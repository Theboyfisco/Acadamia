import { auth } from '@clerk/nextjs/server';
import prisma from './prisma';

type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

/**
 * Get the current user's role from Clerk
 */
export async function getUserRole(): Promise<UserRole | null> {
  const { userId } = auth();
  
  if (!userId) return null;
  
  try {
    // Get user from Clerk
    const user = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    }).then(res => res.json());

    // Return the role from public metadata or null if not set
    return user?.public_metadata?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Update a user's role in Clerk and sync with the database
 */
export async function updateUserRole(userId: string, role: UserRole) {
  try {
    // Update role in Clerk
    const response = await fetch(`https://api.clerk.dev/v1/users/${userId}/metadata`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        public_metadata: { role },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user role: ${await response.text()}`);
    }

    // The webhook will handle the database sync, but we can also handle it here for immediate consistency
    await syncUserWithDatabase(userId);

    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

/**
 * Sync a user's Clerk data with the database
 */
async function syncUserWithDatabase(userId: string) {
  try {
    // Get user from Clerk
    const user = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    }).then(res => res.json());

    if (!user) {
      throw new Error('User not found in Clerk');
    }

    const role = user.public_metadata?.role as UserRole;
    const email = user.email_addresses?.[0]?.email_address;
    const username = user.username || user.id;

    if (!role) {
      console.warn('No role set for user, skipping database sync');
      return;
    }

    // This is a simplified version of the webhook handler
    // You might want to keep this in sync with the webhook handler
    switch (role) {
      case 'admin':
        await prisma.admin.upsert({
          where: { id: userId },
          update: { username },
          create: { id: userId, username },
        });
        break;
      case 'teacher':
        await prisma.teacher.upsert({
          where: { id: userId },
          update: { username, email: email || null },
          create: {
            id: userId,
            username,
            email: email || null,
            name: '',
            surname: '',
            phone: null,
            address: '',
            bloodType: '',
            sex: 'MALE',
            birthday: new Date(),
          },
        });
        break;
      // Add other cases as needed
    }
  } catch (error) {
    console.error('Error syncing user with database:', error);
    throw error;
  }
}

/**
 * Middleware to ensure the current user has the required role
 */
export async function requireRole(requiredRole: UserRole) {
  const role = await getUserRole();
  
  if (role !== requiredRole) {
    throw new Error('Unauthorized: Insufficient permissions');
  }
  
  return true;
}

/**
 * Check if the current user has any of the required roles
 */
export async function hasAnyRole(requiredRoles: UserRole[]): Promise<boolean> {
  const role = await getUserRole();
  return role ? requiredRoles.includes(role) : false;
}
