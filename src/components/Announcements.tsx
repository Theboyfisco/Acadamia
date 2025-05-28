"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

type Announcement = {
  id: number;
  title: string;
  content: string;
  date: string;
};

const Announcements = () => {
  const [data, setData] = useState<Announcement[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      setData(data);
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-md p-3 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Announcements</h1>
        <button
          onClick={() => router.push("/announcements")}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Image
            src="/icons/more.svg"
            alt="more"
            width={16}
            height={16}
            className="dark:invert"
          />
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {data.map((announcement) => (
          <div
            key={announcement.id}
            className="p-3 rounded-md border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              <h1 className="font-semibold text-gray-900 dark:text-gray-200 text-sm">{announcement.title}</h1>
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                {new Date(announcement.date).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-1 text-gray-600 dark:text-gray-400 text-xs">{announcement.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
