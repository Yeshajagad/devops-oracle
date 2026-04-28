import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, FileCode, Bot, User } from 'lucide-react'

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="my-3 rounded-xl overflow-hidden border border-indigo-500/20">
      <div className="flex items-center justify-between bg-indigo-950/60 px-4 py-2">
        <span className="text-xs text-indigo-300 font-mono">{language || 'code'}</span>
        <button onClick={copy} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{ margin: 0, borderRadius: 0, background: '#080814', fontSize: '13px', padding: '16px' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

function renderMarkdown(text) {
  const lines = text.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // H1
    if (line.startsWith('# ')) {
      elements.push(
        <div key={i} className="flex items-center gap-2 mt-4 mb-2">
          <div className="w-1 h-6 bg-indigo-500 rounded-full" />
          <h1 className="text-base font-bold text-white">{line.slice(2)}</h1>
        </div>
      )
    }
    // H2
    else if (line.startsWith('## ')) {
      elements.push(
        <div key={i} className="flex items-center gap-2 mt-4 mb-2">
          <div className="w-1 h-5 bg-purple-500 rounded-full" />
          <h2 className="text-sm font-bold text-purple-300">{line.slice(3)}</h2>
        </div>
      )
    }
    // H3
    else if (line.startsWith('### ')) {
      elements.push(
        <div key={i} className="mt-3 mb-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 border-b border-indigo-500/30 pb-0.5">
            {line.slice(4)}
          </span>
        </div>
      )
    }
    // Bullet points
    else if (line.match(/^[\*\-] /)) {
      const items = []
      while (i < lines.length && lines[i].match(/^[\*\-] /)) {
        items.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-2 flex flex-col gap-1.5">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      )
      continue
    }
    // Numbered list
    else if (line.match(/^\d+\. /)) {
      const items = []
      let num = 1
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\. /, ''))
        i++
        num++
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-2 flex flex-col gap-1.5">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 text-xs flex items-center justify-center font-bold mt-0.5">{j+1}</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      )
      continue
    }
    // Blockquote / tip box
    else if (line.startsWith('> ')) {
      elements.push(
        <div key={i} className="my-2 flex gap-2 bg-indigo-500/5 border-l-2 border-indigo-500 rounded-r-xl px-3 py-2">
          <p className="text-sm text-slate-300 italic">{line.slice(2)}</p>
        </div>
      )
    }
    // Horizontal rule
    else if (line.match(/^---+$/)) {
      elements.push(<hr key={i} className="my-3 border-white/10" />)
    }
    // Empty line
    else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1" />)
    }
    // Normal paragraph
    else {
      elements.push(
        <p key={i} className="text-sm text-slate-300 leading-relaxed my-0.5">
          {renderInline(line)}
        </p>
      )
    }
    i++
  }
  return elements
}

function renderInline(text) {
  // bold + code inline
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="bg-indigo-950/60 text-indigo-300 rounded px-1.5 py-0.5 text-xs font-mono border border-indigo-500/20">{part.slice(1, -1)}</code>
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
    return part
  })
}

function parseBlocks(text) {
  const blocks = []
  const regex = /```(\w*)\n?([\s\S]*?)```/g
  let last = 0, match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) blocks.push({ type: 'text', content: text.slice(last, match.index) })
    blocks.push({ type: 'code', lang: match[1], content: match[2].trim() })
    last = regex.lastIndex
  }
  if (last < text.length) blocks.push({ type: 'text', content: text.slice(last) })
  return blocks
}

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  const blocks = isUser ? null : parseBlocks(message.content)

  return (
    <div className={`flex gap-3 fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-indigo-600' : 'bg-gradient-to-br from-purple-600 to-indigo-700'}`}>
        {isUser ? <User size={15} className="text-white" /> : <Bot size={15} className="text-white" />}
      </div>

      <div className={`flex flex-col gap-2 max-w-[88%] ${isUser ? 'items-end' : ''}`}>
        {isUser ? (
          <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
            {message.content}
          </div>
        ) : (
          <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 w-full">
            {blocks.map((block, i) =>
              block.type === 'code'
                ? <CodeBlock key={i} code={block.content} language={block.lang} />
                : <div key={i}>{renderMarkdown(block.content)}</div>
            )}
          </div>
        )}

        {!isUser && message.sources?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.sources.map((s, i) => (
              <span key={i} className="flex items-center gap-1 text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-lg px-2 py-1">
                <FileCode size={11} />
                {s.filename || s.file}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}