import api from '../lib/axios'

const activityLogService = {
  list: (params = {}) => api.get('/activity-logs', { params }),
  show: (id) => api.get(`/activity-logs/${id}`),
}

export default activityLogService
