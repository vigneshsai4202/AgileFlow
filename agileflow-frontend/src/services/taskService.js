import api from './api'

export const taskService = {
  getByProject: (projectId, params = {}) =>
    api.get(`/tasks/project/${projectId}`, { params }),
  search: (q, projectId) => api.get('/tasks/search', { params: { q, projectId } }),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
}
