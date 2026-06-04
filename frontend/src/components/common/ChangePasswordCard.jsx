import { useState } from 'react'
import { CircleCheck, Eye, EyeOff, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import PageCard from './PageCard'
import { useTranslation } from '@/i18n'
import { isApiEnabled } from '@/constants'
import { changePassword } from '@/services/auth/authService'
import { isSamePassword, isValidPassword } from '@/utils/passwordRules'

const MIN_LOADING_MS = 450

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 disabled:opacity-60 disabled:cursor-not-allowed'

const PasswordField = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  show,
  onToggleShow,
  showLabel,
  hideLabel,
  disabled,
  showValid = false,
  validLabel,
}) => (
  <div>
    <label htmlFor={id} className="block text-xs font-medium text-slate-500 mb-1.5">
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={clsx(inputClass, showValid && 'pr-[4.25rem]')}
        disabled={disabled}
        autoComplete={id === 'current-password' ? 'current-password' : 'new-password'}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {showValid && (
          <CircleCheck
            className="h-3.5 w-3.5 shrink-0 text-emerald-600"
            strokeWidth={2}
            role="status"
            aria-label={validLabel}
          />
        )}
        <button
          type="button"
          onClick={onToggleShow}
          disabled={disabled}
          className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40"
          aria-label={show ? hideLabel : showLabel}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  </div>
)

const ChangePasswordCard = () => {
  const { t, isKhmer } = useTranslation()
  const apiOn = isApiEnabled()
  const [formOpen, setFormOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  /** i18n key — rendered with t() so language switch updates the message */
  const [errorKey, setErrorKey] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const showLabel = t('teacherProfile.showPassword')
  const hideLabel = t('teacherProfile.hidePassword')
  const newPasswordValid = isValidPassword(newPassword)

  const resetFields = () => {
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowOld(false)
    setShowNew(false)
    setShowConfirm(false)
    setErrorKey('')
  }

  const handleOpen = () => {
    setShowSuccess(false)
    setErrorKey('')
    setFormOpen(true)
  }

  const handleCancel = () => {
    if (loading) return
    resetFields()
    setFormOpen(false)
  }

  const finishLoading = async (startedAt) => {
    const elapsed = Date.now() - startedAt
    if (elapsed < MIN_LOADING_MS) {
      await new Promise((r) => setTimeout(r, MIN_LOADING_MS - elapsed))
    }
    setLoading(false)
  }

  const mapErrorKey = (err) => {
    switch (err?.message) {
      case 'CHANGE_PASSWORD_OLD_INCORRECT':
        return 'teacherProfile.oldPasswordIncorrect'
      case 'CHANGE_PASSWORD_UNAUTHORIZED':
        return 'teacherProfile.changePasswordUnauthorized'
      case 'CHANGE_PASSWORD_API_DISABLED':
        return 'teacherProfile.changePasswordApiDisabled'
      default:
        return 'teacherProfile.changePasswordFailed'
    }
  }

  const runPasswordUpdate = async () => {
    setErrorKey('')
    setShowSuccess(false)

    if (!apiOn) {
      setErrorKey('teacherProfile.changePasswordApiDisabled')
      return
    }

    if (!oldPassword.trim()) {
      setErrorKey('teacherProfile.currentPasswordRequired')
      return
    }
    if (!isValidPassword(newPassword)) {
      setErrorKey('auth.passwordRequirements')
      return
    }
    if (isSamePassword(oldPassword, newPassword)) {
      setErrorKey('auth.newPasswordSameAsOld')
      return
    }
    if (newPassword !== confirmPassword) {
      setErrorKey('auth.passwordMismatch')
      return
    }

    const startedAt = Date.now()
    setLoading(true)
    try {
      await changePassword({
        oldPassword: oldPassword.trim(),
        newPassword,
      })
      resetFields()
      setShowSuccess(true)
      setFormOpen(false)
    } catch (err) {
      setErrorKey(mapErrorKey(err))
    } finally {
      await finishLoading(startedAt)
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    void runPasswordUpdate()
  }

  return (
    <PageCard className={clsx('relative', isKhmer && 'font-khmer')}>
      {loading && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/75 backdrop-blur-[2px]"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white border border-slate-200 shadow-md">
            <Loader2 className="w-5 h-5 text-primary-500 animate-spin shrink-0" aria-hidden />
            <span className="text-sm font-semibold text-slate-700">
              {t('teacherProfile.updatingPassword')}
            </span>
          </div>
        </div>
      )}

      <h3 className="font-bold text-slate-800 mb-1">{t('teacherProfile.changePassword')}</h3>
      <p className="text-xs text-slate-500 mb-4">{t('teacherProfile.changePasswordHint')}</p>

      {!apiOn && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
          {t('teacherProfile.changePasswordApiDisabled')}
        </p>
      )}

      {showSuccess && !formOpen && (
        <p className="text-xs text-emerald-600 mb-3" role="status">
          {t('teacherProfile.changePasswordSuccess')}
        </p>
      )}

      {!formOpen ? (
        <button
          type="button"
          onClick={handleOpen}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          {t('teacherProfile.changePassword')}
        </button>
      ) : (
        <form onSubmit={handleFormSubmit} className="space-y-4 max-w-md" noValidate>
          <PasswordField
            id="current-password"
            label={t('teacherProfile.currentPassword')}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder={t('teacherProfile.currentPasswordPlaceholder')}
            show={showOld}
            onToggleShow={() => setShowOld((v) => !v)}
            showLabel={showLabel}
            hideLabel={hideLabel}
            disabled={loading}
          />
          <PasswordField
            id="new-password"
            label={t('teacherProfile.newPasswordLabel')}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t('teacherProfile.newPasswordPlaceholder')}
            show={showNew}
            onToggleShow={() => setShowNew((v) => !v)}
            showLabel={showLabel}
            hideLabel={hideLabel}
            disabled={loading}
            showValid={newPasswordValid}
            validLabel={t('auth.passwordValid')}
          />
          <PasswordField
            id="confirm-new-password"
            label={t('teacherProfile.confirmNewPassword')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t('teacherProfile.confirmNewPasswordPlaceholder')}
            show={showConfirm}
            onToggleShow={() => setShowConfirm((v) => !v)}
            showLabel={showLabel}
            hideLabel={hideLabel}
            disabled={loading}
          />

          {loading && (
            <p className="text-xs font-medium text-primary-600 flex items-center gap-1.5" role="status">
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" aria-hidden />
              {t('teacherProfile.updatingPassword')}
            </p>
          )}

          {errorKey && (
            <p className="text-xs text-red-600" role="alert">
              {t(errorKey)}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-60"
            >
              {t('profile.cancel')}
            </button>
            <button
              type="button"
              disabled={loading || !apiOn}
              onClick={() => void runPasswordUpdate()}
              className="inline-flex items-center justify-center gap-2 min-w-[9.5rem] px-5 py-2 text-sm font-semibold bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors shadow-sm disabled:opacity-70"
            >
              {loading && (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden />
              )}
              {loading ? t('teacherProfile.updatingPassword') : t('teacherProfile.updatePasswordButton')}
            </button>
          </div>
        </form>
      )}
    </PageCard>
  )
}

export default ChangePasswordCard
