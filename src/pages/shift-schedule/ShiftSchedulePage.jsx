import { useState, useEffect, useCallback, useMemo } from "react";
import shiftScheduleService from "../../services/shiftScheduleService";
import employeeService from "../../services/employeeService";
import shiftService from "../../services/shiftService";
import { useAuthStore } from "../../store/authStore";

const DAY_NAMES = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

function formatDate(d) {
  return d.toISOString().split("T")[0];
}

function getWeekDates(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    return dd;
  });
}

function getMonthDates(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const dates = [];
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  return dates;
}

export default function ShiftSchedulePage() {
  const user = useAuthStore((s) => s.user);
  const isManager = user?.role === "manager";
  const isAdmin = ["admin", "hr"].includes(user?.role);

  const [viewMode, setViewMode] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterBranch, setFilterBranch] = useState("");

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);

  // Single assign form
  const [assignForm, setAssignForm] = useState({
    employee_id: "",
    shift_id: "",
    schedule_date: "",
    notes: "",
  });

  // Bulk assign form
  const [bulkForm, setBulkForm] = useState({
    employee_ids: [],
    shift_id: "",
    dates: [],
    notes: "",
  });

  // Copy week form
  const [copyForm, setCopyForm] = useState({
    source_week_start: "",
    target_week_start: "",
  });

  // Day off
  const [showDayOffModal, setShowDayOffModal] = useState(false);
  const [dayOffForm, setDayOffForm] = useState({
    employee_id: "",
    schedule_date: "",
    notes: "Day Off",
  });

  const normalizeRows = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };

  const getEmpName = (emp) =>
    emp.user?.name || emp.full_name || emp.name || emp.employee_number || "-";
  const getEmpNumber = (emp) =>
    emp.employee_number || emp.formatted_employee_number || "";

  const departments = useMemo(() => {
    const depts = [
      ...new Set(employees.map((e) => e.department?.name).filter(Boolean)),
    ];
    return depts.sort();
  }, [employees]);

  const branches = useMemo(() => {
    const brs = [
      ...new Set(employees.map((e) => e.branch?.name).filter(Boolean)),
    ];
    return brs.sort();
  }, [employees]);

  const loadSchedules = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let res;
      const params = {};
      if (viewMode === "week") {
        const weekDates = getWeekDates(currentDate);
        params.start_date = formatDate(weekDates[0]);
        params.end_date = formatDate(weekDates[6]);
      } else {
        params.start_date = formatDate(
          new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        );
        params.end_date = formatDate(
          new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
        );
      }
      if (filterEmployee) params.employee_id = filterEmployee;

      if (isManager && !isAdmin) {
        res = await shiftScheduleService.getTeamSchedule(params);
      } else {
        res = await shiftScheduleService.getAll(params);
      }
      setSchedules(normalizeRows(res));
    } catch (e) {
      setError(e.response?.data?.message || "Gagal memuat jadwal");
    } finally {
      setLoading(false);
    }
  }, [
    currentDate,
    viewMode,
    filterEmployee,
    filterDepartment,
    filterBranch,
    isManager,
    isAdmin,
  ]);

  const loadMeta = useCallback(async () => {
    try {
      const [empRes, shiftRes] = await Promise.all([
        employeeService.getAll(),
        shiftService.getAll(),
      ]);
      setEmployees(normalizeRows(empRes?.data));
      setShifts(normalizeRows(shiftRes?.data));
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const filteredSchedules = useMemo(() => {
    let result = schedules;
    if (filterDepartment) {
      result = result.filter(
        (s) => s.employee?.department?.name === filterDepartment,
      );
    }
    if (filterBranch) {
      result = result.filter((s) => s.employee?.branch?.name === filterBranch);
    }
    return result;
  }, [schedules, filterDepartment, filterBranch]);

  const navigateDate = (dir) => {
    const d = new Date(currentDate);
    if (viewMode === "week") {
      d.setDate(d.getDate() + dir * 7);
    } else {
      d.setMonth(d.getMonth() + dir);
    }
    setCurrentDate(d);
  };

  const openAssignModal = (date) => {
    setAssignForm({
      employee_id: "",
      shift_id: "",
      schedule_date: date ? formatDate(date) : "",
      notes: "",
    });
    setShowAssignModal(true);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await shiftScheduleService.create(assignForm);
      setShowAssignModal(false);
      loadSchedules();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal assign shift");
    } finally {
      setLoading(false);
    }
  };

  const handleBulk = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await shiftScheduleService.bulkAssign({
        assignments: bulkForm.employee_ids.flatMap((empId) =>
          bulkForm.dates.map((date) => ({
            employee_id: Number(empId),
            shift_id: bulkForm.shift_id ? Number(bulkForm.shift_id) : null,
            schedule_date: date,
            notes: bulkForm.notes,
            is_day_off: !bulkForm.shift_id,
          })),
        ),
      });
      setShowBulkModal(false);
      loadSchedules();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal bulk assign");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyWeek = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await shiftScheduleService.copyWeek(copyForm);
      setShowCopyModal(false);
      loadSchedules();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal copy jadwal");
    } finally {
      setLoading(false);
    }
  };

  const handleDayOff = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await shiftScheduleService.create({
        ...dayOffForm,
        shift_id: null,
        is_day_off: true,
      });
      setShowDayOffModal(false);
      loadSchedules();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal set day off");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus jadwal ini?")) return;
    setLoading(true);
    try {
      await shiftScheduleService.remove(id);
      loadSchedules();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menghapus");
    } finally {
      setLoading(false);
    }
  };

  const getPrevWeekDates = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    return getWeekDates(d);
  };

  const weekDates = getWeekDates(currentDate);
  const monthDates = getMonthDates(
    currentDate.getFullYear(),
    currentDate.getMonth(),
  );

  const headerTitle =
    viewMode === "week"
      ? `${formatDate(weekDates[0])} — ${formatDate(weekDates[6])}`
      : `${currentDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`;

  const renderScheduleCell = (date) => {
    const dateStr = formatDate(date);
    const daySchedules = filteredSchedules.filter(
      (s) => s.schedule_date === dateStr,
    );
    if (daySchedules.length === 0) return null;
    return daySchedules.map((s) => (
      <div
        key={s.id}
        className={`text-xs px-1 py-0.5 rounded mb-0.5 flex items-center justify-between ${
          s.is_day_off
            ? "bg-gray-200 text-gray-600"
            : "bg-indigo-100 text-indigo-800"
        }`}
      >
        <span className="truncate">
          {isAdmin
            ? s.employee?.user?.name ||
              s.employee?.employee_number ||
              `#${s.employee_id}`
            : ""}
          {s.is_day_off ? " Day Off" : ` ${s.shift?.name || ""}`}
        </span>
        {isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(s.id);
            }}
            className="ml-1 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        )}
      </div>
    ));
  };

  return (
    <div className="p-6 max-w-full">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <h1 className="text-2xl font-bold">Jadwal Shift</h1>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => openAssignModal(null)}
                className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm hover:bg-indigo-700"
              >
                + Assign
              </button>
              <button
                onClick={() => {
                  setBulkForm({
                    employee_ids: [],
                    shift_id: "",
                    dates: [],
                    notes: "",
                  });
                  setShowBulkModal(true);
                }}
                className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700"
              >
                Bulk Assign
              </button>
              <button
                onClick={() => {
                  const prev = getPrevWeekDates();
                  setCopyForm({
                    source_week_start: formatDate(prev[0]),
                    target_week_start: formatDate(weekDates[0]),
                  });
                  setShowCopyModal(true);
                }}
                className="bg-orange-600 text-white px-3 py-1.5 rounded text-sm hover:bg-orange-700"
              >
                Copy Minggu Lalu
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Filters & View Toggle */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              View
            </label>
            <div className="flex border rounded overflow-hidden">
              <button
                onClick={() => setViewMode("week")}
                className={`px-3 py-1.5 text-sm ${viewMode === "week" ? "bg-indigo-600 text-white" : "bg-white text-gray-700"}`}
              >
                Mingguan
              </button>
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1.5 text-sm ${viewMode === "month" ? "bg-indigo-600 text-white" : "bg-white text-gray-700"}`}
              >
                Bulanan
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate(-1)}
              className="px-2 py-1 border rounded text-sm hover:bg-gray-50"
            >
              ◀
            </button>
            <span className="text-sm font-medium min-w-[200px] text-center">
              {headerTitle}
            </span>
            <button
              onClick={() => navigateDate(1)}
              className="px-2 py-1 border rounded text-sm hover:bg-gray-50"
            >
              ▶
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-2 py-1 border rounded text-sm hover:bg-gray-50"
            >
              Hari Ini
            </button>
          </div>

          {isAdmin && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Pegawai
              </label>
              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="border rounded px-2 py-1.5 text-sm"
              >
                <option value="">Semua</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {getEmpName(emp)} ({getEmpNumber(emp)})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Departemen
            </label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="border rounded px-2 py-1.5 text-sm"
            >
              <option value="">Semua</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Cabang
            </label>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="border rounded px-2 py-1.5 text-sm"
            >
              <option value="">Semua</option>
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Calendar */}
      {loading && <p className="text-sm text-gray-500 mb-2">Memuat...</p>}

      {viewMode === "week" ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-7 border-b">
            {weekDates.map((date, i) => {
              const isToday = formatDate(date) === formatDate(new Date());
              return (
                <div
                  key={i}
                  className={`p-2 text-center text-xs font-medium border-r last:border-r-0 ${
                    isToday
                      ? "bg-indigo-50 text-indigo-700"
                      : "bg-gray-50 text-gray-600"
                  }`}
                >
                  <div>{DAY_NAMES[date.getDay()]}</div>
                  <div className="text-lg font-bold">{date.getDate()}</div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-7" style={{ minHeight: 300 }}>
            {weekDates.map((date, i) => {
              const isToday = formatDate(date) === formatDate(new Date());
              return (
                <div
                  key={i}
                  className={`border-r last:border-r-0 p-1 ${
                    isToday ? "bg-indigo-50/30" : ""
                  }`}
                  onClick={() => isAdmin && openAssignModal(date)}
                  style={{
                    cursor: isAdmin ? "pointer" : "default",
                    minHeight: 300,
                  }}
                >
                  {renderScheduleCell(date)}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-7 border-b">
            {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
              <div
                key={d}
                className="p-2 text-center text-xs font-medium bg-gray-50 border-r last:border-r-0"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {/* Pad first week */}
            {(() => {
              const firstDay = monthDates[0]?.getDay() || 0;
              const pad = firstDay === 0 ? 6 : firstDay - 1;
              const padded = [...Array(pad).fill(null), ...monthDates];
              return padded.map((date, i) => {
                if (!date)
                  return (
                    <div
                      key={`pad-${i}`}
                      className="border-r border-b p-1 min-h-[80px] bg-gray-50"
                    />
                  );
                const isToday = formatDate(date) === formatDate(new Date());
                return (
                  <div
                    key={i}
                    className={`border-r border-b p-1 min-h-[80px] ${
                      isToday ? "bg-indigo-50/30" : ""
                    }`}
                    onClick={() => isAdmin && openAssignModal(date)}
                    style={{ cursor: isAdmin ? "pointer" : "default" }}
                  >
                    <div
                      className={`text-xs font-medium mb-1 ${isToday ? "text-indigo-700" : "text-gray-500"}`}
                    >
                      {date.getDate()}
                    </div>
                    {renderScheduleCell(date)}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Single Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Assign Shift</h2>
            <form onSubmit={handleAssign} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pegawai *
                </label>
                <select
                  value={assignForm.employee_id}
                  onChange={(e) =>
                    setAssignForm({
                      ...assignForm,
                      employee_id: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Pilih Pegawai</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {getEmpName(emp)} ({getEmpNumber(emp)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Shift</label>
                <select
                  value={assignForm.shift_id}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, shift_id: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Day Off (tanpa shift)</option>
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.start_time}–{s.end_time})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tanggal *
                </label>
                <input
                  type="date"
                  value={assignForm.schedule_date}
                  onChange={(e) =>
                    setAssignForm({
                      ...assignForm,
                      schedule_date: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Catatan
                </label>
                <input
                  type="text"
                  value={assignForm.notes}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, notes: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  placeholder="Opsional"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border rounded text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded text-sm disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Assign Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Bulk Assign Shift</h2>
            <form onSubmit={handleBulk} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pegawai * (pilih banyak)
                </label>
                <select
                  multiple
                  value={bulkForm.employee_ids}
                  onChange={(e) =>
                    setBulkForm({
                      ...bulkForm,
                      employee_ids: Array.from(
                        e.target.selectedOptions,
                        (o) => o.value,
                      ),
                    })
                  }
                  className="w-full border rounded px-3 py-2 h-32"
                  required
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {getEmpName(emp)} ({getEmpNumber(emp)})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Ctrl/Cmd+Click untuk pilih banyak
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Shift (kosongkan = Day Off)
                </label>
                <select
                  value={bulkForm.shift_id}
                  onChange={(e) =>
                    setBulkForm({ ...bulkForm, shift_id: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Day Off</option>
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.start_time}–{s.end_time})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tanggal * (pisahkan koma)
                </label>
                <input
                  type="text"
                  value={bulkForm.dates.join(", ")}
                  onChange={(e) =>
                    setBulkForm({
                      ...bulkForm,
                      dates: e.target.value
                        .split(",")
                        .map((d) => d.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  placeholder="2026-06-26, 2026-06-27, 2026-06-28"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Catatan
                </label>
                <input
                  type="text"
                  value={bulkForm.notes}
                  onChange={(e) =>
                    setBulkForm({ ...bulkForm, notes: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 border rounded text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded text-sm disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : "Bulk Assign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Copy Week Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              Copy Jadwal Minggu Lalu
            </h2>
            <form onSubmit={handleCopyWeek} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Minggu Sumber
                </label>
                <input
                  type="date"
                  value={copyForm.source_week_start}
                  onChange={(e) =>
                    setCopyForm({
                      ...copyForm,
                      source_week_start: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Minggu Target
                </label>
                <input
                  type="date"
                  value={copyForm.target_week_start}
                  onChange={(e) =>
                    setCopyForm({
                      ...copyForm,
                      target_week_start: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCopyModal(false)}
                  className="px-4 py-2 border rounded text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-orange-600 text-white rounded text-sm disabled:opacity-50"
                >
                  {loading ? "Menyalin..." : "Copy Jadwal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Day Off Modal */}
      {showDayOffModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Set Day Off</h2>
            <form onSubmit={handleDayOff} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pegawai *
                </label>
                <select
                  value={dayOffForm.employee_id}
                  onChange={(e) =>
                    setDayOffForm({
                      ...dayOffForm,
                      employee_id: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Pilih Pegawai</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {getEmpName(emp)} ({getEmpNumber(emp)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tanggal *
                </label>
                <input
                  type="date"
                  value={dayOffForm.schedule_date}
                  onChange={(e) =>
                    setDayOffForm({
                      ...dayOffForm,
                      schedule_date: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Catatan
                </label>
                <input
                  type="text"
                  value={dayOffForm.notes}
                  onChange={(e) =>
                    setDayOffForm({ ...dayOffForm, notes: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDayOffModal(false)}
                  className="px-4 py-2 border rounded text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-gray-600 text-white rounded text-sm disabled:opacity-50"
                >
                  Simpan Day Off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
