import { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  Loader2,
  Send,
  X,
  Bot,
  AlertCircle,
  Trash2
} from 'lucide-react'
import { useDiagramStore } from '../../store/useDiagramStore'
import { generateDiagramFromPrompt } from '../../services/aiService'
import { ConfirmModal } from '../modals/ConfirmModal'


export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { aiConfig, setSchema, setError, chatMessages, setChatMessages } = useDiagramStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return

    const prompt = input.trim()
    setInput('')

    setChatMessages([
      ...chatMessages,
      { id: Date.now().toString(), role: 'user', content: prompt }
    ])

    setIsGenerating(true)
    setError(null)

    try {
      const schema = await generateDiagramFromPrompt(prompt, aiConfig)
      setSchema(schema)

      setChatMessages([
        ...chatMessages,
        { id: Date.now().toString(), role: 'user', content: prompt },
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Diagrama gerado com sucesso! 🎉 Você pode visualizá-lo e editá-lo no canvas.'
        }
      ])
    } catch (e) {
      console.error('Erro ao gerar diagrama com IA:', e)
      setChatMessages([
        ...chatMessages,
        { id: Date.now().toString(), role: 'user', content: prompt },
        {
          id: (Date.now() + 1).toString(),
          role: 'error',
          content: 'Ocorreu um erro ao gerar o diagrama. Verifique o console para mais detalhes.'
        }
      ])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClearChat = () => {
    setChatMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Chat limpo! Como posso ajudar você a modelar agora?',
      },
    ])
    setShowClearConfirm(false)
  }

  return (
    <div className="absolute bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[360px] max-h-[500px] bg-white dark:bg-dark-surface border border-primary-100 dark:border-dark-border rounded-[28px] shadow-[0_20px_60px_rgba(147,112,64,0.15)] flex flex-col overflow-hidden animate-fade-in transform origin-bottom-right pointer-events-auto">

          {/* Header */}
          <div className="bg-primary-900 px-5 py-4 flex items-center justify-between text-white shadow-md relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Sparkles size={16} className="text-primary-100" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">HFZinho</h3>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsOpen(false)
              }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary-100 dark:scrollbar-thumb-dark-border bg-pastel-bg/30 dark:bg-dark-bg/30">

            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role !== 'user' && (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1
                    ${msg.role === 'error' ? 'bg-red-100 text-red-500' : 'bg-primary-100 text-primary-600'}
                  `}>
                    {msg.role === 'error' ? <AlertCircle size={12} /> : <Bot size={12} />}
                  </div>
                )}

                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm
                  ${msg.role === 'user'
                    ? 'bg-primary-900 dark:bg-primary-800 text-white rounded-tr-sm'
                    : msg.role === 'error'
                      ? 'bg-white dark:bg-dark-panel border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 rounded-tl-sm'
                      : 'bg-white dark:bg-dark-panel border border-primary-100 dark:border-dark-border text-primary-900 dark:text-dark-text rounded-tl-sm'
                  }
                `}>

                  {msg.content}
                </div>
              </div>
            ))}

            {isGenerating && (
              <div className="flex gap-2 justify-start items-center text-primary-400">
                <div className="w-6 h-6 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                  <Bot size={12} className="text-primary-50" />
                </div>
                <div className="bg-white dark:bg-dark-panel border border-primary-100 dark:border-dark-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-300 dark:bg-primary-700 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-primary-400 dark:bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-primary-500 dark:bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-dark-surface border-t border-primary-100 dark:border-dark-border">
            <div className="relative flex items-end gap-2 bg-pastel-panel/50 dark:bg-dark-panel/50 rounded-2xl p-1.5 border border-primary-100/50 dark:border-dark-border focus-within:border-primary-300 dark:focus-within:border-primary-700 focus-within:bg-white dark:focus-within:bg-dark-panel transition-all shadow-inner">
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                title="Limpar conversa"
                className="w-10 h-10 shrink-0 text-primary-300 hover:text-red-500 dark:text-dark-muted dark:hover:text-red-400 flex items-center justify-center transition-colors mb-0.5 ml-0.5 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl"
              >
                <Trash2 size={16} />
              </button>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Descreva o banco de dados..."
                className="w-full max-h-32 min-h-[44px] bg-transparent resize-none text-sm text-primary-900 dark:text-dark-text placeholder:text-primary-300 dark:placeholder:text-dark-muted px-3 py-2.5 focus:outline-none scrollbar-none"
                rows={1}
                disabled={isGenerating}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="w-10 h-10 shrink-0 bg-primary-900 dark:bg-primary-800 hover:bg-primary-800 dark:hover:bg-primary-700 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-95 mb-0.5 mr-0.5"
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* FAB */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group pointer-events-auto flex items-center gap-2.5 px-6 h-12
            bg-primary-900 border border-primary-800/50
            dark:bg-dark-panel dark:border-dark-border
            rounded-full shadow-lg shadow-primary-900/20
            hover:shadow-xl hover:shadow-primary-900/30
            hover:-translate-y-0.5 transition-all duration-300
            active:translate-y-0 active:scale-[0.98]
            cursor-pointer relative overflow-hidden"
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />

          <span className="text-sm font-bold text-white dark:text-primary-100 tracking-tight">
            Crie com IA
          </span>
          <Sparkles
            size={18}
            className="text-primary-300 group-hover:rotate-12 transition-transform duration-300 group-hover:scale-110"
          />
        </button>
      )}

      {showClearConfirm && (
        <ConfirmModal
          title="Limpar Chat"
          message="Deseja limpar todo o histórico de mensagens com a IA?"
          confirmLabel="Limpar"
          isDestructive
          onConfirm={handleClearChat}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}
    </div>
  )
}
