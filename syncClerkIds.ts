import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Load .env.local
console.log("syncClerkIds.ts: Script execution started...");

import { PrismaClient } from '@prisma/client';
import { clerkClient, User, EmailAddress } from '@clerk/nextjs/server'; // Or from '@clerk/clerk-sdk-node'

const prisma = new PrismaClient();

// --- Configuration ---
const DRY_RUN = false; // SET TO FALSE TO EXECUTE ACTUAL DATABASE UPDATES
const MATCH_FIELD: 'email' | 'username' = 'username'; // Confirm: Is 'username' the best unique field to match users between DB and Clerk?
// --- End Configuration ---

async function syncParentIds() {
  console.log('\nProcessing Parent IDs...');
  console.log('Starting Parent ID sync...');
  const parentsInDb = await prisma.parent.findMany();
  console.log(`Found ${parentsInDb.length} parent records in the database.`);
  if (parentsInDb.length === 0) {
    console.log('No parent records to process.');
    return;
  }
  const parentsToSync = await prisma.parent.findMany({
    where: {
      NOT: {
        id: {
          startsWith: 'user_', // Find parents whose ID doesn't look like a Clerk ID
        },
      },
    },
  });

  console.log(`Found ${parentsToSync.length} Parent records to potentially sync.`);

  for (const parent of parentsToSync) {
    console.log(`\nProcessing Parent: DB ID = ${parent.id}, Username = ${parent.username}, Email = ${parent.email}`);

    if (!parent[MATCH_FIELD]) {
      console.warn(`  - SKIPPING: Parent ${parent.id} (Username: ${parent.username}) has no ${MATCH_FIELD} in the database.`);
      continue;
    }

    try {
      const clerkUsersResponse = await clerkClient().users.getUserList({
        [MATCH_FIELD]: parent[MATCH_FIELD],
      });
      console.log(`  - Clerk API for parent ${parent[MATCH_FIELD]} returned ${clerkUsersResponse.data.length} users. Total available: ${clerkUsersResponse.totalCount}`);
      const clerkUsers = clerkUsersResponse.data;

      if (clerkUsers.length === 0) {
        console.warn(`  - NO MATCH in Clerk for ${MATCH_FIELD} "${parent[MATCH_FIELD]}".`);
      } else if (clerkUsers.length > 1) {
        console.warn(`  - MULTIPLE MATCHES (${clerkUsers.length}) in Clerk for ${MATCH_FIELD} "${parent[MATCH_FIELD]}". Skipping due to ambiguity.`);
        clerkUsers.forEach((u: User) => console.log(`    - Clerk User ID: ${u.id}, Email: ${u.emailAddresses.map((e: EmailAddress) => e.emailAddress).join(',')}, Username: ${u.username}`));
      } else {
        const clerkUser = clerkUsers[0];
        console.log(`  - MATCH FOUND in Clerk: Clerk User ID = ${clerkUser.id}`);

        if (parent.id === clerkUser.id) {
          console.log(`  - IDs already match. No update needed.`);
        } else {
          if (DRY_RUN) {
            console.log(`  - DRY RUN: Would update Parent DB ID "${parent.id}" to Clerk User ID "${clerkUser.id}".`);
          } else {
            const existingParentWithClerkId = await prisma.parent.findUnique({
              where: { id: clerkUser.id }
            });
            if (existingParentWithClerkId && existingParentWithClerkId.id !== parent.id) {
                console.error(`  - ERROR: Another Parent record (DB ID: ${existingParentWithClerkId.id}, Username: ${existingParentWithClerkId.username}) already uses Clerk ID "${clerkUser.id}". Skipping update for DB ID "${parent.id}". This indicates a potential duplicate that needs manual resolution.`);
            } else {
                await prisma.parent.update({
                  where: { id: parent.id }, 
                  data: { id: clerkUser.id }, 
                });
                console.log(`  - SUCCESS: Updated Parent DB ID "${parent.id}" to Clerk User ID "${clerkUser.id}".`);
            }
          }
        }
      }
    } catch (error) {
      console.error(`  - ERROR processing Parent ${parent.id} (${parent[MATCH_FIELD]}):`, error);
    }
  }
  console.log('\nParent ID sync finished.');
}

