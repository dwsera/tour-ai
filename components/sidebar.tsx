"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname(); // 获取当前路径

  return (
    <aside
      className={cn(
        "fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-60 bg-white shadow-md transition-transform duration-300 ease-in-out",
        !isOpen && "-translate-x-full"
      )}
    >
      <nav className="space-y-3 p-4">
        {[
          { name: "景点推荐", path: "/" },
          { name: "地图推荐", path: "/create" },
          { name: "AI", path: "/reply" },
          // { name: "结果", path: "/jg" },
          { name: "小红书链接解析", path: "/xhs" },
          { name: "我的行程", path: "/cc" },

        ].map(({ name, path }) => (
          <Button
            key={path}
            variant="ghost"
            className={cn(
              "w-full justify-start flex items-center rounded-lg transition-all",
              "h-12 text-base px-4 py-3", // 默认小屏幕尺寸
              "md:h-14 md:text-lg md:px-6 md:py-4", // 中等屏幕
              "lg:h-16 lg:text-xl lg:px-8 lg:py-5", // 大屏幕
              pathname === path ? "bg-gray-100 font-semibold text-black" : "text-gray-600"
            )}
            asChild
          >
            <a href={path}>{name}</a>
          </Button>
        ))}
      </nav>


    </aside>
  );
}
