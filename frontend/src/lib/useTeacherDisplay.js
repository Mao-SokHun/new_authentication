import { useMemo } from 'react'
import { useTranslation } from './LanguageProvider.jsx'

export function useTeacherDisplay(teacher) {
  const { labelFor, t } = useTranslation()

  return useMemo(() => {
    if (!teacher) return null

    return {
      title: teacher.title ?? '',
      bio: teacher.bio ?? '',
      major: teacher.major ? labelFor(teacher.major) : '',
      location: teacher.location ? labelFor(teacher.location) : '',
      subjects: (teacher.subjects ?? []).map((s) => labelFor(s)),
      experienceLabel: t('teacherCard.yearsExp', { count: teacher.experience ?? 0 }),
    }
  }, [teacher, labelFor, t])
}
