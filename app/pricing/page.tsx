"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, Zap, Crown, Loader2 } from "lucide-react";

const plans = [
  {
    name: "免费版",
    icon: Zap,
    price: "免费",
    period: "",
    description: "体验基础功能，适合偶尔使用",
    color: "from-gray-500 to-gray-600",
    features: [
      { text: "每日 3 次 AI 行程生成", included: true },
      { text: "每日 3 次小红书笔记解析", included: true },
      { text: "基础景点推荐", included: true },
      { text: "地图路线展示", included: true },
      { text: "保存行程记录", included: true },
      { text: "高级 AI 模型", included: false },
      { text: "无限次生成", included: false },
      { text: "优先客服支持", included: false },
    ],
    current: false,
  },
  {
    name: "Pro 版",
    icon: Sparkles,
    price: "¥29",
    period: "/月",
    description: "高频旅行者首选，解锁全部功能",
    color: "from-orange-400 to-rose-500",
    features: [
      { text: "无限次 AI 行程生成", included: true },
      { text: "无限次小红书笔记解析", included: true },
      { text: "高级 AI 模型（千问 Max）", included: true },
      { text: "智能图片 OCR 识别", included: true },
      { text: "地图路线展示", included: true },
      { text: "无限保存行程记录", included: true },
      { text: "个性化行程偏好", included: true },
      { text: "优先客服支持", included: true },
    ],
    current: true,
  },
  {
    name: "团队版",
    icon: Crown,
    price: "¥99",
    period: "/月",
    description: "适合旅行社团、定制游工作室",
    color: "from-amber-400 to-orange-500",
    features: [
      { text: "Pro 版全部功能", included: true },
      { text: "最多 10 人团队协作", included: true },
      { text: "团队行程共享", included: true },
      { text: "品牌定制（Logo/名称）", included: true },
      { text: "API 接口调用", included: true },
      { text: "批量笔记解析", included: true },
      { text: "数据导出（Excel/PDF）", included: true },
      { text: "专属客户经理", included: true },
    ],
    current: false,
  },
];

const Pricing = () => {
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const handleUpgrade = (planName: string) => {
    setUpgrading(planName);
    setTimeout(() => {
      setUpgrading(null);
      alert(`正在订阅${planName}，功能即将上线，敬请期待！`);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            选择适合你的方案
          </h1>
          <p className="text-gray-400 mt-3 text-base max-w-lg mx-auto">
            从免费版开始体验，随时订阅解锁更多功能
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isCurrent = plan.current;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  isCurrent
                    ? "border-orange-200 ring-2 ring-orange-500/20"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-rose-500" />
                )}

                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                      {isCurrent ? (
                        <span className="text-xs text-orange-500 font-medium">当前方案</span>
                      ) : plan.name === "Pro 版" ? (
                        <span className="text-xs text-orange-500 font-medium">最受欢迎</span>
                      ) : null}
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-5">{plan.description}</p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && (
                      <span className="text-sm text-gray-400">{plan.period}</span>
                    )}
                  </div>

                  {isCurrent ? (
                    <div className="w-full py-3 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-600 text-center flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      当前方案
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.name)}
                      disabled={upgrading !== null}
                      className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                        plan.name === "团队版"
                          ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-200/50"
                          : "bg-gradient-to-r from-orange-400 to-rose-500 text-white hover:shadow-lg hover:shadow-orange-200/50"
                      } disabled:opacity-50`}
                    >
                      {upgrading === plan.name ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                        订阅中...
                        </>
                      ) : (
                        plan.name === "团队版" ? "联系我们" : "立即订阅"
                      )}
                    </button>
                  )}

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature.text} className="flex items-start gap-2.5">
                          {feature.included ? (
                            <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 mt-0.5 flex-shrink-0 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-gray-200" />
                            </div>
                          )}
                          <span className={`text-sm ${
                            feature.included ? "text-gray-700" : "text-gray-300"
                          }`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-3 bg-orange-50 rounded-xl">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-600 font-medium">
              所有付费方案均支持 7 天无理由退款
            </span>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Pricing;