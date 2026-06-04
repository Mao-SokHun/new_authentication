import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Eye, EyeOff, Mail, Phone, Plus, X } from 'lucide-react'
import clsx from 'clsx'
import {
  PageScaffold,
  PageCard,
  ExperienceSection,
  ScheduleSection,
  PageAmbient,
  ChangePasswordCard,
} from '@/components'
import Avatar from '../../components/ui/Avatar'
import SearchableSelect from '../../components/ui/SearchableSelect'
import { LocationFilterField } from '@/components'
import Modal from '@/components/ui/Modal'
import { useTranslation, localizeOptionList, useLocalizedFilterOptions } from '@/i18n'
import NameFieldsGrid from '@/components/common/NameFieldsGrid'
import { FILTER_ALL } from '@/constants'
import { getSubjectFilterOptions } from '@/constants'
import { TEACHER_GENDER_OPTIONS } from '@/constants'
import { useAuth } from '@/hooks'
import { isApiEnabled } from '@/constants'
import { deleteAccountWithPassword } from '@/services/auth/authService'
import {
  fetchMyTeacherProfile,
  mentorRowToProfile,
  updateTeacherProfile,
} from '@/services/mentors/teacherService'
import { saveTeacherWeeklySchedule, getTeacherWeeklySchedule } from '@/services/mentors/teacherScheduleService'
import { resolveTeacherProfile } from '@/lib/teacherProfile'

const FILTER_LABEL = 'block text-xs font-semibold text-slate-600 mb-1'
const FILTER_SELECT = '!py-2'

const withCustomOption = (options, currentValue, labelFor) => {
  if (!currentValue || options.some((o) => o.value === currentValue)) return options
  return [...options, { value: currentValue, label: labelFor(currentValue) }]
}

const initialPortfolios = (defaults) => {
  if (defaults.portfolios?.length) return defaults.portfolios
  return [{ id: 1, link: '', title: '' }]
}

