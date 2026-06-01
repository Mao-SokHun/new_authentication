import { useState } from 'react'
import { Plus, X, Edit2, Check, Clock, BookOpen } from 'lucide-react'
import clsx from 'clsx'
import PageCard from './PageCard'
import Select from '../ui/Select'
import { useTranslation } from '@/i18n'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const DAY_SHORT = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
}

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-200'

const ScheduleSlotCard = ({ slot }) => (
  <div className="group relative rounded-xl border border-primary-100/80 bg-gradient-to-br from-white via-white to-primary-50/40 p-3.5 shadow-sm hover:border-primary-200/90 hover:shadow-md transition-all duration-200">
    <div className="flex items-start justify-between gap-2 mb-2.5">
      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-500 text-[10px] font-bold uppercase tracking-wide text-white">
        {DAY_SHORT[slot.day] || slot.day}
      </span>
      <span className="w-7 h-7 rounded-lg bg-white/80 border border-primary-100 flex items-center justify-center flex-shrink-0">
        <Clock className="w-3.5 h-3.5 text-primary-500" />
      </span>
    </div>
    <p className="text-sm font-bold text-slate-800 leading-snug">{slot.time}</p>
    <p className="text-[11px] text-slate-500 mt-0.5">{slot.day}</p>
    <div className="mt-2.5 pt-2.5 border-t border-primary-100/60 flex items-start gap-1.5">
      <BookOpen className="w-3.5 h-3.5 text-primary-400 flex-shrink-0 mt-0.5" />
      <p className="text-xs font-medium text-primary-700 leading-snug line-clamp-2">{slot.subject}</p>
    </div>
  </div>
)

const ScheduleSection = ({ schedule, onChange, readOnly = false, title }) => {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(schedule)

  const startEdit = () => {
    setDraft(schedule)
    setEditing(true)
  }

  const confirm = () => {
    onChange(draft)
    setEditing(false)
  }

  const cancel = () => {
    setDraft(schedule)
    setEditing(false)
  }

  const updateSlot = (id, field, value) => {
    setDraft((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const removeSlot = (id) => {
    setDraft((prev) => prev.filter((s) => s.id !== id))
  }

  const addSlot = () => {
    setDraft((prev) => [
      ...prev,
      { id: Date.now(), day: 'Monday', time: '9:00 – 9:45 AM', subject: '' },
    ])
  }

  const rows = editing ? draft : schedule

  return (
    <PageCard padding={false} className="overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-primary-50/40 to-white">
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            {title || 'Weekly Schedule'}
          </h3>
          {!editing && rows.length > 0 && (
            <p className="text-[11px] text-slate-400 mt-1">
              {t('teacherProfile.scheduleCount', { count: rows.length })}
            </p>
          )}
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            {!editing ? (
              <button
                type="button"
                onClick={startEdit}
                className="flex items-center gap-1 px-3 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={confirm}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-400 text-white text-xs font-semibold hover:bg-primary-500 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" /> Confirm
                </button>
                <button
                  type="button"
                  onClick={cancel}
                  aria-label="Cancel"
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="p-5">
        {rows.length === 0 && !editing && (
          <p className="text-sm text-slate-400 text-center py-8 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
            No availability added yet.
          </p>
        )}

        {editing ? (
          <div className="space-y-3">
            {rows.map((slot) => (
              <div
                key={slot.id}
                className="relative grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <Select
                  size="sm"
                  value={slot.day}
                  onChange={(v) => updateSlot(slot.id, 'day', v)}
                  options={DAYS}
                />
                <input
                  value={slot.time}
                  onChange={(e) => updateSlot(slot.id, 'time', e.target.value)}
                  placeholder="8:00 – 8:45 AM"
                  className={inputClass}
                />
                <input
                  value={slot.subject}
                  onChange={(e) => updateSlot(slot.id, 'subject', e.target.value)}
                  placeholder="Subject"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => removeSlot(slot.id)}
                  className="p-2 text-red-400 hover:text-red-600 justify-self-end self-center"
                  aria-label="Remove slot"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSlot}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-primary-200 text-xs font-semibold text-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Time Slot
            </button>
          </div>
        ) : (
          <div
            className={clsx(
              'grid gap-3',
              rows.length === 1
                ? 'grid-cols-1 max-w-xs'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            )}
          >
            {rows.map((slot) => (
              <ScheduleSlotCard key={slot.id} slot={slot} />
            ))}
          </div>
        )}
      </div>
    </PageCard>
  )
}

export default ScheduleSection
