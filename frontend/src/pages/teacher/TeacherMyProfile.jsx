import { Link } from 'react-router-dom'
import { Edit3 } from 'lucide-react'
import {
  PageScaffold,
  PageCard,
  ExperienceSection,
  ScheduleSection,
  PageAmbient,
  TeacherProfileHero,
} from '@/components'
import { useTranslation } from '@/i18n'
import { useAuth } from '@/hooks'
import { resolveTeacherProfile } from '@/lib/teacherProfile'

const TeacherMyProfile = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const profile = resolveTeacherProfile(user)

  return (
    <PageAmbient variant="teacher" className="space-y-6">
      <PageScaffold
        title={t('teacherProfile.title')}
        subtitle={t('teacherProfile.subtitle')}
        action={
          <Link
            to="/teacher/edit-profile"
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:border-primary-200 hover:text-primary-600 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {t('settings.editProfile')}
          </Link>
        }
      >
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="space-y-5">
            <TeacherProfileHero profile={profile} />
          </div>

          <div className="lg:col-span-2 space-y-5">
            <PageCard>
              <h3 className="font-bold text-slate-800 text-sm mb-3">{t('profile.aboutMe')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{profile.bio}</p>
            </PageCard>

            <ExperienceSection
              readOnly
              title={t('teacherProfile.experience')}
              experience={profile.experience}
              onChange={() => {}}
            />
          </div>

          <div className="lg:col-span-3">
            <ScheduleSection
              readOnly
              title={t('teacherProfile.schedule')}
              schedule={profile.schedule}
              onChange={() => {}}
            />
          </div>
        </div>
      </PageScaffold>
    </PageAmbient>
  )
}

export default TeacherMyProfile
