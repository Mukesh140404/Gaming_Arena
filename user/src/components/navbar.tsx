import { useState } from "react";
import { useLogout } from "@/hooks/useAuth";
import { closeSharedSocket } from "@/hooks/useWebSocket";

interface NavbarProps {
  projectName?: string;
  username?: string;
  userRole?: string;
  email?: string;
}

export default function Navbar({
  projectName = "GAMING ARENA",
  username = "Player",
  userRole = "Player",
  email,
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const logoutMutation = useLogout();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#F2D7D2]/80 bg-white/80 backdrop-blur-xl shadow-xs shadow-red-950/5">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="group relative flex items-center gap-3">
            <div className="absolute -inset-1 rounded-xl bg-linear-to-r from-[#FF6562] via-[#FFA194] to-[#FFD7D0] opacity-30 blur-md transition duration-500 group-hover:opacity-70" />

            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#FCECE9] border border-[#FAD7D1] text-[#E85D56] shadow-xs">
              <span className="text-lg font-black tracking-tight text-[#E85D56]">
                GA
              </span>
            </div>

            <div className="relative flex flex-col">
              <span className="text-base font-black tracking-tight text-[#1F2438] transition">
                <span className="text-[#E85D56]">{projectName.slice(0, 2)}</span>
                {projectName.slice(2)}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                </span>
                Online
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200/80 bg-white/90 text-gray-600 transition-all hover:bg-[#FCECE9] hover:text-[#E85D56] hover:border-[#FF6562]/40 cursor-pointer shadow-xs"
          >
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
            </span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white/90 p-1.5 pr-3 transition-all hover:border-[#FF6562]/40 hover:bg-[#FCECE9]/40 cursor-pointer shadow-xs"
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-tr from-[#FF6562] to-[#FFA194] text-xs font-bold text-white shadow-sm shadow-red-200">
                {username ? username.charAt(0).toUpperCase() : "P"}
              </div>

              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-[#1F2438]">{username}</span>
                <span className="text-[10px] font-medium text-gray-500 capitalize">{userRole}</span>
              </div>
              <svg
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180 text-[#E85D56]" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-[#F2D7D2] bg-white/95 p-1.5 shadow-2xl shadow-red-950/10 backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-[#1F2438]">{username}</p>
                  {email && <p className="text-[11px] text-gray-500 truncate">{email}</p>}
                </div>
                <div className="border-t border-gray-100 pt-1">
                  <button
                    onClick={() => logoutMutation.mutate(undefined, {
      onSettled: () => {
        // Close the old socket so the next login opens a new one with the new token
        closeSharedSocket();
      },
    })}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[#E85D56] hover:bg-red-50 transition cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
