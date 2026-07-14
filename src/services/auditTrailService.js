import api from '../lib/axios';

export default {
  getTrail(targetType, targetId) {
    return api.get(`/audit-trail/${targetType}/${targetId}`);
  },
  list(params = {}) {
    return api.get('/audit-trail', { params });
  },
};
