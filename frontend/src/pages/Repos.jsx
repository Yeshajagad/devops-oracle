import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, Trash2, MessageSquare, RefreshCw, GitBranch, Package, AlertTriangle } from 'lucide-react'
import { getRepos, deleteRepo } from '../api/client'

export default function Repos() {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await getRepos()
      setRepos(data.repos || [])
    } catch (_) {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (repoId) => {
    setDeleting(repoId)
    try {
      await deleteRepo(repoId)
      setRepos(prev => prev.filter(r => r.repo_id !== repoId))
      if (sessionStorage.getItem('activeRepo') === repoId) sessionStorage.removeItem('activeRepo')
    } catch (_) {}
    finally { setDeleting(null); setConfirm(null) }
  }

  const chatWithRepo = (repoId) => {
    sessionStorage.setItem('activeRepo', repoId)
    navigate('/chat')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database size={22} className="text-indigo-400" />
            Indexed Repositories
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage your indexed codebases</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 transition-all"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading repositories…</div>
      ) : repos.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Database size={40} className="text-slate-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-300 mb-2">No repositories indexed</h2>
          <p className="text-sm text-slate-500 mb-6">Go to Home or Chat to index your first repository.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 py-2.5 text-sm font-medium transition-all"
          >
            Get started
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {repos.map(repo => (
            <div key={repo.repo_id} className="glass rounded-2xl p-5 hover:border-white/15 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center shrink-0">
                    {repo.source === 'github'
                      ? <GitBranch size={18} className="text-indigo-400" />
                      : <Package size={18} className="text-purple-400" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white truncate">{repo.repo_name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {repo.source === 'github' && repo.url
                        ? <a href={repo.url} target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors truncate block">{repo.url}</a>
                        : <span>ZIP upload</span>}
                    </p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-xs bg-indigo-600/10 text-indigo-300 border border-indigo-500/20 rounded-lg px-2 py-0.5">
                        {repo.chunk_count} chunks
                      </span>
                      <span className="text-xs text-slate-500 font-mono">ID: {repo.repo_id}</span>
                      <span className={`text-xs rounded-lg px-2 py-0.5 ${
                        repo.source === 'github'
                          ? 'bg-emerald-600/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-purple-600/10 text-purple-300 border border-purple-500/20'
                      }`}>
                        {repo.source}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => chatWithRepo(repo.repo_id)}
                    className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-3 py-2 transition-all"
                  >
                    <MessageSquare size={13} />
                    Chat
                  </button>

                  {confirm === repo.repo_id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(repo.repo_id)}
                        disabled={deleting === repo.repo_id}
                        className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 rounded-xl px-3 py-2 transition-all"
                      >
                        {deleting === repo.repo_id ? 'Deleting…' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setConfirm(null)}
                        className="text-xs text-slate-400 hover:text-white bg-white/5 rounded-xl px-2 py-2 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirm(repo.repo_id)}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 rounded-xl px-3 py-2 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {repos.length > 0 && (
        <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 bg-amber-500/5 border border-amber-500/10 rounded-xl px-4 py-3">
          <AlertTriangle size={13} className="text-amber-500/60" />
          Deleting a repository removes its vector index permanently. The original source is unaffected.
        </div>
      )}
    </div>
  )
}