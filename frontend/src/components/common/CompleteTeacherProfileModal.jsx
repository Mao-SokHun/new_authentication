import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Check, User, BookOpen, MessageSquare } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import SearchableSelect from '../ui/SearchableSelect'
import RequiredFieldsHint from './RequiredFieldsHint'
import FieldLabel from '../ui/FieldLabel'
import clsx from 'clsx'
import { useTranslation, localizeOptionList, useLocalizedFilterOptions } from '@/i18n'
import { FILTER_ALL, TEACHER_GENDER_OPTIONS, getSubjectFilterOptions } from '@/constants'

const steps = [
  { id: 1, labelKey: 'teacherOnboarding.stepBasic', shortLabelKey: 'teacherOnboarding.stepBasicShort', icon: User },
  { id: 2, labelKey: 'teacherOnboarding.stepTeaching', shortLabelKey: 'teacherOnboarding.stepTeachingShort', icon: BookOpen },
  { id: 3, labelKey: 'teacherOnboarding.stepAbout', shortLabelKey: 'teacherOnboarding.stepAboutShort', icon: MessageSquare },
]

const CompleteTeacherProfileModal = ({ open, onComplete }) => {
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
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

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
      <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm" aria-hidden />

      <section
        className="relative w-full max-w-md max-h-[min(90vh,780px)] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/80"
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-teacher-profile-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1 min-w-0 last:flex-none">
                <div className="flex flex-col items-center gap-1 min-w-[3.5rem]">
                  <div
                    className={clsx(
                      'w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0',
                      step > s.id
                        ? 'bg-emerald-500 text-white'
                        : step === s.id
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-400'
                    )}
                  >
                    {step > s.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <s.icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-slate-500 text-center leading-tight">
                    <span className="sm:hidden">{t(s.shortLabelKey)}</span>
                    <span className="hidden sm:inline">{t(s.labelKey)}</span>
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={clsx(
                      'flex-1 h-0.5 mx-2 rounded-full min-w-[1rem]',
                      step > s.id ? 'bg-emerald-400' : 'bg-slate-200'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <div className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <h2 id="complete-teacher-profile-title" className="text-xl font-bold text-slate-800">
                    {t('teacherOnboarding.title')}
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">{t('teacherOnboarding.subtitle')}</p>
                </div>
                <RequiredFieldsHint>{t('auth.requiredFieldsHint')}</RequiredFieldsHint>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <Input
                    label={t('teacherProfile.lastName')}
                    value={form.lastName}
                    onChange={(e) => setField('lastName', e.target.value)}
                    placeholder={t('teacherProfile.lastName')}
                    required
                  />
                  <Input
                    label={t('teacherProfile.firstName')}
                    value={form.firstName}
                    onChange={(e) => setField('firstName', e.target.value)}
                    placeholder={t('teacherProfile.firstName')}
                    required
                  />
                </div>
                <Input
                  label={t('teacherProfile.professionalTitle')}
                  value={form.title}
                  onChange={(e) => setField('title', e.target.value)}
                  placeholder={t('teacherOnboarding.titlePlaceholder')}
                  required
                />
                <Input
                  label={t('teacherOnboarding.phone')}
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  placeholder="+855 12 000 000"
                  optional
                  optionalLabel={t('auth.optional')}
                />
                <div>
                  <FieldLabel label={t('teacherProfile.gender')} required />
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
                  required
                />
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800">
                    {t('teacherProfile.teachingFocus')}
                  </h2>
                  <p className="text-slate-500 text-base mt-2">{t('teacherOnboarding.teachingHint')}</p>
                </div>
                <RequiredFieldsHint>{t('auth.requiredFieldsHint')}</RequiredFieldsHint>
                <SearchableSelect
                  label={t('teacherCard.major')}
                  value={form.major}
                  onChange={handleMajorChange}
                  options={majorOptions}
                  placeholder={t('teacherProfile.customOptionHint')}
                  allowCustom
                  required
                />
                <SearchableSelect
                  label={t('teacherCard.subject')}
                  value={form.subject}
                  onChange={(subject) => setField('subject', subject)}
                  options={subjectOptions}
                  placeholder={t('teacherProfile.customOptionHint')}
                  allowCustom
                  disabled={!form.major}
                  required
                />
                <SearchableSelect
                  label={t('filters.province')}
                  value={form.province}
                  onChange={(province) => setField('province', province)}
                  options={locationOptions}
                  placeholder={t('teacherProfile.customOptionHint')}
                  allowCustom
                  required
                />
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800">
                    {t('teacherOnboarding.aboutTitle')}
                  </h2>
                  <p className="text-slate-500 text-base mt-2">{t('teacherOnboarding.aboutHint')}</p>
                </div>
                <div>
                  <FieldLabel label={t('teacherOnboarding.bioLabel')} optional optionalText={t('auth.optional')} />
                  <textarea
                    rows={5}
                    value={form.bio}
                    onChange={(e) => setField('bio', e.target.value)}
                    placeholder={t('teacherProfile.bioPlaceholder')}
                    className="w-full min-h-[7rem] rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 placeholder-slate-400 resize-y focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-transparent"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-100 px-5 py-4 sm:px-6 bg-slate-50/60">
          {saveError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-3">
              {saveError}
            </p>
          )}
          <div className="flex items-center justify-between gap-3">
            {step > 1 ? (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setStep((s) => s - 1)}
              >
                {t('teacherOnboarding.back')}
              </Button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="primary"
                size="sm"
                type="button"
                onClick={handleNext}
                disabled={!canContinue || saving}
                loading={saving}
                className="min-w-[7rem]"
              >
                {step === 3
                  ? saving
                    ? t('teacherOnboarding.saving')
                    : t('teacherOnboarding.finish')
                  : t('teacherOnboarding.continue')}
              </Button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 mt-3 leading-relaxed">
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
