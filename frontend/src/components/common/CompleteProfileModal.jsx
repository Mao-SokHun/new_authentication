import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Check, User, BookOpen, Target } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import clsx from 'clsx'

const steps = [
  { id: 1, label: 'Basic Info', shortLabel: 'Info', icon: User },
  { id: 2, label: 'Interests', shortLabel: 'Learn', icon: BookOpen },
  { id: 3, label: 'Goals', shortLabel: 'Goals', icon: Target },
]

const subjects = [
  'Mathematics',
  'Physics',
  'Data Science',
  'English',
  'Programming',
  'Chemistry',
  'Biology',
  'History',
  'Economics',
  'Art',
]

const goals = [
  'Improve exam scores',
  'Learn a new skill',
  'Prepare for a career change',
  'Personal enrichment',
  'Homework help',
  'University preparation',
]

const CompleteProfileModal = ({ open, onClose, onComplete }) => {
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState([])
  const [selectedGoals, setSelectedGoals] = useState([])
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    location: '',
    phone: '',
    bio: '',
  })

  useEffect(() => {
    if (open) {
      setStep(1)
      setSelected([])
      setSelectedGoals([])
      setForm({
        firstName: '',
        lastName: '',
        location: '',
        phone: '',
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

  const toggleSubject = (s) =>
    setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))

  const toggleGoal = (g) =>
    setSelectedGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const canContinue =
    step === 1
      ? form.firstName.trim() && form.lastName.trim()
      : step !== 2 || selected.length > 0

  const handleNext = () => {
    if (step < 3) setStep((s) => s + 1)
    else {
      const firstName = form.firstName.trim()
      const lastName = form.lastName.trim()
      onComplete?.({
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        location: form.location.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim(),
        interests: selected,
        goals: selectedGoals,
      })
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
        aria-labelledby="complete-profile-title"
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
                  <span className="sm:hidden">{s.shortLabel}</span>
                  <span className="hidden sm:inline">{s.label}</span>
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
      <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6 max-w-3xl mx-auto w-full">
        {step === 1 && (
          <>
            <div>
              <h2
                id="complete-profile-title"
                className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800"
              >
                Complete Your Profile
              </h2>
              <p className="text-slate-500 text-sm sm:text-base mt-1">
                Tell us a bit about yourself to get started
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
              <Input
                label="First Name"
                placeholder="Alex"
                value={form.firstName}
                onChange={(e) => setField('firstName', e.target.value)}
              />
              <Input
                label="Last Name"
                placeholder="Johnson"
                value={form.lastName}
                onChange={(e) => setField('lastName', e.target.value)}
              />
            </div>
            <Input
              label="Address / Location"
              placeholder="Phnom Penh, Cambodia"
              value={form.location}
              onChange={(e) => setField('location', e.target.value)}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+855 12 000 000"
              value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Professional Bio (Optional)
              </label>
              <textarea
                rows={3}
                value={form.bio}
                onChange={(e) => setField('bio', e.target.value)}
                placeholder="Tell teachers about your learning background and goals..."
                className="w-full min-h-[5.5rem] sm:min-h-[6rem] rounded-xl border border-slate-200/80 bg-white/50 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-slate-800 placeholder-slate-400 resize-y focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-transparent"
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800">
                What do you want to learn?
              </h2>
              <p className="text-slate-500 text-sm sm:text-base mt-1">
                Select all subjects that interest you
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
              {subjects.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSubject(s)}
                  className={clsx(
                    'flex items-center gap-1.5 p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm font-medium text-left transition-all min-h-[2.75rem] min-w-0 w-full overflow-hidden',
                    selected.includes(s)
                      ? 'bg-primary-500 text-white border-primary-400'
                      : 'border-white/60 bg-white/40 text-slate-600 hover:border-primary-200 hover:bg-white/60'
                  )}
                >
                  {selected.includes(s) && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                  <span className="min-w-0 flex-1 break-words leading-snug">{s}</span>
                </button>
              ))}
            </div>
            {selected.length > 0 && (
              <p className="text-xs sm:text-sm text-primary-600 text-center font-medium">
                {selected.length} subject{selected.length > 1 ? 's' : ''} selected
              </p>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800">
                What are your learning goals?
              </h2>
              <p className="text-slate-500 text-sm sm:text-base mt-1">
                This helps us recommend the right teachers
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5 md:gap-3">
              {goals.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGoal(g)}
                  className={clsx(
                    'w-full flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl border text-xs sm:text-sm font-medium text-left transition-all min-w-0 overflow-hidden',
                    selectedGoals.includes(g)
                      ? 'bg-primary-500 text-white border-primary-400'
                      : 'border-white/60 bg-white/40 text-slate-600 hover:border-primary-200 hover:bg-white/60'
                  )}
                >
                  <div
                    className={clsx(
                      'w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                      selectedGoals.includes(g) ? 'border-white bg-white' : 'border-slate-300'
                    )}
                  >
                    {selectedGoals.includes(g) && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-600" />}
                  </div>
                  <span className="min-w-0 flex-1 break-words leading-snug">{g}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      </div>

      <div className="shrink-0 border-t border-white/50 bg-white/75 backdrop-blur-md">
      <div className="p-4 sm:p-5 md:p-6 lg:p-8 max-w-3xl mx-auto w-full">
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
                Back
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
                className="w-full min-[480px]:w-auto text-sm text-slate-500 hover:text-slate-700 transition-colors py-2 sm:py-0 text-center"
              >
                Skip for now
              </button>
            )}
            <Button
              variant="primary"
              size="md"
              type="button"
              onClick={handleNext}
              disabled={!canContinue}
              className="w-full min-[480px]:w-auto min-w-[8.5rem]"
            >
              {step === 3 ? 'Get Started' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>

      <p className="text-center text-[11px] sm:text-xs text-slate-500 px-4 sm:px-6 pb-4 sm:pb-5">
        By continuing, you agree to our{' '}
        <Link to="/terms" className="text-primary-600 hover:underline">
          Terms
        </Link>{' '}
        and{' '}
        <Link to="/privacy" className="text-primary-600 hover:underline">
          Privacy Policy
        </Link>
      </p>
      </div>
      </section>
    </div>,
    document.body
  )
}

export default CompleteProfileModal
