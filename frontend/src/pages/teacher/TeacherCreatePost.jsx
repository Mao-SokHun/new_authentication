import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarClock, Users, ArrowLeft, ChevronRight, CheckCircle } from 'lucide-react'
import { PageScaffold, PageCard, PageAmbient } from '@/components'
import { useTranslation } from '@/i18n'
import { useAuth } from '@/hooks'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import SearchableSelect from '../../components/ui/SearchableSelect'
import clsx from 'clsx'
import { sessionTimeOptions } from '@/constants'
import { publishTeacherSessionSlot } from '@/services/mentors/teacherScheduleService'

/** Teacher hub — post teaching schedule or start a new community (not community feed posts). */
const TeacherCreatePost = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [view, setView] = useState('hub')
  const [subject, setSubject] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState(sessionTimeOptions[1])
  const [notes, setNotes] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [published, setPublished] = useState(false)

  const timeOptions = sessionTimeOptions
    .filter((slot) => slot !== 'Any Time')
    .map((slot) => ({ value: slot, label: slot }))

  const handlePublishSchedule = async (e) => {
    e.preventDefault()
    setError('')
    setPublishing(true)
    try {
      await publishTeacherSessionSlot({
        userId: user?.id,
        subject,
        date,
        time,
        notes,
      })
      setPublished(true)
    } catch (err) {
      setError(err?.message || t('teacherSchedule.publishFailed'))
    } finally {
      setPublishing(false)
    }
  }

  if (view === 'schedule') {
    return (
      <PageAmbient variant="teacher" className="space-y-6">
        <PageScaffold
          title={t('teacherCreate.scheduleTitle')}
          subtitle={t('teacherCreate.scheduleSubtitle')}
        >
          <button
            type="button"
            onClick={() => {
              setView('hub')
              setPublished(false)
              setError('')
            }}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-primary-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('teacherCreate.backToHub')}
          </button>

          {published ? (
            <PageCard className="max-w-xl text-center py-10">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="font-bold text-slate-800 mb-2">{t('teacherSchedule.publishSuccess')}</h3>
              <p className="text-sm text-slate-500 mb-6">{t('teacherSchedule.publishSuccessHint')}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button type="button" variant="primary" onClick={() => navigate('/teacher/schedule')}>
                  {t('teacherSchedule.viewMySchedule')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPublished(false)
                    setSubject('')
                    setDate('')
                    setNotes('')
                  }}
                >
                  {t('teacherSchedule.postAnother')}
                </Button>
              </div>
            </PageCard>
          ) : (
            <PageCard className="max-w-xl">
              <form onSubmit={handlePublishSchedule} className="space-y-4">
                <Input
                  label={t('teacherCreate.subject')}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t('teacherCreate.subjectPlaceholder')}
                  required
                />
                <Input
                  label={t('teacherCreate.date')}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
                <SearchableSelect
                  label={t('teacherCreate.timeSlot')}
                  size="sm"
                  placement="bottom"
                  value={time}
                  onChange={setTime}
                  options={timeOptions}
                  placeholder={t('teacherCreate.timeSlot')}
                  menuMinWidth={240}
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t('teacherCreate.notes')}
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('teacherCreate.notesPlaceholder')}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                  disabled={publishing}
                >
                  {publishing ? t('profile.saving') : t('teacherCreate.publishSchedule')}
                </Button>
              </form>
            </PageCard>
          )}
        </PageScaffold>
      </PageAmbient>
    )
  }

  return (
    <PageAmbient variant="teacher" className="space-y-6">
      <PageScaffold title={t('teacherCreate.title')} subtitle={t('teacherCreate.subtitle')}>
        <div className="grid sm:grid-cols-2 gap-4 max-w-3xl">
          <button
            type="button"
            onClick={() => setView('schedule')}
            className={clsx(
              'group text-left rounded-2xl border-2 border-slate-200/90 bg-white/60 p-5 sm:p-6',
              'hover:border-primary-300 hover:bg-primary-50/40 hover:shadow-md transition-all duration-200'
            )}
          >
            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-4 group-hover:bg-primary-500 group-hover:text-white transition-colors">
              <CalendarClock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">{t('teacherCreate.scheduleCardTitle')}</h3>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{t('teacherCreate.scheduleCardDesc')}</p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 mt-4">
              {t('teacherCreate.open')}
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>

          <Link
            to="/community/create"
            className={clsx(
              'group block rounded-2xl border-2 border-slate-200/90 bg-white/60 p-5 sm:p-6',
              'hover:border-primary-300 hover:bg-primary-50/40 hover:shadow-md transition-all duration-200'
            )}
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">{t('teacherCreate.communityCardTitle')}</h3>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{t('teacherCreate.communityCardDesc')}</p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 mt-4">
              {t('teacherCreate.open')}
              <ChevronRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </PageScaffold>
    </PageAmbient>
  )
}

export default TeacherCreatePost
