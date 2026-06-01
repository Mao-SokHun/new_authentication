import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  CompleteProfileModal,
  PageAmbient,
  PageSection,
  SearchFilter,
  TeacherList,
} from '@/components'
import { useAuth, useTeacherFilters, useTeachers } from '@/hooks'
import { useTranslation } from '@/i18n'
import { TEXT } from '@/constants'

const Home = () => {
  const { t } = useTranslation()
  const { updateUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showCompleteProfile, setShowCompleteProfile] = useState(
    () => Boolean(location.state?.showCompleteProfile)
  )
  const { filters, setFilter, reset } = useTeacherFilters()
  const { teachers, total, loading } = useTeachers(filters)

  useEffect(() => {
    if (location.state?.showCompleteProfile) {
      navigate('/home', { replace: true })
    }
  }, [location.state, navigate])

  return (
    <>
      <CompleteProfileModal
        open={showCompleteProfile}
        onClose={() => setShowCompleteProfile(false)}
        onComplete={(profile) => {
          updateUser({
            firstName: profile.firstName,
            lastName: profile.lastName,
            name: profile.name,
          })
          setShowCompleteProfile(false)
        }}
      />

      <PageAmbient variant="home" className="space-y-8 sm:space-y-12 md:space-y-14 lg:space-y-16">
      <SearchFilter
        variant="home"
        filters={filters}
        onFilterChange={setFilter}
        onReset={reset}
      />

      <PageSection
        className="pt-2 sm:pt-4"
        title={t('student.topTeachers')}
        subtitle={t('student.topTeachersSubtitle', { count: total })}
      >
        <TeacherList
          teachers={teachers}
          loading={loading}
          emptyDescription={t('student.emptyHint')}
        />
      </PageSection>

      <div className="text-center pt-2">
        <Link to="/schedule" className={TEXT.link}>
          {t('student.browseSchedule')}
        </Link>
      </div>
    </PageAmbient>
    </>
  )
}

export default Home
