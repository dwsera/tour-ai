"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useXhsStore } from "@/app/store/useXhsStore";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Link2, Loader2, AlertCircle, RefreshCw,
  Sparkles, BookOpen, Map, ChevronRight
} from "lucide-react";

const STEPS = [
  { icon: Link2, label: "粘贴链接", desc: "复制小红书分享内容" },
  { icon: BookOpen, label: "AI 解析", desc: "智能提取笔记信息" },
  { icon: Map, label: "生成行程", desc: "自动规划旅行路线" },
];

const XhsParser = () => {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forceOcr, setForceOcr] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      setErrorMessage("请先登录后再使用");
      return;
    }
    if (!inputText.trim()) {
      setErrorMessage("请粘贴小红书分享链接");
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setStep(1);

    try {
      const parseRes = await fetch("/api/xhs/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link: inputText.trim(), forceOcr }),
      });

      const parseData = await parseRes.json();
      if (!parseRes.ok || parseData.error) throw new Error(parseData.error || "解析失败");

      setStep(2);

      const analyzeRes = await fetch("/api/xhs/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parseData,
          userId: session.user.id,
        }),
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok || analyzeData.error) throw new Error(analyzeData.error || "保存失败");

      useXhsStore.getState().setData(analyzeData);
      router.push(`/dd?noteId=${analyzeData.id}`);
    } catch (err: any) {
      setErrorMessage(err.message);
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-xl shadow-rose-100/50 p-6 sm:p-8"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="w-16 h-16 bg-gradient-to-br from-rose-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-200"
            >
              <BookOpen className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              小红书行程解析
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              粘贴笔记链接，AI 秒速生成专属旅行路线
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = step >= i;
              const isCurrent = step === i && loading;
              return (
                <div key={i} className="flex items-center">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isCurrent
                        ? "bg-rose-500 text-white shadow-lg shadow-rose-200 scale-110"
                        : isActive
                        ? "bg-rose-100 text-rose-600"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      {isCurrent ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-[10px] sm:text-xs mt-1.5 font-medium ${
                      isActive ? "text-gray-700" : "text-gray-400"
                    }`}>{s.label}</span>
                  </motion.div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-6 sm:w-10 h-0.5 mx-1 rounded-full transition-colors duration-300 ${
                      step > i ? "bg-rose-300" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <div className="absolute left-4 top-4 text-gray-300 group-focus-within:text-rose-400 transition-colors">
                <Link2 className="w-5 h-5" />
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="粘贴小红书分享链接或内容..."
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all duration-300 text-sm bg-gray-50/50 placeholder:text-gray-300"
                disabled={loading}
              />
              {inputText && !loading && (
                <button
                  type="button"
                  onClick={() => { setInputText(""); setErrorMessage(null); }}
                  className="absolute right-3 top-3 p-1.5 text-gray-300 hover:text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <label
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                forceOcr
                  ? "bg-amber-50 border-amber-200"
                  : "bg-gray-50/50 border-gray-100 hover:bg-gray-50"
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  forceOcr ? "bg-rose-500 border-rose-500" : "border-gray-300"
                }`}>
                  {forceOcr && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  id="forceOcr"
                  checked={forceOcr}
                  onChange={(e) => setForceOcr(e.target.checked)}
                  className="sr-only"
                  disabled={loading}
                />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                  OCR 全部图片
                </span>
                <p className="text-xs text-gray-400 mt-0.5">正文内容不足时自动识别图片，勾选后强制识别全部</p>
              </div>
            </label>

            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-red-600 text-sm">{errorMessage}</p>
                      {errorMessage.includes("数量已达上限") && (
                        <button
                          type="button"
                          onClick={() => router.push("/cc")}
                          className="mt-2 inline-flex items-center gap-1 text-sm text-rose-500 hover:text-rose-700 font-medium transition-colors"
                        >
                          去管理笔记
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              disabled={loading || !inputText.trim()}
              className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : !inputText.trim()
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 hover:from-rose-600 hover:to-red-600"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {step === 1 ? "正在解析笔记内容..." : "AI 正在生成行程..."}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  开始解析
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-300 text-xs mt-6"
        >
          Powered by AI
        </motion.p>
      </div>
    </div>
  );
};

export default XhsParser;
