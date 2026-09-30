import { useState } from "react"

interface NavbarProps {
  projectName?: string
  username?: string
  userRole?: string
}

export default function Navbar({ 
  projectName = 'Aura Core', 
  username = 'Rohit Negi',
  userRole = 'Lead Developer'
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl supports-backdrop-filter:bg-slate-950/60 shadow-lg shadow-black/5">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Brand Logo & Title */}
        <div className="flex items-center gap-4">
          <div className="group relative flex items-center gap-3">
            {/* Ambient Glow */}
            <div className="absolute -inset-1 rounded-xl bg-linear-to-r from-violet-600 via-indigo-600 to-cyan-500 opacity-60 blur-md transition duration-500 group-hover:opacity-100" />
            
            {/* Logo Icon */}
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-white/20 text-white shadow-inner shadow-white/10">
              <span className="bg-linear-to-br from-indigo-400 via-sky-300 to-white bg-clip-text text-lg font-black tracking-tight text-transparent">
                {projectName.slice(0, 1)}
              </span>
            </div>

            {/* Brand Text */}
            <div className="relative flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-100 group-hover:text-white transition">
                {projectName}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-emerald-400 uppercase">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                </span>
                Production
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-3 sm:gap-5">
          
          {/* Notification Button */}
          <button 
            type="button" 
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-900/60 text-slate-300 transition-all hover:bg-slate-800 hover:text-white hover:border-indigo-500/50"
          >
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
            </span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          {/* User Profile Pill & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 p-1.5 pr-3 transition-all hover:border-indigo-500/40 hover:bg-slate-800/80"
            >
              {/* Avatar with Gradient Border */}
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500 text-xs font-bold text-white shadow-md shadow-indigo-500/25">
                {username.charAt(0).toUpperCase()}
              </div>

              {/* User Text */}
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-100">{username}</span>
                <span className="text-[10px] text-slate-400">{userRole}</span>
              </div>

              {/* Chevron Icon */}
              <svg 
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-white' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-white/10 bg-slate-950/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-white/5">
                  <p className="text-xs font-semibold text-slate-200">{username}</p>
                  <p className="text-[11px] text-slate-400 truncate">user@example.com</p>
                </div>
                <div className="py-1">
                  <a href="#profile" className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition">
                    Account Settings
                  </a>
                  <a href="#preferences" className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition">
                    Preferences
                  </a>
                </div>
                <div className="border-t border-white/5 pt-1">
                  <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition">
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  )
}