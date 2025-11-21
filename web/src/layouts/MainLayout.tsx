import { ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import HeaderBar from '../components/HeaderBar'
import { Container } from '../components/Container'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { t } from '../i18n/translations'

interface MainLayoutProps {
  children?: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { language, setLanguage } = useLanguage()
  const { user, logout } = useAuth()
  const location = useLocation()

  // 根据路径自动判断当前页面
  const getCurrentPage = (): 'competition' | 'traders' | 'trader' | 'faq' => {
    if (location.pathname === '/faq') return 'faq'
    if (location.pathname === '/traders') return 'traders'
    if (location.pathname === '/dashboard') return 'trader'
    if (location.pathname === '/competition') return 'competition'
    return 'competition' // 默认
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: '#0B0E11', color: '#EAECEF' }}
    >
      <HeaderBar
        isLoggedIn={!!user}
        currentPage={getCurrentPage()}
        language={language}
        onLanguageChange={setLanguage}
        user={user}
        onLogout={logout}
        onPageChange={() => {
          // React Router handles navigation now
        }}
      />

      {/* Main Content */}
      <Container as="main" className="py-6 pt-24">
        {children || <Outlet />}
      </Container>

      {/* Footer */}
      <footer
        className="mt-16"
        style={{ borderTop: '1px solid #2B3139', background: '#181A20' }}
      >
        <Container
          className="py-6 text-center text-sm"
          style={{ color: '#5E6673' }}
        >
          <p>{t('footerTitle', language)}</p>
          <p className="mt-1">{t('footerWarning', language)}</p>
          <div className="mt-4">

          </div>
        </Container>
      </footer>
    </div>
  )
}
