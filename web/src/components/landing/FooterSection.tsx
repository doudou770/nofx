import { t, Language } from '../../i18n/translations'

interface FooterSectionProps {
  language: Language
}

export default function FooterSection({ language }: FooterSectionProps) {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--panel-border)',
        background: 'var(--brand-dark-gray)',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <img src="/icons/eq.svg" alt="Equinai Logo" className="w-8 h-8" />
          <div>
            <div className="text-lg font-bold" style={{ color: '#EAECEF' }}>
              {t('appTitle', language)}
            </div>
            <div className="text-xs" style={{ color: '#848E9C' }}>
              {t('futureStandardAI', language)}
            </div>
          </div>
        </div>

        {/* Multi-link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-8">
          {/* Column 1: Platform */}
          <div>
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: '#EAECEF' }}
            >
              {t('platform', language)}
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: '#848E9C' }}>
              <li>
                <a
                  className="hover:text-[#F0B90B]"
                  href="https://github.com/tinkle-community/nofx"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('signalMarketplace', language)}
                </a>
              </li>
              <li>
                <a
                  className="hover:text-[#F0B90B]"
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('pricing', language)}
                </a>
              </li>
              <li>
                <a
                  className="hover:text-[#F0B90B]"
                  href="https://x.com/nofx_official"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('successStories', language)}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Support */}
          <div>
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: '#EAECEF' }}
            >
              {t('support', language)}
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: '#848E9C' }}>
              <li>
                <a
                  className="hover:text-[#F0B90B]"
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('helpCenter', language)}
                </a>
              </li>
              <li>
                <a
                  className="hover:text-[#F0B90B]"
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('becomeProvider', language)}
                </a>
              </li>
              <li>
                <a
                  className="hover:text-[#F0B90B]"
                  href="https://github.com/tinkle-community/nofx"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('apiDocumentation', language)}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Ecosystem */}
          <div>
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: '#EAECEF' }}
            >
              {t('ecosystem', language)}
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: '#848E9C' }}>
              <li>
                <a
                  className="hover:text-[#F0B90B]"
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('affiliateProgram', language)}
                </a>
              </li>
              <li>
                <a
                  className="hover:text-[#F0B90B]"
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('supportedExchanges', language)}
                </a>
              </li>
              <li>
                <a
                  className="hover:text-[#F0B90B]"
                  href="https://amber.ac/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('institutionalPartners', language)}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom note */}
        <div
          className="pt-6 mt-8 text-center text-xs flex flex-col md:flex-row justify-between items-center gap-4"
          style={{
            color: 'var(--text-tertiary)',
            borderTop: '1px solid var(--panel-border)',
          }}
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <p>{t('footerCopyright', language)}</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-[#F0B90B]">
                {t('privacyPolicy', language)}
              </a>
              <a href="#" className="hover:text-[#F0B90B]">
                {t('termsOfService', language)}
              </a>
            </div>
          </div>
          <p>{t('footerWarning', language)}</p>
        </div>
      </div>
    </footer>
  )
}
