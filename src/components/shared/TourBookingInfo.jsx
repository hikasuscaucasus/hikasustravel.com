import FadeUp from './FadeUp'
import LocaleLink from '../../i18n/LocaleLink'
import useT from '../../i18n/useT'

/**
 * "How booking works" — the one place a tour page states the booking steps,
 * deposit, balance, cancellation bands and payment methods. The figures are
 * the Terms & Conditions' (pages.json `terms`), written once in ui.json and
 * shared by every private and group tour; nothing here lives in tour data.
 * Only steps 2 and 4 differ between the two kinds of tour.
 */
export default function TourBookingInfo({ isGroup = false }) {
  const t = useT()
  const kind = isGroup ? 'Group' : 'Private'
  return (
    <section className="td-section td-bookinfo" aria-labelledby="td-bookinfo-title">
      <FadeUp>
        <div className="td-bookinfo__box">
          <h2 className="td-section__title" id="td-bookinfo-title">{t('booking.title')}</h2>
          <ol className="td-bookinfo__steps">
            <li>{t('booking.step1')}</li>
            <li>{t(`booking.step2${kind}`)}</li>
            <li>{t('booking.step3')}</li>
            <li>{t(`booking.step4${kind}`)}</li>
          </ol>
          <p>{t('booking.cancellation')}</p>
          <p>{t('booking.payment')}</p>
          <p className="td-bookinfo__terms">
            <LocaleLink to="/terms-and-conditions">{t('booking.termsLink')}</LocaleLink>
          </p>
        </div>
      </FadeUp>
    </section>
  )
}
