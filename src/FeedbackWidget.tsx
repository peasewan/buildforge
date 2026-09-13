import { CheckCircle2, Lightbulb, MessageSquarePlus, Send, X } from 'lucide-react'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { track } from './lib/analytics'
import type { FeedbackCategory } from './lib/feedback'

const categories: Array<{ value: FeedbackCategory; label: string }> = [
  { value: 'talent-data', label: 'Talent data' },
  { value: 'feature', label: 'Feature request' },
  { value: 'bug', label: 'Report a bug' },
  { value: 'other', label: 'Other' },
]

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<FeedbackCategory>('feature')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')
  const messageRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!open) return
    messageRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const show = () => {
    setOpen(true)
    setStatus('idle')
    setError('')
    track('feedback_open', { page_path: window.location.pathname })
  }

  const close = () => setOpen(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('sending')
    setError('')

    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          category,
          message,
          email,
          page: `${window.location.pathname}${window.location.search}`,
          website: form.get('website'),
        }),
      })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || 'Feedback could not be saved.')

      setStatus('sent')
      setMessage('')
      setEmail('')
      track('feedback_submit', { category, page_path: window.location.pathname })
    } catch (requestError) {
      setStatus('error')
      setError(requestError instanceof Error ? requestError.message : 'Feedback could not be saved.')
      track('feedback_error', { category, page_path: window.location.pathname })
    }
  }

  return (
    <>
      <button className="feedback-trigger" type="button" onClick={show}>
        <MessageSquarePlus size={18} />
        <span>Feedback</span>
      </button>

      {open && (
        <div className="feedback-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}>
          <section className="feedback-dialog" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
            <button className="feedback-close" type="button" onClick={close} aria-label="Close feedback form"><X size={19} /></button>

            {status === 'sent' ? (
              <div className="feedback-success">
                <CheckCircle2 size={42} />
                <span>Feedback received</span>
                <h2 id="feedback-title">Thanks for helping shape BuildForge.</h2>
                <p>Your request has been saved. We’ll use it to decide what to build or verify next.</p>
                <button className="button primary" type="button" onClick={close}>Done</button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div className="feedback-kicker"><Lightbulb size={15} /> Help improve the planner</div>
                <h2 id="feedback-title">What should BuildForge do next?</h2>
                <p className="feedback-intro">Report incorrect talent data, a broken interaction, or a feature you want.</p>

                <fieldset>
                  <legend>Feedback type</legend>
                  <div className="feedback-types">
                    {categories.map((item) => (
                      <label key={item.value} className={category === item.value ? 'selected' : ''}>
                        <input type="radio" name="category" value={item.value} checked={category === item.value} onChange={() => setCategory(item.value)} />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className="feedback-field">
                  <span>Your feedback</span>
                  <textarea ref={messageRef} value={message} onChange={(event) => setMessage(event.target.value)} minLength={10} maxLength={1000} required placeholder="Tell us what you need, or which talent looks wrong…" />
                  <small>{message.length}/1000</small>
                </label>

                <label className="feedback-field">
                  <span>Email <em>optional</em></span>
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} placeholder="you@example.com" />
                </label>

                <label className="feedback-honeypot" aria-hidden="true">
                  Website
                  <input name="website" type="text" tabIndex={-1} autoComplete="off" />
                </label>

                {status === 'error' && <p className="feedback-error" role="alert">{error}</p>}
                <button className="button primary feedback-submit" type="submit" disabled={status === 'sending' || message.trim().length < 10}>
                  <Send size={16} /> {status === 'sending' ? 'Sending…' : 'Send Feedback'}
                </button>
                <small className="feedback-privacy">Your feedback is stored privately. Email is only used if a reply is needed.</small>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  )
}
