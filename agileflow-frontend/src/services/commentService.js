import api from './api'

export const commentService = {
  getByTask: (taskId) => api.get(`/comments/${taskId}`),
  add: (taskId, text) => api.post(`/comments/${taskId}`, { text }),
  delete: (id) => api.delete(`/comments/${id}`),
}
