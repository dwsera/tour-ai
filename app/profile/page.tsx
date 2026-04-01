"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Edit3, Save, X, Loader2,
  CheckCircle2, AlertCircle, Lock, Eye, EyeOff, Shield,
  ChevronRight, BadgeCheck, Camera, Sparkles, Calendar,
  ArrowRight, UserRound, Bell, ShieldCheck, Moon, Sun
} from "lucide-react";

const Profile = () => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setUsername(data.username || session?.user?.username || "");
        setBio(data.bio || "");
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!username) {
      showToast("error", "请输入昵称");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, bio }),
      });
      if (res.ok) {
        await update({ username, bio, email: session?.user?.email });
        showToast("success", "资料已保存");
        setEditing(false);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast("error", data.error || "保存失败");
      }
    } catch {
      showToast("error", "网络异常");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setUsername(session?.user?.username || "");
    setBio("");
    setEditing(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("error", "请填写所有密码字段");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("error", "两次密码不一致");
      return;
    }
    if (newPassword.length < 6) {
      showToast("error", "密码长度至少6位");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "changePassword",
          currentPassword,
          newPassword,
        }),
      });
      if (res.ok) {
        showToast("success", "密码修改成功");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json().catch(() => ({}));
        showToast("error", data.error || "修改失败");
      }
    } catch {
      showToast("error", "请求失败");
    } finally {
      setChangingPassword(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20 selection:bg-orange-100">
      {/* 顶部渐变背景 */}
      <div className="h-52 w-full bg-gradient-to-r from-orange-100/50 to-rose-100/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F8FAFC]" />
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 3, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-28 -right-28 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-28 relative z-10">
        {/* 主卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl border border-white/10 shadow-lg shadow-orange-200/10 overflow-hidden"
        >
          <div className="p-8 md:p-12">
            {/* 头像 + 信息 */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
              <div className="relative group">
                <div className="w-36 h-36 rounded-3xl overflow-hidden border-4 border-white shadow-md bg-slate-100">
                  <img
                    src="/1.jpg"
                    alt="Avatar"
                    className="w-full h-full object-cover duration-700 group-hover:scale-110"
                  />
                </div>
              </div>

              <div className="text-center md:text-left flex-1">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h1 className="text-4xl font-bold text-slate-800">{username || "用户"}</h1>
                  <BadgeCheck size={22} className="text-orange-500 fill-orange-50" />
                </div>
                <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-1.5 mt-1">
                  <Mail size={14} /> {session?.user?.email}
                </p>
                <div className="mt-5 flex gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-bold uppercase tracking-wider rounded-full">
                    正式账户
                  </span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider rounded-full">
                    已验证
                  </span>
                </div>
              </div>

              {/* PC 编辑按钮 */}
              <div className="hidden md:block">
                <AnimatePresence mode="wait">
                  {!editing ? (
                    <motion.button
                      key="edit"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setEditing(true)}
                      className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-200 flex items-center gap-2"
                    >
                      <Edit3 size={16} /> 编辑资料
                    </motion.button>
                  ) : (
                    <motion.div
                      key="actions"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-2"
                    >
                      <button
                        onClick={handleCancelEdit}
                        className="px-5 py-3 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-200 flex items-center gap-2"
                      >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        保存
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* 左侧：资料 */}
              <div className="space-y-8">
                <section>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                    昵称
                  </label>
                  {editing ? (
                    <input
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-slate-700 font-bold text-lg">{username || "未设置"}</p>
                    </div>
                  )}
                </section>

                <section>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                    个人简介
                  </label>
                  {editing ? (
                    <textarea
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all resize-none"
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  ) : (
                    <p className="text-slate-600 leading-relaxed text-sm">
                      {bio || "这个人很懒，还没有留下简介～"}
                    </p>
                  )}
                </section>
              </div>

              {/* 右侧：安全中心 */}
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-amber-500">
                    <Shield size={20} />
                  </div>
                  <h3 className="font-bold text-slate-800">安全中心</h3>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <label className="text-xs font-bold text-slate-400 mb-1.5 block">
                      当前密码
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="输入当前密码"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="text-xs font-bold text-slate-400 mb-1.5 block">
                      新密码
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="6位以上新密码"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="relative">
                    <label className="text-xs font-bold text-slate-400 mb-1.5 block">
                      确认密码
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="再次输入新密码"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={changingPassword || !newPassword}
                    className="w-full py-3 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
                  >
                    {changingPassword ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Lock size={14} />
                    )}
                    修改密码
                  </button>
                </div>
              </div>
            </div>

            {/* 移动端编辑按钮 */}
            <div className="mt-10 md:hidden">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold"
                >
                  编辑个人资料
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 py-4 bg-orange-600 text-white rounded-xl font-bold"
                  >
                    保存
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* 底部信息卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
                <UserRound size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">用户标识</p>
                <p className="text-sm font-bold text-slate-700">
                  {session?.user?.id || "---"}
                </p>
              </div>
            </div>
            <Sparkles className="text-orange-200" size={18} />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">安全邮箱</p>
                <p className="text-sm font-bold text-slate-700">{session?.user?.email}</p>
              </div>
            </div>
            <BadgeCheck className="text-rose-200" size={18} />
          </div>
        </motion.div>
      </div>

      {/* 提示弹窗 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl shadow-xl backdrop-blur-md border border-white/20 flex items-center gap-3 font-bold text-sm ${toast.type === "success"
              ? "bg-emerald-500 text-white"
              : "bg-rose-500 text-white"
              }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Profile;