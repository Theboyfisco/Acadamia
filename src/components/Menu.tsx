import { currentUser } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/",
        visible: ["admin", "teacher", "student", "parent"],
      },
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
      {
        icon: "/calendar.png",
        label: "Events",
        href: "/list/events",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/message.png",
        label: "Messages",
        href: "/list/messages",
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
    title: "OTHER",
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
    <div className="h-screen flex flex-col overflow-hidden px-3 py-2">
      {menuItems.map((section) => (
        <div key={section.title} className="mb-3">
          <h3 className="hidden lg:block px-3 mb-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {section.title}
          </h3>
          <div className="space-y-0.5">
            {section.items.map((item) => {
              if (!item.visible.includes(role)) return null;

              if (item.label === "Logout") {
                return (
                  <SignOutButton key={item.label}>
                    <button
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                      aria-label={item.label}
                    >
                      <Image 
                        src={item.icon} 
                        alt="" 
                        width={18} 
                        height={18}
                        className="opacity-60 group-hover:opacity-100 transition-opacity" 
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
                  className="flex items-center gap-2.5 px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                  aria-label={item.label}
                >
                  <Image 
                    src={item.icon} 
                    alt="" 
                    width={18} 
                    height={18}
                    className="opacity-60 group-hover:opacity-100 transition-opacity" 
                  />
                  <span className="hidden lg:block text-sm font-medium">{item.label}</span>
                </Link>
              );
          })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Menu;
