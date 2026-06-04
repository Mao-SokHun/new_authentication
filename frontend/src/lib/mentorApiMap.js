/**
 * Teacher UI ↔ mentor table (`backend-rokkru-auth-intergrate/models/mentorModel.js`).
 * Do not change backend here — map UI fields to existing columns until new columns exist.
 *
 * DB columns: user_id, firstname, lastname, gender, phone_number, address,
 *             experience_years, description, profile_picture
 *
 * UI-only (stored in `description` until backend adds columns):
 *   title, major, subject, bio, workOrganization, workPosition
 */

import { getPhoneDigits } from '@/utils/phoneInput'
import { validateTeacherOnboardingStep1 as validateTeacherOnboardingStep1Shared } from '@/lib/validation/mentor/index.js'

/** @typedef {{ id: number|string, role: string, org: string, period: string }} ExperienceItem */

/** @typedef {Object} TeacherProfileUI
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [name]
 * @property {string} [title]
 * @property {string} [phone]
 * @property {string} [gender]
 * @property {number} [experienceYears]
 * @property {string} [workOrganization]
 * @property {string} [workPosition]
 * @property {ExperienceItem[]} [experience]
 * @property {string} [major]
 * @property {string} [subject]
 * @property {string} [province]
 * @property {string} [bio]
 */

/** @typedef {Object} MentorApiPayload
 * @property {string} [firstname]
 * @property {string} [lastname]
 * @property {string} [gender]
 * @property {string} [phone_number]
 * @property {string} [address]
 * @property {number} [experience_years]
 * @property {string} [description]
 */

export const MENTOR_DB_FIELDS = [
  'user_id',
  'firstname',
  'lastname',
  'gender',
  'phone_number',
  'address',
  'experience_years',
  'description',
  'profile_picture',
]

const PREFIX = {
  title: 'Title: ',
  teaching: 'Teaching: ',
  organization: 'Organization: ',
  position: 'Position: ',
}

/** Parse mentor.description written by buildMentorDescription */
export function parseMentorDescription(description = '') {
  const text = String(description).trim()
  const empty = {
    title: '',
    major: '',
    subject: '',
    bio: '',
    workOrganization: '',
    workPosition: '',
    subjects: [],
  }
  if (!text) return empty

  const lines = text.split('\n\n').filter(Boolean)
  let title = ''
  let major = ''
  let subject = ''
  let workOrganization = ''
  let workPosition = ''
  const bioParts = []

  for (const line of lines) {
    if (line.startsWith(PREFIX.title)) title = line.slice(PREFIX.title.length).trim()
    else if (line.startsWith(PREFIX.teaching)) {
      const parts = line.slice(PREFIX.teaching.length).split(' · ').map((p) => p.trim())
      major = parts[0] ?? ''
      subject = parts[1] ?? ''
    } else if (line.startsWith(PREFIX.organization)) {
      workOrganization = line.slice(PREFIX.organization.length).trim()
    } else if (line.startsWith(PREFIX.position)) {
      workPosition = line.slice(PREFIX.position.length).trim()
    } else {
      bioParts.push(line)
    }
  }

  const bio = bioParts.join('\n\n').trim()
  return {
    title,
    major,
    subject,
    bio,
    workOrganization,
    workPosition,
    subjects: subject ? [subject] : [],
  }
}

/** Build mentor.description from UI fields (single TEXT column on backend). */
export function buildMentorDescription(profile = {}) {
  const lines = []
  if (profile.title?.trim()) lines.push(`${PREFIX.title}${profile.title.trim()}`)
  if (profile.major || profile.subject) {
    lines.push(
      `${PREFIX.teaching}${[profile.major, profile.subject].filter(Boolean).join(' · ')}`
    )
  }
  if (profile.workOrganization?.trim()) {
    lines.push(`${PREFIX.organization}${profile.workOrganization.trim()}`)
  }
  if (profile.workPosition?.trim()) {
    lines.push(`${PREFIX.position}${profile.workPosition.trim()}`)
  }
  if (profile.bio?.trim()) lines.push(profile.bio.trim())
  return lines.length ? lines.join('\n\n') : undefined
}

/** UI teacher profile → POST/PUT body for /v1/mentors */
export function teacherProfileToMentorPayload(profile) {
  const years = profile.experienceYears
  const parsedYears = years != null && years !== '' ? parseInt(String(years), 10) : NaN

  return {
    firstname: profile.firstName?.trim() || undefined,
    lastname: profile.lastName?.trim() || undefined,
    gender: profile.gender?.trim() || undefined,
    phone_number: profile.phone?.trim() || undefined,
    address: profile.province?.trim() || undefined,
    experience_years: Number.isNaN(parsedYears) ? undefined : parsedYears,
    description: buildMentorDescription(profile),
  }
}

