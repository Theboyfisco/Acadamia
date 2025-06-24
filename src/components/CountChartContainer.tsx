import Image from "next/image";
import CountChart from "./CountChart";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

type StudentCount = {
  sex: string;
  _count: number;
};

const CountChartContainer = async () => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims as any)?.o?.rol;
  const currentUserId = userId;

  // Build query based on role for events
  const eventQuery: any = {};

  if (role === "teacher") {
    // Teacher: their classes + school-wide events
    const teacherClasses = await prisma.class.findMany({
      where: {
        lessons: {
          some: {
            teacherId: currentUserId!,
          },
        },
      },
      select: { id: true },
    });
    const teacherClassIds = teacherClasses.map(c => c.id);
    eventQuery.OR = [
      { classId: null }, // School-wide events
      { classId: { in: teacherClassIds } }, // Their classes
    ];
  } else if (role === "student") {
    // Student: their class + school-wide events
    const studentClass = await prisma.student.findUnique({
      where: { id: currentUserId! },
      select: { classId: true },
    });
    eventQuery.OR = [
      { classId: null }, // School-wide events
      { classId: studentClass?.classId }, // Their class
    ];
  } else if (role === "parent") {
    // Parent: their children's classes + school-wide events
    const children = await prisma.student.findMany({
      where: { parentId: currentUserId! },
      select: { classId: true },
    });
    const childClassIds = children.map(c => c.classId);
    eventQuery.OR = [
      { classId: null }, // School-wide events
      { classId: { in: childClassIds } }, // Their children's classes
    ];
  }

  // Get upcoming events count
  const upcomingEventsCount = await prisma.event.count({
    where: {
      ...eventQuery,
      startTime: { gt: new Date() },
    },
  });

  // Get ongoing events count
  const ongoingEventsCount = await prisma.event.count({
    where: {
      ...eventQuery,
      AND: [
        { startTime: { lte: new Date() } },
        { endTime: { gte: new Date() } },
      ],
    },
  });

  // Get total events count (next 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  const totalEventsCount = await prisma.event.count({
    where: {
      ...eventQuery,
      startTime: { gte: new Date(), lte: thirtyDaysFromNow },
    },
  });

  // Get other counts based on role
  let teacherCount = 0;
  let studentCount = 0;
  let classCount = 0;
  let parentCount = 0;

  if (role === "admin") {
    // Admin sees all counts
    [teacherCount, studentCount, classCount, parentCount] = await prisma.$transaction([
      prisma.teacher.count(),
      prisma.student.count(),
      prisma.class.count(),
      prisma.parent.count(),
    ]);
  } else if (role === "teacher") {
    // Teacher sees their class students and their own info
    const teacherClasses = await prisma.class.findMany({
      where: {
        lessons: {
          some: {
            teacherId: currentUserId!,
          },
        },
      },
      include: {
        students: true,
      },
    });
    
    studentCount = teacherClasses.reduce((total, classItem) => total + classItem.students.length, 0);
    classCount = teacherClasses.length;
    teacherCount = 1; // The teacher themselves
  } else if (role === "student") {
    // Student sees their class info
    const studentClass = await prisma.student.findUnique({
      where: { id: currentUserId! },
      include: {
        class: {
          include: {
            students: true,
            lessons: {
              include: {
                teacher: true,
              },
            },
          },
        },
      },
    });
    
    if (studentClass?.class) {
      studentCount = studentClass.class.students.length;
      classCount = 1;
      teacherCount = studentClass.class.lessons.length;
    }
  } else if (role === "parent") {
    // Parent sees their children's info
    const children = await prisma.student.findMany({
      where: { parentId: currentUserId! },
      include: {
        class: {
          include: {
            students: true,
            lessons: {
              include: {
                teacher: true,
              },
            },
          },
        },
      },
    });
    
    studentCount = children.length;
    classCount = new Set(children.map(child => child.classId)).size;
    teacherCount = new Set(children.flatMap(child => child.class?.lessons.map(lesson => lesson.teacherId) || [])).size;
    parentCount = 1; // The parent themselves
  }

  const data = [
    {
      name: "Teachers",
      value: teacherCount,
      color: "bg-blue-500",
    },
    {
      name: "Students",
      value: studentCount,
      color: "bg-green-500",
    },
    {
      name: "Classes",
      value: classCount,
      color: "bg-purple-500",
    },
    {
      name: "Parents",
      value: parentCount,
      color: "bg-orange-500",
    },
    {
      name: "Upcoming Events",
      value: upcomingEventsCount,
      color: "bg-red-500",
    },
    {
      name: "Ongoing Events",
      value: ongoingEventsCount,
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl w-full p-4 transition-colors duration-200">
      {/* TITLE */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Students</h1>
        <button className="hover:bg-gray-100 dark:hover:bg-gray-700/50 p-1 rounded-full transition-colors">
          <Image
            src="/more.png"
            alt=""
            width={20}
            height={20}
            className="dark:invert"
          />
        </button>
      </div>
      {/* CHART */}
      <div className="h-72">
        <CountChart data={data} />
      </div>
      {/* BOTTOM */}
      <div className="flex justify-center gap-16">
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-blue-400 rounded-full" />
          <h1 className="font-bold text-gray-900 dark:text-white">{teacherCount}</h1>
          <h2 className="text-xs text-gray-500 dark:text-gray-400">
            Teachers
          </h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-green-400 rounded-full" />
          <h1 className="font-bold text-gray-900 dark:text-white">{studentCount}</h1>
          <h2 className="text-xs text-gray-500 dark:text-gray-400">
            Students
          </h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-purple-400 rounded-full" />
          <h1 className="font-bold text-gray-900 dark:text-white">{classCount}</h1>
          <h2 className="text-xs text-gray-500 dark:text-gray-400">
            Classes
          </h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-orange-400 rounded-full" />
          <h1 className="font-bold text-gray-900 dark:text-white">{parentCount}</h1>
          <h2 className="text-xs text-gray-500 dark:text-gray-400">
            Parents
          </h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-red-400 rounded-full" />
          <h1 className="font-bold text-gray-900 dark:text-white">{upcomingEventsCount}</h1>
          <h2 className="text-xs text-gray-500 dark:text-gray-400">
            Upcoming Events
          </h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-yellow-400 rounded-full" />
          <h1 className="font-bold text-gray-900 dark:text-white">{ongoingEventsCount}</h1>
          <h2 className="text-xs text-gray-500 dark:text-gray-400">
            Ongoing Events
          </h2>
        </div>
      </div>
    </div>
  );
};

export default CountChartContainer;
