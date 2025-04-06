"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useXhsStore } from "@/app/store/useXhsStore";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

const XhsParser = () => {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forceOcr, setForceOcr] = useState(false); // 勾选框状态
  const router = useRouter();
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      setErrorMessage("请先登录！");
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/xhs/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link: inputText.trim(), userId: session.user.id, forceOcr }), // 传递 forceOcr
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "解析失败");
      }

      useXhsStore.getState().setData(data);
      router.push(`/dd?noteId=${data.id}`);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">小红书笔记解析</h1>
        <p className="text-gray-500 text-center mb-6">
          粘贴小红书分享链接，快速解析笔记内容，生成专属行程！
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="粘贴小红书分享内容..."
              className="w-full p-4 border border-gray-200 rounded-lg h-32 resize-none focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all duration-300"
              disabled={loading}
            />
            <motion.div
              className="absolute inset-0 -z-10 rounded-lg bg-pink-100 opacity-0"
              transition={{ duration: 0.3 }}
              animate={{ opacity: inputText ? 0.2 : 0 }}
            />
          </motion.div>

          {/* 勾选框：强制执行 OCR */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="forceOcr"
              checked={forceOcr}
              onChange={(e) => setForceOcr(e.target.checked)}
              className="h-4 w-4 text-pink-500 focus:ring-pink-300 border-gray-300 rounded"
              disabled={loading}
            />
            <label htmlFor="forceOcr" className="text-gray-700 text-sm">
              如果刚刚解析的内容不一致，请勾选这个，不够识别会有点久哦
            </label>
          </div>

          {/* 错误提示 */}
          {errorMessage && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm text-center"
            >
              {errorMessage}
              {errorMessage.includes("数量已达上限") && (
                <span>
                  {" "}
                  <a href="/cc" className="underline text-pink-500 hover:text-pink-700">
                    去删除笔记
                  </a>
                </span>
              )}
            </motion.p>
          )}

          <motion.button
            type="submit"
            whileHover={{ scale: !loading ? 1.05 : 1 }}
            whileTap={{ scale: !loading ? 0.95 : 1 }}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>解析中...</span>
              </>
            ) : (
              <span>解析链接</span>
            )}
          </motion.button>
        </form>
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Powered by <span className="text-pink-500 font-semibold">小红书</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default XhsParser;