/** Primary experience row for ExperienceSection from work + years fields. */
export function buildExperienceFromWork(
  { workPosition = '', workOrganization = '', experienceYears } = {},
  periodLabel = ''
) {
  const role = String(workPosition).trim()
  const org = String(workOrganization).trim()
  const years = experienceYears != null && experienceYears !== '' ? Number(experienceYears) : null

  if (!role && !org && (years == null || Number.isNaN(years))) return []

  const period =
    periodLabel?.trim() ||
    (years != null && !Number.isNaN(years) ? `${years} years` : '')

  return [{ id: 1, role, org, period }]
}

/** Merge experience card + teaching fields from API mentor row. */
export function mentorRowToTeacherProfile(mentor, base = {}) {
  if (!mentor) return { ...base }

  const parsed = parseMentorDescription(mentor.description ?? '')
  const experienceYears = mentor.experience_years ?? base.experienceYears ?? null
  const workOrganization = parsed.workOrganization || base.workOrganization || ''
  const workPosition = parsed.workPosition || base.workPosition || ''

  const fromPrimary = buildExperienceFromWork(
    { workPosition, workOrganization, experienceYears },
    ''
  )
  const experience =
    fromPrimary.length > 0
      ? fromPrimary
      : base.experience?.length
        ? base.experience
        : []

  const firstName = mentor.firstname ?? base.firstName ?? ''
  const lastName = mentor.lastname ?? base.lastName ?? ''

  return {
    ...base,
    firstName,
    lastName,
    displayName: `${firstName} ${lastName}`.trim() || base.displayName,
    name: `${firstName} ${lastName}`.trim() || base.name,
    phone: mentor.phone_number ?? base.phone,
    gender: mentor.gender ?? base.gender,
    province: mentor.address ?? base.province,
    experienceYears,
    workOrganization,
    workPosition,
    experience,
    title: parsed.title || base.title,
    major: parsed.major || base.major,
    subject: parsed.subject || base.subject,
    bio: parsed.bio || base.bio,
    profilePicture: mentor.profile_picture ?? base.profilePicture,
    description: mentor.description ?? '',
  }
}

export function emptyTeacherOnboardingForm() {
  return {
    firstName: '',
    lastName: '',
    title: '',
    phone: '',
    gender: '',
    experienceYears: '',
    workOrganization: '',
    workPosition: '',
    major: '',
    subject: '',
    province: '',
    bio: '',
  }
}

/** Pre-fill onboarding modal from session / profile cache. */
export function teacherOnboardingFormFromUser(user = {}) {
  const years = user.experienceYears
  return {
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    title: user.title ?? '',
    phone: user.phone ?? '',
    gender: user.gender ?? '',
    experienceYears: years != null && years !== '' ? String(years) : '',
    workOrganization: user.workOrganization ?? '',
    workPosition: user.workPosition ?? '',
    major: user.major ?? '',
    subject: user.subject ?? '',
    province: user.province ?? '',
    bio: user.bio ?? '',
  }
}

/**
 * Step-1 onboarding form → profile object for updateUser + saveMentorFromOnboarding.
 * @param {Record<string, string>} form
 * @param {{ yearsExpLabel?: string }} [opts]
 * @returns {TeacherProfileUI}
 */
export function buildOnboardingTeacherProfile(form, opts = {}) {
  const firstName = form.firstName.trim()
  const lastName = form.lastName.trim()
  const workOrganization = String(form.workOrganization ?? '').trim()
  const workPosition = String(form.workPosition ?? '').trim()
  const experienceYears = parseInt(form.experienceYears, 10)

  return {
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    title: form.title.trim(),
    phone: getPhoneDigits(form.phone),
    gender: form.gender,
    experienceYears,
    workOrganization,
    workPosition,
    experience: buildExperienceFromWork(
      { workPosition, workOrganization, experienceYears },
      opts.yearsExpLabel
    ),
    major: form.major,
    subject: form.subject,
    province: form.province,
    bio: form.bio.trim(),
  }
}

/**
 * @param {Record<string, string>} form
 * @param {{ locationOptions: { value: string }[] }} ctx
 */
export function validateTeacherOnboardingStep1(form, ctx) {
  return validateTeacherOnboardingStep1Shared(form, ctx)
}
