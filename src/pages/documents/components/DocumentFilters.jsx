import { RotateCcw, Search } from 'lucide-react'

const DocumentFilters = ({ filters, categories, onChange, onReset }) => (
  <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <label className="relative xl:col-span-2">
        <span className="sr-only">Cari dokumen</span>
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          name="search"
          value={filters.search}
          onChange={onChange}
          className="form-input pl-9"
          placeholder="Cari judul, file, atau deskripsi"
        />
      </label>
      <select name="category" aria-label="Filter kategori" value={filters.category} onChange={onChange} className="form-input">
        <option value="">Semua Kategori</option>
        {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
      </select>
      <select name="status" aria-label="Filter status" value={filters.status} onChange={onChange} className="form-input">
        <option value="">Semua Status</option>
        <option value="valid">Berlaku</option>
        <option value="expiring">Segera Kedaluwarsa</option>
        <option value="expired">Kedaluwarsa</option>
        <option value="without_expiry">Tanpa Kedaluwarsa</option>
      </select>
      <div className="flex gap-2">
        <select name="sort" aria-label="Urutkan dokumen" value={filters.sort} onChange={onChange} className="form-input min-w-0 flex-1">
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
          <option value="expiry_asc">Expiry Terdekat</option>
          <option value="expiry_desc">Expiry Terjauh</option>
        </select>
        <button type="button" onClick={onReset} title="Reset filter" className="rounded-lg border border-gray-200 p-2.5 text-gray-500 hover:bg-gray-50">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  </section>
)

export default DocumentFilters
