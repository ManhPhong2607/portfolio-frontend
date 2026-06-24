// services/publicService.ts
import { api } from '@/lib/api'
import type {
  AboutProfileDto, SkillDto, ExperienceDto, SocialLinkDto,
  PaginatedResult, BlogPostSummaryDto, BlogPostDetailDto,
  ProjectSummaryDto, ProjectDetailDto, TagDto, TechnologyDto,
} from '@/types/api'

export const publicService = {
  // About
  getAbout: async (): Promise<AboutProfileDto> => {
    const { data } = await api.get<AboutProfileDto>('/api/about')
    return data
  },

  // Skills
  getSkills: async (): Promise<SkillDto[]> => {
    const { data } = await api.get<SkillDto[]>('/api/skills')
    return data
  },

  // Experiences
  getExperiences: async (): Promise<ExperienceDto[]> => {
    const { data } = await api.get<ExperienceDto[]>('/api/experiences')
    return data
  },

  // Social Links (public — chỉ isVisible=true)
  getSocialLinks: async (): Promise<SocialLinkDto[]> => {
    const { data } = await api.get<SocialLinkDto[]>('/api/social-links')
    return data
  },

  // Tags
  getTags: async (): Promise<TagDto[]> => {
    const { data } = await api.get<TagDto[]>('/api/tags')
    return data
  },

  // Technologies
  getTechnologies: async (): Promise<TechnologyDto[]> => {
    const { data } = await api.get<TechnologyDto[]>('/api/technologies')
    return data
  },

  // Blog
  getPosts: async (params?: {
    page?: number
    limit?: number
    tagSlug?: string
    search?: string
  }): Promise<PaginatedResult<BlogPostSummaryDto>> => {
    const { data } = await api.get<PaginatedResult<BlogPostSummaryDto>>('/api/blogs', { params })
    return data
  },

  getPostBySlug: async (slug: string): Promise<BlogPostDetailDto> => {
    const { data } = await api.get<BlogPostDetailDto>(`/api/blogs/${slug}`)
    return data
  },

  incrementView: async (slug: string) => {
    // fire & forget
    api.post(`/api/blogs/${slug}/view`).catch(() => { })
  },

  // Projects
  getProjects: async (params?: {
    page?: number
    limit?: number
    technologyId?: string
  }): Promise<PaginatedResult<ProjectSummaryDto>> => {
    const { data } = await api.get<PaginatedResult<ProjectSummaryDto>>('/api/projects', { params })
    return data
  },

  getProjectBySlug: async (slug: string): Promise<ProjectDetailDto> => {
    const { data } = await api.get<ProjectDetailDto>(`/api/projects/${slug}`)
    return data
  },

  //contact
  submitContact: async (payload: {
    name: string; email: string; subject?: string;
     message: string; honeypotUrl?: string
  }) => {
    const { data } = await api.post('/api/contact', payload)
    return data
  },
}