import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  console.log('Webhook received:', {
    type: payload.type,
    data: payload.data
  });

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  try {
    switch (eventType) {
      case 'user.created':
      case 'user.updated': {
        const { id, email_addresses, username, public_metadata } = evt.data;
        const role = public_metadata?.role as string || 'student'; // Default role
        const email = email_addresses?.[0]?.email_address;

        console.log('Processing user:', {
          id,
          username,
          role,
          email
        });

        // Check which model to update based on role
        switch (role) {
          case 'admin':
            await prisma.admin.upsert({
              where: { id },
              update: { username: username || '' },
              create: { 
                id,
                username: username || ''
              },
            });
            break;
            
          case 'teacher':
            await prisma.teacher.upsert({
              where: { id },
              update: { 
                username: username || '',
                email: email || null
              },
              create: { 
                id,
                username: username || '',
                email: email || null,
                name: '',
                surname: '',
                phone: null,
                address: '',
                bloodType: '',
                sex: 'MALE',
                birthday: new Date()
              },
            });
            break;
            
          case 'student':
            console.log('Creating/updating student record');
            try {
              // Find or create a default class
              let defaultClass = await prisma.class.findFirst();
              if (!defaultClass) {
                defaultClass = await prisma.class.create({ data: { name: 'Unassigned', gradeId: 1, capacity: 1 } });
              }
              // Find or create a default grade
              let defaultGrade = await prisma.grade.findFirst();
              if (!defaultGrade) {
                defaultGrade = await prisma.grade.create({ data: { level: 0 } });
              }
              // Find or create a default parent
              let defaultParent = await prisma.parent.findFirst();
              if (!defaultParent) {
                defaultParent = await prisma.parent.create({ data: { id: 'default-parent', username: 'unassigned', name: 'Unassigned', surname: '', phone: '', address: '' } });
              }
              await prisma.student.upsert({
                where: { id },
                update: { 
                  username: username || '',
                  email: email || null
                },
                create: { 
                  id,
                  username: username || '',
                  email: email || null,
                  name: '',
                  surname: '',
                  address: '',
                  phone: null,
                  bloodType: '',
                  sex: 'MALE',
                  birthday: new Date(),
                  class: { connect: { id: defaultClass.id } },
                  grade: { connect: { id: defaultGrade.id } },
                  parent: { connect: { id: defaultParent.id } },
                },
              });
              console.log('Student record created/updated successfully');
            } catch (error) {
              console.error('Error creating/updating student:', error);
              throw error;
            }
            break;
            
          case 'parent':
            await prisma.parent.upsert({
              where: { id },
              update: { 
                username: username || '',
                email: email || null
              },
              create: { 
                id,
                username: username || '',
                email: email || null,
                name: '',
                surname: '',
                phone: '',
                address: ''
              },
            });
            break;
        }
        break;
      }
      
      case 'user.deleted': {
        const { id } = evt.data;
        
        // Try to delete from all tables (only one will succeed)
        await Promise.allSettled([
          prisma.admin.delete({ where: { id } }).catch(() => null),
          prisma.teacher.delete({ where: { id } }).catch(() => null),
          prisma.student.delete({ where: { id } }).catch(() => null),
          prisma.parent.delete({ where: { id } }).catch(() => null),
        ]);
        break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return new Response('Hello, Clerk Webhook!', {
    status: 200,
  });
}
