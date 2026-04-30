import { useState, useEffect } from 'react';
import shiftScheduleService from '../../services/shiftScheduleService';
import employeeService from '../../services/employeeService';
import shiftService from '../../services/shiftService';

export default function ShiftSchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    shift_id: '',
    schedule_date: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [schedulesRes, employeesRes, shiftsRes] = await Promise.all([
        shiftScheduleService.getAll(),
        employeeService.getAll(),
        shiftService.getAll()
      ]);
      setSchedules(schedulesRes.data || []);
      setEmployees(employeesRes.data || []);
      setShifts(shiftsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await shiftScheduleService.create(formData);
      alert('Shift berhasil di-assign');
      setFormData({ employee_id: '', shift_id: '', schedule_date: '', notes: '' });
      loadData();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Gagal assign shift');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus assignment ini?')) return;
    setLoading(true);
    try {
      await shiftScheduleService.remove(id);
      alert('Assignment berhasil dihapus');
      loadData();
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal menghapus assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Assign Shift ke Pegawai</h1>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Assign Shift Baru</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Pegawai *</label>
            <select
              value={formData.employee_id}
              onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
              className="w-full rounded-md border px-3 py-2"
              required
            >
              <option value="">Pilih Pegawai</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.full_name} - {emp.employee_id}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Shift *</label>
            <select
              value={formData.shift_id}
              onChange={(e) => setFormData({...formData, shift_id: e.target.value})}
              className="w-full rounded-md border px-3 py-2"
              required
            >
              <option value="">Pilih Shift</option>
              {shifts.map(shift => (
                <option key={shift.id} value={shift.id}>{shift.name} ({shift.start_time} - {shift.end_time})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal *</label>
            <input
              type="date"
              value={formData.schedule_date}
              onChange={(e) => setFormData({...formData, schedule_date: e.target.value})}
              className="w-full rounded-md border px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Catatan</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Catatan (opsional)"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Assign Shift'}
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pegawai</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catatan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {schedules.map((schedule) => (
              <tr key={schedule.id}>
                <td className="px-6 py-4">{schedule.employee?.full_name}</td>
                <td className="px-6 py-4">{schedule.shift?.name}</td>
                <td className="px-6 py-4">{schedule.schedule_date}</td>
                <td className="px-6 py-4">{schedule.notes || '-'}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
