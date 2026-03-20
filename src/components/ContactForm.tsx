import { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState({ from_name: '', reply_to: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.from_name || !form.reply_to || !form.message) return;
    setStatus('sending');
    try {
      await emailjs.sendForm(
        'service_vp1fe58',
        'template_wcg4czj',
        formRef.current!,
        'lSCnPZgtIX0VXkPEs'
      );
      setStatus('success');
      setForm({ from_name: '', reply_to: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  const inputStyle = {
    background: 'rgba(0,0,0,0.35)',
    border: '1px solid var(--color-border-base)',
    borderRadius: '0.5rem',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    padding: '10px 14px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: '6px',
    display: 'block',
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label style={labelStyle}>Nom</label>
          <input
            name="from_name"
            value={form.from_name}
            onChange={handleChange}
            placeholder="Votre nom"
            required
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border-base)')}
          />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input
            name="reply_to"
            type="email"
            value={form.reply_to}
            onChange={handleChange}
            placeholder="votre@email.com"
            required
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border-base)')}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Message</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Votre message..."
          required
          rows={5}
          style={{ ...inputStyle, resize: 'vertical' }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border-base)')}
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="font-mono text-sm font-bold px-6 py-3 rounded-lg transition-all duration-200"
          style={{
            background: status === 'sending' ? 'var(--color-accent-dim)' : 'var(--color-accent)',
            color: 'var(--color-bg-deep)',
            cursor: status === 'sending' ? 'not-allowed' : 'pointer',
            boxShadow: status === 'sending' ? 'none' : '0 0 24px 4px rgba(0,255,156,0.2)',
          }}
        >
          {status === 'sending' ? 'Envoi…' : 'Envoyer →'}
        </button>

        {status === 'success' && (
          <span
            className="font-mono text-xs animate-fade-in"
            style={{ color: 'var(--color-accent)' }}
          >
            Message envoyé !
          </span>
        )}
        {status === 'error' && (
          <span
            className="font-mono text-xs animate-fade-in"
            style={{ color: 'var(--color-danger)' }}
          >
            Erreur, réessaie ou envoie un mail directement.
          </span>
        )}
      </div>
    </form>
  );
}