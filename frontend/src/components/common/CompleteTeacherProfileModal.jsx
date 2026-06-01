import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Check, User, BookOpen, MessageSquare } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import SearchableSelect from '../ui/SearchableSelect'
import clsx from 'clsx'
import { useTranslation, localizeOptionList, useLocalizedFilterOptions } from '@/i18n'
import { FILTER_ALL, TEACHER_GENDER_OPTIONS, getSubjectFilterOptions } from '@/constants'

const steps = [
  { id: 1, labelKey: 'teacherOnboarding.stepBasic', shortLabelKey: 'teacherOnboarding.stepBasicShort', icon: User },
  { id: 2, labelKey: 'teacherOnboarding.stepTeaching', shortLabelKey: 'teacherOnboarding.stepTeachingShort', icon: BookOpen },
  { id: 3, labelKey: 'teacherOnboarding.stepAbout', shortLabelKey: 'teacherOnboarding.stepAboutShort', icon: MessageSquare },
]

const CompleteTeacherProfileModal = ({ open, onClose, onComplete }) => {
  const { t, labelFor } = useTranslation()
  const opts = useLocalizedFilterOptions()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    title: '',
    phone: '',
    gender: '',
    experienceYears: '',
    major: '',
    subject: '',
    province: '',
    bio: '',
  })

  const majorOptions = useMemo(
    () => opts.majors.filter((o) => o.value !== FILTER_ALL.major),
    [opts.majors]
  )

  const subjectOptions = useMemo(() => {
    const values = getSubjectFilterOptions(form.major).filter((v) => v !== FILTER_ALL.subject)
    return localizeOptionList(values, labelFor)
  }, [form.major, labelFor])

  const locationOptions = useMemo(
    () => opts.locations.filter((o) => o.value !== FILTER_ALL.location),
    [opts.locations]
  )

  useEffect(() => {
    if (open) {
      setStep(1)
      setSaving(false)
      setSaveError('')
      setForm({
        firstName: '',
        lastName: '',
        title: '',
        phone: '',
        gender: '',
        experienceYears: '',
        major: '',
        subject: '',
        province: '',
        bio: '',
      })
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleMajorChange = (major) => {
    setForm((prev) => {
      const nextPredefined = getSubjectFilterOptions(major).filter((s) => s !== FILTER_ALL.subject)
      const subject = nextPredefined.includes(prev.subject) ? prev.subject : ''
      return { ...prev, major, subject }
    })
  }

  const parsedExperienceYears = parseInt(form.experienceYears, 10)

  const canContinue =
    step === 1
      ? form.firstName.trim() &&
        form.lastName.trim() &&
        form.title.trim() &&
        form.gender &&
        !Number.isNaN(parsedExperienceYears) &&
        parsedExperienceYears >= 1
      : step === 2
        ? form.major && form.subject && form.province
        : true

  const handleNext = async () => {
    if (step < 3) {
      setStep((s) => s + 1)
      return
    }

    const firstName = form.firstName.trim()
    const lastName = form.lastName.trim()
    const payload = {
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      title: form.title.trim(),
      phone: form.phone.trim(),
      gender: form.gender,
      experienceYears: parsedExperienceYears,
      major: form.major,
      subject: form.subject,
      province: form.province,
      bio: form.bio.trim(),
    }

    setSaveError('')
    setSaving(true)
    try {
      await onComplete?.(payload)
    } catch (err) {
      setSaveError(err.message || t('teacherOnboarding.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6" role="presentation">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />

      <section
        className="relative w-full max-w-lg max-h-[min(90vh,820px)] flex flex-col overflow-hidden rounded-2xl shadow-2xl glass-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-teacher-profile-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 p-4 sm:p-5 border-b border-white/50 bg-white/75 backdrop-blur-md">
          <div className="flex items-center gap-0 max-w-3xl mx-auto w-full">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center gap-1 sm:gap-1.5 flex-1 min-w-0">
                  <div
                    className={clsx(
                      'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all shrink-0',
                      step > s.id
                        ? 'bg-emerald-500 text-white'
                        : step === s.id
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-white/60 text-slate-400'
                    )}
                  >
                    {step > s.id ? (
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ) : (
                      <s.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-slate-500 text-center leading-tight px-0.5 w-full break-words">
                    <span className="sm:hidden">{t(s.shortLabelKey)}</span>
                    <span className="hidden sm:inline">{t(s.labelKey)}</span>
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={clsx(
                      'flex-1 h-0.5 mx-1 sm:mx-2 md:mx-3 rounded-full min-w-[0.75rem]',
                      step > s.id ? 'bg-emerald-400' : 'bg-white/60'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-4 sm:space-y-5 max-w-3xl mx-auto w-full">
            {step === 1 && (
              <>
                <div>
                  <h2 id="complete-teacher-profile-title" className="text-lg sm:text-xl font-bold text-slate-800">
                    {t('teacherOnboarding.title')}
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">{t('teacherOnboarding.subtitle')}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label={t('teacherProfile.firstName')}
                    value={form.firstName}
                    onChange={(e) => setField('firstName', e.target.value)}
                    placeholder={t('teacherProfile.firstName')}
                  />
                  <Input
                    label={t('teacherProfile.lastName')}
                    value={form.lastName}
                    onChange={(e) => setField('lastName', e.target.value)}
                    placeholder={t('teacherProfile.lastName')}
                  />
                </div>
                <Input
                  label={t('teacherProfile.professionalTitle')}
                  value={form.title}
                  onChange={(e) => setField('title', e.target.value)}
                  placeholder={t('teacherOnboarding.titlePlaceholder')}
                />
                <Input
                  label={t('teacherOnboarding.phone')}
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  placeholder="+855 12 000 000"
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t('teacherProfile.gender')}
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {TEACHER_GENDER_OPTIONS.map((g) => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer">
                        <button
                          type="button"
                          onClick={() => setField('gender', g)}
                          className={clsx(
                            'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all',
                            form.gender === g
                              ? 'border-primary-400 bg-primary-500'
                              : 'border-slate-300 bg-white'
                          )}
                        >
                          {form.gender === g && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </button>
                        <span className="text-sm text-slate-700">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Input
                  label={t('teacherOnboarding.experienceYears')}
                  type="number"
                  min={1}
                  max={60}
                  value={form.experienceYears}
                  onChange={(e) => setField('experienceYears', e.target.value)}
                  placeholder={t('teacherOnboarding.experienceYearsPlaceholder')}
                />
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                    {t('teacherProfile.teachingFocus')}
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">{t('teacherOnboarding.teachingHint')}</p>
                </div>
                <SearchableSelect
                  label={t('teacherCard.major')}
                  value={form.major}
                  onChange={handleMajorChange}
                  options={majorOptions}
                  placeholder={t('teacherProfile.customOptionHint')}
                  allowCustom
                />
                <SearchableSelect
                  label={t('teacherCard.subject')}
                  value={form.subject}
                  onChange={(subject) => setField('subject', subject)}
                  options={subjectOptions}
                  placeholder={t('teacherProfile.customOptionHint')}
                  allowCustom
                  disabled={!form.major}
                />
                <SearchableSelect
                  label={t('filters.province')}
                  value={form.province}
                  onChange={(province) => setField('province', province)}
                  options={locationOptions}
                  placeholder={t('teacherProfile.customOptionHint')}
                  allowCustom
                />
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                    {t('teacherOnboarding.aboutTitle')}
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">{t('teacherOnboarding.aboutHint')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t('teacherOnboarding.bioLabel')}
                  </label>
                  <textarea
                    rows={5}
                    value={form.bio}
                    onChange={(e) => setField('bio', e.target.value)}
                    placeholder={t('teacherProfile.bioPlaceholder')}
                    className="w-full min-h-[7rem] rounded-xl border border-slate-200/80 bg-white/50 px-3 sm:px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 resize-y focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-transparent"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-white/50 bg-white/75 backdrop-blur-md">
          <div className="p-4 sm:p-5 max-w-3xl mx-auto w-full">
            {saveError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-3">
                {saveError}
              </p>
            )}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="w-full sm:w-auto">
                {step > 1 ? (
                  <Button
                    variant="ghost"
                    size="md"
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="w-full sm:w-auto"
                  >
                    {t('teacherOnboarding.back')}
                  </Button>
                ) : (
                  <span className="hidden sm:block" />
                )}
              </div>

              <div className="flex flex-col-reverse min-[480px]:flex-row items-stretch min-[480px]:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {step < 3 && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full min-[480px]:w-auto text-sm text-slate-500 hover:text-slate-700 transition-colors py-2 text-center"
                  >
                    {t('teacherOnboarding.skip')}
                  </button>
                )}
                <Button
                  variant="primary"
                  size="md"
                  type="button"
                  onClick={handleNext}
                  disabled={!canContinue || saving}
                  loading={saving}
                  className="w-full min-[480px]:w-auto min-w-[8.5rem]"
                >
                  {step === 3
                    ? saving
                      ? t('teacherOnboarding.saving')
                      : t('teacherOnboarding.finish')
                    : t('teacherOnboarding.continue')}
                </Button>
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] sm:text-xs text-slate-500 px-4 pb-4">
            {t('auth.agreeTerms')}{' '}
            <Link to="/terms" className="text-primary-600 hover:underline">
              {t('auth.terms')}
            </Link>{' '}
            {t('auth.and')}{' '}
            <Link to="/privacy" className="text-primary-600 hover:underline">
              {t('auth.privacy')}
            </Link>
          </p>
        </div>
      </section>
    </div>,
    document.body
  )
}

export default CompleteTeacherProfileModal
