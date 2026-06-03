import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import clsx from 'clsx'
import { useAuth, getStoredUser } from '@/hooks'
import { useTranslation } from '@/i18n'
import { RokkruLogo } from '@/components'
import Avatar from '../ui/Avatar'
import LanguageSwitcher from '../ui/LanguageSwitcher'

const guestNavTabs = [
  { labelKey: 'nav.home', href: '/' },
  { labelKey: 'nav.schedule', href: '/login' },
  { labelKey: 'nav.community', href: '/login' },
]

const navLinkClass =
  'px-2.5 py-1.5 text-sm font-semibold text-slate-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-white/50 whitespace-nowrap'

/** Guest navbar — or compact bar when logged in on public support/legal pages */
const PublicNavbar = () => {
  const { t, isKhmer } = useTranslation()
  const { user } = useAuth()
  const activeUser = user ?? getStoredUser()
  const isAppUser = activeUser?.role === 'student' || activeUser?.role === 'teacher'

  if (isAppUser) {
    const homeHref = activeUser.role === 'teacher' ? '/teacher/home' : '/home'
    return (
      <header className={clsx('glass-public-nav', isKhmer && 'font-khmer')}>
        <div className="max-w-7xl mx-auto h-14 px-4 sm:px-6 flex items-center gap-3">
          <RokkruLogo to={homeHref} size="sm" />
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <LanguageSwitcher size="sm" />
            <Avatar name={activeUser.name || 'User'} size="sm" />
            <span className="text-sm font-medium text-slate-600 capitalize hidden sm:inline">
              {t(`auth.${activeUser.role}`)}
            </span>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className={clsx('glass-public-nav', isKhmer && 'font-khmer')}>
      <div className="max-w-7xl mx-auto h-14 px-4 sm:px-6 flex items-center gap-2 sm:gap-3">
        <RokkruLogo to="/" size="sm" className="shrink-0" />

        <nav className="hidden lg:flex items-center gap-0.5 shrink-0">
          {guestNavTabs.map((tab) => (
            <Link key={tab.href + tab.labelKey} to={tab.href} className={navLinkClass}>
              {t(tab.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
          <div className="hidden sm:flex items-center gap-2 rounded-full pl-3 pr-3.5 h-9 bg-white border-2 border-slate-300 shadow-sm focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-200/80 w-40 md:w-48 lg:w-52">
            <Search className="w-4 h-4 text-slate-400 shrink-0" aria-hidden />
            <input
              type="search"
              placeholder={t('search.navPlaceholder')}
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-500 outline-none"
            />
          </div>
          <LanguageSwitcher size="sm" />
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-700 hover:text-primary-600 transition-colors px-2 py-1 rounded-lg hover:bg-white/60 whitespace-nowrap no-underline"
          >
            {t('nav.loginNav')}
          </Link>
          <Link
            to="/create-account"
            className="inline-flex items-center justify-center text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors px-3.5 py-1.5 rounded-lg shadow-sm whitespace-nowrap no-underline"
          >
            {t('nav.signupNav')}
          </Link>
        </div>
      </div>
    </header>
  )
}

export default PublicNavbar
