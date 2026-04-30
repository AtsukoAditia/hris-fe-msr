import { useState, useEffect } from 'react';
import shiftService from '../../services/shiftService';
import ShiftList from '../../components/shift/ShiftList';
import ShiftFormModal from '../../components/shift/ShiftFormModal';

const ShiftPage = () => {
  const [shifts, setShifts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);

  // Fetch all shifts
  const fetchShifts = async () => {
    setIsLoading(true);
    try {
      const res = await shiftService.getAll();
      setShifts(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching shifts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  // Handle add new shift
  const handleAdd = () => {
    setEditingShift(null);
    setShowModal(true);
  };

  // Handle edit shift
  const handleEdit = (shift) => {
    setEditingShift(shift);
    setShowModal(true);
  };

  // Handle delete shift
  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus shift ini?')) {
      return;
    }
    
    try {
      await shiftService.remove(id);
      fetchShifts(); // Refresh list
    } catch (err) {
      console.error('Error deleting shift:', err);
      alert('Gagal menghapus shift');
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingShift(null);
  };

  // Handle successful save
  const handleSaveSuccess = () => {
    fetchShifts(); // Refresh list
    handleCloseModal();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Shift</h1>
            <p className="mt-2 text-sm text-gray-600">
              Kelola shift kerja karyawan
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            + Tambah Shift
          </button>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          /* Shift List */
          <ShiftList
            shifts={shifts}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {/* Form Modal */}
        {showModal && (
          <ShiftFormModal
            shift={editingShift}
            onClose={handleCloseModal}
            onSaveSuccess={handleSaveSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default ShiftPage;
