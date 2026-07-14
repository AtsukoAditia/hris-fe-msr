import { useState, useEffect } from 'react';
import shiftScheduleService from '../../../services/shiftScheduleService';

export default function ShiftSwapList({ onRefresh }) {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadSwaps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadSwaps = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await shiftScheduleService.listSwapRequests(params);
      setSwaps(response.data.data || []);
    } catch (error) {
      console.error('Failed to load swap requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await shiftScheduleService.approveSwap(id);
      loadSwaps();
      onRefresh?.();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Rejection reason:');
    if (reason === null) return;

    try {
      await shiftScheduleService.rejectSwap(id, { review_notes: reason });
      loadSwaps();
      onRefresh?.();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject');
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this swap request?')) return;
    try {
      await shiftScheduleService.cancelSwap(id);
      loadSwaps();
      onRefresh?.();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel');
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Swap Requests</h2>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : swaps.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No swap requests found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {swaps.map(swap => (
                <tr key={swap.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">
                    {swap.requester?.name || swap.requester?.employee_number || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {swap.target?.name || swap.target?.employee_number || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{swap.reason || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[swap.status]}`}>
                      {swap.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {swap.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(swap.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(swap.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleCancel(swap.id)}
                          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
