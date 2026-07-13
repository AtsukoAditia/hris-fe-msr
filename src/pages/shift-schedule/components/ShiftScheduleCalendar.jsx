import { useState } from 'react';
import {
  getWeekStart,
  getWeekEnd,
  getMonthStart,
  getMonthEnd,
  addDays,
  format,
  isToday,
  parseISO,
} from '../../utils/dateUtils';

export default function ShiftScheduleCalendar({
  schedules = [],
  employees = [],
  shifts = [],
  view = 'monthly',
  onCellClick,
  onBulkAssign,
  onPublish,
  onUnpublish,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCells, setSelectedCells] = useState([]);

  const startOfRange =
    view === 'weekly'
      ? getWeekStart(currentDate)
      : getMonthStart(currentDate);
  const endOfRange =
    view === 'weekly'
      ? getWeekEnd(currentDate)
      : getMonthEnd(currentDate);

  const days = [];
  let d = new Date(startOfRange);
  while (d <= endOfRange) {
    days.push(new Date(d));
    d = addDays(d, 1);
  }

  const buildScheduleMap = () => {
    const map = {};
    schedules.forEach((s) => {
      const key = `${s.employee_id}_${format(parseISO(s.schedule_date || s.date), 'yyyy-MM-dd')}`;
      map[key] = s;
    });
    return map;
  };

  const scheduleMap = buildScheduleMap();

  const navigatePrev = () => {
    setCurrentDate((prev) =>
      addDays(prev, view === 'weekly' ? -7 : -1),
    );
  };

  const navigateNext = () => {
    setCurrentDate((prev) =>
      addDays(prev, view === 'weekly' ? 7 : 1),
    );
  };

  const goToToday = () => setCurrentDate(new Date());

  const toggleCell = (empId, dateStr) => {
    const cellKey = `${empId}_${dateStr}`;
    setSelectedCells((prev) =>
      prev.includes(cellKey)
        ? prev.filter((c) => c !== cellKey)
        : [...prev, cellKey],
    );
  };

  return (
    <div className="shift-calendar">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={navigatePrev} className="btn btn-sm">
            &lt;
          </button>
          <h3 className="text-lg font-semibold">
            {format(startOfRange, 'MMM yyyy')}
          </h3>
          <button onClick={navigateNext} className="btn btn-sm">
            &gt;
          </button>
          <button onClick={goToToday} className="btn btn-sm btn-outline">
            Today
          </button>
        </div>
        {selectedCells.length > 0 && (
          <button
            onClick={() => onBulkAssign?.(selectedCells)}
            className="btn btn-primary btn-sm"
          >
            Assign ({selectedCells.length})
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white p-2 border text-sm min-w-[150px]">
                Employee
              </th>
              {days.map((day) => (
                <th
                  key={day.toISOString()}
                  className={`p-2 border text-center text-sm min-w-[80px] ${
                    isToday(day) ? 'bg-blue-50' : ''
                  }`}
                >
                  <div>{format(day, 'EEE')}</div>
                  <div className="font-bold">{format(day, 'd')}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td className="sticky left-0 bg-white p-2 border text-sm font-medium">
                  {emp.name}
                </td>
                {days.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const key = `${emp.id}_${dateStr}`;
                  const schedule = scheduleMap[key];
                  const isSelected = selectedCells.includes(key);
                  const isPublished = schedule?.status === 'published';

                  return (
                    <td
                      key={key}
                      onClick={() => onCellClick?.(emp, day, schedule)}
                      className={`p-1 border text-center text-xs cursor-pointer hover:bg-gray-50 ${
                        isToday(day) ? 'bg-blue-50' : ''
                      } ${isSelected ? 'ring-2 ring-blue-400 bg-blue-100' : ''} ${
                        schedule?.is_day_off ? 'bg-gray-100' : ''
                      }`}
                    >
                      {schedule?.is_day_off ? (
                        <span className="text-gray-400">OFF</span>
                      ) : schedule?.shift_name ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="font-medium text-blue-700">
                            {schedule.shift_name}
                          </span>
                          {isPublished && (
                            <span className="inline-block px-1 py-0.5 rounded text-[9px] bg-green-100 text-green-700 font-medium">
                              v{schedule.version || 1}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
