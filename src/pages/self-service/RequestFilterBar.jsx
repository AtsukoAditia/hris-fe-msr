const RequestFilterBar = ({ filters, includeSearch = false, onChange, onReset }) => (
  <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
    <div className="grid gap-4 md:grid-cols-5">
      {includeSearch && (
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-gray-700">Cari</span>
          <input name="search" value={filters.search} onChange={onChange} className="form-input" placeholder="Nama atau email" />
        </label>
      )}
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-gray-700">Status</span>
        <select name="status" value={filters.status} onChange={onChange} className="form-input">
          <option value="">Semua</option>
          <option value="pending">Menunggu Review</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-gray-700">Dari</span>
        <input type="date" name="date_from" value={filters.date_from} onChange={onChange} className="form-input" />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-gray-700">Sampai</span>
        <input type="date" name="date_to" value={filters.date_to} onChange={onChange} className="form-input" />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-gray-700">Urutan</span>
        <select name="sort" value={filters.sort} onChange={onChange} className="form-input">
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
        </select>
      </label>
    </div>
    <div className="mt-4 flex justify-end">
      <button type="button" onClick={onReset} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Reset</button>
    </div>
  </section>
)

export default RequestFilterBar
