export const TEACHER_PROFILE_MOCK = {
  firstName: 'Phe',
  lastName: 'Sophy',
  displayName: 'Phe Sophy',
  title: 'Physics Specialist of Data Science & AI',
  username: 'phe.sophy',
  email: 'phe.sophy@example.com',
  phone: '+855 12 345 678',
  province: 'Phnom Penh',
  locationDistrict: '',
  locationCommune: '',
  locationVillage: '',
  portfolios: [],
  major: 'Mechanical Engineering',
  subject: 'Physics',
  /** @deprecated use subject — kept for display fallbacks */
  primarySubject: 'Physics',
  gender: 'Male',
  bio: `A dedicated Physics educator with a passion for simplifying complex quantum mechanics and thermodynamics for high school students. Over the past 8 years, I have developed a unique teaching methodology that blends theoretical physics with hands-on experiments.

Formerly Lead Researcher at Global Field Corp. I guide analytical students who are committed to their career goals.`,
  rating: 4.5,
  reviewCount: 128,
  groupStudents: 24,
  hoursTaught: 31,
  schedule: [
    { id: 1, day: 'Monday', time: '8:00 – 8:45 AM', subject: 'Physics G11' },
    { id: 2, day: 'Monday', time: '10:00 – 10:45 AM', subject: 'Math G12' },
    { id: 3, day: 'Wednesday', time: '8:00 – 8:45 AM', subject: 'Physics G12' },
    { id: 4, day: 'Friday', time: '2:00 – 2:45 PM', subject: 'Lab Session' },
  ],
  experience: [
    { id: 1, role: 'Senior Physics Teacher', org: 'Global Science Academy, Phnom Penh', period: '2018–23' },
    { id: 2, role: 'Research Associate', org: 'Institute of Technology Solvation', period: '2015–18' },
  ],
}

export const TEACHER_SUBJECT_OPTIONS = [
  'Physics',
  'Mathematics',
  'Data Science',
  'Chemistry',
  'Biology',
  'History',
]

export const TEACHER_GENDER_OPTIONS = ['Male', 'Female', 'Other']
