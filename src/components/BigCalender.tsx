"use client";

import { Event, Class } from "@prisma/client";
import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type EventWithClass = Event & { class: Class | null };

type BigCalendarProps = {
  events: EventWithClass[];
  role?: string;
  currentUserId?: string;
};

// Helper function to get event status
const getEventStatus = (startTime: Date, endTime: Date) => {
  const now = new Date();
  if (now < startTime) return { status: 'upcoming', color: 'bg-blue-500' };
  if (now >= startTime && now <= endTime) return { status: 'ongoing', color: 'bg-green-500' };
  return { status: 'past', color: 'bg-gray-500' };
};

const BigCalendar = ({ events, role, currentUserId }: BigCalendarProps) => {
  const [value, setValue] = useState<Date | null>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Group events by date for calendar display
  const eventsByDate = events.reduce((acc, event) => {
    const dateKey = new Date(event.startTime).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as { [key: string]: EventWithClass[] });

  // Custom tile content to show event indicators
  const tileContent = ({ date }: { date: Date }) => {
    const dateKey = date.toDateString();
    const dayEvents = eventsByDate[dateKey] || [];
    
    if (dayEvents.length === 0) return null;

    return (
      <div className="flex flex-col items-center gap-1 mt-1">
        {dayEvents.slice(0, 3).map((event, index) => {
          const eventStatus = getEventStatus(event.startTime, event.endTime);
          const isSchoolWide = !event.classId;
          
          return (
            <div
              key={`${event.id}-${index}`}
              className={`w-2 h-2 rounded-full ${eventStatus.color} ${
                isSchoolWide ? 'ring-1 ring-purple-300' : 'ring-1 ring-blue-300'
              }`}
              title={`${event.title} - ${isSchoolWide ? 'School-wide' : event.class?.name || 'Unknown Class'}`}
            />
          );
        })}
        {dayEvents.length > 3 && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            +{dayEvents.length - 3} more
          </div>
        )}
      </div>
    );
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  // Get events for selected date
  const selectedDateEvents = selectedDate 
    ? eventsByDate[selectedDate.toDateString()] || []
    : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar */}
        <div className="flex-1 w-full min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Event Calendar
          </h3>
          <div className="[&_.react-calendar]:bg-white [&_.react-calendar]:dark:bg-gray-800 [&_.react-calendar]:border-gray-200 [&_.react-calendar]:dark:border-gray-700 [&_.react-calendar]:text-gray-900 [&_.react-calendar]:dark:text-gray-200 [&_.react-calendar__tile]:text-gray-900 [&_.react-calendar__tile]:dark:text-gray-200 [&_.react-calendar__tile:hover]:bg-gray-100 [&_.react-calendar__tile:hover]:dark:bg-gray-700 [&_.react-calendar__tile--active]:bg-lamaSky [&_.react-calendar__tile--now]:bg-gray-100 [&_.react-calendar__tile--now]:dark:bg-gray-700 [&_.react-calendar__navigation__label]:text-gray-900 [&_.react-calendar__navigation__label]:dark:text-gray-200 [&_.react-calendar__navigation__arrow]:text-gray-900 [&_.react-calendar__navigation__arrow]:dark:text-gray-200 [&_.react-calendar__month-view__weekdays]:text-gray-500 [&_.react-calendar__month-view__weekdays]:dark:text-gray-400 transition-colors duration-200">
            <Calendar
              onChange={(val) => setValue(Array.isArray(val) ? val[0] : val)}
              value={value}
              tileContent={tileContent}
              onClickDay={handleDateClick}
              className="w-full"
            />
            <style jsx global>{`
              .react-calendar {
                width: 100% !important;
              }
            `}</style>
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Upcoming</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Ongoing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span>Past</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500 ring-1 ring-purple-300"></div>
              <span>School-wide</span>
            </div>
          </div>
        </div>

        {/* Selected Date Events */}
        {selectedDate && (
          <div className="lg:w-80">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
              Events for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h4>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedDateEvents.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No events scheduled for this date
                </p>
              ) : (
                selectedDateEvents.map((event) => {
                  const eventStatus = getEventStatus(event.startTime, event.endTime);
                  const isSchoolWide = !event.classId;
                  
                  return (
                    <div
                      key={event.id}
                      className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${eventStatus.color}`}></div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                            {event.title}
                          </h5>
                          {event.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>
                              {new Date(event.startTime).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })} - {new Date(event.endTime).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            <span>•</span>
                            <span className={`font-medium ${
                              isSchoolWide 
                                ? 'text-purple-600 dark:text-purple-400'
                                : 'text-blue-600 dark:text-blue-400'
                            }`}>
                              {isSchoolWide ? 'School-wide' : event.class?.name || 'Unknown Class'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BigCalendar;
