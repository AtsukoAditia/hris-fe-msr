import api from "../lib/axios";

const shiftScheduleService = {
  getAll: async (params = {}) => {
    const response = await api.get("/shift-schedules", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/shift-schedules/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/shift-schedules", data);
    return response.data;
  },

  bulkAssign: async (data) => {
    const response = await api.post("/shift-schedules/bulk", data);
    return response.data;
  },

  copyWeek: async (data) => {
    const response = await api.post("/shift-schedules/copy-week", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/shift-schedules/${id}`, data);
    return response.data;
  },

  remove: async (id) => {
    const response = await api.delete(`/shift-schedules/${id}`);
    return response.data;
  },

  getMySchedule: async (params = {}) => {
    const response = await api.get("/shift-schedules/my-schedule", { params });
    return response.data;
  },

  getTeamSchedule: async (params = {}) => {
    const response = await api.get("/shift-schedules/team-schedule", {
      params,
    });
    return response.data;
  },
};

export default shiftScheduleService;