const EditProfile = () => {
  const navigate = useNavigate()
  const { t, labelFor, isKhmer } = useTranslation()
  const { user, logout, updateUser } = useAuth()
  const photoInputRef = useRef(null)
  const defaults = resolveTeacherProfile(user)
  const opts = useLocalizedFilterOptions()

  const [profileLoading, setProfileLoading] = useState(isApiEnabled())
  /** Fields from mentor API row (experience_years, parsed description) */
  const [mentorSnapshot, setMentorSnapshot] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeletePassword, setShowDeletePassword] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)

  const [avatarPreview, setAvatarPreview] = useState(null)
  const [gender, setGender] = useState(defaults.gender)
  const [experienceYears, setExperienceYears] = useState(
    defaults.experienceYears != null && defaults.experienceYears !== ''
      ? String(defaults.experienceYears)
      : ''
  )
  const [experience, setExperience] = useState(defaults.experience)
  const [schedule, setSchedule] = useState(() => getTeacherWeeklySchedule(user))
  const [portfolios, setPortfolios] = useState(() => initialPortfolios(defaults))
  const [form, setForm] = useState({
    firstName: defaults.firstName,
    lastName: defaults.lastName,
    username: defaults.username,
    phone: defaults.phone,
    province: defaults.province,
    locationDistrict: defaults.locationDistrict ?? '',
    locationCommune: defaults.locationCommune ?? '',
    locationVillage: defaults.locationVillage ?? '',
    bio: defaults.bio,
    major: defaults.major,
    subject: defaults.subject,
    email: defaults.email,
    title: defaults.title,
  })

  const displayName = `${form.firstName} ${form.lastName}`.trim()

  const majorOptions = useMemo(
    () =>
      withCustomOption(
        opts.majors.filter((o) => o.value !== FILTER_ALL.major),
        form.major,
        labelFor
      ),
    [opts.majors, form.major, labelFor]
  )

  const locationOptions = useMemo(
    () => opts.locations.filter((o) => o.value !== FILTER_ALL.location),
    [opts.locations]
  )

  const subjectOptions = useMemo(() => {
    const values = getSubjectFilterOptions(form.major).filter((v) => v !== FILTER_ALL.subject)
    const options = localizeOptionList(values, labelFor)
    return withCustomOption(options, form.subject, labelFor)
  }, [form.major, form.subject, labelFor])

  const handleMajorChange = (major) => {
    setForm((prev) => {
      const prevPredefined = getSubjectFilterOptions(prev.major).filter(
        (s) => s !== FILTER_ALL.subject
      )
      const nextPredefined = getSubjectFilterOptions(major).filter((s) => s !== FILTER_ALL.subject)
      const subjectIsCustom = prev.subject && !prevPredefined.includes(prev.subject)
      const subject =
        subjectIsCustom || nextPredefined.includes(prev.subject)
          ? prev.subject
          : ''
      return { ...prev, major, subject }
    })
  }

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const updatePortfolio = (id, field, value) => {
    setPortfolios((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const addPortfolio = () => {
    setPortfolios((prev) => [...prev, { id: Date.now(), link: '', title: '' }])
  }

  const removePortfolio = (id) => {
    setPortfolios((prev) => (prev.length <= 1 ? prev : prev.filter((item) => item.id !== id)))
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-transparent transition-all bg-white'

  const labelClass = 'block text-xs font-medium text-slate-500 mb-1.5'

  const openPhotoPicker = () => photoInputRef.current?.click()

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  useEffect(
    () => () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    },
    [avatarPreview]
  )

  useEffect(() => {
    if (!isApiEnabled() || !user?.id) {
      setProfileLoading(false)
      return
    }

    let cancelled = false
    setProfileLoading(true)

    fetchMyTeacherProfile()
      .then((mentor) => {
        if (cancelled) return
        const profile = mentorRowToProfile(mentor, user)
        setMentorSnapshot(profile)
        setGender(profile.gender)
        setExperienceYears(
          profile.experienceYears != null && profile.experienceYears !== ''
            ? String(profile.experienceYears)
            : ''
        )
        setExperience(profile.experience?.length ? profile.experience : defaults.experience)
        setForm((prev) => ({
          ...prev,
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          province: profile.province,
          title: profile.title ?? prev.title,
          major: profile.major ?? prev.major,
          subject: profile.subject ?? prev.subject,
          bio: profile.bio,
        }))
        setSchedule(getTeacherWeeklySchedule({ ...user, ...profile }))
      })
      .catch(() => {
        if (!cancelled) {
          // No mentor row yet — keep empty profile defaults
        }
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user?.id])

  const handleSave = async () => {
    setSaveError('')
    if (!isApiEnabled() || !user?.id) {
      navigate('/teacher/my-profile')
      return
    }

    setSaving(true)
    try {
      const primaryExp = experience[0]
      const parsedYears = parseInt(experienceYears, 10)
      const yearsPayload = Number.isNaN(parsedYears) ? undefined : parsedYears
      await updateTeacherProfile(user.id, {
        firstName: form.firstName,
        lastName: form.lastName,
        gender,
        phone: form.phone,
        province: form.province,
        bio: form.bio,
        title: form.title,
        major: form.major,
        subject: form.subject,
        experienceYears: yearsPayload,
        workOrganization: primaryExp?.org ?? mentorSnapshot?.workOrganization ?? '',
        workPosition: primaryExp?.role ?? mentorSnapshot?.workPosition ?? '',
      })
      await saveTeacherWeeklySchedule(schedule)
      updateUser({
        firstName: form.firstName,
        lastName: form.lastName,
        name: displayName,
        gender,
        phone: form.phone,
        province: form.province,
        bio: form.bio,
        title: form.title,
        major: form.major,
        subject: form.subject,
        experienceYears: yearsPayload,
        workOrganization: primaryExp?.org ?? '',
        workPosition: primaryExp?.role ?? '',
        experience,
        schedule,
      })
      navigate('/teacher/my-profile')
    } catch (err) {
      setSaveError(err.message || t('teacherOnboarding.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const openDeleteModal = () => {
    setDeleteModalOpen(true)
    setDeletePassword('')
    setShowDeletePassword(false)
    setDeleteError('')
  }

  const closeDeleteModal = () => {
    if (deletingAccount) return
    setDeleteModalOpen(false)
    setDeletePassword('')
    setShowDeletePassword(false)
    setDeleteError('')
  }

  const handleDeleteAccount = async () => {
    setDeleteError('')
    if (!deletePassword.trim()) {
      setDeleteError(t('teacherProfile.deletePasswordRequired'))
      return
    }

    setDeletingAccount(true)
    try {
      await deleteAccountWithPassword({
        userId: user?.id,
        password: deletePassword,
      })
      await logout()
      navigate('/login', { replace: true })
    } catch (err) {
      if (err?.message === 'DELETE_ACCOUNT_ENDPOINT_UNAVAILABLE') {
        setDeleteError(t('teacherProfile.deleteAccountEndpointUnavailable'))
      } else if (err?.message === 'DELETE_ACCOUNT_PASSWORD_INCORRECT') {
        setDeleteError(t('teacherProfile.deletePasswordIncorrect'))
      } else if (err?.message === 'DELETE_ACCOUNT_USER_NOT_FOUND') {
        setDeleteError(t('teacherProfile.deleteAccountUserNotFound'))
      } else if (err?.message === 'DELETE_ACCOUNT_PASSWORD_REQUIRED') {
        setDeleteError(t('teacherProfile.deletePasswordRequired'))
      } else {
        setDeleteError(t('teacherProfile.deleteAccountFailed'))
      }
    } finally {
      setDeletingAccount(false)
    }
  }

  const saveActions = (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => navigate('/teacher/my-profile')}
        className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
      >
        {t('profile.cancel')}
      </button>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || profileLoading}
        className="px-5 py-2 text-sm font-semibold bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors shadow-sm disabled:opacity-60"
      >
        {saving ? t('teacherOnboarding.saving') : t('profile.saveChanges')}
      </button>
    </div>
  )

  return (
    <PageAmbient variant="teacher" className="space-y-6">
      <PageScaffold
        title={t('teacherProfile.editTitle')}
        subtitle={t('teacherProfile.editSubtitle')}
        action={saveActions}
      >
        <div className="max-w-6xl mx-auto w-full space-y-5">
          {saveError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {saveError}
            </p>
          )}
          {profileLoading && (
            <p className="text-sm text-slate-500">{t('filters.loadingTeachers')}</p>
          )}
          {/* Row 1 — balanced two columns */}
          <div className="grid lg:grid-cols-2 gap-5 items-start">
            <div className="space-y-4">
              <PageCard className="text-center">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handlePhotoChange}
                />
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <Avatar name={displayName} src={avatarPreview} size="xl" />
                  <button
                    type="button"
                    onClick={openPhotoPicker}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors shadow-md"
                    aria-label={t('profile.uploadPhotoAria')}
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
                <p className="font-semibold text-slate-800">{displayName}</p>
                <p className="text-xs text-slate-500 mt-0.5">@{form.username}</p>
                <p className="text-xs text-primary-600 mt-1 font-medium">{form.title}</p>
                <button
                  type="button"
                  onClick={openPhotoPicker}
                  className="mt-3 text-xs text-primary-600 hover:underline font-medium"
                >
                  {t('profile.uploadPhoto')}
                </button>
              </PageCard>

              <PageCard className="overflow-visible space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">{t('teacherProfile.teachingFocus')}</h3>
                <div className="rounded-xl border border-white/50 bg-white/45 backdrop-blur-md shadow-sm overflow-visible p-2.5 sm:p-3 space-y-3">
                  <SearchableSelect
                    size="sm"
                    placement="bottom"
                    label={t('filters.major')}
                    labelClassName={FILTER_LABEL}
                    value={form.major}
                    onChange={handleMajorChange}
                    options={majorOptions}
                    allowCustom
                    placeholder={t('teacherProfile.customOptionHint')}
                    menuMinWidth={240}
                    menuMaxHeight={260}
                    className={FILTER_SELECT}
                  />
                  <SearchableSelect
                    size="sm"
                    placement="bottom"
                    label={t('filters.subject')}
                    labelClassName={FILTER_LABEL}
                    value={form.subject}
                    onChange={(v) => setForm((prev) => ({ ...prev, subject: v }))}
                    options={subjectOptions}
                    disabled={!form.major}
                    allowCustom
                    placeholder={t('teacherProfile.customOptionHint')}
                    menuMinWidth={240}
                    menuMaxHeight={260}
                    className={FILTER_SELECT}
                  />
                  <LocationFilterField
                    label={t('filters.location')}
                    labelClassName={FILTER_LABEL}
                    value={form.province}
                    onChange={(v) =>
                      setForm((prev) => ({
                        ...prev,
                        province: v,
                        ...(v === FILTER_ALL.location
                          ? { locationDistrict: '', locationCommune: '', locationVillage: '' }
                          : {}),
                      }))
                    }
                    options={locationOptions}
                    detail={{
                      district: form.locationDistrict,
                      commune: form.locationCommune,
                      village: form.locationVillage,
                    }}
                    onDetailChange={(key, value) =>
                      setForm((prev) => ({ ...prev, [key]: value }))
                    }
                    menuMinWidth={240}
                    menuMaxHeight={260}
                    selectClassName={FILTER_SELECT}
                  />
                </div>
              </PageCard>
            </div>

            <PageCard className="space-y-4 h-full">
              <h3 className="font-bold text-slate-800 text-sm">{t('teacherProfile.personalInfo')}</h3>
              <NameFieldsGrid
                isKhmer={isKhmer}
                firstNameField={
                  <div>
                    <label className={labelClass}>{t('teacherProfile.firstName')}</label>
                    <input value={form.firstName} onChange={set('firstName')} className={inputClass} />
                  </div>
                }
                lastNameField={
                  <div>
                    <label className={labelClass}>{t('teacherProfile.lastName')}</label>
                    <input value={form.lastName} onChange={set('lastName')} className={inputClass} />
                  </div>
                }
              />
              <div>
                <label className={labelClass}>{t('teacherProfile.professionalTitle')}</label>
                <input value={form.title} onChange={set('title')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('teacherProfile.username')}</label>
                <input value={form.username} onChange={set('username')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('teacherProfile.gender')}</label>
                <div className="flex flex-wrap gap-4">
                  {TEACHER_GENDER_OPTIONS.map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                      <button
                        type="button"
                        onClick={() => setGender(g)}
                        className={clsx(
                          'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all',
                          gender === g ? 'border-primary-400 bg-primary-500' : 'border-slate-300 bg-white'
                        )}
                      >
                        {gender === g && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </button>
                      <span className="text-sm text-slate-700">{g}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('profile.email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={form.email} onChange={set('email')} className={inputClass + ' pl-10'} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('profile.mobile')}</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={form.phone} onChange={set('phone')} className={inputClass + ' pl-10'} />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('teacherProfile.portfolio')}</label>
                <div className="space-y-2">
                  {portfolios.map((item) => (
                    <div key={item.id} className="flex gap-2">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updatePortfolio(item.id, 'title', e.target.value)}
                        placeholder={t('teacherProfile.portfolioTitlePlaceholder')}
                        className={clsx(inputClass, 'w-full sm:w-36 shrink-0')}
                      />
                      <input
                        type="url"
                        value={item.link}
                        onChange={(e) => updatePortfolio(item.id, 'link', e.target.value)}
                        placeholder={t('teacherProfile.portfolioPlaceholder')}
                        className={clsx(inputClass, 'flex-1 min-w-0')}
                      />
                      {portfolios.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePortfolio(item.id)}
                          aria-label={t('teacherProfile.removePortfolioLink')}
                          className="shrink-0 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPortfolio}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t('teacherProfile.addPortfolioLink')}
                  </button>
                </div>
              </div>
            </PageCard>
          </div>

          {/* Row 2 — full width bio */}
          <PageCard>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800">{t('profile.aboutMe')}</h3>
              <span className="text-xs text-slate-400">{form.bio.length} / 500</span>
            </div>
            <textarea
              rows={4}
              value={form.bio}
              onChange={set('bio')}
              maxLength={500}
              placeholder={t('teacherProfile.bioPlaceholder')}
              className={inputClass + ' resize-none'}
            />
          </PageCard>

          {/* Row 3 — experience + schedule side by side */}
          <div className="grid lg:grid-cols-2 gap-5 items-start">
            <div className="space-y-4">
              <PageCard className="!p-4 sm:!p-5">
                <label className={labelClass}>
                  {t('teacherProfile.totalExperienceYears')}
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  placeholder={t('teacherProfile.totalExperienceYearsPlaceholder')}
                  className={inputClass}
                />
              </PageCard>
              <ExperienceSection
                title={t('teacherProfile.experience')}
                experience={experience}
                onChange={setExperience}
              />
            </div>
            <ScheduleSection
              title={t('teacherProfile.schedule')}
              schedule={schedule}
              onChange={setSchedule}
            />
          </div>

          <ChangePasswordCard />

          <PageCard className="border border-red-100 bg-red-50/40 space-y-3">
            <h3 className="font-bold text-red-800">{t('teacherProfile.dangerZone')}</h3>
            <p className="text-sm text-red-700">{t('teacherProfile.deleteAccountHint')}</p>
            <div>
              <button
                type="button"
                onClick={openDeleteModal}
                className="px-4 py-2 rounded-xl border border-red-200 bg-white text-red-700 text-sm font-semibold hover:bg-red-50 transition-colors"
              >
                {t('teacherProfile.deleteAccount')}
              </button>
            </div>
          </PageCard>
        </div>
      </PageScaffold>
      <Modal
        open={deleteModalOpen}
        onClose={closeDeleteModal}
        title={<span className="text-red-800 font-extrabold">{t('teacherProfile.deleteAccount')}</span>}
        description={
          <span className="text-slate-800 text-sm font-semibold">
            {t('teacherProfile.deleteAccountConfirm')}
          </span>
        }
        className="border border-slate-200"
        footer={
          <>
            <button
              type="button"
              onClick={closeDeleteModal}
              disabled={deletingAccount}
              className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-60"
            >
              {t('profile.cancel')}
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {deletingAccount
                ? t('teacherProfile.deletingAccount')
                : t('teacherProfile.confirmDeleteAccount')}
            </button>
          </>
        }
      >
        <div className="mb-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          {t('teacherProfile.deleteAccountHint')}
        </div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {t('teacherProfile.confirmPassword')}
        </label>
        <div className="relative">
          <input
            type={showDeletePassword ? 'text' : 'password'}
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder={t('teacherProfile.confirmPasswordPlaceholder')}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300"
          />
          <button
            type="button"
            onClick={() => setShowDeletePassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={
              showDeletePassword
                ? t('teacherProfile.hidePassword')
                : t('teacherProfile.showPassword')
            }
          >
            {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {deleteError && <p className="mt-2 text-xs text-red-600">{deleteError}</p>}
      </Modal>
    </PageAmbient>
  )
}

export default EditProfile
