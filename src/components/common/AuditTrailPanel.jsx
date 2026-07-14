import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import auditTrailService from '../../services/auditTrailService';

const FIELD_LABELS = {
  name: 'Nama Lengkap',
  email: 'Email',
  phone: 'Telepon',
  address: 'Alamat',
  department_id: 'Departemen',
  position_id: 'Jabatan',
  branch_id: 'Cabang',
  join_date: 'Tanggal Masuk',
  status: 'Status',
  salary: 'Gaji',
  leave_type_id: 'Tipe Cuti',
  start_date: 'Tanggal Mulai',
  end_date: 'Tanggal Selesai',
  reason: 'Alasan',
  notes: 'Catatan',
  shift_id: 'Shift',
  schedule_date: 'Tanggal Jadwal',
  is_active: 'Status Aktif',
  employment_type: 'Tipe Kontrak',
};

const label = (field) => FIELD_LABELS[field] || field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const DiffLine = ({ line }) => (
  <div className="flex items-start gap-2 border-b border-gray-100 py-1.5 last:border-0">
    <span className="flex-shrink-0 w-28 text-xs font-medium text-gray-600">{label(line.field)}</span>
    <span className="flex-1 min-w-0">
      {line.old ? (
        <span className="inline-block mr-2 text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded line-through max-w-full truncate">{line.old}</span>
      ) : (
        <span className="inline-block mr-2 text-xs text-gray-400 italic">—</span>
      )}
      {line.new ? (
        <span className="inline-block text-xs text-green-700 bg-green-50 px-1.5 py-0.5 rounded max-w-full truncate">{line.new}</span>
      ) : (
        <span className="inline-block text-xs text-gray-400 italic">—</span>
      )}
    </span>
  </div>
);

const AuditTrailPanel = ({ targetType, targetId }) => {
  const [trail, setTrail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const toggle = async () => {
    if (open) { setOpen(false); return; }
    if (trail) { setOpen(true); return; }
    setLoading(true);
    try {
      const res = await auditTrailService.getTrail(targetType, targetId);
      setTrail(res.data?.data || []);
    } catch { setTrail([]); }
    setLoading(false);
    setOpen(true);
  };

  return (
    <div className="mt-3 border border-gray-200 rounded-lg">
      <button onClick={toggle} className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        Riwayat Perubahan
        {trail && <span className="ml-auto text-xs text-gray-400">{trail.length} entri</span>}
      </button>
      {open && (
        <div className="border-t border-gray-100 px-3 py-2 max-h-64 overflow-y-auto">
          {loading && <p className="text-xs text-gray-400 py-2">Memuat...</p>}
          {!loading && trail?.length === 0 && <p className="text-xs text-gray-400 py-2">Belum ada perubahan tercatat.</p>}
          {!loading && trail?.map((entry) => (
            <div key={entry.id} className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-600">{entry.user_name || 'System'}</span>
                <span className="text-[10px] text-gray-400">{new Date(entry.logged_at).toLocaleString('id-ID')}</span>
                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{entry.action}</span>
              </div>
              {entry.diff_lines?.length > 0 && (
                <div className="ml-2 border-l-2 border-gray-200 pl-2">
                  {entry.diff_lines.map((line, i) => <DiffLine key={i} line={line} />)}
                </div>
              )}
              {!entry.diff_lines?.length && entry.description && (
                <p className="ml-2 text-xs text-gray-500">{entry.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditTrailPanel;
