//services/adminService.ts
import { api } from '@/lib/api'
import type {
  DashboardDto, BlogPostSummaryDto, BlogPostDetailDto,
  ProjectSummaryDto, ProjectDetailDto, SocialLinkDto,
  SkillDto, ExperienceDto, TagDto, TechnologyDto,
  MediaFileDto, PaginatedResult, AboutProfileDto,
  ProjectStatus,
  PostStatus,
  SkillCategory,
  ContactMessageDto,
} from '@/types/api'
import { isDataView } from 'util/types'

export const adminService = {
  // Dashboard
  getDashboard: async (): Promise<DashboardDto> => {
    const { data } = await api.get<DashboardDto>('/admin/dashboard')
    return data
  },

  // About
  updateAbout: async (payload: {
    fullName: string
    tagline?: string
    bio?: string
    location?: string
    contactEmail?: string
    avatarMediaId?: string
    cvMediaId?: string
  }) => {
    await api.put('/api/admin/about', payload)
  },

  // Blog Posts
  getAdminPosts: async (params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
  }): Promise<PaginatedResult<BlogPostSummaryDto>> => {
    const { data } = await api.get('/api/admin/blogs', { params })
    return data
  },

  getAdminPostById: async (id: string): Promise<BlogPostDetailDto> => {
    const { data } = await api.get(`/api/admin/blogs/${id}`)
    return data
  },

  createPost: async (payload: {
    title: string
    content: string
    excerpt?: string
    coverMediaId?: string
    tagIds: string[]
  }): Promise<{ id: string }> => {
    const { data } = await api.post('/api/admin/blogs', payload)
    return data
  },

  updatePost: async (id: string, payload: {
    title: string
    content: string
    excerpt?: string
    coverMediaId?: string
    tagIds: string[]
  }) => {
    await api.put(`/api/admin/blogs/${id}`, payload)
  },

  //   publishPost:   (id: string) => api.patch(`/api/admin/blogs/${id}/publish`),
  //   unpublishPost: (id: string) => api.patch(`/api/admin/blogs/${id}/unpublish`),
  //   archivePost:   (id: string) => api.patch(`/api/admin/blogs/${id}/archive`),

  changePostStatus: (id: string, status: PostStatus) =>
    api.patch(`/api/admin/blogs/${id}/status`, { status }),

  deletePost: (id: string) => api.delete(`/api/admin/blogs/${id}`),

  // Projects
  getAdminProjects: async (params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<PaginatedResult<ProjectSummaryDto>> => {
    const { data } = await api.get('/api/admin/projects', { params })
    return data
  },

  getAdminProjectById: async (id: string): Promise<ProjectDetailDto> => {
    const { data } = await api.get(`/api/admin/projects/${id}`)
    return data
  },

  createProject: async (payload: {
    title: string
    shortDescription?: string
    detailContent?: string
    demoUrl?: string
    githubUrl?: string
    startDate?: string
    endDate?: string
    thumbnailMediaId?: string
    technologyIds: string[]
  }): Promise<{ id: string }> => {
    const { data } = await api.post('/api/admin/projects', payload)
    return data
  },

  updateProject: async (id: string, payload: {
    title: string
    shortDescription?: string
    detailContent?: string
    demoUrl?: string
    githubUrl?: string
    startDate?: string
    endDate?: string
    thumbnailMediaId?: string
    technologyIds: string[]
  }) => {
    await api.put(`/api/admin/projects/${id}`, payload)
  },

  changeProjectStatus: (id: string, status: ProjectStatus) =>
    api.patch(`/api/admin/projects/${id}/status`, { status }),

  toggleFeatured: (id: string) => api.patch(`/api/admin/projects/${id}/featured`),
  reorderProjects: (orderedIds: string[]) =>
    api.patch('/api/admin/projects/reorder', { orderedIds }),
  deleteProject: (id: string) => api.delete(`/api/admin/projects/${id}`),

  // Skills
  getAdminSkills: async (): Promise<SkillDto[]> => {
    const { data } = await api.get<SkillDto[]>('/api/skills')
    return data
  },
  createSkill: (payload: { name: string; category: SkillCategory; proficiencyLevel: number; iconUrl?: string }) =>
    api.post('/api/admin/skills', payload),
  updateSkill: (id: string, payload: { name: string; category: SkillCategory; proficiencyLevel: number; iconUrl?: string }) =>
    api.put(`/api/admin/skills/${id}`, payload),
  deleteSkill: (id: string) => api.delete(`/api/admin/skills/${id}`),
  reorderSkills: (orderedIds: string[]) =>
    api.patch('/api/admin/skills/reorder', { orderedIds }),

  // Experiences
  getAdminExperiences: async (): Promise<ExperienceDto[]> => {
    const { data } = await api.get('/api/experiences')
    return data
  },
  createExperience: (payload: object) => api.post('/api/admin/experiences', payload),
  updateExperience: (id: string, payload: object) => api.put(`/api/admin/experiences/${id}`, payload),
  deleteExperience: (id: string) => api.delete(`/api/admin/experiences/${id}`),

  // Social Links
  getAdminSocialLinks: async (): Promise<SocialLinkDto[]> => {
    const { data } = await api.get('/api/admin/social-links')
    return data
  },
  createSocialLink: (payload: { platform: string; url: string; label?: string; isVisible: boolean }) =>
    api.post('/api/admin/social-links', payload),
  updateSocialLink: (id: string, payload: { url: string; label?: string; iconUrl?: string; isVisible: boolean }) =>
    api.put(`/api/admin/social-links/${id}`, payload),
  toggleSocialLink: (id: string) => api.patch(`/api/admin/social-links/${id}/toggle`),
  deleteSocialLink: (id: string) => api.delete(`/api/admin/social-links/${id}`),
  reorderSocialLinks: (orderedIds: string[]) =>
    api.patch('/api/admin/social-links/reorder', { orderedIds }),

  // Tags
  getAdminTags: async (): Promise<TagDto[]> => {
    const { data } = await api.get('/api/admin/tags')
    return data
  },
  createTag: (name: string) => api.post('/api/admin/tags', { name }),
  updateTag: (id: string, name: string) => api.put(`/api/admin/tags/${id}`, { id, name }),
  deleteTag: (id: string, force = false) => api.delete(`/api/admin/tags/${id}?force=${force}`),

  // Technologies
  getAdminTechnologies: async (): Promise<TechnologyDto[]> => {
    const { data } = await api.get('/api/admin/technologies')
    return data
  },
  createTechnology: (payload: { name: string; iconUrl?: string }) =>
    api.post('/api/admin/technologies', payload),
  updateTechnology: (id: string, payload: { name: string; iconUrl?: string }) =>
    api.put(`/api/admin/technologies/${id}`, payload),
  deleteTechnology: (id: string, force = false) =>
    api.delete(`/api/admin/technologies/${id}?force=${force}`),

  // Media
  getMediaFiles: async (folder?: string): Promise<MediaFileDto[]> => {
    const { data } = await api.get('/api/admin/media', { params: { folder } })
    return data
  },
  uploadMedia: async (file: File, folder = 'general'): Promise<MediaFileDto> => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post(`/api/admin/media/upload?folder=${folder}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
  deleteMedia: (id: string, force = false) =>
    api.delete(`/api/admin/media/${id}?force=${force}`),

  //contact
  getMessages: async (params?: {
    page?: number; limit?: number; status?: string
  }): Promise<PaginatedResult<ContactMessageDto>> => {
    const { data } = await api.get('/api/admin/messages', { params })
    return data
  },
  markMessageRead: (id: string) => api.patch(`/api/admin/messages/${id}/read`),
  archiveMessage: (id: string) => api.patch(`/api/admin/messages/${id}/archive`),
  unarchiveMessage: (id: string) => api.patch(`/api/admin/messages/${id}/unarchive`),
  deleteMessage: (id: string) => api.delete(`/api/admin/messages/${id}`),
}