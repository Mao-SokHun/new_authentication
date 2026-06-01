import { Navigate } from 'react-router-dom'

/** Legacy route — editing lives on /teacher/edit-profile */
const ProfileSetting = () => <Navigate to="/teacher/edit-profile" replace />

export default ProfileSetting
