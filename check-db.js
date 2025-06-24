const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function main() {
  console.log('Checking database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '***' : 'Not set');
  
  const prisma = new PrismaClient();
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');
    
    // Get database version
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('Database version:', result);
    
    // List all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    console.log('\nTables in database:');
    console.table(tables);
    
    // Check if Student table has data
    try {
      const studentCount = await prisma.student.count();
      console.log(`\nNumber of students: ${studentCount}`);
      
      if (studentCount > 0) {
        const sampleStudent = await prisma.student.findFirst({
          include: { class: true }
        });
        console.log('Sample student:', {
          id: sampleStudent?.id,
          name: sampleStudent?.name,
          surname: sampleStudent?.surname,
          class: sampleStudent?.class
        });
      } else {
        console.log('No students found. You may need to run the seed script.');
        console.log('Run: npm run seed');
      }
    } catch (error) {
      console.error('Error querying students table:', error);
    }
    
  } catch (error) {
    console.error('❌ Error connecting to the database:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
