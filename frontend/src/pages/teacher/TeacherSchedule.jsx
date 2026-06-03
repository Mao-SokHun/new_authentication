import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, Plus } from 'lucide-react'
import {
  PageScaffold,
  PageCard,
  PageAmbient,
  ScheduleSection,
} from '@/components'
import { useTranslation } from '@/i18n'
import { useAuth } from '@/hooks'
import { resolveTeacherProfile } from '@/lib/teacherProfile'
import {
  getTeacherWeeklySchedule,
  saveTeacherWeeklySchedule,
  fetchMyTeacherSessions,
} from '@/services/mentors/teacherScheduleService'

const TeacherSchedule = () => {
  const { t } = useTranslation()
  const { user, updateUser } = useAuth()
  const profile = resolveTeacherProfile(user)
  const [schedule, setSchedule] = useState(() => getTeacherWeeklySchedule(user))
  const [published, setPublished] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [savedOk, setSavedOk] = useState(false)

  useEffect(() => {
    setSchedule(getTeacherWeeklySchedule(user))
  }, [user?.schedule])

  useEffect(() => {
    if (!user?.id) {
      setLoadingSessions(false)
      return
    }
    let cancelled = false
    setLoadingSessions(true)
    fetchMyTeacherSessions(user.id)
      .then((rows) => {
        if (!cancelled) setPublished(rows)
      })
      .finally(() => {
        if (!cancelled) setLoadingSessions(false)
      })
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const handleSaveWeekly = async () => {
    setSaveError('')
    setSavedOk(false)
    setSaving(true)
    try {
      await saveTeacherWeeklySchedule(schedule)
      updateUser({ schedule })
      setSavedOk(true)
    } catch (err) {
      setSaveError(err?.message || t('profile.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageAmbient variant="teacher" className="space-y-6">
      <PageScaffold
        title={t('teacherSchedule.title')}
        subtitle={t('teacherSchedule.subtitle')}
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSaveWeekly}
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-60"
            >
              {saving ? t('profile.saving') : t('teacherSchedule.saveWeekly')}
            </button>
            <Link
              to="/teacher/create-post"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-primary-200 text-primary-600 rounded-xl hover:bg-primary-50"
            >
              <Plus className="w-4 h-4" />
              {t('teacherSchedule.postSession')}
            </Link>
          </div>
        }
      >
        {saveError && <p className="text-sm text-red-600 mb-4">{saveError}</p>}
        {savedOk && (
          <p className="text-sm text-emerald-600 mb-4">{t('teacherSchedule.savedWeekly')}</p>
        )}

        <ScheduleSection
          title={t('teacherProfile.schedule')}
          schedule={schedule}
          onChange={setSchedule}
        />

        <PageCard className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="w-5 h-5 text-primary-500" />
            <h3 className="font-bold text-slate-800">{t('teacherSchedule.publishedTitle')}</h3>
          </div>
          {loadingSessions ? (
            <p className="text-sm text-slate-500 py-6 text-center">{t('student.loadingTeachers')}</p>
          ) : published.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
              {t('teacherSchedule.noPublished')}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {published.map((row, idx) => (
                <li key={row.id ?? idx} className="py-3 flex flex-wrap justify-between gap-2 text-sm">
                  <span className="font-medium text-slate-800">
                    {row.subject ?? row.title ?? '—'}
                  </span>
                  <span className="text-slate-500">
                    {[row.session_date ?? row.date, row.time_slot ?? row.time]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-slate-400 mt-4">{t('teacherSchedule.publishedHint')}</p>
        </PageCard>

        <p className="text-xs text-slate-500 mt-2">
          {t('teacherSchedule.browseNote', { name: profile.displayName || t('auth.teacher') })}
        </p>
      </PageScaffold>
    </PageAmbient>
  )
}

export default TeacherSchedule
