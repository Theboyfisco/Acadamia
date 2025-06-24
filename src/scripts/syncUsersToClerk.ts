import { clerkClient } from "@clerk/nextjs/server";
import prisma from "../lib/prisma";
import { randomBytes } from "crypto";

// Function to generate a random password
function generateTemporaryPassword() {
  return randomBytes(8).toString('hex');
}

async function syncUsersToClerk() {
  try {
    // Fetch all users from your database
    const [teachers, students, parents] = await Promise.all([
      prisma.teacher.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          surname: true,
        },
      }),
      prisma.student.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          surname: true,
        },
      }),
      prisma.parent.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          surname: true,
        },
      }),
    ]);

    console.log(`Found ${teachers.length} teachers to sync`);
    console.log(`Found ${students.length} students to sync`);
    console.log(`Found ${parents.length} parents to sync`);

    // Function to sync a single user
    async function syncUser(user: any, role: string) {
      try {
        if (!user.email) {
          console.log(`${role} ${user.username} has no email, skipping...`);
          return;
        }

        // Check if user already exists in Clerk
        const existingUsers = await clerkClient.users.getUserList({
          emailAddress: [user.email],
        });

        if (existingUsers.data.length > 0) {
          console.log(`User ${user.email} already exists in Clerk, skipping...`);
          return;
        }

        // Generate a temporary password
        const tempPassword = generateTemporaryPassword();

        // Create user in Clerk with the new client syntax
        const clerkUser = await clerkClient.users.createUser({
          emailAddress: user.email,
          username: user.username,
          firstName: user.name,
          lastName: user.surname,
          password: tempPassword,
          publicMetadata: {
            role: role,
            userId: user.id // Store the database ID in Clerk metadata
          },
        });

        console.log(`Successfully created ${role} ${user.email} in Clerk with temporary password: ${tempPassword}`);
        console.log(`Clerk ID: ${clerkUser.id}`);
      } catch (error: any) {
        if (error.clerkError) {
          console.error(`Clerk API Error syncing ${role} ${user.email}:`, error.errors?.[0]?.message || error.message);
        } else {
          console.error(`Error syncing ${role} ${user.email}:`, error);
        }
      }
    }

    // Sync all users
    console.log('\nSyncing teachers...');
    for (const teacher of teachers) {
      await syncUser(teacher, 'teacher');
    }

    console.log('\nSyncing students...');
    for (const student of students) {
      await syncUser(student, 'student');
    }

    console.log('\nSyncing parents...');
    for (const parent of parents) {
      await syncUser(parent, 'parent');
    }

    console.log('\nUser sync completed');
  } catch (error) {
    console.error('Error during user sync:', error);
  }
}

// Run the sync
syncUsersToClerk()
  .then(() => {
    console.log('Sync process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Sync process failed:', error);
    process.exit(1);
  }); 