import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import http from '@/http'
import { imgUrl, inStorage, fromStorage } from '@/library/function'
import { ChatMessage, ChatResponse, ProductData } from '@/library/interfaces'

const QUICK_CART_CHAT_SESSION = 'quickcart_chat_session_id'

const createSessionId = () => `qc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

const starterMessages: ChatMessage[] = [
  {
    role: 'assistant',
    text: 'Hi! I am Quick Cart Assistant. Tell me the product you want, your budget, or ask me to compare products.',
    products: [],
    suggestions: ['Show me shoes under Rs. 3000', 'Only Samsung phones', 'Compare iPhone 13 vs Samsung S23'],
  },
]

const ChatAssistant: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const sessionId = useMemo(() => {
    const existing = fromStorage(QUICK_CART_CHAT_SESSION)
    if (existing) return existing
    const created = createSessionId()
    inStorage(QUICK_CART_CHAT_SESSION, created, true)
    return created
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, open])

  const sendMessage = async (messageText?: string) => {
    const text = (messageText ?? input).trim()
    if (!text || loading) return

    setMessages(prev => [...prev, { role: 'user', text, products: [] }])
    setInput('')
    setLoading(true)

    try {
      const { data } = await http.post<ChatResponse>('/chat/assistant', {
        message: text,
        sessionId,
      })

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply,
          products: data.products || [],
          suggestions: data.suggestions || [],
        },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Something went wrong while checking products. Please try again.',
          products: [],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const MiniProductCard: React.FC<{ product: ProductData }> = ({ product }) => {
    const price = product.discountedPrice > 0 ? product.discountedPrice : product.price

    return (
      <Link to={`/products/${product._id}`} className="text-decoration-none" onClick={() => setOpen(false)}>
        <div className="border rounded-3 p-2 bg-white mb-2">
          <div className="d-flex gap-2 align-items-start">
            <img
              src={imgUrl(product.images?.[0])}
              alt={product.name}
              style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8 }}
            />
            <div className="flex-grow-1">
              <div className="fw-semibold text-dark small">{product.name}</div>
              <div className="text-muted small">{product.brand?.name || 'Quick Cart'}</div>
              <div className="small text-dark">Rs. {price}</div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-dark rounded-circle shadow position-fixed"
        style={{ bottom: 24, right: 24, width: 62, height: 62, zIndex: 1040 }}
        onClick={() => setOpen(prev => !prev)}
      >
        <i className="fas fa-comments fs-5"></i>
      </button>

      {open && (
        <div
          className="card shadow-lg position-fixed border-0"
          style={{ bottom: 96, right: 24, width: 370, maxWidth: 'calc(100vw - 32px)', zIndex: 1040, borderRadius: 18 }}
        >
          <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3 rounded-top-4">
            <div>
              <div className="fw-semibold">Quick Cart Assistant</div>
              <div className="small text-white-50">Find products by normal chat</div>
            </div>
            <button type="button" className="btn btn-sm btn-outline-light" onClick={() => setOpen(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="card-body" style={{ height: 430, overflowY: 'auto', background: '#f8f9fa' }}>
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`mb-3 d-flex ${message.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                <div
                  className={`p-3 rounded-4 ${message.role === 'user' ? 'bg-dark text-white' : 'bg-white border'}`}
                  style={{ maxWidth: '88%' }}
                >
                  <div className="small" style={{ whiteSpace: 'pre-wrap' }}>{message.text}</div>

                  {message.products?.length > 0 && (
                    <div className="mt-3">
                      {message.products.map(product => (
                        <MiniProductCard key={product._id} product={product} />
                      ))}
                    </div>
                  )}

                  {message.suggestions?.length ? (
                    <div className="mt-2 d-flex flex-wrap gap-2">
                      {message.suggestions.map(suggestion => (
                        <button
                          key={suggestion}
                          type="button"
                          className="btn btn-sm btn-outline-secondary rounded-pill"
                          onClick={() => sendMessage(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {loading && (
              <div className="d-flex justify-content-start mb-3">
                <div className="bg-white border rounded-4 px-3 py-2 small">Assistant is checking products...</div>
              </div>
            )}
            <div ref={messagesEndRef}></div>
          </div>

          <div className="card-footer bg-white border-0 p-3">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Ask for a product, budget, or comparison"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
              />
              <button type="button" className="btn btn-dark" disabled={loading} onClick={() => sendMessage()}>
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


export default ChatAssistant
