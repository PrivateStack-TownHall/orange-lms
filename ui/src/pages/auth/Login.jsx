import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  BookOpen,
  Users,
  TrendingUp,
} from "lucide-react";

import { setLoading, setUser, setError } from "@/app/store/slices/authSlice";
import AuthService from "@/services/modules/auth.service";

import logoWhite from "@/assets/logo/logo_white.png";
import logo from "@/assets/logo/logo.png";
import illustration from "@/assets/images/assets-toga-buku.png";

const features = [
  {
    icon: BookOpen,
    title: "Organize Classes",
    desc: "Create and manage classes with ease.",
  },
  {
    icon: Users,
    title: "Engage Learners",
    desc: "Collaborate and communicate in one place.",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    desc: "Monitor learning and achievement in real-time.",
  },
];

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));

    try {
      const response = await AuthService.login(form);
      const token = response.data.access_token;

      localStorage.setItem("access_token", token);

      const user = await AuthService.me();
      AuthService.saveSession(token, user);

      dispatch(setUser({ user, token }));
      navigate("/dashboard");
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Login failed"));
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* LEFT PANEL */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative hidden md:flex md:w-1/2 flex-col justify-between overflow-hidden p-12 text-white"
        style={{
          background: "linear-gradient(160deg, #f97316 0%, #fb923c 100%)",
        }}
      >
        {/* dotted pattern - pojok kanan atas saja */}
        <div
          className="pointer-events-none absolute top-8 right-8 w-24 h-24 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.9) 1.5px, transparent 1.5px)",
            backgroundSize: "12px 12px",
          }}
        />

        {/* logo kecil + teks */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src={logoWhite}
            alt="Orange LMS"
            className="h-8 w-8 object-contain"
          />
          <span className="text-lg font-bold tracking-wide">ORANGE LMS</span>
        </div>

        {/* headline + fitur */}
        <div className="max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4"
          >
            Learning.
            <br />
            Together.
            <br />
            Anywhere.
          </motion.h1>

          <p className="text-white/90 mb-8 leading-relaxed">
            Orange LMS helps you manage classes, track progress, and create
            meaningful learning experiences.
          </p>

          <div className="space-y-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }}
                className="flex items-start gap-3"
              >
                <div className="w-9 h-9 shrink-0 rounded-lg bg-white/20 flex items-center justify-center">
                  <f.icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="text-xs text-white/80">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ilustrasi toga + buku */}
        <motion.img
          src={illustration}
          alt="Orange LMS illustration"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="w-56 lg:w-64 self-start object-contain drop-shadow-xl shrink-0"
        />
      </motion.div>

      {/* RIGHT PANEL */}
      <div className="relative flex flex-1 items-center justify-center p-6 bg-slate-50">
        <div
          className="pointer-events-none absolute top-6 right-6 w-20 h-20 opacity-20 hidden md:block"
          style={{
            backgroundImage:
              "radial-gradient(circle, #f97316 1.5px, transparent 1.5px)",
            backgroundSize: "10px 10px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-10"
        >
          {/* logo mark */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={logo}
              alt="Orange LMS"
              className="h-16 w-auto object-contain mb-2"
            />
          </div>

          <h1 className="text-2xl font-bold text-center text-slate-800 mb-1">
            Welcome back!
          </h1>
          <p className="text-sm text-center text-slate-400 mb-8">
            Sign in to continue to your account
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4 p-3 rounded-lg bg-red-100 text-red-600 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 rounded-lg border border-slate-200 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-orange-500 hover:text-orange-600"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 rounded-lg border border-slate-200 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3 rounded-lg bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">or continue with</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.55-5.17 3.55-8.65z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.92l-3.88-3c-1.08.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.93H1.3v3.1C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.31 14.3a7.2 7.2 0 0 1 0-4.6v-3.1H1.3a12 12 0 0 0 0 10.8z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.3 6.6l4.01 3.1C6.25 6.86 8.89 4.75 12 4.75z"
                />
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <svg width="16" height="16" viewBox="0 0 23 23">
                <path fill="#F35325" d="M1 1h10v10H1z" />
                <path fill="#81BC06" d="M12 1h10v10H12z" />
                <path fill="#05A6F0" d="M1 12h10v10H1z" />
                <path fill="#FFBA08" d="M12 12h10v10H12z" />
              </svg>
              Microsoft
            </button>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              className="text-orange-500 font-medium hover:text-orange-600"
            >
              Contact Admin
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
