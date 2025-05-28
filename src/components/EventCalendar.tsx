"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

const EventCalendar = () => {
  const [value, onChange] = useState<Value>(new Date());

  const router = useRouter();

  useEffect(() => {
    if (value instanceof Date) {
      router.push(`?date=${value}`);
    }
  }, [value, router]);

  return (
    <div className="[&_.react-calendar]:bg-white [&_.react-calendar]:dark:bg-gray-800 [&_.react-calendar]:border-gray-200 [&_.react-calendar]:dark:border-gray-700 [&_.react-calendar]:text-gray-900 [&_.react-calendar]:dark:text-gray-200 [&_.react-calendar__tile]:text-gray-900 [&_.react-calendar__tile]:dark:text-gray-200 [&_.react-calendar__tile:hover]:bg-gray-100 [&_.react-calendar__tile:hover]:dark:bg-gray-700 [&_.react-calendar__tile--active]:bg-blue-500 [&_.react-calendar__tile--now]:bg-gray-100 [&_.react-calendar__tile--now]:dark:bg-gray-700 [&_.react-calendar__navigation__label]:text-gray-900 [&_.react-calendar__navigation__label]:dark:text-gray-200 [&_.react-calendar__navigation__arrow]:text-gray-900 [&_.react-calendar__navigation__arrow]:dark:text-gray-200 [&_.react-calendar__month-view__weekdays]:text-gray-500 [&_.react-calendar__month-view__weekdays]:dark:text-gray-400 transition-colors duration-200">
      <Calendar onChange={onChange} value={value} />
    </div>
  );
};

export default EventCalendar;
