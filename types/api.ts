// types/api.ts
// Map đúng với DTO từ BE

// ── Auth ──────────────────────────────────────────────────────────────────
export interface LoginResult {
  accessToken: string
  refreshToken: string
  accessTokenExpiry: string
}

// ── About ─────────────────────────────────────────────────────────────────
export interface AboutProfileDto {
  id: string
  fullName: string
  tagline: string | null
  bio: string | null
  location: string | null
  contactEmail: string | null
  avatarUrl: string | null
  cvUrl: string | null
}

// ── Skills ────────────────────────────────────────────────────────────────
export type SkillCategory = 'Frontend' | 'Backend' | 'Database' | 'Other'

export interface SkillDto {
  id: string
  name: string
  category: SkillCategory
  proficiencyLevel: number
  iconUrl: string | null
  displayOrder: number
}

// ── Experience ────────────────────────────────────────────────────────────
export type EmploymentType = 'FullTime' | 'PartTime' | 'Internship' | 'Freelance'

export interface ExperienceDto {
  id: string
  companyName: string
  position: string
  location: string | null
  description: string | null
  employmentType: EmploymentType
  startDate: string
  endDate: string | null
  isCurrent: boolean
  displayOrder: number
}

// ── Social Links ──────────────────────────────────────────────────────────
export interface SocialLinkDto {
  id: string
  platform: string
  label: string | null
  url: string
  iconUrl: string | null
  displayOrder: number
  isVisible: boolean
}

// ── Technologies ──────────────────────────────────────────────────────────
export interface TechnologyDto {
  id: string
  name: string
  iconUrl: string | null
  projectCount: number
}

// ── Tags ──────────────────────────────────────────────────────────────────
export interface TagDto {
  id: string
  name: string
  slug: string
  blogCount: number
}

// ── Blog Posts ────────────────────────────────────────────────────────────
export type PostStatus = 'Draft' | 'Published' | 'Archived'

export interface BlogPostSummaryDto {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImageUrl: string | null
  status: PostStatus
  readingTimeMinutes: number
  viewCount: number
  publishedAt: string | null
  createdAt: string
  tags: TagDto[]
}

export interface AdjacentPostDto {
  id: string
  title: string
  slug: string
}

export interface BlogPostDetailDto extends BlogPostSummaryDto {
  content: string
  updatedAt: string
  prev: AdjacentPostDto | null
  next: AdjacentPostDto | null
}

export interface BlogTagDto {
  id: string
  name: string
  slug: string
}

// ── Projects ──────────────────────────────────────────────────────────────
export type ProjectStatus = 'Draft' | 'InProgress' | 'Completed' | 'Archived'

export interface ProjectSummaryDto {
  id: string
  title: string
  slug: string
  shortDescription: string | null
  thumbnailUrl: string | null
  demoUrl: string | null
  githubUrl: string | null
  status: ProjectStatus
  displayOrder: number
  isFeatured: boolean
  startDate: string | null
  endDate: string | null
  technologies: TechnologyDto[]
}

export interface ProjectDetailDto extends ProjectSummaryDto {
  detailContent: string | null
  createdAt: string
  updatedAt: string
}

export interface ProjectTechnologyDto {
  id: string
  name: string
  iconUrl: string | null
}

// ── Pagination ────────────────────────────────────────────────────────────
export interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// ── Media ─────────────────────────────────────────────────────────────────
export interface MediaFileDto {
  id: string
  publicId: string
  secureUrl: string
  resourceType: string
  originalFilename: string | null
  sizeBytes: number | null
  width: number | null
  height: number | null
  folder: string | null
  uploadedAt: string
}

// ── Dashboard ─────────────────────────────────────────────────────────────
export interface DashboardPostDto {
  id: string
  title: string
  slug: string
  status: string
  viewCount: number
  publishedAt: string | null
  updatedAt: string
}

export interface DashboardProjectDto {
  id: string
  title: string
  slug: string
  status: string
  isFeatured: boolean
  updatedAt: string
}

export interface DashboardDto {
  totalBlogPosts: number
  totalPublishedPosts: number
  draftPosts: number
  totalProjects: number
  draftProjects: number
  topViewedPosts: DashboardPostDto[]
  recentPosts: DashboardPostDto[]
  recentProjects: DashboardProjectDto[]
}

// ── Error ─────────────────────────────────────────────────────────────────
export interface ProblemDetails {
  status: number
  title: string
  detail: string | null
}