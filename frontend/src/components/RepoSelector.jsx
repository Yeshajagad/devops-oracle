import { useEffect, useState } from 'react'
import { Database, ChevronDown, RefreshCw } from 'lucide-react'
import { getRepos } from '../api/client'

export default function RepoSelector({ selected, onSelect }) {
  const [repos, setRepos] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await getRepos()
      setRepos(data.repos || [])
    } catch (_) {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const current = repos.find(r => r.repo_id === selected)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 glass border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 hover:text-white transition-all min-w-[200px]"
      >
        <Database size={14} className="text-indigo-400 shrink-0" />
        <span className="flex-1 text-left truncate">
          {current ? current.repo_name : 'Select repository…'}
        </span>
        <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 glass border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <span className="text-xs text-slate-500">Indexed repos</span>
            <button onClick={load} className="text-slate-500 hover:text-white transition-colors">
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          {repos.length === 0 ? (
            <p className="text-xs text-slate-500 px-3 py-3">No repos indexed yet</p>
          ) : (
            repos.map(r => (
              <button
                key={r.repo_id}
                onClick={() => { onSelect(r.repo_id); setOpen(false) }}
                className={`w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-white/5 ${
                  selected === r.repo_id ? 'text-indigo-400' : 'text-slate-300'
                }`}
              >
                <span className="font-medium">{r.repo_name}</span>
                <span className="text-xs text-slate-500 block">{r.chunk_count} chunks · {r.source}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}