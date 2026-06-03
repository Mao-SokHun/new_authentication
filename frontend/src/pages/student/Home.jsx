import { Link, useNavigate } from 'react-router-dom'
import {
  PageAmbient,
  PageSection,
  SearchFilter,
  TeacherList,
} from '@/components'
import { useTeacherFilters, useTeachers } from '@/hooks'
import { useTranslation } from '@/i18n'
import { TEXT } from '@/constants'

const Home = () => {
  const { t } = useTranslation()
  const { filters, setFilter, reset } = useTeacherFilters()
  const { teachers, total, loading } = useTeachers(filters)

  return (
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
  )
}

export default Home
