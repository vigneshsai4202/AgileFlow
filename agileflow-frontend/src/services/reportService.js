import api from './api'

export const reportService = {
  getProjectReport: (projectId) => api.get(`/reports/project/${projectId}`),
  getSprintReport: (sprintId) => api.get(`/reports/sprint/${sprintId}`),
  getVelocityReport: (projectId) => api.get(`/reports/velocity/${projectId}`),
}