async function syncStudentIds() {
  console.log('\nProcessing Student IDs...');
  console.log('\nStarting Student ID sync...');
  const studentsInDb = await prisma.student.findMany();
  console.log(`Found ${studentsInDb.length} student records in the database.`);
  if (studentsInDb.length === 0) {
    console.log('No student records to process.');
    return;
  }
  const studentsToSync = await prisma.student.findMany({
    where: {
      NOT: {
        id: {
          startsWith: 'user_',
        },
      },
    },
  });

  console.log(`Found ${studentsToSync.length} Student records to potentially sync.`);

  for (const student of studentsToSync) {
    console.log(`\nProcessing Student: DB ID = ${student.id}, Username = ${student.username}, Email = ${student.email}`);
     if (!student[MATCH_FIELD]) {
      console.warn(`  - SKIPPING: Student ${student.id} (Username: ${student.username}) has no ${MATCH_FIELD} in the database.`);
      continue;
    }
    try {
      const clerkUsersResponse = await clerkClient().users.getUserList({
        [MATCH_FIELD]: student[MATCH_FIELD],
      });
      console.log(`  - Clerk API for student ${student[MATCH_FIELD]} returned ${clerkUsersResponse.data.length} users. Total available: ${clerkUsersResponse.totalCount}`);
      const clerkUsers = clerkUsersResponse.data;

       if (clerkUsers.length === 0) {
        console.warn(`  - NO MATCH in Clerk for ${MATCH_FIELD} "${student[MATCH_FIELD]}".`);
      } else if (clerkUsers.length > 1) {
        console.warn(`  - MULTIPLE MATCHES (${clerkUsers.length}) in Clerk for ${MATCH_FIELD} "${student[MATCH_FIELD]}". Skipping due to ambiguity.`);
         clerkUsers.forEach((u: User) => console.log(`    - Clerk User ID: ${u.id}, Email: ${u.emailAddresses.map((e: EmailAddress) => e.emailAddress).join(',')}, Username: ${u.username}`));
      } else {
        const clerkUser = clerkUsers[0];
        console.log(`  - MATCH FOUND in Clerk: Clerk User ID = ${clerkUser.id}`);
         if (student.id === clerkUser.id) {
          console.log(`  - IDs already match. No update needed.`);
        } else {
          if (DRY_RUN) {
            console.log(`  - DRY RUN: Would update Student DB ID "${student.id}" to Clerk User ID "${clerkUser.id}".`);
          } else {
            const existingStudentWithClerkId = await prisma.student.findUnique({
              where: { id: clerkUser.id }
            });
            if (existingStudentWithClerkId && existingStudentWithClerkId.id !== student.id) {
                console.error(`  - ERROR: Another Student record (DB ID: ${existingStudentWithClerkId.id}, Username: ${existingStudentWithClerkId.username}) already uses Clerk ID "${clerkUser.id}". Skipping update for DB ID "${student.id}".`);
            } else {
                await prisma.student.update({
                  where: { id: student.id },
                  data: { id: clerkUser.id },
                });
                console.log(`  - SUCCESS: Updated Student DB ID "${student.id}" to Clerk User ID "${clerkUser.id}".`);
            }
          }
        }
      }
    } catch (error) {
         console.error(`  - ERROR processing Student ${student.id} (${student[MATCH_FIELD]}):`, error);
    }
  }
  console.log('\nStudent ID sync finished.');
}

