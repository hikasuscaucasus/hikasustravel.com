import { useState } from 'react'
import useT from '../../i18n/useT'
import useWeb3Form from '../../hooks/useWeb3Form'
import { WEB3FORMS_KEY, CONTACT_EMAIL } from '../../config'
import TurnstileWidget from './TurnstileWidget'
import { getTurnstileToken } from '../../utils/turnstile'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ContactForm({ initialMessage = '' }) {
  const t = useT()
  const { status, submit } = useWeb3Form()
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: initialMessage, botcheck: '' })
  const [errors, setErrors] = useState([])

  // Fallback when no key is configured yet — identical to the site's current behaviour.
  if (!WEB3FORMS_KEY) {
    return (
      <div className="td-form__notice">
        <p>{t('form.notAvailable')}</p>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </div>
    )
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const validate = () => {
    const errs = []
    if (!form.name.trim()) errs.push(t('form.errors.name'))
    if (!EMAIL_RE.test(form.email.trim())) errs.push(t('form.errors.email'))
    if (!form.message.trim()) errs.push(t('form.errors.message'))
    return errs
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (form.botcheck) return // honeypot tripped — silently ignore
    const errs = validate()
    setErrors(errs)
    if (errs.length) return
    await submit({
      subject: 'New contact message — Hikasus Travel',
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      message: form.message.trim(),
      botcheck: '',
      'cf-turnstile-response': getTurnstileToken(),
    })
  }

  if (status === 'success') {
    return (
      <div className="td-form__success">
        <h3>{t('form.contactSuccess')}</h3>
        <p>{t('form.contactSuccessText')}</p>
      </div>
    )
  }

  const invalid = (cond) => (errors.length && cond ? true : undefined)
  // Points a field that failed at the summary that says why. Only while the
  // summary is on screen, so the field is never described by nothing.
  const describedBy = (cond) => (errors.length && cond ? 'cf-errors' : undefined)

  return (
    <form className="td-form" onSubmit={onSubmit} noValidate>
      {(errors.length > 0 || status === 'error') && (
        <div className="td-form__errors" id="cf-errors" role="alert" aria-live="assertive">
          {status === 'error' && <p>{t('form.errors.sendFailed')}</p>}
          {errors.length > 0 && (
            <>
              <p>{t('form.errors.fixErrors')}</p>
              <ul>{errors.map((er, i) => <li key={i}>{er}</li>)}</ul>
            </>
          )}
        </div>
      )}

      <div className="td-form__group">
        <label htmlFor="cf-name">{t('form.name')} *</label>
        <input id="cf-name" name="name" type="text" autoComplete="name" required value={form.name} onChange={set('name')} aria-invalid={invalid(!form.name.trim())} aria-describedby={describedBy(!form.name.trim())} />
      </div>
      <div className="td-form__group">
        <label htmlFor="cf-email">{t('form.email')} *</label>
        <input id="cf-email" name="email" type="email" autoComplete="email" inputMode="email" required value={form.email} onChange={set('email')} aria-invalid={invalid(!EMAIL_RE.test(form.email.trim()))} aria-describedby={describedBy(!EMAIL_RE.test(form.email.trim()))} />
      </div>
      <div className="td-form__group">
        <label htmlFor="cf-phone">{t('form.whatsapp')}</label>
        <input id="cf-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" value={form.phone} onChange={set('phone')} />
      </div>
      <div className="td-form__group">
        <label htmlFor="cf-message">{t('form.message')} *</label>
        <textarea id="cf-message" name="message" rows="5" required value={form.message} onChange={set('message')} aria-invalid={invalid(!form.message.trim())} aria-describedby={describedBy(!form.message.trim())} />
      </div>

      {/* Honeypot — hidden from real users */}
      <input type="text" name="botcheck" className="td-form__hp" tabIndex={-1} autoComplete="off" value={form.botcheck} onChange={set('botcheck')} aria-hidden="true" />

      <TurnstileWidget />

      <button type="submit" className="td-form__submit" disabled={status === 'sending'}>
        {status === 'sending' ? t('form.sending') : t('form.send')}
      </button>
    </form>
  )
}
