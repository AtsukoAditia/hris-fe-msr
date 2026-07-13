import { useState } from 'react';
import shiftScheduleService from '../../services/shiftScheduleService';

export default function BulkAssignModal({ cells, shifts, onClose }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shift_id: '',
    is_day_off: false,
    notes: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const assignments = cells.map((cell) => ({
        employee_id: cell.employee_id,
        schedule_date: cell.date,
        shift_id: formData.is_day_off ? null : formData.shift_id,
        is_day_off: formData.is_day_off,
        notes: formData.notes,
      }));

      await shiftScheduleService.bulkAssign({ assignments });
      onClose();
    } catch (error) {
      console.error('Failed to bulk assign:', error);
      alert('Failed to bulk assign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Bulk Assign</h2>

          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Selected cells:</span> {cells.length}
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
                disabled={loading || (!formData.shift_id && !formData.is_day_off)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {loading ? 'Assigning...' : 'Assign All'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
