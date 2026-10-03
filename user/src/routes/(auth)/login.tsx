import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/(auth)/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("daniel21fisher@gmail.com");
  const [password, setPassword] = useState("password123");

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#FDF0EE] p-4 sm:p-6 overflow-x-hidden">
      {/* Background Decorative Gradient Blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#FFD7D0]/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#FFE5DF]/60 blur-3xl" />

      {/* Main Modal Card */}
      <div className="relative flex flex-col md:flex-row w-full max-w-[940px] md:h-[560px] rounded-[2.5rem] bg-white/85 md:bg-white backdrop-blur-xl md:backdrop-blur-none border border-white/70 md:border-transparent shadow-[0_25px_60px_-15px_rgba(232,93,86,0.12),0_12px_30px_-10px_rgba(0,0,0,0.06)] overflow-hidden p-3 md:p-5 transition-all duration-300">
        
        {/* Mobile Background Mascot (Subtle translucent character visible behind the form) */}
        <div className="absolute inset-0 md:hidden flex items-center justify-center pointer-events-none overflow-hidden z-0">
          <img
            src="/assets/login.png"
            alt="Mascot Background"
            className="h-[85%] max-h-[420px] w-auto object-contain opacity-25 filter contrast-105"
          />
        </div>

        {/* Left Side: Mascot Card (Desktop) */}
        <div className="relative hidden md:flex w-1/2 h-full flex-col justify-between rounded-[2rem] bg-[#FCECE9] p-7 overflow-hidden">
          {/* Logo / Brand Name */}
          <div className="z-10">
            <span className="text-xl font-black tracking-tight text-[#E85D56]">
              GA<span className="text-[#1F2438]">MING-ARENA</span>
            </span>
          </div>

          {/* Fixed Proportion Mascot Illustration */}
          <div className="absolute inset-0 top-12 flex items-end justify-center pointer-events-none overflow-hidden">
            <img
              src="/assets/login.png"
              alt="Gaming Arena Mascot"
              className="h-[92%] w-auto max-w-full object-contain object-bottom select-none drop-shadow-sm transition-transform duration-300"
            />
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="relative z-10 flex w-full md:w-1/2 flex-col justify-center px-5 py-8 sm:px-10 md:py-6">
          <div className="mx-auto w-full max-w-sm">
            
            {/* Mobile Brand Logo */}
            <div className="mb-6 flex justify-center md:hidden">
              <span className="text-xl font-black tracking-tight text-[#E85D56]">
                GA<span className="text-[#1F2438]">MING-ARENA</span>
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-[#1F2438] text-center mb-8 tracking-tight">
              Login
            </h1>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Email
                </label>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-amber-300/80 bg-white/95 py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 shadow-xs focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 transition"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-200 bg-white/95 py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 shadow-xs focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition"
                  />
                </div>
                {/* Forgot Password */}
                <div className="flex justify-end pt-1">
                  <a
                    href="#forgot-password"
                    className="text-xs font-semibold text-amber-500 hover:text-amber-600 transition"
                  >
                    Forgot Password?
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full cursor-pointer rounded-xl bg-[#FF6562] py-3.5 text-sm font-bold text-white shadow-md shadow-red-200 hover:bg-[#fa534f] active:scale-[0.99] transition duration-150"
              >
                Log In
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="mt-8 text-center text-xs text-gray-500">
              Don't have an account?{" "}
              <a
                href="#signup"
                className="font-bold text-gray-800 underline hover:text-black transition"
              >
                Sign Up here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}