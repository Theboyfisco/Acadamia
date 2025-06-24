import { currentUser } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

const menuItems = [
  {
    title: "DASHBOARD",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
  {
    title: "ACADEMIC",
    items: [
      {
        icon: "/teacher.png",
        label: "Teachers",
        href: "/list/teachers",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/student.png",
        label: "Students",
        href: "/list/students",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/parent.png",
        label: "Parents",
        href: "/list/parents",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/subject.png",
        label: "Subjects",
        href: "/list/subjects",
        visible: ["admin"],
      },
      {
        icon: "/class.png",
        label: "Classes",
        href: "/list/classes",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/lesson.png",
        label: "Lessons",
        href: "/list/lessons",
        visible: ["admin", "teacher"],
      },
    ],
  },
  {
    title: "ASSESSMENT",
    items: [
      {
        icon: "/exam.png",
        label: "Exams",
        href: "/list/exams",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/assignment.png",
        label: "Assignments",
        href: "/list/assignments",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/result.png",
        label: "Results",
        href: "/list/results",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/attendance.png",
        label: "Attendance",
        href: "/list/attendance",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
  {
    title: "COMMUNICATION",
    items: [
      {
        icon: "/calendar.png",
        label: "Events",
        href: "/list/events",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/announcement.png",
        label: "Announcements",
        href: "/list/announcements",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      {
        icon: "/profile.png",
        label: "Profile",
        href: "/profile",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/setting.png",
        label: "Settings",
        href: "/settings",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/logout.png",
        label: "Logout",
        href: "/logout",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
];

const Menu = async () => {
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto px-3 py-4">
      {menuItems.map((section) => {
        // Filter items that are visible for the current role
        const visibleItems = section.items.filter(item => item.visible.includes(role));
        
        // Don't render section if no items are visible
        if (visibleItems.length === 0) return null;

        return (
          <div key={section.title} className="mb-6">
            <h3 className="hidden lg:block px-3 mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {section.title}
          </h3>
            <div className="space-y-1">
              {visibleItems.map((item) => {
              if (item.label === "Logout") {
                return (
                  <SignOutButton key={item.label}>
                    <button
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group"
                      aria-label={item.label}
                    >
                      <Image 
                        src={item.icon} 
                        alt="" 
                        width={18} 
                        height={18}
                          className="opacity-70 group-hover:opacity-100 transition-opacity" 
                      />
                      <span className="hidden lg:block text-sm font-medium">{item.label}</span>
                    </button>
                  </SignOutButton>
                );
              }

              return (
                <Link
                  href={item.href}
                  key={item.label}
                    className="flex items-center gap-3 px-3 py-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group"
                  aria-label={item.label}
                >
                  <Image 
                    src={item.icon} 
                    alt="" 
                    width={18} 
                    height={18}
                      className="opacity-70 group-hover:opacity-100 transition-opacity" 
                  />
                  <span className="hidden lg:block text-sm font-medium">{item.label}</span>
                </Link>
              );
          })}
          </div>
        </div>
        );
      })}
    </div>
  );
};

export default Menu;
