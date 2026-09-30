import { createFileRoute, Outlet } from '@tanstack/react-router'
import Navbar from '../../components/navbar'
import { PROJECT_NAME } from '../../constants'

export const Route = createFileRoute('/(protected)')({
  component: ProtectedLayout,
})

function ProtectedLayout() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-300">
      
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-indigo-600/15 blur-[128px]" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-purple-600/10 blur-[128px]" />
      </div>

      <Navbar projectName={PROJECT_NAME} username="Rohit Negi" userRole="Frontend Lead" />

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-6 backdrop-blur-sm shadow-inner min-h-[calc(100vh-10rem)]">
          <Outlet />
        </div>
      </main>

    </div>
  )
}