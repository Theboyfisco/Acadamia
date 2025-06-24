import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";
import { FaChartPie, FaCalendarAlt, FaMoneyBillWave, FaBullhorn, FaUsers } from "react-icons/fa";

const AdminPage = () => {
  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Page Header */}
      <div className="dashboard-card flex flex-col gap-2 p-6 w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
          <FaUsers className="text-blue-500" /> Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-base">Welcome back! Here&apos;s what&apos;s happening in your school.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        <div className="dashboard-card p-4 flex flex-col items-center w-full">
          <UserCard type="admin" />
        </div>
        <div className="dashboard-card p-4 flex flex-col items-center w-full">
          <UserCard type="teacher" />
        </div>
        <div className="dashboard-card p-4 flex flex-col items-center w-full">
          <UserCard type="student" />
        </div>
        <div className="dashboard-card p-4 flex flex-col items-center w-full">
          <UserCard type="parent" />
        </div>
      </div>

      {/* Charts and Sidebar Row */}
      <div className="flex flex-col xl:flex-row gap-8 w-full">
        {/* Charts Section */}
        <div className="flex-1 flex flex-col gap-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div className="dashboard-card p-6 flex flex-col w-full">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                <FaChartPie className="text-purple-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Statistics</h2>
              </div>
            <CountChartContainer />
            </div>
            <div className="dashboard-card p-6 flex flex-col w-full">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                <FaCalendarAlt className="text-green-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Attendance Overview</h2>
              </div>
              <AttendanceChartContainer />
            </div>
          </div>
          <div className="dashboard-card p-6 flex flex-col w-full">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              <FaMoneyBillWave className="text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Financial Overview</h2>
            </div>
            <FinanceChart />
          </div>
        </div>
        {/* Sidebar Section */}
        <div className="flex flex-col gap-8 w-full xl:max-w-sm xl:w-[350px] self-start">
          <div className="dashboard-card p-6 flex flex-col w-full">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              <FaCalendarAlt className="text-blue-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Events</h2>
            </div>
            <EventCalendarContainer />
          </div>
          <div className="dashboard-card p-6 flex flex-col w-full">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              <FaBullhorn className="text-pink-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Announcements</h2>
            </div>
            <Announcements />
          </div>
        </div>
      </div>

      {/* Full-width Calendar */}
      <div className="dashboard-card p-6 w-full">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
          <FaCalendarAlt className="text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">School Calendar</h2>
        </div>
        <BigCalendarContainer />
      </div>
    </div>
  );
};

export default AdminPage;
