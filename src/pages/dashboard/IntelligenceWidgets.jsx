import { useEffect, useState } from 'react';
import { attendanceIntelligenceService } from '../../services/attendanceIntelligenceService';

const statusColors = {
  present: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  late: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  on_leave: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  absent: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  not_scheduled: { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-400' },
};

const statusLabels = {
  present: 'Hadir',
  late: 'Terlambat',
  on_leave: 'Cuti',
  absent: 'Alpha',
  not_scheduled: 'Libur',
};

export const WhoIsInWidget = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('present');

  useEffect(() => {
    attendanceIntelligenceService
      .whoIsIn()
      .then((res) => setData(res.data?.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="h-20 bg-gray-50 rounded" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const tabs = ['present', 'late', 'on_leave', 'absent'].filter(
    (t) => (data.summary?.[t] ?? 0) > 0 || t === 'present'
  );

  const employees = data[activeTab] || [];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">Siapa Masuk Hari Ini</h2>
        <span className="text-xs text-gray-400">{data.date}</span>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { key: 'present', icon: '✅' },
          { key: 'late', icon: '⏰' },
          { key: 'on_leave', icon: '🌴' },
          { key: 'absent', icon: '❌' },
        ].map(({ key, icon }) => {
          const c = statusColors[key];
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                activeTab === key ? `${c.bg} ${c.text}` : 'bg-gray-50 text-gray-500'
              }`}
            >
              <span className="text-xl">{icon}</span>
              <span className="text-lg font-bold">{data.summary?.[key] ?? 0}</span>
              <span className="text-[10px]">{statusLabels[key]}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {employees.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-3">Tidak ada</p>
        ) : (
          employees.map((emp) => {
            const c = statusColors[activeTab];
            return (
              <div
                key={emp.employee_id}
                className={`flex items-center justify-between ${c.bg} rounded-lg px-3 py-2`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  <span className="text-sm font-medium text-gray-800">{emp.name}</span>
                  {emp.department && (
                    <span className="text-[10px] text-gray-400">{emp.department}</span>
                  )}
                </div>
                <span className={`text-xs ${c.text}`}>
                  {emp.check_in_time
                    ? `${emp.check_in_time.slice(0, 5)}${emp.late_minutes > 0 ? ` (+${emp.late_minutes}m)` : ''}`
                    : statusLabels[activeTab]}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export const AnomaliesWidget = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceIntelligenceService
      .anomalies(3)
      .then((res) => setData(res.data?.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="h-12 bg-gray-50 rounded" />
        </div>
      </div>
    );
  }

  if (!data?.employees?.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-2">⚠️ Anomali Absensi</h2>
        <p className="text-sm text-green-600">✅ Tidak ada anomali terdeteksi dalam 3 bulan terakhir.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">⚠️ Anomali Absensi</h2>
        <span className="text-xs text-gray-400">{data.total_flagged} karyawan</span>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {data.employees.map((emp) => (
          <div key={emp.employee_id} className="border border-gray-100 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-800">{emp.name}</span>
              {emp.department && (
                <span className="text-[10px] text-gray-400">{emp.department}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {emp.flags.map((flag, i) => (
                <span
                  key={i}
                  className={`text-[11px] px-2 py-0.5 rounded-full ${
                    flag.severity === 'high'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-yellow-50 text-yellow-700'
                  }`}
                >
                  {flag.message}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TrendWidget = () => {
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceIntelligenceService
      .trend(14)
      .then((res) => setTrend(res.data?.data?.trend || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="animate-pulse h-32 bg-gray-50 rounded" />
      </div>
    );
  }

  const maxTotal = Math.max(...trend.map((d) => d.total), 1);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-base font-semibold text-gray-800 mb-4">📈 Tren Kehadiran (14 Hari)</h2>
      <div className="flex items-end gap-1 h-32">
        {trend.map((day) => {
          const height = (day.total / maxTotal) * 100;
          const lateHeight = day.total > 0 ? (day.late / day.total) * height : 0;
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-0.5" title={`${day.date}: ${day.total} hadir, ${day.late} terlambat`}>
              <div className="w-full flex flex-col justify-end" style={{ height: '100%' }}>
                {lateHeight > 0 && (
                  <div className="bg-orange-400 rounded-t-sm w-full" style={{ height: `${lateHeight}%` }} />
                )}
                <div
                  className="bg-indigo-500 rounded-b-sm w-full"
                  style={{ height: `${height - lateHeight}%` }}
                />
              </div>
              <span className="text-[8px] text-gray-400">{day.date.slice(8)}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 justify-center">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-indigo-500 rounded-sm" />
          <span className="text-[10px] text-gray-500">Hadir</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-orange-400 rounded-sm" />
          <span className="text-[10px] text-gray-500">Terlambat</span>
        </div>
      </div>
    </div>
  );
};
