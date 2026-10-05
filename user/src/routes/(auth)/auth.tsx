import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, Eye, EyeOff, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLogin, useSignup } from "@/hooks/useAuth";

export const Route = createFileRoute("/(auth)/auth")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isSignUp, setIsSignUp] = useState(false);
  const loginMutation = useLogin();
  const signupMutation = useSignup();

  const [loginEmail, setLoginEmail] = useState("daniel21fisher@gmail.com");
  const [loginPassword, setLoginPassword] = useState("password123");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  const LoginHandler =(e: React.FormEvent)=>{
    e.preventDefault();
    loginMutation.mutate({ email:loginEmail,passwordHash:loginPassword });
  }
  const SignUpHandler =(e: React.FormEvent)=>{
    e.preventDefault();
    signupMutation.mutate({ email:signupEmail,passwordHash:signupPassword,name:signupUsername,role:"user"});
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#FDF0EE] p-4 sm:p-6 overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#FFD7D0]/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#FFE5DF]/60 blur-3xl" />

      <div className="relative flex flex-col md:flex-row w-full max-w-235 md:min-h-145 rounded-[2.5rem] bg-white/85 md:bg-white backdrop-blur-xl md:backdrop-blur-none border border-white/70 md:border-transparent shadow-[0_25px_60px_-15px_rgba(232,93,86,0.12),0_12px_30px_-10px_rgba(0,0,0,0.06)] overflow-hidden p-3 md:p-5 transition-all duration-300">
        
        <div className="absolute inset-0 md:hidden flex pointer-events-none overflow-hidden items-end justify-start z-0">
          <img
            src="/assets/login.png"
            alt="Mascot Background"
            className="h-[85%] max-h-105 w-auto object-contain opacity-25 filter contrast-105"
          />
        </div>

        <div className="relative hidden md:flex w-1/2 min-h-135 flex-col justify-between rounded-[2rem] bg-[#FCECE9] p-7 overflow-hidden">

          <div className="z-10 relative">
            <span className="text-xl font-black tracking-tight text-[#E85D56]">
              GA<span className="text-[#1F2438]">MING-ARENA</span>
            </span>
          </div>

          <div className="absolute bottom-0 -left-3 w-[122%] max-w-107.5 pointer-events-none select-none">
            <img
              src="/assets/login.png"
              alt="Gaming Arena Mascot"
              className="w-full h-auto object-contain object-end select-none"
            />
          </div>
        </div>

        <div className="relative z-10 flex w-full md:w-1/2 flex-col justify-center px-4 py-6 sm:px-10 md:py-8">
          <div className="mx-auto w-full max-w-sm">
            
            <div className="mb-4 flex justify-center md:hidden">
              <span className="text-xl font-black tracking-tight text-[#E85D56]">
                GA<span className="text-[#1F2438]">MING-ARENA</span>
              </span>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {!isSignUp ? (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.98 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                  className="w-full"
                >
                  <h1 className="text-3xl font-extrabold text-[#1F2438] text-center mb-6 tracking-tight">
                    Login
                  </h1>

                  <form onSubmit={LoginHandler} className="space-y-4">
                    
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
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="w-full rounded-xl border border-amber-300/80 bg-white/95 py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 shadow-xs focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700">
                        Password
                      </label>
                      <div className="relative flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                        >
                          {showLoginPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-gray-200 bg-white/95 py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 shadow-xs focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition"
                        />
                      </div>
                      <div className="flex justify-end pt-0.5">
                        <a
                          href="#forgot-password"
                          className="text-xs font-semibold text-amber-500 hover:text-amber-600 transition"
                        >
                          Forgot Password?
                        </a>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full cursor-pointer rounded-xl bg-[#FF6562] py-3 text-sm font-bold text-white shadow-md shadow-red-200 hover:bg-[#fa534f] active:scale-[0.99] transition duration-150"
                    >
                      Log In
                    </button>
                  </form>

                  <p className="mt-6 text-center text-xs text-gray-500">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="font-bold text-gray-800 underline hover:text-black transition cursor-pointer"
                    >
                      Sign Up here
                    </button>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="signup-form"
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.98 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                  className="w-full"
                >
                  <h1 className="text-3xl font-extrabold text-[#1F2438] text-center mb-6 tracking-tight">
                    Sign Up
                  </h1>

                  <form onSubmit={SignUpHandler} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700">
                        Username
                      </label>
                      <div className="relative flex items-center">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                          <User className="h-4 w-4" />
                        </div>
                        <input
                          type="text"
                          value={signupUsername}
                          onChange={(e) => setSignupUsername(e.target.value)}
                          placeholder="johndoe"
                          className="w-full rounded-xl border border-gray-200 bg-white/95 py-2 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 shadow-xs focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700">
                        Email
                      </label>
                      <div className="relative flex items-center">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          type="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full rounded-xl border border-amber-300/80 bg-white/95 py-2 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 shadow-xs focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700">
                        Password
                      </label>
                      <div className="relative flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                        >
                          {showSignupPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <input
                          type={showSignupPassword ? "text" : "password"}
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="Create password"
                          className="w-full rounded-xl border border-gray-200 bg-white/95 py-2 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 shadow-xs focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700">
                        Confirm Password
                      </label>
                      <div className="relative flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                          className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                        >
                          {showSignupConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <input
                          type={showSignupConfirmPassword ? "text" : "password"}
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          className="w-full rounded-xl border border-gray-200 bg-white/95 py-2 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 shadow-xs focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full cursor-pointer rounded-xl bg-[#FF6562] py-3 text-sm font-bold text-white shadow-md shadow-red-200 hover:bg-[#fa534f] active:scale-[0.99] transition duration-150 mt-1"
                    >
                      Sign Up
                    </button>
                  </form>

                  <p className="mt-5 text-center text-xs text-gray-500">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(false)}
                      className="font-bold text-gray-800 underline hover:text-black transition cursor-pointer"
                    >
                      Log In here
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}