import { contactInfo } from '../../data/siteData'
import useT from '../../i18n/useT'
import LocaleLink from '../../i18n/LocaleLink'
import LanguageSwitcher from './LanguageSwitcher'
import asset from '../../utils/basePath'

export default function Footer({ variant = 'default' }) {
  const isTaxi = variant === 'taxi'
  const t = useT()

  return (
    <footer className={isTaxi ? 'taxi-footer' : ''}>
      <div className="footer-top">
        {/* Brand column */}
        <div className="footer-col footer-col--brand">
          <LocaleLink to="/" title="Home" className="footer-logo">
            <img src={asset('/img/hikasustravel.svg')} alt="Hikasus Travel" />
          </LocaleLink>
          <p className="footer-desc">{t('footer.description')}</p>
          <div className="footer-social">
            <a
              href={contactInfo.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="instagram"
              aria-label="Instagram"
            >
              {contactInfo.instagramHandle}
            </a>
          </div>
        </div>

        {/* Explore column */}
        <div className="footer-col">
          <h4 className="footer-col__title">{t('footer.explore')}</h4>
          <ul className="footer-col__list">
            <li><LocaleLink to="/">{t('footer.home')}</LocaleLink></li>
            <li><LocaleLink to="/about-us">{t('footer.about')}</LocaleLink></li>
            <li><LocaleLink to="/about-georgia">{t('footer.aboutGeorgia')}</LocaleLink></li>
            <li><LocaleLink to="/embassies">{t('footer.embassies')}</LocaleLink></li>
            <li><LocaleLink to="/blog">{t('footer.blog')}</LocaleLink></li>
            <li><LocaleLink to="/faq">{t('footer.faq')}</LocaleLink></li>
            <li><LocaleLink to="/contact">{t('footer.contact')}</LocaleLink></li>
          </ul>
        </div>

        {/* Tours column */}
        <div className="footer-col">
          <h4 className="footer-col__title">{t('footer.tours')}</h4>
          <ul className="footer-col__list">
            <li><LocaleLink to="/group-tours">{t('footer.allGroupTours')}</LocaleLink></li>
            <li><LocaleLink to="/private-tours">{t('footer.allPrivateTours')}</LocaleLink></li>
          </ul>
        </div>

        {/* Services column */}
        <div className="footer-col">
          <h4 className="footer-col__title">{t('footer.services')}</h4>
          <ul className="footer-col__list">
            <li><LocaleLink to="/shuttle-service">{t('footer.shuttleService')}</LocaleLink></li>
            <li><LocaleLink to="/georgia-visa-entry-requirements">{t('footer.visa')}</LocaleLink></li>
          </ul>
        </div>

        {/* Contact column */}
        <div className="footer-col">
          <h4 className="footer-col__title">{t('footer.contactUs')}</h4>
          <ul className="footer-col__list footer-col__list--contact">
            <li>{contactInfo.address}</li>
            <li>
              <span className="footer-contact-label">{t('footer.belgium')}</span>
              <a href={`tel:${contactInfo.phoneBelgium.replace(/\s/g, '')}`}>{contactInfo.phoneBelgium}</a>
            </li>
            <li>
              <span className="footer-contact-label">{t('footer.georgia')}</span>
              <a href={`tel:${contactInfo.phoneGeorgia.replace(/\s/g, '')}`}>{contactInfo.phoneGeorgia}</a>
            </li>
            <li>
              <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="footer-bottom__left">
          <span>&copy; 2024&ndash;{new Date().getFullYear()} Hikasus Travel. {t('footer.rights')}</span>
        </div>
        <div className="footer-bottom__right">
          <LocaleLink to="/privacy-policy">{t('footer.privacyPolicy')}</LocaleLink>
          <LocaleLink to="/terms-and-conditions">{t('footer.termsConditions')}</LocaleLink>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  )
}
