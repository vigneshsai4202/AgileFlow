import api from './api'

export const sprintService = {
  getByProject: (projectId) => api.get(`/sprints/project/${projectId}`),
  create: (data) => api.post('/sprints', data),
  update: (id, data) => api.put(`/sprints/${id}`, data),
  delete: (id) => api.delete(`/sprints/${id}`),
}
