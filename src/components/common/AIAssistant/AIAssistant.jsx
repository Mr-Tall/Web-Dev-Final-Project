import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import './AIAssistant.css'
import { useBooks } from '../../../context/BooksContext'

const GEMINI_MODEL = 'gemini-1.5-flash-latest'
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
// TODO: Create a local .env file and set VITE_GEMINI_API_KEY with your Gemini key. Never commit the real key.

const NAV_OPTIONS = [
  { label: 'home', path: '/' },
  { label: 'advanced search', path: '/advanced-search' },
  { label: 'book reviews', path: '/book-reviews' },
  { label: 'resources', path: '/resources' },
  { label: 'my library', path: '/my-library' },
  { label: 'book list', path: '/book-list/2025' },
  { label: 'sign in', path: '/sign-in' }
]

const sanitizeJSON = (text = '') => {
  const trimmed = text.trim()
  if (trimmed.startsWith('```')) {
    return trimmed.replace(/```json/gi, '').replace(/```/g, '').trim()
  }
  return trimmed
}

const initialMessage = {
  role: 'bot',
  text: "Hey there! I'm the AI Library Assistant. Ask me about books, reviews, BC library resources, or where to click next."
}

function AIAssistant() {
  const navigate = useNavigate()
  const { books } = useBooks()
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState([initialMessage])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const siteContext = useMemo(() => {
    const highlighted = books.slice(0, 5).map(book => `${book.title} by ${book.author} (${book.genre || 'fiction'})`)
    return [
      'You are the BC Library AI assistant.',
      'You help users find books, reviews, and library resources.',
      'Key experiences: New Releases, Highly Anticipated Books, Book Reviews, Advanced Search, Resources.',
      'If navigation is helpful, respond with JSON only, e.g.',
      '{"reply":"Heading to Advanced Search for genre filters.","action":{"type":"navigate","target":"/advanced-search"}}',
      'Only use the routes provided by the site.',
      highlighted.length ? `Featured books: ${highlighted.join(' | ')}` : ''
    ].join('\n')
  }, [books])

  const toggleChat = () => {
    setIsOpen(prev => !prev)
  }

  const appendMessage = useCallback((message) => {
    setMessages(prev => [...prev, message])
  }, [])

  const handleNavigation = useCallback((target) => {
    if (!target) return
    navigate(target)
  }, [navigate])

  const interpretNavigation = useCallback((replyText, action) => {
    if (action?.type === 'navigate' && action.target) {
      handleNavigation(action.target)
      return
    }

    const navMatch = replyText.match(/NAVIGATE:([^\s]+)/i)
    if (navMatch?.[1]) {
      handleNavigation(navMatch[1])
      return
    }

    const lowerReply = replyText.toLowerCase()
    const found = NAV_OPTIONS.find(option => lowerReply.includes(option.label))
    if (found) {
      handleNavigation(found.path)
    }
  }, [handleNavigation])

  const requestAssistant = useCallback(async (userPrompt) => {
    if (!GEMINI_API_KEY) {
      appendMessage({
        role: 'bot',
        text: 'Add your Gemini API key to a local .env file as VITE_GEMINI_API_KEY to enable the AI assistant.'
      })
      return
    }

    setIsLoading(true)
    setError('')
    try {
      const body = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${siteContext}\n\nUser question: "${userPrompt}"\nRespond with JSON.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topP: 0.8,
          topK: 32
        }
      }

      const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error(`Gemini API error (${response.status})`)
      }

      const data = await response.json()
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.'
      let replyText = rawText
      let action = null

      try {
        const parsed = JSON.parse(sanitizeJSON(rawText))
        if (parsed.reply) replyText = parsed.reply
        if (parsed.action) action = parsed.action
      } catch {
        // fall back to natural text
      }

      appendMessage({ role: 'bot', text: replyText })
      interpretNavigation(replyText, action)
    } catch (apiError) {
      console.error(apiError)
      setError('Unable to reach the AI assistant right now. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [siteContext, appendMessage, interpretNavigation])

  const handleSend = async () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    appendMessage({ role: 'user', text: trimmed })
    setInputValue('')
    await requestAssistant(trimmed)
  }

  return (
    <>
      <button
        className={`ai-chat-button ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        aria-label="Open AI Assistant"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="ai-chat-box">
          <div className="ai-chat-header">
            <h3>AI Library Assistant</h3>
            <button
              className="ai-chat-close"
              onClick={toggleChat}
              aria-label="Close AI Assistant"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="ai-chat-messages">
            {messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={`ai-message ${msg.role === 'bot' ? 'ai-bot-message' : 'ai-user-message'}`}
              >
                <p>{msg.text}</p>
              </div>
            ))}
            {isLoading && (
              <div className="ai-message ai-bot-message">
                <p>Thinking...</p>
              </div>
            )}
            {error && <p className="ai-error-note">{error}</p>}
          </div>

          <div className="ai-chat-input-container">
            <input
              type="text"
              className="ai-chat-input"
              placeholder="Ask me anything about BC Library..."
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  handleSend()
                }
              }}
              disabled={isLoading}
            />
            <button className="ai-send-btn" onClick={handleSend} disabled={isLoading}>
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default AIAssistant
