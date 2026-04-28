import { useNavigate } from 'react-router-dom'
import { Brain, Zap, FileSearch, Terminal, ArrowRight } from 'lucide-react'
import UploadBox from '../components/UploadBox'

const features = [
  { icon: Brain,      title: 'Codebase Intelligence',    desc: 'Understands your actual code, not generic snippets' },
  { icon: Zap,        title: 'Groq-Powered Speed',        desc: 'Lightning-fast answers with Llama 3.x on Groq' },
  { icon: FileSearch, title: 'Smart Retrieval',           desc: 'MMR search finds the most relevant code chunks' },
  { icon: Terminal,   title: 'Deployment Advisor',        desc: 'Reads your Dockerfile, render.yaml and configs' },
]

export default function Home() {
  const navigate = useNavigate()

  const handleIndexed = (data) => {
    sessionStorage.setItem('activeRepo', data.repo_id)
    setTimeout(() => navigate('/chat'), 1200)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
          <span className="text-xs text-indigo-300 font-medium">AI-powered codebase intelligence</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-5 leading-tight">
          <span className="text-white">DevOps </span>
          <span className="gradient-text">Oracle</span>
        </h1>

        <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
          Upload your GitHub repo or ZIP, then ask any question.
          Get answers based on <em className="text-slate-300 not-italic font-medium">your actual code</em>, not generic docs.
        </p>

        <button
          onClick={() => navigate('/chat')}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 py-3 font-medium text-sm transition-all glow"
        >
          Start chatting
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="glass rounded-2xl p-4 hover:border-indigo-500/20 transition-all group">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 flex items-center justify-center mb-3 group-hover:bg-indigo-600/30 transition-colors">
              <Icon size={17} className="text-indigo-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Upload */}
      <div className="mb-8">
        <p className="text-center text-sm text-slate-500 mb-6">Index your first repository to get started</p>
        <UploadBox onIndexed={handleIndexed} />
      </div>

      {/* Example prompts */}
      <div className="glass rounded-2xl p-6 mt-8">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">💡 Example questions you can ask</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            'How does authentication work in this project?',
            'Where should I add JWT login?',
            'Why is my deployment failing on Render?',
            'Explain the folder structure to a beginner',
            'Generate a protected route matching this React setup',
            'What does this middleware actually do?',
          ].map(q => (
            <div
              key={q}
              className="text-sm text-slate-400 bg-white/3 border border-white/5 rounded-xl px-3 py-2.5 hover:text-slate-300 hover:border-white/10 cursor-pointer transition-all"
              onClick={() => navigate('/chat')}
            >
              "{q}"
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}