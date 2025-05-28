import Image from "next/image";
import EventCalendar from "./EventCalendar";
import EventList from "./EventList";

const EventCalendarContainer = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  const { date } = searchParams;
  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-md transition-colors duration-200">
      <EventCalendar />
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold my-2 text-gray-900 dark:text-white">Events</h1>
        <button aria-label="More event options" className="hover:bg-gray-100 dark:hover:bg-gray-700/50 p-1 rounded-full transition-colors">
          <Image src="/more.png" alt="More options icon" width={16} height={16} className="dark:invert" />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <EventList dateParam={date} />
      </div>
    </div>
  );
};

export default EventCalendarContainer;
