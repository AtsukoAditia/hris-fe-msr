import api from "../lib/axios";

const listShiftSchedules = (params = {}) =>
  api.get("/shift-schedules", { params });

const getShiftSchedule = (id) => api.get(`/shift-schedules/${id}`);

const createShiftSchedule = (data) => api.post("/shift-schedules", data);

const bulkAssignShiftSchedules = (data) =>
  api.post("/shift-schedules/bulk", data);

const copyWeekShiftSchedules = (data) =>
  api.post("/shift-schedules/copy-week", data);

const assignRotatingShiftSchedules = (data) =>
  api.post("/shift-schedules/rotating", data);

const updateShiftSchedule = (id, data) =>
  api.put(`/shift-schedules/${id}`, data);

const deleteShiftSchedule = (id) => api.delete(`/shift-schedules/${id}`);

const getMySchedule = (params = {}) =>
  api.get("/shift-schedules/my-schedule", { params });

const getTeamSchedule = (params = {}) =>
  api.get("/shift-schedules/team-schedule", { params });

const unwrapData = async (request) => {
  const response = await request;
  return response.data;
};

const shiftScheduleService = {
  // Preferred names used by the current shift schedule pages.
  list: listShiftSchedules,
  getById: getShiftSchedule,
  store: createShiftSchedule,
  create: createShiftSchedule,
  bulkAssign: bulkAssignShiftSchedules,
  copyWeek: copyWeekShiftSchedules,
  assignRotating: assignRotatingShiftSchedules,
  update: updateShiftSchedule,
  destroy: deleteShiftSchedule,
  remove: deleteShiftSchedule,
  getMySchedule,
  getTeamSchedule,

  // Backward-compatible helpers for older callers that expect unwrapped data.
  getAll: (params = {}) => unwrapData(listShiftSchedules(params)),
  bulkCreate: (schedules) =>
    unwrapData(bulkAssignShiftSchedules({ schedules })),
};

export default shiftScheduleService;
