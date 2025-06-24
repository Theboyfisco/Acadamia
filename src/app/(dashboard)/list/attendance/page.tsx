import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Attendance, Lesson, Prisma, Student, Class, Subject, Parent } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import React from "react";

// Helper for role display
const roleDisplay = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
};

type AttendanceList = Attendance & {
  student: Student & { class: Class };
  lesson: Lesson & { subject: Subject; class: Class };
};

type FilterOptions = {
  students?: Student[];
  classes?: Class[];
  lessons?: (Lesson & { subject?: Subject })[];
  subjects?: Subject[];
  children?: Student[];
};

const AttendanceListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims as any)?.o?.rol;
  const currentUserId = userId;

  // --- FILTER OPTIONS BASED ON ROLE ---
  let filterOptions: FilterOptions = {};

  if (role === "admin") {
    // Admin: all students, classes, lessons, subjects
    const [students, classes, lessons, subjects] = await prisma.$transaction([
      prisma.student.findMany({ include: { class: true } }),
      prisma.class.findMany(),
      prisma.lesson.findMany({ include: { subject: true, class: true } }),
      prisma.subject.findMany(),
    ]);
    filterOptions = { students, classes, lessons, subjects };
  } else if (role === "teacher") {
    // Teacher: only their classes/lessons/students
    const lessons = await prisma.lesson.findMany({
      where: { teacherId: currentUserId! },
      include: { subject: true, class: true },
    });
    const classIds = Array.from(new Set(lessons.map(l => l.classId)));
    const classes = await prisma.class.findMany({ where: { id: { in: classIds } } });
    const students = await prisma.student.findMany({ where: { classId: { in: classIds } }, include: { class: true } });
    filterOptions = { students, classes, lessons, subjects: [] };
  } else if (role === "parent") {
    // Parent: their children
    const children = await prisma.student.findMany({ where: { parentId: currentUserId! }, include: { class: true } });
    filterOptions = { children };
  }

  // --- QUERY LOGIC BASED ON ROLE ---
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;
  const query: Prisma.AttendanceWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "studentId":
            query.studentId = value;
            break;
          case "lessonId":
            query.lessonId = parseInt(value);
            break;
          case "classId":
            query.lesson = { classId: parseInt(value) };
            break;
          case "date":
            const searchDate = new Date(value);
            const nextDay = new Date(searchDate);
            nextDay.setDate(nextDay.getDate() + 1);
            query.date = { gte: searchDate, lt: nextDay };
            break;
          case "present":
            query.present = value === "true";
            break;
          default:
            break;
        }
      }
    }
  }

  // Role-based data restriction
  if (role === "teacher") {
    // Only attendance for their lessons
    const teacherLessons = filterOptions.lessons?.map(l => l.id) || [];
    query.lessonId = { in: teacherLessons };
  } else if (role === "student") {
    // Only their own attendance
    query.studentId = currentUserId!;
  } else if (role === "parent") {
    // Only their children's attendance
    const childIds = filterOptions.children?.map(c => c.id) || [];
    query.studentId = { in: childIds };
  }

  // --- FETCH DATA ---
  const [data, count] = await prisma.$transaction([
    prisma.attendance.findMany({
      where: query,
      include: {
        student: { include: { class: true } },
        lesson: { include: { subject: true, class: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { date: "desc" },
    }),
    prisma.attendance.count({ where: query }),
  ]);

  // --- COLUMNS BASED ON ROLE ---
  const columns = [
    ...(role !== "student"
      ? [{ header: "Student", accessor: "student" }]
      : []),
    { header: "Lesson", accessor: "lesson", className: "hidden md:table-cell" },
    { header: "Subject", accessor: "subject", className: "hidden lg:table-cell" },
    { header: "Class", accessor: "class", className: "hidden lg:table-cell" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    { header: "Status", accessor: "status" },
    ...((role === "admin" || role === "teacher")
      ? [{ header: "Actions", accessor: "action" }]
      : []),
  ];

  // --- RENDER ROW ---
  const renderRow = (item: AttendanceList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
    >
      {role !== "student" && (
        <td className="flex items-center gap-4 p-4">
          <Image
            src={item.student.img || "/noAvatar.png"}
            alt={`Profile photo of ${item.student.name}`}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <h3 className="font-semibold">{item.student.name} {item.student.surname}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.student.username}</p>
          </div>
        </td>
      )}
      <td className="hidden md:table-cell p-4">{item.lesson.name}</td>
      <td className="hidden lg:table-cell p-4">{item.lesson.subject.name}</td>
      <td className="hidden lg:table-cell p-4">{item.lesson.class.name}</td>
      <td className="hidden md:table-cell p-4">
        {new Date(item.date).toLocaleDateString()}
      </td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.present
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {item.present ? 'Present' : 'Absent'}
        </span>
      </td>
      {(role === "admin" || role === "teacher") && (
        <td className="p-4">
          <div className="flex items-center gap-2">
            {/* Only allow teacher to edit their own lessons */}
            {(role === "admin" || (role === "teacher" && item.lesson.teacherId === currentUserId)) && (
              <>
                <FormContainer table="attendance" type="update" data={item} />
                <FormContainer table="attendance" type="delete" id={item.id} />
              </>
            )}
          </div>
        </td>
      )}
    </tr>
  );

  // --- FILTERS UI ---
  function Filters() {
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Student filter (admin, teacher, parent) */}
        {(role === "admin" || role === "teacher") && filterOptions.students && (
          <select
            name="studentId"
            defaultValue={searchParams.studentId || ""}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            <option value="">All Students</option>
            {filterOptions.students.map(s => (
              <option key={s.id} value={s.id}>{s.name} {s.surname}</option>
            ))}
          </select>
        )}
        {/* Child filter (parent) */}
        {role === "parent" && filterOptions.children && (
          <select
            name="studentId"
            defaultValue={searchParams.studentId || ""}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            <option value="">All Children</option>
            {filterOptions.children.map(c => (
              <option key={c.id} value={c.id}>{c.name} {c.surname}</option>
            ))}
          </select>
        )}
        {/* Class filter (admin, teacher, parent) */}
        {(role === "admin" || role === "teacher") && filterOptions.classes && (
          <select
            name="classId"
            defaultValue={searchParams.classId || ""}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            <option value="">All Classes</option>
            {filterOptions.classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
        {/* Lesson filter (admin, teacher) */}
        {(role === "admin" || role === "teacher") && filterOptions.lessons && (
          <select
            name="lessonId"
            defaultValue={searchParams.lessonId || ""}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            <option value="">All Lessons</option>
            {filterOptions.lessons.map(l => (
              <option key={l.id} value={l.id}>{l.name} ({l.subject?.name || 'No Subject'})</option>
            ))}
          </select>
        )}
        {/* Date filter (all roles) */}
        <input
          type="date"
          name="date"
          defaultValue={searchParams.date || ""}
          className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
        />
        {/* Present/Absent filter (all roles) */}
        <select
          name="present"
          defaultValue={searchParams.present || ""}
          className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          <option value="">All</option>
          <option value="true">Present</option>
          <option value="false">Absent</option>
        </select>
        {/* Search bar (all roles) */}
        <TableSearch />
      </div>
    );
  }

  // --- MAIN RENDER ---
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-md flex-1 m-4 mt-0">
      {/* Role-indicator banner */}
      <div className="mb-4">
        <span className="inline-block px-3 py-1 rounded-full bg-lamaSky text-white text-xs font-semibold shadow">
          Viewing as: {roleDisplay[role as keyof typeof roleDisplay] || "User"}
        </span>
      </div>
      {/* TOP */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Attendance Records</h1>
        {(role === "admin" || role === "teacher") && (
          <FormContainer table="attendance" type="create" />
        )}
      </div>
      {/* FILTERS */}
      <Filters />
      {/* LIST */}
      <div className="overflow-x-auto rounded-lg shadow-sm">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default AttendanceListPage; 