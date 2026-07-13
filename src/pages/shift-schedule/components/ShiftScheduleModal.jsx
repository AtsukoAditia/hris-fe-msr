import { useState } from 'react';
import shiftScheduleService from '../../services/shiftScheduleService';

export default function ShiftScheduleModal({ schedule, shifts, onClose }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shift_id: schedule.schedule?.shift_id || '',
    is_day_off: schedule.schedule?.is_day_off || false,
    notes: schedule.schedule?.notes || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        employee_id: schedule.employee.id,
        schedule_date: schedule.date,
        ...formData,
      };

      if (schedule.schedule) {
        await shiftScheduleService.update(schedule.schedule.id, payload);
      } else {
        await shiftScheduleService.store(payload);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save schedule:', error);
      alert('Failed to save schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {schedule.schedule ? 'Edit Schedule' : 'Add Schedule'}
          </h2>

          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Employee:</span> {schedule.employee.name}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Date:</span> {schedule.date}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shift
              </label>
              <select
                value={formData.shift_id}
                onChange={(e) => setFormData({ ...formData, shift_id: e.target.value })}
                disabled={formData.is_day_off}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Select Shift</option>
                {shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name} ({shift.start_time} - {shift.end_time})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_day_off}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_day_off: e.target.checked,
                      shift_id: e.target.checked ? '' : formData.shift_id,
                    })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Day Off</span>
              </label>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
