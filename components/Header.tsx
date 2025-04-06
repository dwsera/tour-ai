"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

interface HeaderProps {
  onSidebarToggle: () => void;
}

const Header = ({ onSidebarToggle }: HeaderProps) => {
  const { data: session } = useSession(); // 获取当前登录状态

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="flex items-center h-full px-4">
        {/* 左侧菜单按钮 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onSidebarToggle}
          className="absolute left-4"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="pl-20">
          <div className="font-bold text-lg">旅游</div>
        </div>

        {/* 右侧登录/退出 */}
        <div className="ml-auto flex-shrink-0 text-right">
          {session ? (
            <button
              onClick={() => signOut()}
              className="text-lg font-semibold text-red-400 transition-all"
            >
              退出登录
            </button>
          ) : (
            <Link
              href="/login"
              className="text-lg font-semibold text-blue-400 transition-all"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
