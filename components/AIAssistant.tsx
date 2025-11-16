import { useState, ChangeEvent, KeyboardEvent } from 'react'
import { Send, Sparkles, Loader2, Zap } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'
import toast from 'react-hot-toast'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIAssistantProps {
  content: string
  contentType: 'business_case' | 'content_strategy'
  dashboardId: string
}

export default function AIAssistant({ content, contentType, dashboardId }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const quickActions = [
    { label: 'Make more professional', prompt: 'Make this content more professional and polished' },
    { label: 'Expand details', prompt: 'Expand on the key sections with more detail' },
    { label: 'Simplify language', prompt: 'Simplify the language to be more accessible' },
  ]

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim()
    if (!textToSend || isLoading) return

    const userMessage: Message = { role: 'user', content: textToSend }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          contentType,
          dashboardId,
          question: textToSend,
          conversationHistory: messages,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      const assistantMessage: Message = { role: 'assistant', content: data.response }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error getting AI response:', error)
      toast.error('Failed to get AI response. This feature is coming soon!')
      // Remove the user message if there was an error
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (prompt: string) => {
    handleSend(prompt)
  }

  return (
    <Card className="p-6 sticky top-6 max-h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-mint-400" size={20} />
        <h3 className="font-bold">AI Assistant</h3>
        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Coming Soon</span>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2 mb-4">
        <p className="text-xs text-gray-400 mb-2">Quick Actions:</p>
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => handleQuickAction(action.prompt)}
            disabled={isLoading}
            className="w-full text-left text-sm px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Zap size={14} className="text-mint-400" />
            {action.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[200px]">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="text-gray-600 mx-auto mb-3" size={32} />
            <p className="text-sm text-gray-400">
              Ask questions about your content or request improvements
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-mint-400/20 ml-4'
                  : 'bg-white/5 mr-4'
              }`}
            >
              <div className="text-xs text-gray-400 mb-1">
                {message.role === 'user' ? 'You' : 'AI Assistant'}
              </div>
              <div className="text-sm">{message.content}</div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Loader2 className="animate-spin" size={16} />
            Thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Ask about your content..."
          disabled={isLoading}
          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-mint-400 focus:outline-none transition-colors text-sm disabled:opacity-50"
        />
        <Button
          size="sm"
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
        >
          <Send size={16} />
        </Button>
      </div>

      <p className="text-xs text-gray-500 mt-2 text-center">
        AI features coming in a future update
      </p>
    </Card>
  )
}

