import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNotificationStore } from "../../store/notificationStore";
import shiftScheduleService from "../../services/shiftScheduleService";
import shiftService from "../../services/shiftService";
import employeeService from "../../services/employeeService";
import { format, startOfWeek, addDays, parseISO } from "date-fns";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekDates(dateStr) {
  const d = parseISO(dateStr);
  const start = startOfWeek(d, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) =>
    format(addDays(start, i), "yyyy-MM-dd"),
  );
}

function extractRows(response) {
  const payload = response?.data?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function getEmployeeName(employee = {}) {
  return (
    employee.full_name ||
    employee.name ||
    employee.user?.name ||
    [employee.first_name, employee.last_name].filter(Boolean).join(" ") ||
    `Employee #${employee.id}`
  );
}

export default function ShiftSchedulePage() {
  const { user } = useAuthStore();
  const notify = useNotificationStore((s) => s.showNotification);

  const isAdminOrHr = ["admin", "hr"].includes(user?.role);

  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    return format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd");
  });
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterBranch, setFilterBranch] = useState("");

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignDate, setAssignDate] = useState("");
  const [assignShift, setAssignShift] = useState("");
  const [assignEmployee, setAssignEmployee] = useState("");
  const [assignIsDayOff, setAssignIsDayOff] = useState(false);
  const [assignNotes, setAssignNotes] = useState("");
  const [assignExistingId, setAssignExistingId] = useState(null);

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkEmpIds, setBulkEmpIds] = useState([]);
  const [bulkShiftId, setBulkShiftId] = useState("");
  const [bulkDates, setBulkDates] = useState([]);
  const [bulkIsDayOff, setBulkIsDayOff] = useState(false);

  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copySource, setCopySource] = useState("");
  const [copyTarget, setCopyTarget] = useState("");
  const [copyEmpFilter, setCopyEmpFilter] = useState("");

  const [showRotatingModal, setShowRotatingModal] = useState(false);
  const [rotatingEmpIds, setRotatingEmpIds] = useState([]);
  const [rotatingPattern, setRotatingPattern] = useState([{ shiftId: "" }]);
  const [rotatingStartDate, setRotatingStartDate] = useState("");
  const [rotatingWeeks, setRotatingWeeks] = useState(4);

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const params = { start_date: weekDates[0], end_date: weekDates[6] };
      if (filterEmployee) params.employee_id = filterEmployee;
      if (filterDept) params.department_id = filterDept;
      if (filterBranch) params.branch_id = filterBranch;

      const response = await shiftScheduleService.list(params);
      setSchedules(extractRows(response));
    } catch (error) {
      notify(error.response?.data?.message || "Gagal memuat jadwal", "error");
    } finally {
      setLoading(false);
    }
  }, [weekDates, filterEmployee, filterDept, filterBranch, notify]);

  useEffect(() => {
    (async () => {
      try {
        const [employeeResponse, shiftResponse] = await Promise.all([
          employeeService.list({ per_page: 100 }),
          shiftService.list(),
        ]);
        setEmployees(extractRows(employeeResponse));
        setShifts(extractRows(shiftResponse));
      } catch {
        notify("Gagal memuat master data jadwal", "warning");
      }
    })();
  }, [notify]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const departments = useMemo(
    () => [
      ...new Map(
        employees
          .filter((employee) => employee.department)
          .map((employee) => [employee.department?.id, employee.department]),
      ).values(),
    ],
    [employees],
  );

  const branches = useMemo(
    () => [
      ...new Map(
        employees
          .filter((employee) => employee.branch)
          .map((employee) => [employee.branch?.id, employee.branch]),
      ).values(),
    ],
    [employees],
  );

  const employeeRows = useMemo(() => {
    const byId = new Map(employees.map((employee) => [Number(employee.id), employee]));

    schedules.forEach((schedule) => {
      if (schedule.employee?.id && !byId.has(Number(schedule.employee.id))) {
        byId.set(Number(schedule.employee.id), schedule.employee);
      }
    });

    let rows = Array.from(byId.values());
    if (filterEmployee) {
      rows = rows.filter((employee) => Number(employee.id) === Number(filterEmployee));
    }
    if (filterDept) {
      rows = rows.filter((employee) => Number(employee.department?.id) === Number(filterDept));
    }
    if (filterBranch) {
      rows = rows.filter((employee) => Number(employee.branch?.id) === Number(filterBranch));
    }

    return rows.sort((a, b) => getEmployeeName(a).localeCompare(getEmployeeName(b)));
  }, [employees, schedules, filterEmployee, filterDept, filterBranch]);

  const scheduleMap = useMemo(() => {
    const map = new Map();
    schedules.forEach((schedule) => {
      const dateKey =
        typeof schedule.schedule_date === "string"
          ? schedule.schedule_date.substring(0, 10)
          : format(new Date(schedule.schedule_date), "yyyy-MM-dd");
      map.set(`${schedule.employee_id}:${dateKey}`, schedule);
    });
    return map;
  }, [schedules]);

  function changeWeek(offset) {
    const d = parseISO(weekStart);
    setWeekStart(format(addDays(d, offset * 7), "yyyy-MM-dd"));
  }

  function openAssign(dateKey, employeeId = "", existing = null) {
    setAssignDate(dateKey);
    if (existing) {
      setAssignExistingId(existing.id);
      setAssignEmployee(String(existing.employee_id));
      setAssignShift(existing.shift?.id ? String(existing.shift.id) : "");
      setAssignIsDayOff(Boolean(existing.is_day_off));
      setAssignNotes(existing.notes || "");
    } else {
      setAssignExistingId(null);
      setAssignEmployee(String(employeeId || filterEmployee || ""));
      setAssignShift("");
      setAssignIsDayOff(false);
      setAssignNotes("");
    }
    setShowAssignModal(true);
  }

  async function handleAssignSave() {
    if (!assignEmployee) return notify("Pilih karyawan", "error");
    if (!assignIsDayOff && !assignShift) {
      return notify("Pilih shift atau centang day off", "error");
    }

    try {
      if (assignExistingId) {
        await shiftScheduleService.update(assignExistingId, {
          shift_id: assignIsDayOff ? null : Number(assignShift),
          is_day_off: assignIsDayOff,
          notes: assignNotes || null,
        });
      } else {
        await shiftScheduleService.store({
          employee_id: Number(assignEmployee),
          shift_id: assignIsDayOff ? null : Number(assignShift),
          schedule_date: assignDate,
          is_day_off: assignIsDayOff,
          notes: assignNotes || null,
        });
      }
      notify("Jadwal tersimpan", "success");
      setShowAssignModal(false);
      fetchSchedules();
    } catch (error) {
      notify(error.response?.data?.message || "Gagal menyimpan", "error");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Hapus jadwal ini?")) return;
    try {
      await shiftScheduleService.destroy(id);
      notify("Jadwal dihapus", "success");
      fetchSchedules();
    } catch (error) {
      notify(error.response?.data?.message || "Gagal menghapus", "error");
    }
  }

  function openBulk() {
    setBulkEmpIds(filterEmployee ? [filterEmployee] : []);
    setBulkShiftId("");
    setBulkDates(weekDates);
    setBulkIsDayOff(false);
    setShowBulkModal(true);
  }

  async function handleBulkSave() {
    if (!bulkEmpIds.length) return notify("Pilih karyawan", "error");
    if (!bulkIsDayOff && !bulkShiftId) return notify("Pilih shift", "error");

    const schedulesPayload = bulkDates.map((date) => ({
      shift_id: bulkIsDayOff ? null : Number(bulkShiftId),
      date,
      is_day_off: bulkIsDayOff,
    }));

    try {
      const response = await shiftScheduleService.bulkAssign({
        employee_ids: bulkEmpIds.map(Number),
        schedules: schedulesPayload,
      });
      const created = response.data?.created?.length ?? response.data?.data?.length ?? 0;
      const errors = response.data?.errors || {};
      notify(
        `Bulk: ${created} jadwal dibuat${Object.keys(errors).length ? `, ${Object.keys(errors).length} error` : ""}`,
        Object.keys(errors).length ? "warning" : "success",
      );
      setShowBulkModal(false);
      fetchSchedules();
    } catch (error) {
      notify(error.response?.data?.message || "Gagal bulk assign", "error");
    }
  }

  function openCopyWeek() {
    setCopySource(weekStart);
    setCopyTarget(format(addDays(parseISO(weekStart), 7), "yyyy-MM-dd"));
    setCopyEmpFilter(filterEmployee || "");
    setShowCopyModal(true);
  }

  async function handleCopyWeek() {
    if (!copySource || !copyTarget) return notify("Pilih tanggal", "error");
    try {
      const payload = {
        source_start_date: copySource,
        target_start_date: copyTarget,
      };
      if (copyEmpFilter) payload.employee_ids = [Number(copyEmpFilter)];
      const response = await shiftScheduleService.copyWeek(payload);
      const created = response.data?.created?.length ?? response.data?.data?.length ?? 0;
      notify(`${created} jadwal disalin`, "success");
      setShowCopyModal(false);
      fetchSchedules();
    } catch (error) {
      notify(error.response?.data?.message || "Gagal menyalin", "error");
    }
  }

  function openRotating() {
    setRotatingEmpIds(filterEmployee ? [filterEmployee] : []);
    setRotatingPattern([{ shiftId: "" }]);
    setRotatingStartDate(weekStart);
    setRotatingWeeks(4);
    setShowRotatingModal(true);
  }

  function addRotatingDay() {
    setRotatingPattern((pattern) => [...pattern, { shiftId: "" }]);
  }

  function updateRotatingDay(index, value) {
    setRotatingPattern((pattern) =>
      pattern.map((item, itemIndex) =>
        itemIndex === index ? { shiftId: value } : item,
      ),
    );
  }

  async function handleRotatingSave() {
    if (!rotatingEmpIds.length) return notify("Pilih karyawan", "error");
    const pattern = rotatingPattern.map((item) =>
      item.shiftId === "day-off" ? null : Number(item.shiftId),
    );
    if (pattern.some((item) => Number.isNaN(item))) {
      return notify("Lengkapi semua hari dalam pattern", "error");
    }
    if (pattern.every((item) => item === null)) {
      return notify("Pattern harus punya minimal 1 shift", "error");
    }

    try {
      const response = await shiftScheduleService.assignRotating({
        employee_ids: rotatingEmpIds.map(Number),
        shift_pattern: pattern,
        start_date: rotatingStartDate,
        weeks: rotatingWeeks,
      });
      const created = response.data?.created?.length ?? response.data?.data?.length ?? 0;
      notify(`${created} jadwal rotating dibuat`, "success");
      setShowRotatingModal(false);
      fetchSchedules();
    } catch (error) {
      notify(error.response?.data?.message || "Gagal assign rotating", "error");
    }
  }

  function toggleBulkEmp(id) {
    setBulkEmpIds((current) =>
      current.includes(id) ? current.filter((employeeId) => employeeId !== id) : [...current, id],
    );
  }

  function toggleRotatingEmp(id) {
    setRotatingEmpIds((current) =>
      current.includes(id) ? current.filter((employeeId) => employeeId !== id) : [...current, id],
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Shift Schedule Calendar</h1>
        {isAdminOrHr && (
          <div className="flex gap-2">
            <button
              onClick={openBulk}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Bulk Assign
            </button>
            <button
              onClick={openCopyWeek}
              className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
            >
              Copy Week
            </button>
            <button
              onClick={openRotating}
              className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
            >
              Rotating Shift
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Employee</label>
            <select
              value={filterEmployee}
              onChange={(event) => setFilterEmployee(event.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[180px]"
            >
              <option value="">All Employees</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {getEmployeeName(employee)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              value={filterDept}
              onChange={(event) => setFilterDept(event.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[150px]"
            >
              <option value="">All Departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Branch</label>
            <select
              value={filterBranch}
              onChange={(event) => setFilterBranch(event.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[150px]"
            >
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Week</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeWeek(-1)}
                className="px-2 py-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                ◀
              </button>
              <span className="text-sm font-medium px-2">{weekStart}</span>
              <button
                onClick={() => changeWeek(1)}
                className="px-2 py-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="sticky left-0 z-10 bg-gray-50 px-3 py-3 text-left text-sm font-medium border-r border-gray-200 min-w-[220px]">
                  Employee
                </th>
                {DAYS.map((day, index) => {
                  const dateKey = weekDates[index];
                  const isToday = dateKey === format(new Date(), "yyyy-MM-dd");
                  return (
                    <th
                      key={day}
                      className={`px-2 py-3 text-center text-sm font-medium border-r border-gray-200 ${isToday ? "bg-blue-50" : ""}`}
                    >
                      {day}
                      <br />
                      <span className="text-xs text-gray-500">
                        {dateKey.substring(5)}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {employeeRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-sm text-gray-500">
                    Tidak ada karyawan untuk filter ini.
                  </td>
                </tr>
              )}
              {employeeRows.map((employee) => (
                <tr key={employee.id} className="border-t border-gray-100">
                  <td className="sticky left-0 z-10 bg-white px-3 py-3 border-r border-gray-200 align-top">
                    <div className="font-medium text-sm text-gray-900">
                      {getEmployeeName(employee)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {employee.department?.name || "-"}
                      {employee.branch?.name ? ` · ${employee.branch.name}` : ""}
                    </div>
                  </td>
                  {weekDates.map((dateKey) => {
                    const schedule = scheduleMap.get(`${employee.id}:${dateKey}`);
                    const isDayOff = schedule?.is_day_off;
                    const shift = schedule?.shift;
                    return (
                      <td
                        key={`${employee.id}-${dateKey}`}
                        className="px-2 py-3 text-center border-r border-gray-200 align-top min-w-[120px]"
                      >
                        <div
                          className={`rounded-lg p-3 mb-2 cursor-pointer hover:shadow-sm ${isDayOff ? "bg-red-50 border border-red-200" : shift ? "bg-blue-50 border border-blue-200" : "bg-gray-50 border border-gray-200"}`}
                          onClick={() => openAssign(dateKey, employee.id, schedule)}
                        >
                          {schedule ? (
                            <div className="text-xs">
                              {isDayOff ? (
                                <span className="font-medium text-red-700">🔴 Day Off</span>
                              ) : (
                                <>
                                  <div className="font-medium text-gray-900">
                                    {shift?.name || "Shift"}
                                  </div>
                                  <div className="text-gray-600">
                                    {shift?.start_time?.substring(0, 5)} - {shift?.end_time?.substring(0, 5)}
                                  </div>
                                </>
                              )}
                              {schedule.notes && (
                                <div className="text-gray-500 mt-1 italic">
                                  {schedule.notes}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">+ Assign</span>
                          )}
                        </div>
                        {schedule && isAdminOrHr && (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(schedule.id);
                            }}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && (
          <div className="text-center py-4 text-gray-500">Loading...</div>
        )}
      </div>

      {showAssignModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAssignModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">
              {assignExistingId ? "Edit" : "Assign"} Shift — {assignDate}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Employee</label>
                <select
                  value={assignEmployee}
                  onChange={(event) => setAssignEmployee(event.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  disabled={Boolean(assignExistingId)}
                >
                  <option value="">Pilih</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {getEmployeeName(employee)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={assignIsDayOff}
                  onChange={(event) => setAssignIsDayOff(event.target.checked)}
                  id="dayOffCheck"
                />
                <label htmlFor="dayOffCheck" className="text-sm">Day Off</label>
              </div>
              {!assignIsDayOff && (
                <div>
                  <label className="block text-sm font-medium mb-1">Shift</label>
                  <select
                    value={assignShift}
                    onChange={(event) => setAssignShift(event.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Pilih Shift</option>
                    {shifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {shift.name} ({shift.start_time?.substring(0, 5)}-{shift.end_time?.substring(0, 5)})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <input
                  type="text"
                  value={assignNotes}
                  onChange={(event) => setAssignNotes(event.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="Optional"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg text-sm hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  onClick={handleAssignSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBulkModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowBulkModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-lg mx-4"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Bulk Assign Shift</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Employees (select multiple)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
                  {employees.map((employee) => (
                    <label key={employee.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={bulkEmpIds.includes(String(employee.id))}
                        onChange={() => toggleBulkEmp(String(employee.id))}
                      />
                      {getEmployeeName(employee)}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={bulkIsDayOff}
                  onChange={(event) => setBulkIsDayOff(event.target.checked)}
                  id="bulkDayOff"
                />
                <label htmlFor="bulkDayOff" className="text-sm">Day Off</label>
              </div>
              {!bulkIsDayOff && (
                <div>
                  <label className="block text-sm font-medium mb-1">Shift</label>
                  <select
                    value={bulkShiftId}
                    onChange={(event) => setBulkShiftId(event.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Pilih Shift</option>
                    {shifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>{shift.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Dates ({bulkDates.length} hari)
                </label>
                <p className="text-xs text-gray-500">
                  {bulkDates[0]} — {bulkDates[bulkDates.length - 1]}
                </p>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg text-sm hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  onClick={handleBulkSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCopyModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowCopyModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Copy Week Schedule</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Source Week Start</label>
                <input
                  type="date"
                  value={copySource}
                  onChange={(event) => setCopySource(event.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Week Start</label>
                <input
                  type="date"
                  value={copyTarget}
                  onChange={(event) => setCopyTarget(event.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Employee Filter (optional)
                </label>
                <select
                  value={copyEmpFilter}
                  onChange={(event) => setCopyEmpFilter(event.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All scheduled employees</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {getEmployeeName(employee)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowCopyModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg text-sm hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  onClick={handleCopyWeek}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                >
                  Salin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRotatingModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowRotatingModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-lg mx-4"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Rotating Shift Pattern</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium mb-2">Employees</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                  {employees.map((employee) => (
                    <label key={employee.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={rotatingEmpIds.includes(String(employee.id))}
                        onChange={() => toggleRotatingEmp(String(employee.id))}
                      />
                      {getEmployeeName(employee)}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Shift Pattern (cycle)</label>
                {rotatingPattern.map((day, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500 w-16">Day {index + 1}</span>
                    <select
                      value={day.shiftId}
                      onChange={(event) => updateRotatingDay(index, event.target.value)}
                      className="flex-1 border rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">Pilih</option>
                      <option value="day-off">🔴 Day Off</option>
                      {shifts.map((shift) => (
                        <option key={shift.id} value={shift.id}>{shift.name}</option>
                      ))}
                    </select>
                    {rotatingPattern.length > 1 && (
                      <button
                        onClick={() =>
                          setRotatingPattern((pattern) =>
                            pattern.filter((_, itemIndex) => itemIndex !== index),
                          )
                        }
                        className="text-red-500 text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addRotatingDay}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Tambah Hari
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={rotatingStartDate}
                    onChange={(event) => setRotatingStartDate(event.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Weeks</label>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={rotatingWeeks}
                    onChange={(event) => setRotatingWeeks(Number(event.target.value))}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowRotatingModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg text-sm hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  onClick={handleRotatingSave}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
