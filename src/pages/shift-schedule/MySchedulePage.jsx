import { useState, useEffect, useCallback } from "react";
import shiftScheduleService from "../../services/shiftScheduleService";
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

export default function MySchedulePage() {
  const user = useAuthStore((s) => s.user);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadSchedules = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const weekDates = getWeekDates(currentDate);
      const res = await shiftScheduleService.getMySchedule({
        start_date: formatDate(weekDates[0]),
        end_date: formatDate(weekDates[6]),
      });
      const rows = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
      setSchedules(rows);
    } catch (e) {
      setError(e.response?.data?.message || "Gagal memuat jadwal");
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const weekDates = getWeekDates(currentDate);
  const headerTitle = `${formatDate(weekDates[0])} — ${formatDate(weekDates[6])}`;

  const getScheduleForDate = (dateStr) =>
    schedules.find((s) => s.schedule_date === dateStr);

  const navigateWeek = (dir) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + dir * 7);
    setCurrentDate(d);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Jadwal Saya</h1>
      <p className="text-sm text-gray-500 mb-4">{user?.name || "Pegawai"}</p>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateWeek(-1)}
          className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
        >
          ◀ Minggu Lalu
        </button>
        <span className="text-sm font-medium">{headerTitle}</span>
        <button
          onClick={() => navigateWeek(1)}
          className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
        >
          Minggu Depan ▶
        </button>
      </div>

      <button
        onClick={() => setCurrentDate(new Date())}
        className="mb-4 px-3 py-1 border rounded text-sm hover:bg-gray-50"
      >
        Minggu Ini
      </button>

      {loading && <p className="text-sm text-gray-500">Memuat...</p>}

      <div className="space-y-2">
        {weekDates.map((date) => {
          const dateStr = formatDate(date);
          const schedule = getScheduleForDate(dateStr);
          const isToday = dateStr === formatDate(new Date());
          return (
            <div
              key={dateStr}
              className={`flex items-center p-3 rounded border ${
                isToday ? "border-indigo-300 bg-indigo-50" : "bg-white"
              }`}
            >
              <div className="w-24">
                <div className="text-xs text-gray-500">
                  {DAY_NAMES[date.getDay()]}
                </div>
                <div
                  className={`text-lg font-bold ${isToday ? "text-indigo-700" : ""}`}
                >
                  {date.getDate()}
                </div>
              </div>
              <div className="flex-1">
                {schedule ? (
                  schedule.is_day_off ? (
                    <span className="inline-block px-3 py-1 bg-gray-200 text-gray-600 rounded text-sm">
                      Day Off
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded text-sm font-medium">
                        {schedule.shift?.name || "Shift"}
                      </span>
                      <span className="text-sm text-gray-500">
                        {schedule.shift?.start_time}–{schedule.shift?.end_time}
                      </span>
                    </div>
                  )
                ) : (
                  <span className="text-sm text-gray-400">
                    Belum dijadwalkan
                  </span>
                )}
              </div>
              {schedule?.notes && (
                <div className="text-xs text-gray-400 ml-2">
                  {schedule.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
