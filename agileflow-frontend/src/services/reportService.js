import api from './api'

export const reportService = {
  getProjectReport: (projectId) => api.get(`/reports/project/${projectId}`),
}
