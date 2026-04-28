import { Link, useLocation } from 'react-router-dom'
import { Brain, MessageSquare, Database, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navLinks = [
  { to: '/',      label: 'Home',  icon: Brain },
  { to: '/chat',  label: 'Chat',  icon: MessageSquare },
  { to: '/repos', label: 'Repos', icon: Database },
]

export default function Layout({ children }) {
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="glass sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center glow group-hover:bg-indigo-500 transition-colors">
              <Brain size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">DevOps Oracle</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === to
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === to
                    ? 'bg-indigo-600/20 text-indigo-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        DevOps Oracle · Built with FastAPI, LangChain, ChromaDB & Groq
      </footer>
    </div>
  )
}