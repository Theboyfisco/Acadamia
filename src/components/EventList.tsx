import prisma from "@/lib/prisma";
import { Event } from "@prisma/client";

const EventList = async ({ dateParam }: { dateParam: string | undefined }) => {
  const date = dateParam ? new Date(dateParam) : new Date();

  const data = await prisma.event.findMany({
    where: {
      startTime: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lte: new Date(date.setHours(23, 59, 59, 999)),
      },
    },
  });

  return data.map((event: Event) => (
    <div
      className="p-3 rounded-md border-2 border-gray-700 bg-gray-800/50 border-t-4 odd:border-t-blue-400 even:border-t-purple-400"
      key={event.id}
    >
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-gray-200 text-sm">{event.title}</h1>
        <span className="text-gray-400 text-xs">
          {event.startTime.toLocaleTimeString("en-UK", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </span>
      </div>
      <p className="mt-1 text-gray-400 text-xs">{event.description}</p>
    </div>
  ));
};

export default EventList;
