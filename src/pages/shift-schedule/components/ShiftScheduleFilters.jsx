import { useState, useEffect } from 'react';
import shiftScheduleService from '../../services/shiftScheduleService';

export default function ShiftScheduleFilters({
  filters,
  onFiltersChange,
  view,
  onViewChange,
}) {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await shiftScheduleService.listDepartments();
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const handleChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            View
          </label>
          <select
            value={view}
            onChange={(e) => onViewChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => handleChange('start_date', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => handleChange('end_date', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <select
            value={filters.department_id}
            onChange={(e) => handleChange('department_id', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() =>
            onFiltersChange({
              start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
              end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
              employee_id: '',
              department_id: '',
            })
          }
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