async function syncTeacherIds() {
  console.log('\nProcessing Teacher IDs...');
  console.log('\nStarting Teacher ID sync...');
  const teachersInDb = await prisma.teacher.findMany();
  console.log(`Found ${teachersInDb.length} teacher records in the database.`);
  if (teachersInDb.length === 0) {
    console.log('No teacher records to process.');
    return;
  }
  const teachersToSync = await prisma.teacher.findMany({
    where: {
      NOT: {
        id: {
          startsWith: 'user_',
        },
      },
    },
  });

  console.log(`Found ${teachersToSync.length} Teacher records to potentially sync.`);

  for (const teacher of teachersToSync) {
    console.log(`\nProcessing Teacher: DB ID = ${teacher.id}, Username = ${teacher.username}, Email = ${teacher.email}`);
     if (!teacher[MATCH_FIELD]) {
      console.warn(`  - SKIPPING: Teacher ${teacher.id} (Username: ${teacher.username}) has no ${MATCH_FIELD} in the database.`);
      continue;
    }
    try {
      const clerkUsersResponse = await clerkClient().users.getUserList({
        [MATCH_FIELD]: teacher[MATCH_FIELD],
      });
      console.log(`  - Clerk API for teacher ${teacher[MATCH_FIELD]} returned ${clerkUsersResponse.data.length} users. Total available: ${clerkUsersResponse.totalCount}`);
      const clerkUsers = clerkUsersResponse.data;

       if (clerkUsers.length === 0) {
        console.warn(`  - NO MATCH in Clerk for ${MATCH_FIELD} "${teacher[MATCH_FIELD]}".`);
      } else if (clerkUsers.length > 1) {
        console.warn(`  - MULTIPLE MATCHES (${clerkUsers.length}) in Clerk for ${MATCH_FIELD} "${teacher[MATCH_FIELD]}". Skipping due to ambiguity.`);
         clerkUsers.forEach((u: User) => console.log(`    - Clerk User ID: ${u.id}, Email: ${u.emailAddresses.map((e: EmailAddress) => e.emailAddress).join(',')}, Username: ${u.username}`));
      } else {
        const clerkUser = clerkUsers[0];
        console.log(`  - MATCH FOUND in Clerk: Clerk User ID = ${clerkUser.id}`);
         if (teacher.id === clerkUser.id) {
          console.log(`  - IDs already match. No update needed.`);
        } else {
          if (DRY_RUN) {
            console.log(`  - DRY RUN: Would update Teacher DB ID "${teacher.id}" to Clerk User ID "${clerkUser.id}".`);
          } else {
            const existingTeacherWithClerkId = await prisma.teacher.findUnique({
              where: { id: clerkUser.id }
            });
            if (existingTeacherWithClerkId && existingTeacherWithClerkId.id !== teacher.id) {
                console.error(`  - ERROR: Another Teacher record (DB ID: ${existingTeacherWithClerkId.id}, Username: ${existingTeacherWithClerkId.username}) already uses Clerk ID "${clerkUser.id}". Skipping update for DB ID "${teacher.id}".`);
            } else {
                await prisma.teacher.update({
                  where: { id: teacher.id },
                  data: { id: clerkUser.id },
                });
                console.log(`  - SUCCESS: Updated Teacher DB ID "${teacher.id}" to Clerk User ID "${clerkUser.id}".`);
            }
          }
        }
      }
    } catch (error) {
         console.error(`  - ERROR processing Teacher ${teacher.id} (${teacher[MATCH_FIELD]}):`, error);
    }
  }
  console.log('\nTeacher ID sync finished.');
}

async function main() {
  console.log(`SCRIPT MODE: ${DRY_RUN ? 'DRY RUN (no database changes will be made)' : 'LIVE (database changes WILL be made)'}`);
  console.log(`Matching users based on: ${MATCH_FIELD}`);
  console.log('Ensure your CLERK_SECRET_KEY and DATABASE_URL environment variables are set correctly.');

  await syncParentIds();
  await syncStudentIds();
  await syncTeacherIds();
  // Add calls for other models if needed (e.g., Teacher)

  console.log('\nAll sync operations complete.');
}

main()
  .catch(async (e) => {
    console.error('Unhandled error in main script:', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
