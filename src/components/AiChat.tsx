import {
  useEffect,
  useRef,
  useState,
} from 'react'
import ReactMarkdown from 'react-markdown'
import Groq from 'groq-sdk'
import {
  Send,
  Sparkles,
  X,
} from 'lucide-react'
import LogoIcon from './LogoIcon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { FITYNESS_SYSTEM_PROMPT } from '@/services/firebase/prompt'
import { useTranslation } from 'react-i18next'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Message = {
  id: string
  text: string
  sender: 'user' | 'ai'
}

const groq = new Groq({
  apiKey: import.meta.env
    .VITE_GROQ_API_KEY,

  dangerouslyAllowBrowser: true,
})

const AiChat = ({
  open,
  onOpenChange,
}: Props) => {
  const { t } = useTranslation()

  const [message, setMessage] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [messages, setMessages] =
    useState<Message[]>([])

  const messagesEndRef =
    useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])

  const handleSendMessage = async (
    textToSend: string
  ) => {
    if (!textToSend.trim() || loading)
      return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: textToSend,
      sender: 'user',
    }

    setMessages((prev) => [
      ...prev,
      userMessage,
    ])

    setMessage('')
    setLoading(true)

    try {
      const completion =
        await groq.chat.completions.create({
          model:
            'llama-3.1-8b-instant',

          messages: [
            {
              role: 'system',

              content: FITYNESS_SYSTEM_PROMPT,
            },

            ...messages.map((msg) => ({
              role:
                msg.sender === 'user'
                  ? ('user' as const)
                  : ('assistant' as const),

              content: msg.text,
            })),

            {
              role: 'user',
              content: textToSend,
            },
          ],

          temperature: 0.7,

          max_tokens: 500,
        })

      const response =
        completion.choices[0]?.message
          ?.content || t('aiChat.errors.noResponse')

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        text: response,
        sender: 'ai',
      }

      setMessages((prev) => [
        ...prev,
        aiMessage,
      ])
    } catch (error: any) {
        console.error(error)

        let errorMessage =
          t('aiChat.errors.unavailable')

        if (
          error?.status === 429
        ) {
          errorMessage =
            t('aiChat.errors.rateLimit')
        }

        else if (
          error?.status === 401
        ) {
          errorMessage =
            t('aiChat.errors.unauthorized')
        }

        else if (
          error?.message?.includes('Failed to fetch')
        ) {
          errorMessage =
            t('aiChat.errors.network')
        }

        else if (
          error?.message?.includes('timeout')
        ) {
          errorMessage =
            t('aiChat.errors.timeout')
        }

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            text: errorMessage,
            sender: 'ai',
          },
        ])
      } finally {
      setLoading(false)
    }
  }

  const suggestionKeys = [
    'hypertrophy',
    'chest',
    'protein',
  ]

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        side="right"
        showCloseButton={false}
        fullScreenOnMobile
        className="
          h-[100dvh]
          w-full
          max-w-none
          border-0
          bg-background
          p-0

          md:max-w-[400px]
          md:border-l
          md:border-border
        "
      >
        <div className="flex h-full flex-col bg-background">
          <SheetHeader className="border-b border-border px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl">
                  <LogoIcon />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <SheetTitle className="text-sm font-bold">
                      {t('aiChat.title')}
                    </SheetTitle>

                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-gradient" />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {t('aiChat.subtitle')}
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  onOpenChange(false)
                }
                className="
                  flex size-9 items-center justify-center
                  rounded-xl border border-border
                  bg-card transition hover:bg-muted
                "
              >
                <X className="size-4" />
              </button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-6 scrollbar-hide">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold">
                    {t('aiChat.welcome')}
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {t('aiChat.welcomeDesc')}
                  </p>
                </div>

                <div className="w-full max-w-[320px] space-y-2">
                  {suggestionKeys.map((key) => {
                    const translatedSuggestion = t(`aiChat.suggestions.${key}`)
                    return (
                      <button
                        key={key}
                        onClick={() =>
                          handleSendMessage(
                            translatedSuggestion
                          )
                        }
                        className="
                          flex w-full items-center justify-between
                          rounded-xl border border-border
                          bg-card px-4 py-3 text-left text-sm
                          transition hover:bg-muted
                        "
                      >
                        <span>
                          {translatedSuggestion}
                        </span>

                        <Sparkles className="size-4 opacity-60" />
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === 'user'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`
                        max-w-[85%]
                        rounded-2xl px-4 py-3
                        text-sm leading-relaxed

                        ${
                          msg.sender ===
                          'user'
                            ? 'rounded-tr-sm bg-primary text-primary-foreground'
                            : 'rounded-tl-sm border border-border bg-muted/40'
                        }
                      `}
                    >
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => (
                            <h1 className="mb-2 text-xl font-bold">
                              {children}
                            </h1>
                          ),

                          h2: ({ children }) => (
                            <h2 className="mb-2 text-lg font-bold">
                              {children}
                            </h2>
                          ),

                          h3: ({ children }) => (
                            <h3 className="mb-1 text-base font-semibold">
                              {children}
                            </h3>
                          ),

                          strong: ({ children }) => (
                            <strong className="font-bold">
                              {children}
                            </strong>
                          ),

                          ul: ({ children }) => (
                            <ul className="ml-4 list-disc space-y-1">
                              {children}
                            </ul>
                          ),

                          ol: ({ children }) => (
                            <ol className="ml-4 list-decimal space-y-1">
                              {children}
                            </ol>
                          ),

                          li: ({ children }) => (
                            <li>{children}</li>
                          ),

                          p: ({ children }) => (
                            <p className="leading-relaxed">
                              {children}
                            </p>
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-tl-sm border border-border bg-muted/40 px-4 py-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.2s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-border p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()

                handleSendMessage(message)
              }}
              className="flex items-center gap-2"
            >
              <div className="flex-1 rounded-xl border border-border bg-muted/20 px-3">
                <Input
                  value={message}
                  onChange={(e) =>
                    setMessage(
                      e.target.value
                    )
                  }
                  placeholder={t('aiChat.placeholder')}
                  className="
                    h-11 border-0 bg-transparent
                    p-0 shadow-none
                    focus-visible:ring-0
                  "
                />
              </div>

              <Button
                type="submit"
                size="icon"
                disabled={
                  !message.trim() || loading
                }
                className="size-11 rounded-xl"
              >
                {loading ? (
                  <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default AiChat