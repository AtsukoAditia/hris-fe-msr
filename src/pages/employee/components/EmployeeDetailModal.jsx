import { BadgeCheck, Briefcase, Calendar, Camera, Hash, Mail, MapPin, Phone, Shield, User, Users, X } from 'lucide-react'
import { useRef, useState } from 'react'
import employeeService from '../../../services/employeeService'

const EmployeeDetailModal = ({ employee, onClose, onFaceUpdated }) => {
  const [isUploadingFace, setIsUploadingFace] = useState(false)
  const [facePreview, setFacePreview] = useState(employee?.face_image_url || null)
  const [faceError, setFaceError] = useState(null)
  const fileInputRef = useRef(null)

  if (!employee) return null

  const handleFaceFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFaceError(null)
    setFacePreview(URL.createObjectURL(file))
    setIsUploadingFace(true)

    try {
      const response = await employeeService.enrollFace(employee.id, file)
      onFaceUpdated?.(response.data?.data)
    } catch (error) {
      console.error(error)
      setFaceError(error.response?.data?.message || 'Gagal menyimpan foto wajah.')
    } finally {
      setIsUploadingFace(false)
      event.target.value = ''
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">Detail Pegawai</h2>
          <button type="button" onClick={onClose} aria-label="Tutup detail pegawai" className="p-2 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6">
          <div className="mb-6 flex items-center">
            <div className="mr-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-blue-100">
              {facePreview ? <img src={facePreview} alt="Face enrollment" className="h-full w-full object-cover" /> : <User className="h-10 w-10 text-blue-600" />}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{employee.name || '-'}</h3>
              <p className="text-gray-600">{employee.position_name || employee.position || '-'}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{employee.status === 'active' ? 'Aktif' : 'Nonaktif'}</span>
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium capitalize text-blue-800">{employee.role || '-'}</span>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${employee.is_face_registered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{employee.is_face_registered ? 'Face registered' : 'Face belum terdaftar'}</span>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Foto Wajah Absensi</h3>
                <p className="mt-1 text-xs text-gray-500">Format JPG, PNG, atau WEBP maksimal 2MB.</p>
                <p className="mt-1 text-xs text-gray-500">Terdaftar: {employee.face_registered_at ? formatDate(employee.face_registered_at) : '-'}</p>
                {faceError && <p className="mt-2 text-xs text-red-600">{faceError}</p>}
              </div>
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFaceFileChange} />
                <button type="button" disabled={isUploadingFace} onClick={() => fileInputRef.current?.click()} className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
                  <Camera className="mr-2 h-4 w-4" />
                  {isUploadingFace ? 'Menyimpan...' : 'Capture / Upload Wajah'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <InfoItem icon={<Mail />} label="Email" value={employee.email} />
              <InfoItem icon={<Hash />} label="NIK" value={employee.nik} />
              <InfoItem icon={<Phone />} label="Telepon" value={employee.phone} />
              <InfoItem icon={<Calendar />} label="Tanggal Lahir" value={employee.birth_date} />
              <InfoItem icon={<Users />} label="Gender" value={formatGender(employee.gender)} />
              <InfoItem icon={<MapPin />} label="Alamat" value={employee.address} />
            </div>

            <div className="space-y-4">
              <InfoItem icon={<Briefcase />} label="Departemen" value={formatMasterValue(employee.department_name || employee.department, employee.department_code)} />
              <InfoItem icon={<Briefcase />} label="Jabatan" value={formatMasterValue(employee.position_name || employee.position, employee.position_code)} />
              <InfoItem icon={<MapPin />} label="Cabang / Lokasi Kerja" value={formatMasterValue(employee.branch_name, employee.branch_code)} />
              <InfoItem icon={<MapPin />} label="Alamat Cabang" value={employee.branch?.address} />
              <InfoItem icon={<Shield />} label="Area Absensi" value={formatAttendanceArea(employee.branch)} />
              <InfoItem icon={<BadgeCheck />} label="Role" value={employee.role} capitalize />
              <InfoItem icon={<Calendar />} label="Tanggal Bergabung" value={employee.join_date} />
              <InfoItem icon={<Briefcase />} label="Tipe Kerja" value={formatEmploymentType(employee.employment_type)} />
              <InfoItem icon={<Shield />} label="No. Pegawai" value={employee.formatted_employee_number || employee.employee_number} />
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-gray-200 pt-6">
            <button type="button" onClick={onClose} className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200">Tutup</button>
          </div>
        </div>
      </div>
    </div>
  )
}

const InfoItem = ({ icon, label, value, capitalize = false }) => (
  <div className="flex items-start">
    <span className="mr-3 mt-0.5 h-5 w-5 text-gray-400 [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
    <div><p className="text-sm text-gray-500">{label}</p><p className={`text-gray-900 ${capitalize ? 'capitalize' : ''}`}>{value || '-'}</p></div>
  </div>
)

const formatMasterValue = (name, code) => code ? `${name || '-'} (${code})` : name || '-'
const formatAttendanceArea = (branch) => branch ? `${branch.radius_meters || '-'} meter • ${branch.timezone || '-'}` : '-'
const formatDate = (value) => value ? new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'
const formatGender = (value) => ({ male: 'Laki-laki', female: 'Perempuan' })[value] || value || '-'
const formatEmploymentType = (value) => ({ permanent: 'Permanent', contract: 'Contract', internship: 'Internship' })[value] || value || '-'

export default EmployeeDetailModal
