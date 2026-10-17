import useT from '../../i18n/useT'

/* The scheduled windows of a group tour with their booking deadlines —
   "2027 departures": four small cells, dates first, "Book by <date>" under
   them. Rendered once per tour page, at the end of the Overview (under the
   adults-only / group-size facts line), so a visitor reads what the trip is,
   who it is for and when it runs as one block before the family chooser and
   the gallery. The inquiry dropdown lower down shows the same windows as
   dates only; nothing else on the page repeats them.

   `departures` is the array TourDetailPage builds from the tour's
   `groupDates` + the locale's `departures` labels and passes to the inquiry
   form as well — [{ value, label, bookingDeadline, deadlineLabel }] — so the
   strip and the form can never disagree. The deadline itself is derived in
   src/data/groupDepartures.js (30 calendar days before the start). Any
   future scheduled tour that carries `groupDates` gets this strip for free;
   nothing here knows a tour slug. Display only: no closing, no sold-out, no
   urgency — the owner has approved none of that. */

function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

export default function ScheduledTourDepartures({ departures, year }) {
  const t = useT()
  if (!departures?.length) return null
  return (
    <div className="td-departures">
      <h3 id="td-departures-title" className="td-departures__title">
        <CalendarIcon />
        {t('tour.departuresTitle', { year })}
      </h3>
      <ul className="td-departures__list" aria-labelledby="td-departures-title">
        {departures.map((d) => (
          <li key={d.value} className="td-departures__item">
            <span className="td-departures__dates">{d.label}</span>
            {d.deadlineLabel && <span className="td-departures__deadline">{d.deadlineLabel}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
