import api from './api'

export const activityService = {
  getByProject: (projectId) => api.get(`/activity/${projectId}`),
}
