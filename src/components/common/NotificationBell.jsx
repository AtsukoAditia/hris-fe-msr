import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notificationService';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await notificationService.unreadCount();
      setUnreadCount(res.data?.unread_count || 0);
    } catch { /* silent */ }
  }, []);

  const fetchItems = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const res = await notificationService.list({ unread_only: false });
      setItems(res.data?.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [open]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30_000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  useEffect(() => {
    const handle = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleRead = async (e, id, link) => {
    e.stopPropagation();
    try { await notificationService.markRead(id); } catch { /* silent */ }
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
    if (link) navigate(link);
  };

  const handleMarkAll = async () => {
    try { await notificationService.markAllRead(); } catch { /* silent */ }
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const diff = (Date.now() - d.getTime()) / 60000;
    if (diff < 1) return 'Baru';
    if (diff < 60) return `${Math.floor(diff)}m lalu`;
    if (diff < 1440) return `${Math.floor(diff / 60)}j lalu`;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
        aria-label="Notifikasi"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-h-96 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
            <span className="text-sm font-semibold text-gray-800">Notifikasi</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAll} className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                <CheckCheck className="h-3 w-3" /> Tandai semua dibaca
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {loading && <p className="py-6 text-center text-sm text-gray-400">Memuat...</p>}
            {!loading && items.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">Tidak ada notifikasi</p>
            )}
            {!loading && items.map((n) => (
              <button
                key={n.id}
                onClick={(e) => handleRead(e, n.id, n.link)}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-gray-50 ${!n.is_read ? 'bg-indigo-50/50' : ''}`}
              >
                <span className="text-lg flex-shrink-0">{n.icon || '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.is_read ? 'text-gray-600' : 'font-semibold text-gray-800'}`}>{n.title}</p>
                  {n.body && <p className="mt-0.5 text-xs text-gray-500 truncate">{n.body}</p>}
                  <p className="mt-1 text-[10px] text-gray-400">{formatTime(n.created_at)}</p>
                </div>
                {!n.is_read && <Check className="h-4 w-4 mt-1 flex-shrink-0 text-gray-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
