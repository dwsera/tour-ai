"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const router = useRouter();
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (codeSent) {
      codeInputRef.current?.focus();
    }
  }, [codeSent]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setMessage("验证码已发送到您的邮箱");
        setCodeSent(true);
      }
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 6) {
      setError("新密码至少6位");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setMessage("密码重置成功，即将跳转到登录页...");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          {codeSent ? "重置密码" : "忘记密码"}
        </h1>
        <p className="text-center text-sm text-gray-400 mb-8">
          {codeSent
            ? "输入验证码并设置新密码"
            : "输入注册邮箱，我们将发送验证码"}
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md text-center text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-6 p-3 bg-emerald-100 text-emerald-700 rounded-md text-center text-sm">
            {message}
          </div>
        )}

        {!codeSent ? (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                邮箱
              </label>
              <input
                id="email"
                type="email"
                placeholder="请输入注册邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                disabled={loading}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md font-medium transition-all bg-orange-600 hover:bg-orange-700 text-white active:bg-orange-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "发送中..." : "发送验证码"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                验证码
              </label>
              <input
                id="code"
                type="text"
                placeholder="请输入验证码"
                value={code}
                onChange={(e) => setCode(e.target.value.trim())}
                ref={codeInputRef}
                disabled={loading}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                required
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                新密码
              </label>
              <input
                id="newPassword"
                type="password"
                placeholder="至少6位"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                确认新密码
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="再次输入新密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md font-medium transition-all bg-orange-600 hover:bg-orange-700 text-white active:bg-orange-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "重置中..." : "重置密码"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          <Link href="/login" className="text-orange-600 hover:underline focus:outline-none">
            返回登录
          </Link>
        </p>
      </div>
    </div>
  );
}