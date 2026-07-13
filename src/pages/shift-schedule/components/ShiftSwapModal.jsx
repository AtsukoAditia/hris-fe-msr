import { useState, useEffect } from 'react';
import shiftScheduleService from '../../../services/shiftScheduleService';

export default function ShiftSwapModal({ employees, schedules, onClose, onSuccess }) {
  const [form, setForm] = useState({
    target_id: '',
    requester_schedule_id: '',
    target_schedule_id: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await shiftScheduleService.createSwapRequest({
        ...form,
        requester_schedule_id: Number(form.requester_schedule_id),
        target_schedule_id: form.target_schedule_id ? Number(form.target_schedule_id) : null,
        target_id: Number(form.target_id),
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        setErrors({ general: err.response?.data?.message || 'Failed to create swap request' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Request Shift Swap</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.general}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Employee *</label>
            <select
              value={form.target_id}
              onChange={e => setForm(prev => ({ ...prev, target_id: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              <option value="">Select employee...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name || emp.employee_number}</option>
              ))}
            </select>
            {errors.target_id && <p className="text-red-500 text-xs mt-1">{errors.target_id[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Schedule *</label>
            <select
              value={form.requester_schedule_id}
              onChange={e => setForm(prev => ({ ...prev, requester_schedule_id: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              <option value="">Select your schedule...</option>
              {schedules.filter(s => !s.is_day_off).map(s => (
                <option key={s.id} value={s.id}>
                  {s.schedule_date} - {s.shift?.name || 'No shift'}
                </option>
              ))}
            </select>
            {errors.requester_schedule_id && <p className="text-red-500 text-xs mt-1">{errors.requester_schedule_id[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Schedule (optional)</label>
            <select
              value={form.target_schedule_id}
              onChange={e => setForm(prev => ({ ...prev, target_schedule_id: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select target schedule...</option>
              {schedules.filter(s => !s.is_day_off).map(s => (
                <option key={s.id} value={s.id}>
                  {s.schedule_date} - {s.shift?.name || 'No shift'}
                </option>
              ))}
            </select>
            {errors.target_schedule_id && <p className="text-red-500 text-xs mt-1">{errors.target_schedule_id[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              value={form.reason}
              onChange={e => setForm(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={3}
              placeholder="Optional reason for swap request..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !form.target_id || !form.requester_schedule_id}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
