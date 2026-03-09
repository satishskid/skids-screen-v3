// Local copy of core types from @skids/shared
// Avoids Metro workspace resolution issues

export type ModuleType =
  | 'vision'
  | 'neurodevelopment'
  | 'vitals'
  | 'skin'
  | 'ear'
  | 'respiratory'
  | 'motor'
  | 'dental'
  | 'throat'
  | 'nose'
  | 'eyes_external'
  | 'neck'
  | 'hair'
  | 'nails'
  | 'posture'
  | 'abdomen'
  | 'lymph'
  | 'general_appearance'
  | 'height'
  | 'weight'
  | 'spo2'
  | 'hemoglobin'
  | 'hearing'
  | 'bp'
  | 'immunization'
  | 'cardiac'
  | 'pulmonary'
  | 'muac'
  | 'nutrition_intake'
  | 'intervention'

export type AgeGroup = 'infant' | 'toddler' | 'preschool' | 'school' | 'adolescent'

export type UserRole = 'admin' | 'ops_manager' | 'nurse' | 'doctor' | 'authority'

export interface CampaignLocation {
  country?: string
  countryCode?: string
  state?: string
  district?: string
  city?: string
  pincode?: string
  address?: string
  coordinates?: { lat: number; lng: number }
}

export interface Campaign {
  code: string
  name: string
  orgCode: string
  schoolName: string
  academicYear: string
  campaignType: string
  status: 'active' | 'completed' | 'archived' | 'paused'
  enabledModules: string[]
  totalChildren: number
  createdBy: string
  createdAt: string
  completedAt?: string
  location: CampaignLocation
  city?: string
  state?: string
  address?: string
  pincode?: string
  coordinates?: { lat: number; lng: number }
}

export interface Child {
  id: string
  name: string
  dob: string
  gender: 'male' | 'female'
  location: string
  photoUrl?: string
  admissionNumber?: string
  class?: string
  section?: string
  academicYear?: string
  schoolName?: string
  createdAt: string
  updatedAt: string
}

export interface Observation {
  id: string
  sessionId: string
  moduleType: ModuleType
  bodyRegion?: string
  mediaUrl?: string
  mediaUrls?: string[]
  mediaType?: 'image' | 'video' | 'audio'
  captureMetadata: Record<string, unknown>
  timestamp: string
  notes?: string
  value?: unknown
  campaignCode?: string
  childId?: string
  reviewStatus?: 'pending' | 'approved' | 'referred' | 'follow_up' | 'retake'
}

export interface ClinicianReview {
  id: string
  clinicianId: string
  clinicianName: string
  timestamp: string
  notes: string
  decision: 'approve' | 'refer' | 'follow_up' | 'discharge' | 'retake'
  qualityRating?: 'good' | 'fair' | 'poor'
  retakeReason?: string
}

export function getAgeGroup(ageInMonths: number): AgeGroup {
  if (ageInMonths < 12) return 'infant'
  if (ageInMonths < 36) return 'toddler'
  if (ageInMonths < 60) return 'preschool'
  if (ageInMonths < 144) return 'school'
  return 'adolescent'
}

export function calculateAgeInMonths(dob: string): number {
  const birthDate = new Date(dob)
  const today = new Date()
  const months = (today.getFullYear() - birthDate.getFullYear()) * 12
  return months + (today.getMonth() - birthDate.getMonth())
}

export function formatAge(dob: string): string {
  const months = calculateAgeInMonths(dob)
  if (months < 12) return `${months} months`
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (remainingMonths === 0) return `${years} years`
  return `${years}y ${remainingMonths}m`
}
