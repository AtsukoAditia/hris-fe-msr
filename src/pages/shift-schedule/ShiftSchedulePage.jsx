import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import shiftScheduleService from '../../services/shiftScheduleService';
import employeeService from '../../services/employeeService';
import ShiftScheduleCalendar from './components/ShiftScheduleCalendar';
import ShiftScheduleFilters from './components/ShiftScheduleFilters';
import ShiftScheduleModal from './components/ShiftScheduleModal';
import BulkAssignModal from './components/BulkAssignModal';
import ConflictWarnings from './components/ConflictWarnings';
import ShiftSwapModal from './components/ShiftSwapModal';
import ShiftSwapList from './components/ShiftSwapList';

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
  const [conflicts, setConflicts] = useState([]);
  const [showConflicts, setShowConflicts] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar');
  const [showSwapModal, setShowSwapModal] = useState(false);

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
    if (user?.role === 'admin' || user?.role === 'hr') {
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

  const handleValidateConflicts = async () => {
    setLoading(true);
    try {
      const response = await shiftScheduleService.validateConflicts({
        start_date: filters.start_date,
        end_date: filters.end_date,
        employee_id: filters.employee_id || undefined,
      });
      setConflicts(response.data.conflicts || []);
      setShowConflicts(true);
    } catch (error) {
      console.error('Failed to validate conflicts:', error);
      alert('Failed to validate conflicts');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (scheduleId) => {
    try {
      await shiftScheduleService.publishSchedule(scheduleId);
      loadSchedules();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to publish schedule');
    }
  };

  const handleUnpublish = async (scheduleId) => {
    try {
      await shiftScheduleService.unpublishSchedule(scheduleId);
      loadSchedules();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to unpublish schedule');
    }
  };

  const isAdminOrHR = user?.role === 'admin' || user?.role === 'hr';

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shift Schedule Calendar</h1>
        <p className="text-gray-600 mt-1">Manage and view shift schedules</p>
      </div>

      {isAdminOrHR && (
        <div className="mb-4 flex gap-3 flex-wrap">
          <button
            onClick={handleValidateConflicts}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
          >
            Validate Conflicts
          </button>
          <button
            onClick={() => setShowSwapModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
          >
            Swap Requests
          </button>
        </div>
      )}

      {showConflicts && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Conflict Check Results ({conflicts.length})</h3>
            <button onClick={() => setShowConflicts(false)} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <ConflictWarnings conflicts={conflicts} />
        </div>
      )}

      <ShiftScheduleFilters
        filters={filters}
        onFiltersChange={setFilters}
        view={view}
        onViewChange={setView}
      />

      {isAdminOrHR && (
        <div className="mb-4 border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`pb-2 text-sm font-medium ${activeTab === 'calendar' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            >
              Calendar
            </button>
            <button
              onClick={() => setActiveTab('swaps')}
              className={`pb-2 text-sm font-medium ${activeTab === 'swaps' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            >
              Swap Requests
            </button>
          </nav>
        </div>
      )}

      {activeTab === 'calendar' && (
        <>
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
              onPublish={handlePublish}
              onUnpublish={handleUnpublish}
            />
          )}
        </>
      )}

      {activeTab === 'swaps' && isAdminOrHR && (
        <ShiftSwapList
          employees={employees}
          schedules={schedules}
          currentUser={user}
          onRefresh={loadSchedules}
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
      {showSwapModal && (
        <ShiftSwapModal
          employees={employees}
          schedules={schedules}
          onClose={() => setShowSwapModal(false)}
          onSuccess={() => {
            setShowSwapModal(false);
            setActiveTab('swaps');
          }}
        />
      )}
    </div>
  );
}
