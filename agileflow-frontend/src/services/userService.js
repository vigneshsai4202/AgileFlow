import api from './api'

export const userService = {
  getAll: () => api.get('/users'),
  getWithTasks: () => api.get('/users/with-tasks'),
  deleteUser: (id) => api.delete(`/users/${id}`),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
}
