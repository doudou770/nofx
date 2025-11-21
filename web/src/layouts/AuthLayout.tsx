import { ReactNode, useState, useEffect, useRef } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Globe } from 'lucide-react'
import { Container } from '../components/Container'
import { useLanguage } from '../contexts/LanguageContext'
import { t, Language, SUPPORTED_LANGUAGES } from '../i18n/translations'

interface AuthLayoutProps {
  children?: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
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
    <div className="min-h-screen" style={{ background: '#0B0E11' }}>
      {/* Simple Header with Logo and Language Selector */}
      <nav
        className="fixed top-0 w-full z-50"
        style={{
          background: 'rgba(11, 14, 17, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Container className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src="/icons/eq.svg" alt="NOFX Logo" className="w-8 h-8" />
            <span className="text-xl font-bold" style={{ color: '#F0B90B' }}>
              {t('appTitle', language)}
            </span>
          </Link>

          {/* Language Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded transition-colors hover:text-white"
              style={{ color: '#EAECEF' }}
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
        </Container>
      </nav>

      {/* Content with top padding to avoid overlap with fixed header */}
      <div className="pt-16">{children || <Outlet />}</div>
    </div>
  )
}
