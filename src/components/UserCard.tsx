import prisma from "@/lib/prisma";
import Image from "next/image";
import { useState } from "react";

const UserCard = async ({
  type,
}: {
  type: "admin" | "teacher" | "student" | "parent";
}) => {
  const modelMap: Record<typeof type, any> = {
    admin: prisma.admin,
    teacher: prisma.teacher,
    student: prisma.student,
    parent: prisma.parent,
  };

  const data = await modelMap[type].count();
  
  // Get additional stats based on user type
  const additionalStats = await (async () => {
    switch (type) {
      case "teacher":
        return await prisma.lesson.count();
      case "student":
        return await prisma.attendance.count({
          where: { present: true }
        });
      case "parent":
        return await prisma.student.count({
          where: {
            parentId: {
              not: ""
            }
          }
        });
      default:
        return null;
    }
  })();

  // Calculate trend based on current vs target numbers
  const getTrend = () => {
    const targetNumbers = {
      admin: 5,
      teacher: 20,
      student: 100,
      parent: 50
    };
    
    const target = targetNumbers[type];
    const trend = ((data - target) / target) * 100;
    return {
      value: trend,
      isPositive: trend > 0
    };
  };

  const trend = getTrend();

  const getTypeIcon = () => {
    switch (type) {
      case "admin":
        return "/admin.png";
      case "teacher":
        return "/teacher.png";
      case "student":
        return "/student.png";
      case "parent":
        return "/parent.png";
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 p-4 flex-1 min-w-[130px] group hover:shadow-lg hover:shadow-gray-200 dark:hover:shadow-gray-700/20 transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-green-600 dark:text-green-400 font-medium">
          2024/25
        </span>
        <div className="relative">
          <button 
            aria-label={`More ${type} options`}
            className="hover:bg-gray-100 dark:hover:bg-gray-700/50 p-1 rounded-full transition-colors"
          >
            <Image src="/more.png" alt="More options icon" width={20} height={20} className="dark:invert" />
          </button>
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border border-gray-200 dark:border-gray-700">
            <div className="py-1">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                <Image src="/view.png" alt="" width={16} height={16} className="dark:invert" />
                View Details
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                <Image src="/export.png" alt="" width={16} height={16} className="dark:invert" />
                Export Data
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                <Image src="/manage.png" alt="" width={16} height={16} className="dark:invert" />
                Manage {type}s
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 my-4">
        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center">
          <Image src={getTypeIcon()} alt={`${type} icon`} width={24} height={24} className="dark:invert" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{data}</h1>
          <div className="flex items-center gap-1">
            <span className="capitalize text-sm font-medium text-gray-500 dark:text-gray-400">{type}s</span>
            <span className={`text-xs ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} flex items-center gap-0.5`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {additionalStats !== null && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Image 
              src={type === "teacher" ? "/lesson.png" : type === "student" ? "/attendance.png" : "/children.png"} 
              alt="" 
              width={16} 
              height={16} 
              className="opacity-80 dark:invert"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {type === "teacher" && `${additionalStats} Lessons`}
              {type === "student" && `${additionalStats} Present Days`}
              {type === "parent" && `${additionalStats} Children`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCard;
