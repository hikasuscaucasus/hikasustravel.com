import { useEffect, useState } from 'react'
import useT from '../../i18n/useT'
import useWeb3Form from '../../hooks/useWeb3Form'
import { WEB3FORMS_KEY, CONTACT_EMAIL } from '../../config'
import TurnstileWidget from './TurnstileWidget'
import { getTurnstileToken } from '../../utils/turnstile'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function TourInquiryForm({ tourTitle, selectedPackage }) {
  const t = useT()
  const { status, submit } = useWeb3Form()
  const [form, setForm] = useState({
    salutation: '', firstName: '', lastName: '', email: '', phone: '',
    travelers: '', startDate: '', endDate: '', accommodation: '', message: '',
    botcheck: '',
  })
  const [errors, setErrors] = useState([])

  // Pre-select the Accommodation Type when a pricing card's "Book Now" button is
  // clicked. Keyed on the click nonce so repeated clicks (even of the same
  // package) re-apply, while a user's manual choice is preserved between clicks.
  const packageNonce = selectedPackage?.nonce
  useEffect(() => {
    if (!packageNonce) return
    const value = selectedPackage?.value
    if (value) setForm((f) => ({ ...f, accommodation: value }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageNonce])

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
    if (!form.firstName.trim()) errs.push(t('form.errors.firstName'))
    if (!form.lastName.trim()) errs.push(t('form.errors.lastName'))
    if (!EMAIL_RE.test(form.email.trim())) errs.push(t('form.errors.email'))
    return errs
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (form.botcheck) return // honeypot tripped — silently ignore
    const errs = validate()
    setErrors(errs)
    if (errs.length) return
    await submit({
      subject: `New tour request: ${tourTitle}`,
      tour: tourTitle,
      salutation: form.salutation,
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      travelers: form.travelers,
      start_date: form.startDate,
      end_date: form.endDate,
      accommodation: form.accommodation,
      message: form.message.trim(),
      botcheck: '',
      'cf-turnstile-response': getTurnstileToken(),
    })
  }

  if (status === 'success') {
    return (
      <div className="td-form__success">
        <h3>{t('form.thankYou')}</h3>
        <p>{t('form.thankYouText', { tour: tourTitle })}</p>
      </div>
    )
  }

  const invalid = (cond) => (errors.length && cond ? true : undefined)
  // Points a field that failed at the summary that says why. Only while the
  // summary is on screen, so the field is never described by nothing.
  const describedBy = (cond) => (errors.length && cond ? 'ti-errors' : undefined)

  return (
    <form className="td-form" onSubmit={onSubmit} noValidate>
      {(errors.length > 0 || status === 'error') && (
        <div className="td-form__errors" id="ti-errors" role="alert" aria-live="assertive">
          {status === 'error' && <p>{t('form.errors.sendFailed')}</p>}
          {errors.length > 0 && (
            <>
              <p>{t('form.errors.fixErrors')}</p>
              <ul>{errors.map((er, i) => <li key={i}>{er}</li>)}</ul>
            </>
          )}
        </div>
      )}

      <div className="td-form__row">
        <div className="td-form__group">
          <label htmlFor="ti-salutation">{t('form.salutation')}</label>
          <select id="ti-salutation" name="salutation" autoComplete="honorific-prefix" value={form.salutation} onChange={set('salutation')}>
            <option value="">{t('form.salutationNone')}</option>
            <option value="Mr">{t('form.salutationMr')}</option>
            <option value="Ms">{t('form.salutationMs')}</option>
            <option value="Mrs">{t('form.salutationMrs')}</option>
            <option value="Mx">{t('form.salutationMx')}</option>
          </select>
        </div>
        <div className="td-form__group">
          <label htmlFor="ti-travelers">{t('form.travelers')}</label>
          <input id="ti-travelers" name="travelers" type="number" min="1" max="99" step="1" inputMode="numeric" value={form.travelers} onChange={set('travelers')} />
        </div>
      </div>

      <div className="td-form__row">
        <div className="td-form__group">
          <label htmlFor="ti-first">{t('form.firstName')} *</label>
          <input id="ti-first" name="firstName" type="text" autoComplete="given-name" required value={form.firstName} onChange={set('firstName')} aria-invalid={invalid(!form.firstName.trim())} aria-describedby={describedBy(!form.firstName.trim())} />
        </div>
        <div className="td-form__group">
          <label htmlFor="ti-last">{t('form.lastName')} *</label>
          <input id="ti-last" name="lastName" type="text" autoComplete="family-name" required value={form.lastName} onChange={set('lastName')} aria-invalid={invalid(!form.lastName.trim())} aria-describedby={describedBy(!form.lastName.trim())} />
        </div>
      </div>

      <div className="td-form__row">
        <div className="td-form__group">
          <label htmlFor="ti-email">{t('form.email')} *</label>
          <input id="ti-email" name="email" type="email" autoComplete="email" inputMode="email" required value={form.email} onChange={set('email')} aria-invalid={invalid(!EMAIL_RE.test(form.email.trim()))} aria-describedby={describedBy(!EMAIL_RE.test(form.email.trim()))} />
        </div>
        <div className="td-form__group">
          <label htmlFor="ti-phone">{t('form.whatsapp')}</label>
          <input id="ti-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" value={form.phone} onChange={set('phone')} />
        </div>
      </div>

      <div className="td-form__row">
        <div className="td-form__group">
          <label htmlFor="ti-start">{t('form.startDate')}</label>
          <input id="ti-start" name="startDate" type="date" value={form.startDate} onChange={set('startDate')} />
        </div>
        <div className="td-form__group">
          <label htmlFor="ti-end">{t('form.endDate')}</label>
          <input id="ti-end" name="endDate" type="date" min={form.startDate || undefined} value={form.endDate} onChange={set('endDate')} />
        </div>
      </div>

      <div className="td-form__group">
        <label htmlFor="ti-accommodation">{t('form.accommodation')}</label>
        <select id="ti-accommodation" name="accommodation" value={form.accommodation} onChange={set('accommodation')}>
          <option value="">{t('form.salutationNone')}</option>
          <option value="Classic">{t('pricing.economy')}</option>
          <option value="Mid-Range">{t('pricing.midRange')}</option>
          {/* One name for the top tier on every tour, group and private alike —
              the same "Premium" the pricing table and the hotel viewer show. */}
          <option value="Premium">{t('pricing.premium')}</option>
        </select>
      </div>

      <div className="td-form__group">
        <label htmlFor="ti-message">{t('form.message')}</label>
        <textarea id="ti-message" name="message" rows="5" value={form.message} onChange={set('message')} />
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
