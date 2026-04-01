"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, LogOut, User, ChevronDown, UserCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

interface HeaderProps {
  onSidebarToggle: () => void;
}

const Header = ({ onSidebarToggle }: HeaderProps) => {
  const { data: session, status } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = session?.user?.username || session?.user?.email || "";
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "";
  const isLoading = status === "loading";

  return (
   <header className="sticky top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 flex-shrink-0">
      <div className="flex items-center h-full px-4 max-w-screen-2xl mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSidebarToggle}
          className="absolute left-4 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </Button>

        <div className="pl-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-orange-400 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">T</span>
            </div>
            <span className="font-bold text-lg text-gray-800">Tour-Ai</span>
          </Link>
        </div>

        <div className="ml-auto flex-shrink-0" ref={dropdownRef}>
          {isLoading ? (
            <div className="flex items-center gap-2.5 px-3 py-1.5">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              <div className="hidden sm:flex flex-col gap-1">
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ) : session ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-full hover:bg-gray-50 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm ring-2 ring-white">
                  <img src="/1.jpg" alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate hidden sm:block">
                  {displayName}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                    showDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm">
                        <img src="/1.jpg" alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {displayName}
                        </p>
                        {session.user?.email && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {session.user.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <UserCircle className="w-4 h-4" />
                      个人中心
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      联系我们
                    </Link>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        localStorage.clear();
                        signOut({ callbackUrl: "/login" });
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      退出登录
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-rose-500 text-white text-sm font-medium rounded-full hover:shadow-md hover:shadow-orange-200 transition-all duration-200"
            >
              <User className="w-4 h-4" />
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;