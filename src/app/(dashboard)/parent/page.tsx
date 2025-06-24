import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";
  
const ParentPage = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Parent Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Welcome back! Here&apos;s your child&apos;s academic overview.</p>
      </div>

      {/* User Cards Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UserCard type="parent" />
          <UserCard type="student" />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Count Chart */}
        <div className="lg:col-span-1 mb-6 lg:mb-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 h-[450px]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Child&apos;s Statistics</h3>
            <CountChartContainer />
          </div>
        </div>
        
        {/* Attendance Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 h-[450px]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Child&apos;s Attendance</h3>
            <AttendanceChartContainer />
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Child&apos;s Performance</h3>
        <div className="h-[500px]">
          <FinanceChart />
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Child&apos;s Schedule</h3>
            <div className="h-[400px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              <p>Child&apos;s schedule view will be implemented here</p>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Events</h3>
            <EventCalendarContainer />
      </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Announcements</h3>
        <Announcements />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentPage;
