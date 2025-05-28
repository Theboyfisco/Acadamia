import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Lesson, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

type LessonList = Lesson & { subject: Subject } & { class: Class } & {
  teacher: Teacher;
};


const LessonListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

const { sessionClaims } = auth();
const role = (sessionClaims as any)?.o?.rol;


const columns = [
  {
    header: "Subject Name",
    accessor: "name",
  },
  {
    header: "Class",
    accessor: "class",
  },
  {
    header: "Teacher",
    accessor: "teacher",
    className: "hidden md:table-cell",
  },
  ...(role === "admin"
    ? [
        {
          header: "Actions",
          accessor: "action",
        },
      ]
    : []),
];

const renderRow = (item: LessonList) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
  >
    <td className="flex items-center gap-4 p-4">{item.subject.name}</td>
    <td>{item.class.name}</td>
    <td className="hidden md:table-cell">
      {item.teacher.name + " " + item.teacher.surname}
    </td>
    <td>
      <div className="flex items-center gap-2">
        {role === "admin" && (
          <>
            <FormContainer 
              table="lesson" 
              type="update" 
              data={item} 
              relatedData={{ subjects, teachers, classes }}
            />
            <FormContainer table="lesson" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
);

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.LessonWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.classId = parseInt(value);
            break;
          case "teacherId":
            query.teacherId = value;
            break;
          case "search":
            query.OR = [
              { subject: { name: { contains: value, mode: "insensitive" } } },
              { teacher: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: query,
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true } },
        teacher: { select: { name: true, surname: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.lesson.count({ where: query }),
  ]);

  // Fetch related data for the form
  const [subjects, teachers, classes] = await prisma.$transaction([
    prisma.subject.findMany(),
    prisma.teacher.findMany(),
    prisma.class.findMany(),
  ]);

  return (
    <div className="bg-gray-800 p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold text-white">All Lessons</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition-colors" aria-label="Filter lessons">
              <Image src="/filter.png" alt="" width={14} height={14} className="invert" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition-colors" aria-label="Sort lessons">
              <Image src="/sort.png" alt="" width={14} height={14} className="invert" />
            </button>
            {role === "admin" && (
              <FormContainer 
                table="lesson" 
                type="create" 
                relatedData={{ subjects, teachers, classes }}
              />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default LessonListPage;
