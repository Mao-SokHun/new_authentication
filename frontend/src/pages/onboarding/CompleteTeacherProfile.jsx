import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/** Redirect helper — opens teacher onboarding modal on dashboard */
const CompleteTeacherProfile = () => {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/teacher/home', { replace: true, state: { showCompleteTeacherProfile: true } })
  }, [navigate])

  return null
}

export default CompleteTeacherProfile
