import { Edit2, Phone, Plus, ShieldCheck, Trash2 } from 'lucide-react'

const relationshipLabels = {
  parent: 'Orang Tua',
  spouse: 'Pasangan',
  sibling: 'Saudara Kandung',
  child: 'Anak',
  relative: 'Kerabat',
  friend: 'Teman',
  other: 'Lainnya',
}

const EmergencyContactList = ({ contacts, onCreate, onEdit, onDelete }) => (
  <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
    <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Kontak Darurat</h2>
        <p className="mt-1 text-sm text-gray-500">Maksimal lima kontak. Satu kontak selalu ditandai sebagai kontak utama.</p>
      </div>
      <button type="button" onClick={onCreate} disabled={contacts.length >= 5} className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
        <Plus className="mr-2 h-4 w-4" />Tambah Kontak
      </button>
    </div>

    {contacts.length === 0 ? (
      <div className="p-8 text-center">
        <Phone className="mx-auto h-10 w-10 text-gray-300" />
        <p className="mt-3 font-medium text-gray-700">Belum ada kontak darurat</p>
        <p className="mt-1 text-sm text-gray-500">Tambahkan setidaknya satu orang yang dapat dihubungi.</p>
      </div>
    ) : (
      <div className="divide-y divide-gray-200">
        {contacts.map((contact) => (
          <article key={contact.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                {contact.is_primary && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                    <ShieldCheck className="mr-1 h-3.5 w-3.5" />Utama
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-600">{relationshipLabels[contact.relationship] || contact.relationship || '-'}</p>
              <div className="mt-2 flex flex-col gap-1 text-sm text-gray-500 sm:flex-row sm:flex-wrap sm:gap-x-4">
                <span>{contact.phone || '-'}</span>
                {contact.alternate_phone && <span>{contact.alternate_phone}</span>}
                {contact.email && <span className="break-all">{contact.email}</span>}
              </div>
              {contact.address && <p className="mt-2 text-sm text-gray-500">{contact.address}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={() => onEdit(contact)} title="Edit kontak" className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-indigo-600">
                <Edit2 className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => onDelete(contact)} title="Hapus kontak" className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    )}
  </section>
)

export default EmergencyContactList
