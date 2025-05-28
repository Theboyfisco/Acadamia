"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const TableSearch = () => {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const value = (e.currentTarget[0] as HTMLInputElement).value;

    const params = new URLSearchParams(window.location.search);
    params.set("search", value);
    router.push(`${window.location.pathname}?${params}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-200 dark:ring-gray-700 px-2 bg-gray-100 dark:bg-gray-700/50 font-sans"
    >
      <button type="submit" aria-label="Search">
        <Image src="/search.png" alt="" width={14} height={14} className="dark:invert" />
      </button>
      <input
        type="text"
        placeholder="Search..."
        className="w-[200px] p-2 bg-transparent outline-none text-gray-700 dark:text-gray-300 placeholder-gray-500 font-medium"
      />
    </form>
  );
};

export default TableSearch;
