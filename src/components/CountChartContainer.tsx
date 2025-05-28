import Image from "next/image";
import CountChart from "./CountChart";
import prisma from "@/lib/prisma";

type StudentCount = {
  sex: string;
  _count: number;
};

const CountChartContainer = async () => {
  const data = await prisma.student.groupBy({
    by: ["sex"],
    _count: true,
  });

  const boys = data.find((d: StudentCount) => d.sex === "MALE")?._count || 0;
  const girls = data.find((d: StudentCount) => d.sex === "FEMALE")?._count || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl w-full h-full p-4 transition-colors duration-200">
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
      <CountChart boys={boys} girls={girls} />
      {/* BOTTOM */}
      <div className="flex justify-center gap-16">
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-blue-400 rounded-full" />
          <h1 className="font-bold text-gray-900 dark:text-white">{boys}</h1>
          <h2 className="text-xs text-gray-500 dark:text-gray-400">
            Boys ({Math.round((boys / (boys + girls)) * 100)}%)
          </h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-red-400 rounded-full" />
          <h1 className="font-bold text-gray-900 dark:text-white">{girls}</h1>
          <h2 className="text-xs text-gray-500 dark:text-gray-400">
            Girls ({Math.round((girls / (boys + girls)) * 100)}%)
          </h2>
        </div>
      </div>
    </div>
  );
};

export default CountChartContainer;
