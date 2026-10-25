import { useEffect, useState } from 'react'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import { countryOptions, countryName, isCountryCode } from '../../data/countries'
import useWeb3Form from '../../hooks/useWeb3Form'
import { WEB3FORMS_KEY, CONTACT_EMAIL } from '../../config'
import TurnstileWidget from './TurnstileWidget'
import { getTurnstileToken } from '../../utils/turnstile'
import { trackEvent } from '../../utils/analytics'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// `departures`: for a scheduled group tour, the bookable departure windows
// ([{ value, label, soldOut, bookingDeadline, deadlineLabel }], built by
// TourDetailPage from the tour's `groupDates` — the same array the page's
// "2027 departures" strip renders). When present the free start/end date
// inputs are replaced by one required dropdown of exactly those windows,
// each option showing the dates only: the booking deadlines are read on the
// page, not in the select. The option VALUE stays the canonical ISO window
// and the deadline travels in the inquiry as its own field. Private tours
// pass nothing and keep their flexible dates.
// `travelerRange` ({ min, max }, the tour's `inquiryTravelers` — the party size
// one inquiry may ask for, 1–12 on the scheduled Caucasus tours — falling back
// to `groupSize`): the free traveler count becomes a required select of exactly
// those values, so a group tour can never be requested for 0 or for more
// people than a departure takes. The operating minimum (`groupSize.min`) is a
// separate fact shown on the page, not a limit on a single inquiry.
// `tourSlug` is the only tour identifier sent to analytics (never the
// visitor's own fields).
export default function TourInquiryForm({ tourTitle, tourSlug = '', selectedPackage, hideAccommodationType = false, departures = null, travelerRange = null }) {
  const t = useT()
  const { lang } = useLang()
  // Built after mount: Intl.DisplayNames output can differ between the
  // prerender (Node) and the visitor's browser, so the server HTML carries only
  // the placeholder option and hydration cannot mismatch.
  const [countries, setCountries] = useState([])
  useEffect(() => { setCountries(countryOptions(lang)) }, [lang])
  const { status, submit } = useWeb3Form()
  const [form, setForm] = useState({
    salutation: '', firstName: '', lastName: '', email: '', phone: '', citizenship: '',
    travelers: '', startDate: '', endDate: '', departure: '', accommodation: '', message: '',
    botcheck: '',
  })
  const [errors, setErrors] = useState([])

  // Pre-select the Accommodation Type when a pricing card's "Request this tour" button is
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
    if (!isCountryCode(form.citizenship)) errs.push(t('form.errors.citizenship'))
    if (departures && !form.departure) errs.push(t('form.errors.departure'))
    if (travelerRange && !form.travelers) errs.push(t('form.errors.travelers'))
    return errs
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (form.botcheck) return // honeypot tripped — silently ignore
    const errs = validate()
    setErrors(errs)
    if (errs.length) return
    const chosen = departures?.find((d) => d.value === form.departure)
    const ok = await submit({
      subject: `New tour request: ${tourTitle}`,
      tour: tourTitle,
      salutation: form.salutation,
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      // Name in English for the team reading the email, plus the ISO code.
      citizenship: countryName(form.citizenship, 'en'),
      citizenship_code: form.citizenship,
      travelers: form.travelers,
      // A scheduled group tour submits the chosen departure (human label plus
      // the canonical ISO window) instead of free start/end dates, which it
      // never shows; a private tour sends its dates exactly as before.
      ...(departures
        ? {
            departure: `${chosen?.label || ''} (${form.departure})`,
            // The departure's booking deadline, as its own line in the email
            // (ISO date plus the label the visitor saw).
            ...(chosen?.bookingDeadline ? { booking_deadline: `${chosen.bookingDeadline} (${chosen.deadlineLabel})` } : {}),
          }
        : { start_date: form.startDate, end_date: form.endDate }),
      // Omitted entirely (not sent as an empty/blank value) on a tour with a
      // single accommodation option — the field is never shown, so there is
      // nothing for the visitor to have chosen. Web3Forms only emails the
      // keys present in this object, so the inquiry simply has no
      // Accommodation line for this tour rather than a blank or "undefined" one.
      ...(hideAccommodationType ? {} : { accommodation: form.accommodation }),
      message: form.message.trim(),
      botcheck: '',
      'cf-turnstile-response': getTurnstileToken(),
    })
    if (ok) trackEvent('inquiry_submit', { tour: tourSlug, form: 'tour_inquiry', ...(departures ? { departure: form.departure } : {}) })
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
          <label htmlFor="ti-travelers">{t('form.travelers')}{travelerRange ? ' *' : ''}</label>
          {travelerRange ? (
            <select id="ti-travelers" name="travelers" required value={form.travelers} onChange={set('travelers')} aria-invalid={invalid(!form.travelers)} aria-describedby={describedBy(!form.travelers)}>
              <option value="">{t('form.travelersPlaceholder')}</option>
              {Array.from({ length: travelerRange.max - travelerRange.min + 1 }, (_, i) => travelerRange.min + i).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          ) : (
            <input id="ti-travelers" name="travelers" type="number" min="1" max="99" step="1" inputMode="numeric" value={form.travelers} onChange={set('travelers')} />
          )}
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

      <div className="td-form__group">
        <label htmlFor="ti-citizenship">{t('form.citizenship')} *</label>
        <select id="ti-citizenship" name="citizenship" required autoComplete="off" value={form.citizenship} onChange={set('citizenship')} aria-invalid={invalid(!isCountryCode(form.citizenship))} aria-describedby={describedBy(!isCountryCode(form.citizenship))}>
          <option value="">{t('form.citizenshipPlaceholder')}</option>
          {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </div>

      {departures ? (
        <div className="td-form__group">
          <label htmlFor="ti-departure">{t('form.departure')} *</label>
          <select
            id="ti-departure"
            name="departure"
            required
            value={form.departure}
            onChange={(e) => {
              set('departure')(e)
              if (e.target.value) trackEvent('departure_select', { tour: tourSlug, departure: e.target.value })
            }}
            aria-invalid={invalid(!form.departure)}
            aria-describedby={describedBy(!form.departure)}
          >
            <option value="">{t('form.departurePlaceholder')}</option>
            {departures.map((d) => (
              <option key={d.value} value={d.value} disabled={d.soldOut}>
                {d.label}{d.soldOut ? ` — ${t('tour.soldOut')}` : ''}
              </option>
            ))}
          </select>
        </div>
      ) : (
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
      )}

      {/* A tour with a single accommodation option (accommodationMode: 'single'
          in tours.js, e.g. the 7-Day Svaneti Tour) has nothing for this field
          to offer a choice between, so it is omitted entirely rather than
          shown disabled or with only one real option — no label, no select,
          no reserved space. Every other tour is unaffected. */}
      {!hideAccommodationType && (
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
      )}

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
