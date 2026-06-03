import { useEffect, useState } from 'react'
import { fetchTeacherById } from '@/services/mentors/teacherService'

export function useTeacher(id) {
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) {
      setTeacher(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchTeacherById(id)
      .then((row) => {
        if (!cancelled) setTeacher(row)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err)
          setTeacher(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return { teacher, loading, error }
}

export default useTeacher
