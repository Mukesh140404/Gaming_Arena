import { createFileRoute, Outlet } from '@tanstack/react-router'
import Navbar from '../../components/navbar'
import { PROJECT_NAME } from '../../constants'

export const Route = createFileRoute('/(protected)')({
  component: ProtectedLayout,
})

function ProtectedLayout() {
  return (
    <div className="relative min-h-screen bg-[#FDF0EE] text-[#1F2438] flex flex-col selection:bg-[#FF6562]/20 selection:text-[#E85D56]">
      
      {/* Background Decorative Gradient Blobs (Matching Auth Theme) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-[#FFD7D0]/50 blur-3xl" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-[#FFE5DF]/70 blur-3xl" />
        <div className="absolute -bottom-40 left-10 h-96 w-96 rounded-full bg-[#FFD7D0]/40 blur-3xl" />
      </div>

      <Navbar projectName={PROJECT_NAME} username="Rohit Negi" userRole="Frontend Lead" />

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/80 bg-white/85 p-6 backdrop-blur-xl shadow-[0_25px_60px_-15px_rgba(232,93,86,0.1),0_10px_25px_-5px_rgba(0,0,0,0.04)] min-h-[calc(100vh-10rem)]">
          <Outlet />
        </div>
      </main>

    </div>
  )
}