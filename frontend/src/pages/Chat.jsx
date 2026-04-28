import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Plus } from 'lucide-react'
import ChatMessage from '../components/ChatMessage'
import RepoSelector from '../components/RepoSelector'
import UploadBox from '../components/UploadBox'
import { sendChat } from '../api/client'

const SUGGESTIONS = [
  'How does authentication work here?',
  'Explain the folder structure',
  'Where should I add a new API route?',
  'Why might deployment fail on Render?',
]

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [repoId, setRepoId] = useState(sessionStorage.getItem('activeRepo') || '')
  const [showUpload, setShowUpload] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const q = text || input.trim()
    if (!q || loading) return
    setInput('')
    setShowUpload(false)

    const userMsg = { role: 'user', content: q }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const { data } = await sendChat(q, repoId || null)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
        hasContext: data.has_context,
      }])
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `**Error:** ${e.response?.data?.detail || 'Something went wrong. Is the backend running?'}`,
        sources: [],
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const handleIndexed = (data) => {
    setRepoId(data.repo_id)
    sessionStorage.setItem('activeRepo', data.repo_id)
    setShowUpload(false)
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `✅ **${data.repo_name}** indexed! ${data.files_indexed} files and ${data.chunks_created} chunks ready. Ask me anything about this codebase.`,
      sources: [],
    }])
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem-2.5rem)]">
      {/* Toolbar */}
      <div className="glass border-b border-white/10 px-4 py-3 flex items-center gap-3 flex-wrap">
        <RepoSelector selected={repoId} onSelect={id => { setRepoId(id); sessionStorage.setItem('activeRepo', id) }} />
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 transition-all"
        >
          <Plus size={13} />
          Index new repo
        </button>
        {!repoId && (
          <span className="text-xs text-amber-400/80">⚠ No repo selected — answers will be generic</span>
        )}
      </div>

      {/* Upload panel (collapsible) */}
      {showUpload && (
        <div className="border-b border-white/10 p-4 bg-white/2">
          <UploadBox onIndexed={handleIndexed} />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-5">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 flex items-center justify-center mb-4 glow">
              <span className="text-2xl">👑</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Ask about your codebase</h2>
            <p className="text-sm text-slate-500 mb-8 max-w-sm">
              {repoId ? 'Repository loaded — ready for project-specific answers' : 'Select or index a repository above for best results'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-sm text-slate-400 hover:text-white bg-white/3 hover:bg-white/8 border border-white/8 hover:border-white/15 rounded-xl px-4 py-3 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}

        {loading && (
          <div className="flex gap-3 fade-in">
            <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center shrink-0">
              <Loader2 size={15} className="text-white animate-spin" />
            </div>
            <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              {[0,1,2].map(i => (
                <span key={i} className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="glass border-t border-white/10 px-4 py-4">
        <div className="flex gap-3 items-end max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your codebase…"
            rows={1}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none resize-none focus:border-indigo-500/50 transition-colors"
            style={{ maxHeight: '120px', overflowY: 'auto' }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all glow shrink-0"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-center text-xs text-slate-600 mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}