import Image from "next/image";
import AttendanceChart from "./AttendanceChart";
import prisma from "@/lib/prisma";

type AttendanceData = {
  date: Date;
  present: boolean;
};

const AttendanceChartContainer = async () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const lastMonday = new Date(today);

  lastMonday.setDate(today.getDate() - daysSinceMonday);

  const resData = await prisma.attendance.findMany({
    where: {
      date: {
        gte: lastMonday,
      },
    },
    select: {
      date: true,
      present: true,
    },
  });

  // console.log(data)

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const attendanceMap: { [key: string]: { present: number; absent: number } } =
    {
      Mon: { present: 0, absent: 0 },
      Tue: { present: 0, absent: 0 },
      Wed: { present: 0, absent: 0 },
      Thu: { present: 0, absent: 0 },
      Fri: { present: 0, absent: 0 },
    };

  resData.forEach((item: AttendanceData) => {
    const itemDate = new Date(item.date);
    const dayOfWeek = itemDate.getDay();
    
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const dayName = daysOfWeek[dayOfWeek - 1];

      if (item.present) {
        attendanceMap[dayName].present += 1;
      } else {
        attendanceMap[dayName].absent += 1;
      }
    }
  });

  const data = daysOfWeek.map((day) => ({
    name: day,
    present: attendanceMap[day].present,
    absent: attendanceMap[day].absent,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 h-full transition-colors duration-200">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold my-4 text-gray-900 dark:text-white">Attendance</h1>
        <button aria-label="More attendance options" className="hover:bg-gray-100 dark:hover:bg-gray-700/50 p-1 rounded-full transition-colors">
          <Image src="/more.png" alt="More options icon" width={20} height={20} className="dark:invert" />
        </button>
      </div>
      <AttendanceChart data={data}/>
    </div>
  );
};

export default AttendanceChartContainer;
