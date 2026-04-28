import { useState, useRef } from 'react'
import { GitBranch, Upload, Loader2, CheckCircle, AlertCircle, Link } from 'lucide-react'
import { uploadGithubRepo, uploadZip } from '../api/client'

export default function UploadBox({ onIndexed }) {
  const [tab, setTab] = useState('github')
  const [githubUrl, setGithubUrl] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const fileRef = useRef()

  const reset = () => { setResult(null); setError('') }

  const handleGithub = async () => {
    if (!githubUrl.trim()) return setError('Enter a GitHub URL')
    reset()
    setLoading(true)
    try {
      const { data } = await uploadGithubRepo(githubUrl.trim())
      setResult(data)
      if (onIndexed) onIndexed(data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to index repository')
    } finally {
      setLoading(false)
    }
  }

  const handleZip = async () => {
    if (!file) return setError('Select a ZIP file')
    reset()
    setLoading(true)
    try {
      const { data } = await uploadZip(file)
      setResult(data)
      if (onIndexed) onIndexed(data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to process ZIP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass rounded-2xl p-6 w-full max-w-xl mx-auto">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Upload size={18} className="text-indigo-400" />
        Index a Repository
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {['github', 'zip'].map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); reset() }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? 'bg-indigo-600 text-white'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {t === 'github' ? '🐙 GitHub URL' : '📦 Upload ZIP'}
          </button>
        ))}
      </div>

      {tab === 'github' ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
            <Link size={15} className="text-slate-400 shrink-0" />
            <input
              type="url"
              placeholder="https://github.com/user/repo"
              value={githubUrl}
              onChange={e => setGithubUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGithub()}
              className="bg-transparent flex-1 text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>
          <button
            onClick={handleGithub}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-medium transition-all glow"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <GitBranch size={16} />}
            {loading ? 'Indexing...' : 'Index Repository'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div
            onClick={() => fileRef.current.click()}
            className="border-2 border-dashed border-white/15 hover:border-indigo-500/50 rounded-xl p-6 text-center cursor-pointer transition-all group"
          >
            <Upload size={24} className="mx-auto mb-2 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            <p className="text-sm text-slate-400 group-hover:text-slate-300">
              {file ? file.name : 'Click to select a .zip file'}
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".zip"
              className="hidden"
              onChange={e => { setFile(e.target.files[0]); reset() }}
            />
          </div>
          <button
            onClick={handleZip}
            disabled={loading || !file}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-medium transition-all"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {loading ? 'Processing...' : 'Index ZIP'}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">Indexed successfully!</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <span>Repo: <span className="text-white">{result.repo_name}</span></span>
            <span>Files: <span className="text-white">{result.files_indexed}</span></span>
            <span>Chunks: <span className="text-white">{result.chunks_created}</span></span>
            <span>ID: <span className="text-white font-mono">{result.repo_id}</span></span>
          </div>
        </div>
      )}
    </div>
  )
}