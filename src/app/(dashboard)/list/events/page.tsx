import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Event, Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import React from "react";
import ExportEventsButton from "@/components/ExportEventsButton";

// Helper for role display
const roleDisplay = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
};

type EventList = Event & { class: Class | null };

type FilterOptions = {
  classes?: Class[];
};

// Helper function to get event status
const getEventStatus = (startTime: Date, endTime: Date) => {
  const now = new Date();
  if (now < startTime) return { status: 'upcoming', label: 'Upcoming', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
  if (now >= startTime && now <= endTime) return { status: 'ongoing', label: 'Ongoing', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
  return { status: 'past', label: 'Past', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' };
};

// Helper function to get relative time
const getRelativeTime = (date: Date) => {
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInDays > 0) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} from now`;
  if (diffInDays < 0) return `${Math.abs(diffInDays)} day${Math.abs(diffInDays) > 1 ? 's' : ''} ago`;
  if (diffInHours > 0) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} from now`;
  if (diffInHours < 0) return `${Math.abs(diffInHours)} hour${Math.abs(diffInHours) > 1 ? 's' : ''} ago`;
  return 'Now';
};

const EventListPage = async ({
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
    // Admin: all classes
    const classes = await prisma.class.findMany();
    filterOptions = { classes };
  } else if (role === "teacher") {
    // Teacher: only their classes
    const teacherClasses = await prisma.class.findMany({
      where: {
        lessons: {
          some: {
            teacherId: currentUserId!,
          },
        },
      },
    });
    filterOptions = { classes: teacherClasses };
  }

  // --- QUERY LOGIC BASED ON ROLE ---
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;
  const query: Prisma.EventWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            if (value === "school-wide") {
              query.classId = null;
            } else {
              query.classId = parseInt(value);
            }
            break;
          case "status":
            const now = new Date();
            switch (value) {
              case "upcoming":
                query.startTime = { gt: now };
                break;
              case "ongoing":
                query.AND = [
                  { startTime: { lte: now } },
                  { endTime: { gte: now } },
                ];
                break;
              case "past":
                query.endTime = { lt: now };
                break;
            }
            break;
          case "dateFrom":
            query.startTime = { gte: new Date(value) };
            break;
          case "dateTo":
            query.endTime = { lte: new Date(value) };
            break;
          case "search":
            query.OR = [
              { title: { contains: value, mode: "insensitive" } },
              { description: { contains: value, mode: "insensitive" } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // Role-based data restriction
  if (role === "teacher") {
    // Teacher: their classes + school-wide events
    const teacherClassIds = filterOptions.classes?.map(c => c.id) || [];
    query.OR = [
      { classId: null }, // School-wide events
      { classId: { in: teacherClassIds } }, // Their classes
    ];
  } else if (role === "student") {
    // Student: their class + school-wide events
    const studentClass = await prisma.student.findUnique({
      where: { id: currentUserId! },
      select: { classId: true },
    });
    query.OR = [
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
  query.OR = [
      { classId: null }, // School-wide events
      { classId: { in: childClassIds } }, // Their children's classes
    ];
  }

  // --- FETCH DATA ---
  const [data, count] = await prisma.$transaction([
    prisma.event.findMany({
      where: query,
      include: {
        class: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { startTime: "asc" },
    }),
    prisma.event.count({ where: query }),
  ]);

  // --- COLUMNS BASED ON ROLE ---
  const columns = [
    {
      header: "Event",
      accessor: "event",
    },
    {
      header: "Type",
      accessor: "type",
      className: "hidden md:table-cell",
    },
    {
      header: "Date & Time",
      accessor: "datetime",
      className: "hidden lg:table-cell",
    },
    {
      header: "Status",
      accessor: "status",
    },
    ...((role === "admin" || role === "teacher")
      ? [{ header: "Actions", accessor: "action" }]
      : []),
  ];

  // --- RENDER ROW ---
  const renderRow = (item: EventList) => {
    const eventStatus = getEventStatus(item.startTime, item.endTime);
    const isSchoolWide = !item.classId;
    
    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
      >
        <td className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isSchoolWide 
                  ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200'
                  : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
              }`}>
                {isSchoolWide ? '🏫' : '🎓'}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {getRelativeTime(item.startTime)}
              </p>
            </div>
          </div>
        </td>
        <td className="hidden md:table-cell p-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isSchoolWide 
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          }`}>
            {isSchoolWide ? 'School-wide' : item.class?.name || 'Unknown Class'}
          </span>
        </td>
        <td className="hidden lg:table-cell p-4">
          <div className="text-sm">
            <div className="font-medium">
              {new Date(item.startTime).toLocaleDateString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
              {new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </td>
        <td className="p-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${eventStatus.color}`}>
            {eventStatus.label}
          </span>
        </td>
        {(role === "admin" || role === "teacher") && (
          <td className="p-4">
            <div className="flex items-center gap-2">
              {/* Only allow teacher to edit their own class events or school-wide events */}
              {(role === "admin" || 
                (role === "teacher" && (isSchoolWide || filterOptions.classes?.some(c => c.id === item.classId)))) && (
                <>
                  <FormContainer table="event" type="update" data={item} />
                  <FormContainer table="event" type="delete" id={item.id} />
                </>
              )}
            </div>
          </td>
        )}
      </tr>
    );
  };

  // --- FILTERS UI ---
  function Filters() {
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Class filter (admin, teacher) */}
        {(role === "admin" || role === "teacher") && filterOptions.classes && (
          <select
            name="classId"
            defaultValue={searchParams.classId || ""}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            <option value="">All Events</option>
            <option value="school-wide">School-wide Events</option>
            {filterOptions.classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} Events</option>
            ))}
          </select>
        )}
        {/* Status filter (all roles) */}
        <select
          name="status"
          defaultValue={searchParams.status || ""}
          className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          <option value="">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="past">Past</option>
        </select>
        {/* Date range filters (all roles) */}
        <input
          type="date"
          name="dateFrom"
          defaultValue={searchParams.dateFrom || ""}
          className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          placeholder="From date"
        />
        <input
          type="date"
          name="dateTo"
          defaultValue={searchParams.dateTo || ""}
          className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          placeholder="To date"
        />
        {/* Search bar (all roles) */}
        <TableSearch />
        {/* Export button (admin, teacher) */}
        {(role === "admin" || role === "teacher") && (
          <ExportEventsButton events={data} />
        )}
      </div>
    );
  }

  // Export function
  function exportEventsToCSV(events: EventList[]) {
    const headers = ['Title', 'Description', 'Start Time', 'End Time', 'Type', 'Status'];
    const csvContent = [
      headers.join(','),
      ...events.map(event => {
        const eventStatus = getEventStatus(event.startTime, event.endTime);
        const isSchoolWide = !event.classId;
        return [
          `"${event.title}"`,
          `"${event.description || ''}"`,
          `"${new Date(event.startTime).toLocaleString()}"`,
          `"${new Date(event.endTime).toLocaleString()}"`,
          `"${isSchoolWide ? 'School-wide' : event.class?.name || 'Unknown Class'}"`,
          `"${eventStatus.label}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `events_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Events</h1>
        {(role === "admin" || role === "teacher") && (
          <FormContainer table="event" type="create" />
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

export default EventListPage;
