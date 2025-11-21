import { useState, useEffect, useRef } from 'react'
import { Globe } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { t, SUPPORTED_LANGUAGES } from '../i18n/translations'
import { Container } from './Container'

interface HeaderProps {
  simple?: boolean // For login/register pages
}

export function Header({ simple = false }: HeaderProps) {
  const { language, setLanguage } = useLanguage()
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setLanguageDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="glass sticky top-0 z-50 backdrop-blur-xl">
      <Container className="py-4">
        <div className="flex items-center justify-between">
          {/* Left - Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <img src="/icons/eq.svg" alt="Equinai Logo" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#EAECEF' }}>
                {t('appTitle', language)}
              </h1>
              {!simple && (
                <p className="text-xs mono" style={{ color: '#848E9C' }}>
                  {t('subtitle', language)}
                </p>
              )}
            </div>
          </div>

          {/* Right - Language Toggle (always show) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded transition-colors hover:text-white"
              style={{ color: '#848E9C' }}
              onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                'rgba(255, 255, 255, 0.05)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'transparent')
              }
            >
              <Globe className="w-5 h-5" />
            </button>

            {languageDropdownOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-32 rounded-lg shadow-lg overflow-hidden z-50"
                style={{
                  background: '#1E2329',
                  border: '1px solid #2B3139',
                }}
              >
                {SUPPORTED_LANGUAGES.map((langOption) => (
                  <button
                    key={langOption.code}
                    onClick={() => {
                      setLanguage(langOption.code)
                      setLanguageDropdownOpen(false)
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 transition-colors ${language === langOption.code ? '' : 'hover:opacity-80'
                      }`}
                    style={{
                      color: '#EAECEF',
                      background:
                        language === langOption.code
                          ? 'rgba(240, 185, 11, 0.1)'
                          : 'transparent',
                    }}
                  >
                    <span className="text-base">{langOption.flag}</span>
                    <span className="text-sm">{langOption.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </header>
  )
}
