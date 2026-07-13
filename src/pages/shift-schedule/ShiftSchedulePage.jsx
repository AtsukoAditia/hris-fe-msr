import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import shiftScheduleService from '../../services/shiftScheduleService';
import employeeService from '../../services/employeeService';
import ShiftScheduleCalendar from './components/ShiftScheduleCalendar';
import ShiftScheduleFilters from './components/ShiftScheduleFilters';
import ShiftScheduleModal from './components/ShiftScheduleModal';
import BulkAssignModal from './components/BulkAssignModal';

export default function ShiftSchedulePage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('monthly');
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
    employee_id: '',
    department_id: '',
  });
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAssignCells, setBulkAssignCells] = useState([]);

  useEffect(() => {
    loadEmployees();
    loadShifts();
  }, []);

  useEffect(() => {
    loadSchedules();
  }, [filters, view]);

  const loadEmployees = async () => {
    try {
      const response = await employeeService.list({ per_page: 1000 });
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const loadShifts = async () => {
    try {
      const response = await shiftScheduleService.listShifts();
      setShifts(response.data.data || []);
    } catch (error) {
      console.error('Failed to load shifts:', error);
    }
  };

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const params = {
        start_date: filters.start_date,
        end_date: filters.end_date,
      };

      if (filters.employee_id) {
        params.employee_id = filters.employee_id;
      }
      if (filters.department_id) {
        params.department_id = filters.department_id;
      }

      const response = await shiftScheduleService.calendar(params);
      setSchedules(response.data.data || []);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (employee, date, schedule) => {
    if (user.role === 'admin' || user.role === 'hr') {
      setSelectedSchedule({
        employee,
        date,
        schedule,
      });
      setShowModal(true);
    }
  };

  const handleBulkAssign = (cells) => {
    setBulkAssignCells(cells);
    setShowBulkModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedSchedule(null);
    loadSchedules();
  };

  const handleBulkModalClose = () => {
    setShowBulkModal(false);
    setBulkAssignCells([]);
    loadSchedules();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shift Schedule Calendar</h1>
        <p className="text-gray-600 mt-1">Manage and view shift schedules</p>
      </div>

      <ShiftScheduleFilters
        filters={filters}
        onFiltersChange={setFilters}
        view={view}
        onViewChange={setView}
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <ShiftScheduleCalendar
          schedules={schedules}
          employees={employees}
          shifts={shifts}
          view={view}
          onCellClick={handleCellClick}
          onBulkAssign={handleBulkAssign}
        />
      )}

      {showModal && selectedSchedule && (
        <ShiftScheduleModal
          schedule={selectedSchedule}
          shifts={shifts}
          onClose={handleModalClose}
        />
      )}

      {showBulkModal && (
        <BulkAssignModal
          cells={bulkAssignCells}
          shifts={shifts}
          onClose={handleBulkModalClose}
        />
      )}
    </div>
  );
}
