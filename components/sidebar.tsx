"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const mainMenu = [
    { name: "景点推荐", path: "/" },
    { name: "路线规划", path: "/create" },
    { name: "AI 助手", path: "/reply" },
    { name: "笔记解析", path: "/xhs" },
    { name: "我的行程", path: "/cc" },
    { name: "旅行日记", path: "/diary" },
  ];

  const userMenu = [
    { name: "个人中心", path: "/profile" },
    { name: "定价方案", path: "/pricing" },
    { name: "联系我们", path: "/contact" },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-60 bg-white shadow-md transition-transform duration-300 ease-in-out flex flex-col",
        !isOpen && "-translate-x-full"
      )}
    >
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {mainMenu.map(({ name, path }) => (
            <Link
              key={path}
              href={path}
              className={cn(
                "flex items-center w-full justify-start rounded-lg transition-all h-10 text-sm px-3",
                pathname === path ? "bg-gray-100 font-semibold text-black" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              {name}
            </Link>
          ))}
        </div>

        <div className="my-3 border-t border-gray-100" />
        <div className="space-y-1">
          {userMenu.map(({ name, path }) => (
            <Link
              key={path}
              href={path}
              className={cn(
                "flex items-center w-full justify-start rounded-lg transition-all h-10 text-sm px-3",
                pathname === path ? "bg-gray-100 font-semibold text-black" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              {name}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
