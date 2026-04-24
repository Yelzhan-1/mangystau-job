import type { Job, User, CandidateProfile, EmployerProfile, Application } from '@prisma/client'

// Extended types with relations
export type JobWithEmployer = Job & {
  employer: EmployerProfile & {
    user: Pick<User, 'name' | 'email'>
  }
  _count?: { applications: number }
}

export type ApplicationWithJob = Application & {
  job: JobWithEmployer
}

export type ApplicationWithCandidate = Application & {
  candidate: CandidateProfile & {
    user: Pick<User, 'name' | 'email' | 'phone'>
  }
}

export type CandidateWithUser = CandidateProfile & {
  user: Pick<User, 'name' | 'email' | 'phone'>
}

export type EmployerWithUser = EmployerProfile & {
  user: Pick<User, 'name' | 'email' | 'phone'>
}

// Filter types for job search
export interface JobFilters {
  city?: string
  district?: string
  sector?: string
  employmentType?: string
  experienceLevel?: string
  salaryMin?: number
  search?: string
}

// AI match types (used in later steps)
export interface MatchScore {
  jobId: string
  score: number
  reasons: string[]
}
