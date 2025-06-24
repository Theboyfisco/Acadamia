"use server";

import { revalidatePath } from "next/cache";
import {
  ClassSchema,
  ExamSchema,
  type ParentSchema, // General parent type
  type CreateParentSchema, // For creating parents
  type UpdateParentSchema, // For updating parents
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { clerkClient, type User } from "@clerk/nextjs/server"; // Added User type import

export type CurrentState = { 
  success: boolean; 
  error: boolean;
  message?: string;
};

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: (data.teachers || []).map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: (data.teachers || []).map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id");
  if (!id || typeof id !== 'string') {
    return { 
      success: false, 
      error: true,
      message: 'Valid subject ID is required'
    };
  }

  const subjectId = parseInt(id);
  if (isNaN(subjectId)) {
    return {
      success: false,
      error: true,
      message: 'Invalid subject ID format'
    };
  }

  try {
    // First check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId }
    });

    if (!subject) {
      return {
        success: false,
        error: true,
        message: 'Subject not found'
      };
    }

    await prisma.subject.delete({
      where: {
        id: subjectId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.error('Error deleting subject:', err);
    return { 
      success: false, 
      error: true,
      message: err instanceof Error ? err.message : 'An error occurred while deleting the subject'
    };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.create({
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata:{role:"teacher"}
    });

    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  
  if (!id) {
    console.error('No teacher ID provided');
    return { success: false, error: true, message: 'Teacher ID is required' };
  }

  try {
    // Check for related data before attempting to delete
    const [lessons, supervisedClasses, subjects] = await Promise.all([
      prisma.lesson.findFirst({ where: { teacherId: id } }),
      prisma.class.findFirst({ where: { supervisorId: id } }),
      prisma.subject.findFirst({ 
        where: { 
          teachers: { 
            some: { id } 
          } 
        } 
      })
    ]);

    // Build a list of reasons why the teacher can't be deleted
    const reasons: string[] = [];
    
    if (lessons) reasons.push("has lessons assigned");
    if (supervisedClasses) reasons.push("is a supervisor for one or more classes");
    if (subjects) reasons.push("is assigned to one or more subjects");

    if (reasons.length > 0) {
      return { 
        success: false, 
        error: true, 
        message: `Cannot delete teacher because they ${reasons.join(', ')}. Please remove these associations first.`
      };
    }


    // If no related data, proceed with deletion
    await prisma.teacher.delete({
      where: { id }
    });

    // Delete the user from Clerk
    await clerkClient.users.deleteUser(id);

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.error('Error deleting teacher:', err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : 'Failed to delete teacher' 
    };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  console.log('Creating student with data:', data);
  let clerkUser = null;
  
  try {
    // First check if email or username already exists in database
    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username }
        ]
      }
    });

    if (existingStudent) {
      console.log('Student with this email or username already exists');
      return { 
        success: false, 
        error: true,
        message: 'A student with this email or username already exists'
      };
    }

    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      console.log('Class is at capacity');
      return { 
        success: false, 
        error: true,
        message: 'The selected class is at capacity'
      };
    }

    console.log('Creating Clerk user');
    try {
      clerkUser = await clerkClient().users.createUser({
        username: data.username,
        password: data.password,
        firstName: data.name,
        lastName: data.surname,
        publicMetadata:{role:"student"}
      });
      console.log('Clerk user created:', clerkUser.id);
    } catch (clerkError: any) {
      if (clerkError.errors) {
        const errorMessages = clerkError.errors.map((err: any) => err.message).join(', ');
        return {
          success: false,
          error: true,
          message: errorMessages
        };
      }
      throw clerkError;
    }

    console.log('Creating database record');
    const student = await prisma.student.create({
      data: {
        id: clerkUser.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    console.log('Database record created:', student.id);

    return { success: true, error: false };
  } catch (err) {
    console.error('Error creating student:', err);
    
    // If we created a Clerk user but failed to create the database record,
    // we should delete the Clerk user to keep things in sync
    if (clerkUser) {
      try {
        console.log('Cleaning up: Deleting Clerk user');
        await clerkClient().users.deleteUser(clerkUser.id);
      } catch (deleteErr) {
        console.error('Error deleting Clerk user:', deleteErr);
      }
    }
    
    return { 
      success: false, 
      error: true,
      message: err instanceof Error ? err.message : 'An error occurred while creating the student'
    };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient().users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    // First check if this is a Clerk-created student (ID starts with 'user_')
    if (id.startsWith('user_')) {
      // Delete from Clerk
      await clerkClient().users.deleteUser(id);
    }

    // Delete all related records first
    await Promise.all([
      // Delete associated results
      prisma.result.deleteMany({
        where: {
          studentId: id
        }
      }),
      // Delete associated attendance records
      prisma.attendance.deleteMany({
        where: {
          studentId: id
        }
      })
    ]);

    // Delete from database
    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.error('Error deleting student:', err);
    return { success: false, error: true };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
        // ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createLesson = async (
  currentState: CurrentState,
  data: any
) => {
  try {
    await prisma.lesson.create({
      data: {
        name: data.name,
        subjectId: parseInt(data.subjectId),
        teacherId: data.teacherId,
        classId: parseInt(data.classId),
        day: data.day, // Ensure data.day is provided
        startTime: data.startTime, // Ensure data.startTime is provided
        endTime: data.endTime, // Ensure data.endTime is provided
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateLesson = async (
  currentState: CurrentState,
  data: any
) => {
  try {
    await prisma.lesson.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        subjectId: parseInt(data.subjectId),
        teacherId: data.teacherId,
        classId: parseInt(data.classId),
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteLesson = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.lesson.delete({
      where: {
        id: parseInt(id),
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteParent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id");
  if (!id || typeof id !== 'string') {
    return { 
      success: false, 
      error: true,
      message: 'Valid parent ID is required'
    };
  }

  try {
    // Check for related data before attempting to delete
    const [students, parent] = await Promise.all([
      prisma.student.findFirst({ 
        where: { parentId: id },
        select: { id: true, name: true }
      }),
      prisma.parent.findUnique({
        where: { id },
        select: { id: true, students: { select: { id: true, name: true } } }
      })
    ]);

    if (!parent) {
      return {
        success: false,
        error: true,
        message: 'Parent not found'
      };
    }

    // Build a list of reasons why the parent can't be deleted
    const reasons: string[] = [];
    
    if (students) {
      const studentNames = parent.students.map((s: { id: string; name: string }) => s.name).join(', ');
      reasons.push(`has ${parent.students.length} associated student(s): ${studentNames}`);
    }

    if (reasons.length > 0) {
      return { 
        success: false, 
        error: true, 
        message: `Cannot delete parent because they ${reasons.join(' and ')}. Please reassign or delete these students first.`
      };
    }

    // Delete from Clerk if it's a Clerk user
    if (id.startsWith('user_')) {
      try {
        await clerkClient.users.deleteUser(id);
      } catch (clerkErr) {
        console.error('Error deleting Clerk user:', clerkErr);
        // Continue with database deletion even if Clerk deletion fails
      }
    }

    // If no related data, proceed with deletion
    await prisma.parent.delete({
      where: { id }
    });

    revalidatePath("/list/parents");
    return { 
      ...currentState,
      success: true, 
      error: false,
      message: 'Parent deleted successfully'
    };
  } catch (err) {
    console.error('Error deleting parent:', err);
    return { 
      success: false, 
      error: true,
      message: err instanceof Error ? err.message : 'An error occurred while deleting the parent'
    };
  }
};

export const createParent = async (
  currentState: CurrentState,
  data: CreateParentSchema
) => {
  let clerkUser: User | null = null;
  
  try {
    // Data validation is already handled by the schema, but we'll double-check email
    const email = data.email;
    if (!email) {
      return {
        success: false,
        error: true,
        message: 'Email is required for creating a parent'
      };
    }

    // Check if email or username already exists
    const existingParent = await prisma.parent.findFirst({
      where: {
        OR: [
          { email },
          { username: data.username }
        ]
      }
    });

    if (existingParent) {
      return { 
        success: false, 
        error: true,
        message: 'A parent with this email or username already exists'
      };
    }

    // Create Clerk user
    // Align with createTeacher: use clerkClient (singleton) and omit emailAddress for now
    const createUserParamsForClerk = {
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "parent" }
      // emailAddress: [email], // Temporarily omitted
    };
    console.log('Attempting to create Clerk user with params (email omitted for Clerk):', JSON.stringify(createUserParamsForClerk, null, 2));
    clerkUser = await clerkClient.users.createUser(createUserParamsForClerk); // Using clerkClient singleton

    // Create the user in your database
    const parentData: any = {
      id: clerkUser.id,
      username: data.username,
      name: data.name,
      surname: data.surname,
      address: data.address,
    };

    // Only include email and phone if they exist
    if (email) parentData.email = email;
    if (data.phone) parentData.phone = data.phone;

    // Create parent with student connections if any
    await prisma.parent.create({
      data: {
        ...parentData,
        // Connect students if any are selected
        students: data.studentIds?.length ? {
          connect: data.studentIds.map(id => ({ id }))
        } : undefined,
      },
      include: {
        students: true
      }
    });

    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.error('Error creating parent:', err);
    
    // Detailed error logging for Clerk API errors
    if (err && typeof err === 'object' && 'clerkError' in err && err.clerkError) {
      const clerkApiError = err as any; // Cast to any to access Clerk-specific properties
      console.error('Clerk API Error Details:', JSON.stringify(clerkApiError.errors, null, 2));
    }
    // If we created a Clerk user but failed to create the database record,
    // we should delete the Clerk user to keep things in sync
    if (err instanceof Error && err.message.includes('clerkUser')) {
      try {
        if (clerkUser && clerkUser.id) {
          await clerkClient().users.deleteUser(clerkUser.id);
        }
      } catch (deleteErr) {
        console.error('Error deleting Clerk user:', deleteErr);
      }
    }
    
    return { 
      success: false, 
      error: true,
      message: err instanceof Error ? err.message : 'An error occurred while creating the parent'
    };
  }
};

export const updateParent = async (
  currentState: CurrentState,
  data: UpdateParentSchema // Use UpdateParentSchema
) => {
  if (!data.id) {
    return { 
      success: false, 
      error: true,
      message: 'Parent ID is required for update'
    };
  }

  try {
    // Get existing parent with current student relationships
    const existingParent = await prisma.parent.findUnique({
      where: { id: data.id },
      include: { students: true },
    });

    if (!existingParent) {
      return { success: false, error: true, message: 'Parent not found' };
    }

    // Update Clerk user
    await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    // Get current student IDs for comparison
    const currentStudentIds = existingParent.students.map((s: { id: string }) => s.id);
    const newStudentIds = data.studentIds || [];
    
    // Determine students to connect and disconnect
    const studentsToConnect = newStudentIds.filter((id: string) => !currentStudentIds.includes(id));
    const studentsToDisconnect = currentStudentIds.filter((id: string) => !newStudentIds.includes(id));

    // Prepare the update data
    const updateData: any = {
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email,
      phone: data.phone ?? undefined,
      address: data.address,
      img: data.img ?? undefined,
    };

    // Only include student connections if there are changes
    if (studentsToConnect.length > 0 || studentsToDisconnect.length > 0) {
      updateData.students = {
        connect: studentsToConnect.length > 0 ? studentsToConnect.map((id: string) => ({ id })) : undefined,
        disconnect: studentsToDisconnect.length > 0 ? studentsToDisconnect.map((id: string) => ({ id })) : undefined,
      };
    }

    // Update the parent in the database
    await prisma.parent.update({
      where: { id: data.id },
      data: updateData,
      include: {
        students: true
      }
    });

    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.error('Error updating parent:', err);
    return { success: false, error: true, message: 'Failed to update parent' };
  }
};

export const createAssignment = async (
  currentState: CurrentState,
  data: FormData
) => {
  try {
    const title = data.get("title") as string;
    const lessonId = parseInt(data.get("lessonId") as string);
    const startDate = new Date(data.get("startDate") as string);
    const dueDate = new Date(data.get("dueDate") as string);

    await prisma.assignment.create({
      data: {
        title,
        startDate,
        dueDate,
        lessonId,
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.error('Error creating assignment:', err);
    return { success: false, error: true, message: 'Failed to create assignment' };
  }
};

export const updateAssignment = async (
  currentState: CurrentState,
  data: FormData
) => {
  try {
    const id = parseInt(data.get("id") as string);
    const title = data.get("title") as string;
    const lessonId = parseInt(data.get("lessonId") as string);
    const startDate = new Date(data.get("startDate") as string);
    const dueDate = new Date(data.get("dueDate") as string);

    await prisma.assignment.update({
      where: { id },
      data: {
        title,
        startDate,
        dueDate,
        lessonId,
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.error('Error updating assignment:', err);
    return { success: false, error: true, message: 'Failed to update assignment' };
  }
};

export const deleteAssignment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.assignment.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.error('Error deleting assignment:', err);
    return { success: false, error: true, message: 'Failed to delete assignment' };
  }
};

export const createResult = async (
  currentState: CurrentState,
  data: FormData
) => {
  try {
    const studentId = data.get("studentId") as string;
    const assessmentType = data.get("assessmentType") as string;
    const assessmentId = parseInt(data.get("assessmentId") as string);
    const score = parseInt(data.get("score") as string);

    const resultData: any = {
      studentId,
      score,
    };

    if (assessmentType === "exam") {
      resultData.examId = assessmentId;
    } else {
      resultData.assignmentId = assessmentId;
    }

    await prisma.result.create({
      data: resultData,
    });

    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.error('Error creating result:', err);
    return { success: false, error: true, message: 'Failed to create result' };
  }
};

export const updateResult = async (
  currentState: CurrentState,
  data: FormData
) => {
  try {
    const id = parseInt(data.get("id") as string);
    const studentId = data.get("studentId") as string;
    const assessmentType = data.get("assessmentType") as string;
    const assessmentId = parseInt(data.get("assessmentId") as string);
    const score = parseInt(data.get("score") as string);

    const resultData: any = {
      studentId,
      score,
    };

    if (assessmentType === "exam") {
      resultData.examId = assessmentId;
      resultData.assignmentId = null;
    } else {
      resultData.assignmentId = assessmentId;
      resultData.examId = null;
    }

    await prisma.result.update({
      where: { id },
      data: resultData,
    });

    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.error('Error updating result:', err);
    return { success: false, error: true, message: 'Failed to update result' };
  }
};

export const deleteResult = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.result.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.error('Error deleting result:', err);
    return { success: false, error: true, message: 'Failed to delete result' };
  }
};

export const createAttendance = async (
  currentState: CurrentState,
  data: FormData
) => {
  try {
    const studentId = data.get("studentId") as string;
    const lessonId = parseInt(data.get("lessonId") as string);
    const date = new Date(data.get("date") as string);
    const present = data.get("present") === "true";

    await prisma.attendance.create({
      data: {
        studentId,
        lessonId,
        date,
        present,
      },
    });

    revalidatePath("/list/attendance");
    revalidatePath("/"); // Refresh dashboard
    return { success: true, error: false };
  } catch (err) {
    console.error('Error creating attendance:', err);
    return { success: false, error: true, message: 'Failed to create attendance record' };
  }
};

export const updateAttendance = async (
  currentState: CurrentState,
  data: FormData
) => {
  try {
    const id = parseInt(data.get("id") as string);
    const studentId = data.get("studentId") as string;
    const lessonId = parseInt(data.get("lessonId") as string);
    const date = new Date(data.get("date") as string);
    const present = data.get("present") === "true";

    await prisma.attendance.update({
      where: { id },
      data: {
        studentId,
        lessonId,
        date,
        present,
      },
    });

    revalidatePath("/list/attendance");
    revalidatePath("/"); // Refresh dashboard
    return { success: true, error: false };
  } catch (err) {
    console.error('Error updating attendance:', err);
    return { success: false, error: true, message: 'Failed to update attendance record' };
  }
};

export const deleteAttendance = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.attendance.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/attendance");
    revalidatePath("/"); // Refresh dashboard
    return { success: true, error: false };
  } catch (err) {
    console.error('Error deleting attendance:', err);
    return { success: false, error: true, message: 'Failed to delete attendance record' };
  }
};

export const createEvent = async (
  currentState: CurrentState,
  data: FormData
) => {
  try {
    const title = data.get("title") as string;
    const description = data.get("description") as string;
    const startTime = new Date(data.get("startTime") as string);
    const endTime = new Date(data.get("endTime") as string);
    const classId = data.get("classId") as string;

    // Validation
    if (!title || !startTime || !endTime) {
      return { success: false, error: true, message: 'Title, start time, and end time are required' };
    }

    if (startTime >= endTime) {
      return { success: false, error: true, message: 'End time must be after start time' };
    }

    const eventData: any = {
      title,
      description: description || null,
      startTime,
      endTime,
    };

    // Only set classId if it's not empty
    if (classId && classId.trim() !== "") {
      eventData.classId = parseInt(classId);
    }

    await prisma.event.create({
      data: eventData,
    });

    revalidatePath("/list/events");
    revalidatePath("/"); // Refresh dashboard
    return { success: true, error: false };
  } catch (err) {
    console.error('Error creating event:', err);
    return { success: false, error: true, message: 'Failed to create event' };
  }
};

export const updateEvent = async (
  currentState: CurrentState,
  data: FormData
) => {
  try {
    const id = parseInt(data.get("id") as string);
    const title = data.get("title") as string;
    const description = data.get("description") as string;
    const startTime = new Date(data.get("startTime") as string);
    const endTime = new Date(data.get("endTime") as string);
    const classId = data.get("classId") as string;

    // Validation
    if (!title || !startTime || !endTime) {
      return { success: false, error: true, message: 'Title, start time, and end time are required' };
    }

    if (startTime >= endTime) {
      return { success: false, error: true, message: 'End time must be after start time' };
    }

    const eventData: any = {
      title,
      description: description || null,
      startTime,
      endTime,
    };

    // Handle classId (null for school-wide, or specific class)
    if (classId && classId.trim() !== "") {
      eventData.classId = parseInt(classId);
    } else {
      eventData.classId = null;
    }

    await prisma.event.update({
      where: { id },
      data: eventData,
    });

    revalidatePath("/list/events");
    revalidatePath("/"); // Refresh dashboard
    return { success: true, error: false };
  } catch (err) {
    console.error('Error updating event:', err);
    return { success: false, error: true, message: 'Failed to update event' };
  }
};

export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.event.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/events");
    revalidatePath("/"); // Refresh dashboard
    return { success: true, error: false };
  } catch (err) {
    console.error('Error deleting event:', err);
    return { success: false, error: true, message: 'Failed to delete event' };
  }
};

export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.announcement.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/announcements");
    revalidatePath("/"); // Refresh dashboard
    return { success: true, error: false };
  } catch (err) {
    console.error('Error deleting announcement:', err);
    return { success: false, error: true, message: 'Failed to delete announcement' };
  }
};
