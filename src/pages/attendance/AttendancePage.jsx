import { useEffect, useMemo, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import QRCode from 'qrcode'
import { Camera, MapPin, RefreshCw, ScanLine, X } from 'lucide-react'
import { useAttendanceStore } from '../../store/attendanceStore'
import { attendanceService } from '../../services/attendanceService'
import { useAuthStore } from '../../store/authStore'

const initialFilters = {
  employee_id: '',
  date_from: '',
  date_to: '',
  status: '',
  search: '',
}

const initialSettingForm = {
  office_name: 'Main Office',
  office_latitude: '',
  office_longitude: '',
  radius_meters: 100,
  is_radius_enabled: false,
  is_qr_enabled: true,
  qr_expiry_minutes: 5,
}

const AttendancePage = () => {
  const { user } = useAuthStore()
  const role = String(user?.role || '').toLowerCase()
  const isAdminLike = ['admin', 'hr', 'manager'].includes(role)
  const canManageAttendance = ['admin', 'hr'].includes(role)
  const checkInPhotoRef = useRef(null)
  const checkOutPhotoRef = useRef(null)

  const {
    todayAttendance,
    attendanceList = [],
    setAttendanceList,
    setTodayAttendance,
  } = useAttendanceStore()

  const [todayShift, setTodayShift] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [settingLoading, setSettingLoading] = useState(false)
  const [qrLoading, setQrLoading] = useState(false)
  const [location, setLocation] = useState(null)
  const [message, setMessage] = useState(null)
  const [filters, setFilters] = useState(initialFilters)
  const [note, setNote] = useState('')
  const [settingForm, setSettingForm] = useState(initialSettingForm)
  const [generatedQr, setGeneratedQr] = useState(null)
  const [qrForm, setQrForm] = useState({ type: 'both', expiry_minutes: 5 })
  const [lastRadiusValidation, setLastRadiusValidation] = useState(null)
  const [scannerMode, setScannerMode] = useState(null)

  useEffect(() => {
    if (isAdminLike) {
      fetchAdminAttendances()
      fetchAttendanceSettings()
      return
    }

    fetchInitialData()
    getCurrentLocation()
  }, [])

  const normalizeAttendanceList = (payload) => {
    if (payload?.data?.data) return payload.data.data
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload)) return payload
    return []
  }

  const normalizeTodayPayload = (payload) => {
    if (payload && Object.prototype.hasOwnProperty.call(payload, 'attendance')) {
      return {
        attendance: payload.attendance || null,
        shift: payload.shift || null,
      }
    }

    return {
      attendance: payload || null,
      shift: payload?.shift || null,
    }
  }

  const fetchInitialData = async () => {
    setIsLoading(true)
    await Promise.all([fetchAttendances(), fetchTodayAttendance()])
    setIsLoading(false)
  }

  const shouldSuppressAttendanceError = (err) => {
    const status = err?.response?.status
    return isAdminLike && [404, 403, 422].includes(status)
  }

  const fetchAttendances = async () => {
    try {
      const res = await attendanceService.getMyAttendances()
      const list = normalizeAttendanceList(res.data)
      setAttendanceList(list)
    } catch (err) {
      console.error(err)
      setAttendanceList([])

      if (!shouldSuppressAttendanceError(err)) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal memuat riwayat absensi.' })
      }
    }
  }

  const fetchTodayAttendance = async () => {
    try {
      const res = await attendanceService.getToday()
      const normalized = normalizeTodayPayload(res.data?.data || null)
      setTodayAttendance(normalized.attendance)
      setTodayShift(normalized.shift)
    } catch (err) {
      console.error(err)
      setTodayAttendance(null)
      setTodayShift(null)

      if (!shouldSuppressAttendanceError(err)) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal memuat absensi hari ini.' })
      }
    }
  }

  const fetchAdminAttendances = async () => {
    try {
      setIsLoading(true)
      setMessage(null)

      const params = {}
      if (filters.employee_id) params.employee_id = filters.employee_id
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to
      if (filters.status) params.status = filters.status

      const res = await attendanceService.getAll(params)
      const list = normalizeAttendanceList(res.data)
      setAttendanceList(list)
    } catch (err) {
      console.error(err)
      setAttendanceList([])
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal memuat daftar absensi karyawan.' })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAttendanceSettings = async () => {
    try {
      setSettingLoading(true)
      const res = await attendanceService.getSettings()
      const data = res.data?.data || initialSettingForm
      setSettingForm({
        office_name: data.office_name || 'Main Office',
        office_latitude: data.office_latitude || '',
        office_longitude: data.office_longitude || '',
        radius_meters: data.radius_meters ?? 100,
        is_radius_enabled: Boolean(data.is_radius_enabled),
        is_qr_enabled: Boolean(data.is_qr_enabled),
        qr_expiry_minutes: data.qr_expiry_minutes ?? 5,
      })
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal memuat setting absensi.' })
    } finally {
      setSettingLoading(false)
    }
  }

  const handleUpdateSettings = async () => {
    try {
      setSettingLoading(true)
      setMessage(null)
      const payload = {
        office_name: settingForm.office_name,
        office_latitude: Number(settingForm.office_latitude),
        office_longitude: Number(settingForm.office_longitude),
        radius_meters: Number(settingForm.radius_meters),
        is_radius_enabled: Boolean(settingForm.is_radius_enabled),
        is_qr_enabled: Boolean(settingForm.is_qr_enabled),
        qr_expiry_minutes: Number(settingForm.qr_expiry_minutes),
      }
      const res = await attendanceService.updateSettings(payload)
      setMessage({ type: 'success', text: res.data?.message || 'Setting absensi berhasil diperbarui.' })
      await fetchAttendanceSettings()
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: getErrorMessage(err, 'Gagal memperbarui setting absensi.') })
    } finally {
      setSettingLoading(false)
    }
  }

  const handleGenerateQr = async () => {
    try {
      setQrLoading(true)
      setMessage(null)
      const res = await attendanceService.generateQr({
        type: qrForm.type,
        expiry_minutes: Number(qrForm.expiry_minutes),
      })
      setGeneratedQr(res.data?.data || null)
      setMessage({ type: 'success', text: res.data?.message || 'QR attendance berhasil dibuat.' })
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: getErrorMessage(err, 'Gagal membuat QR attendance.') })
    } finally {
      setQrLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Browser tidak mendukung geolocation.' })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        console.error('Location error:', err)
        setMessage({ type: 'error', text: 'Gagal mengambil lokasi. Izinkan akses lokasi untuk absensi.' })
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  const useCurrentLocationForOffice = () => {
    if (!location) {
      setMessage({ type: 'error', text: 'Lokasi browser belum tersedia. Klik Refresh Lokasi dulu.' })
      return
    }

    setSettingForm((prev) => ({
      ...prev,
      office_latitude: location.lat,
      office_longitude: location.lng,
    }))
  }

  const buildAttendancePayload = (file, qrCode = '') => ({
    latitude: location?.lat,
    longitude: location?.lng,
    note,
    photo: file || null,
    qr_code: qrCode || undefined,
  })

  const handleAttendanceSuccess = async (res, fallbackMessage) => {
    const data = res.data?.data || null
    setTodayAttendance(data)
    setLastRadiusValidation(data?.radius_validation || null)
    setMessage({ type: 'success', text: res.data?.message || fallbackMessage })
    setNote('')
    await fetchAttendances()
  }

  const handleCheckIn = async (file = null) => {
    if (!file) {
      setMessage({ type: 'error', text: 'Absensi utama wajib menggunakan foto.' })
      return
    }

    try {
      setActionLoading(true)
      setMessage(null)
      const res = await attendanceService.checkIn(buildAttendancePayload(file))
      await handleAttendanceSuccess(res, 'Check-in berhasil.')
    } catch (err) {
      console.error(err)
      if (!shouldSuppressAttendanceError(err)) {
        setMessage({ type: 'error', text: getErrorMessage(err, 'Check-in gagal.') })
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckOut = async (file = null) => {
    if (!file) {
      setMessage({ type: 'error', text: 'Absensi utama wajib menggunakan foto.' })
      return
    }

    try {
      setActionLoading(true)
      setMessage(null)
      const res = await attendanceService.checkOut(buildAttendancePayload(file))
      await handleAttendanceSuccess(res, 'Check-out berhasil.')
    } catch (err) {
      console.error(err)
      if (!shouldSuppressAttendanceError(err)) {
        setMessage({ type: 'error', text: getErrorMessage(err, 'Check-out gagal.') })
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleQrScan = async (decodedText) => {
    const mode = scannerMode
    setScannerMode(null)

    if (!location) {
      setMessage({ type: 'error', text: 'Lokasi belum tersedia. Klik Refresh Lokasi dulu, lalu scan ulang QR.' })
      return
    }

    try {
      setActionLoading(true)
      setMessage(null)
      const payload = buildAttendancePayload(null, decodedText)
      const res = mode === 'check_out'
        ? await attendanceService.checkOutQr(payload)
        : await attendanceService.checkInQr(payload)

      await handleAttendanceSuccess(res, mode === 'check_out' ? 'Check-out QR berhasil.' : 'Check-in QR berhasil.')
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: getErrorMessage(err, 'Absensi QR gagal.') })
    } finally {
      setActionLoading(false)
    }
  }

  const handlePhotoAction = async (event, type) => {
    const file = event.target.files?.[0] || null
    event.target.value = ''

    if (!file || file.size === 0) {
      setMessage({ type: 'error', text: 'Foto dari kamera tidak terbaca. Coba ambil ulang foto atau gunakan browser Chrome.' })
      return
    }

    try {
      setActionLoading(true)
      setMessage(null)
      const normalizedFile = await normalizeCameraImage(file)

      if (type === 'check_in') {
        await handleCheckIn(normalizedFile)
        return
      }

      await handleCheckOut(normalizedFile)
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'Foto gagal diproses. Coba ambil ulang dengan kamera atau pilih gambar dari galeri.' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettingForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleApplyFilters = () => {
    fetchAdminAttendances()
  }

  const handleResetFilters = () => {
    setFilters(initialFilters)
    setTimeout(() => fetchAdminAttendances(), 0)
  }

  const canCheckIn = useMemo(() => !todayAttendance?.check_in_time, [todayAttendance])
  const canCheckOut = useMemo(() => !!todayAttendance?.check_in_time && !todayAttendance?.check_out_time, [todayAttendance])

  const filteredAdminAttendanceList = useMemo(() => {
    if (!isAdminLike) return attendanceList
    if (!filters.search) return attendanceList

    const keyword = filters.search.toLowerCase()

    return attendanceList.filter((attendance) => {
      const employeeName = attendance.employee?.name || ''
      const department = attendance.employee?.department || ''
      const position = attendance.employee?.position || ''
      const status = attendance.status || ''
      const date = attendance.attendance_date || ''

      return [employeeName, department, position, status, date]
        .some((value) => String(value).toLowerCase().includes(keyword))
    })
  }, [attendanceList, filters.search, isAdminLike])

  if (isAdminLike) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Absensi Karyawan</h1>
          <p className="text-gray-600 mt-1">Monitor absensi, lokasi, radius kantor, dan QR scanner attendance.</p>
        </div>

        {message && <Alert message={message} />}

        <AttendanceSettingPanel
          settingForm={settingForm}
          onChange={handleSettingChange}
          onSave={handleUpdateSettings}
          onUseCurrentLocation={useCurrentLocationForOffice}
          isLoading={settingLoading}
          canManage={canManageAttendance}
          currentLocation={location}
          onRefreshLocation={getCurrentLocation}
        />

        {canManageAttendance && (
          <QrGeneratorPanel
            qrForm={qrForm}
            setQrForm={setQrForm}
            generatedQr={generatedQr}
            onGenerate={handleGenerateQr}
            isLoading={qrLoading}
          />
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Filter Absensi</h2>
            <p className="text-sm text-gray-500 mt-1">Filter berdasarkan employee ID, rentang tanggal, status, dan pencarian cepat.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <Input label="Employee ID" name="employee_id" value={filters.employee_id} onChange={handleFilterChange} placeholder="Contoh: 1" />
            <Input label="Tanggal Mulai" type="date" name="date_from" value={filters.date_from} onChange={handleFilterChange} />
            <Input label="Tanggal Akhir" type="date" name="date_to" value={filters.date_to} onChange={handleFilterChange} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="">Semua status</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
                <option value="leave">Leave</option>
              </select>
            </div>
            <Input label="Pencarian Cepat" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Nama, departemen, jabatan" />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleApplyFilters} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Terapkan Filter</button>
            <button onClick={handleResetFilters} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Reset</button>
          </div>
        </div>

        <AttendanceTable rows={filteredAdminAttendanceList} isLoading={isLoading} showEmployee />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Absensi</h1>
        <p className="text-gray-600 mt-1">Absensi utama pakai foto + lokasi. QR scanner digunakan sebagai opsi cadangan di radius kantor.</p>
      </div>

      {message && <Alert message={message} />}

      {scannerMode && (
        <QrScannerModal
          mode={scannerMode}
          onScan={handleQrScan}
          onClose={() => setScannerMode(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Absensi Hari Ini</h2>
              <p className="text-sm text-gray-500 mt-1">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <button onClick={getCurrentLocation} className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh Lokasi
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <InfoCard label="Shift Hari Ini" value={todayShift?.name || todayAttendance?.shift?.name || '-'} subValue={formatShiftTime(todayShift || todayAttendance?.shift)} />
            <InfoCard label="Check In" value={formatTime(todayAttendance?.check_in_time)} subValue={formatStatus(todayAttendance?.status)} />
            <InfoCard label="Check Out" value={formatTime(todayAttendance?.check_out_time)} subValue={todayAttendance?.overtime_minutes ? `Overtime ${todayAttendance.overtime_minutes} menit` : '-'} />
          </div>

          <RadiusResult validation={lastRadiusValidation} attendance={todayAttendance} />

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Catatan opsional</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" placeholder="Contoh: kerja dari kantor / izin terlambat karena..." />
          </div>

          <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-green-900">Absensi Utama</h3>
              <p className="text-sm text-green-700 mt-1">Wajib foto selfie dan lokasi dalam radius kantor.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input ref={checkInPhotoRef} type="file" accept="image/jpeg,image/png,image/webp,image/*" capture="user" className="hidden" onChange={(e) => handlePhotoAction(e, 'check_in')} />
              <input ref={checkOutPhotoRef} type="file" accept="image/jpeg,image/png,image/webp,image/*" capture="user" className="hidden" onChange={(e) => handlePhotoAction(e, 'check_out')} />

              <button disabled={!canCheckIn || actionLoading} onClick={() => checkInPhotoRef.current?.click()} className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                <Camera className="w-4 h-4 mr-2" /> Check In + Foto
              </button>
              <button disabled={!canCheckOut || actionLoading} onClick={() => checkOutPhotoRef.current?.click()} className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
                <Camera className="w-4 h-4 mr-2" /> Check Out + Foto
              </button>
            </div>
          </div>

          <QrAttendanceBox
            canCheckIn={canCheckIn}
            canCheckOut={canCheckOut}
            actionLoading={actionLoading}
            onOpenScanner={setScannerMode}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Lokasi</h2>
          <p className="text-sm text-gray-500 mt-1">Koordinat dikirim saat check-in/out.</p>
          <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700 space-y-2">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Latitude: {location?.lat ?? '-'}</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Longitude: {location?.lng ?? '-'}</div>
          </div>
        </div>
      </div>

      <AttendanceTable rows={attendanceList} isLoading={isLoading} />
    </div>
  )
}

const AttendanceSettingPanel = ({ settingForm, onChange, onSave, onUseCurrentLocation, isLoading, canManage, currentLocation, onRefreshLocation }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Setting Lokasi & Radius</h2>
        <p className="text-sm text-gray-500 mt-1">Atur koordinat kantor dan radius validasi absensi.</p>
      </div>
      <button onClick={onRefreshLocation} className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
        <RefreshCw className="w-4 h-4 mr-2" /> Refresh Lokasi Browser
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Input label="Nama Kantor" name="office_name" value={settingForm.office_name} onChange={onChange} disabled={!canManage} />
      <Input label="Latitude Kantor" name="office_latitude" value={settingForm.office_latitude} onChange={onChange} disabled={!canManage} />
      <Input label="Longitude Kantor" name="office_longitude" value={settingForm.office_longitude} onChange={onChange} disabled={!canManage} />
      <Input label="Radius Meter" type="number" name="radius_meters" value={settingForm.radius_meters} onChange={onChange} disabled={!canManage} />
      <Input label="QR Expiry Menit" type="number" name="qr_expiry_minutes" value={settingForm.qr_expiry_minutes} onChange={onChange} disabled={!canManage} />
      <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
        <p>Lokasi browser:</p>
        <p>Lat: {currentLocation?.lat ?? '-'}</p>
        <p>Lng: {currentLocation?.lng ?? '-'}</p>
      </div>
    </div>

    <div className="flex flex-wrap gap-4 text-sm text-gray-700">
      <label className="inline-flex items-center gap-2">
        <input type="checkbox" name="is_radius_enabled" checked={settingForm.is_radius_enabled} onChange={onChange} disabled={!canManage} />
        Aktifkan radius
      </label>
      <label className="inline-flex items-center gap-2">
        <input type="checkbox" name="is_qr_enabled" checked={settingForm.is_qr_enabled} onChange={onChange} disabled={!canManage} />
        Aktifkan QR
      </label>
    </div>

    {canManage ? (
      <div className="flex flex-wrap gap-3">
        <button onClick={onUseCurrentLocation} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Pakai Lokasi Browser</button>
        <button onClick={onSave} disabled={isLoading} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
          {isLoading ? 'Menyimpan...' : 'Simpan Setting'}
        </button>
      </div>
    ) : (
      <p className="text-sm text-gray-500">Role manager hanya bisa melihat setting.</p>
    )}
  </div>
)

const QrGeneratorPanel = ({ qrForm, setQrForm, generatedQr, onGenerate, isLoading }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Generate QR Scanner Attendance</h2>
      <p className="text-sm text-gray-500 mt-1">QR ini ditempel di kantor dan discan employee saat fallback attendance.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipe QR</label>
        <select value={qrForm.type} onChange={(e) => setQrForm((prev) => ({ ...prev, type: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          <option value="both">Check In & Check Out</option>
          <option value="check_in">Check In</option>
          <option value="check_out">Check Out</option>
        </select>
      </div>
      <Input label="Expired Menit" type="number" value={qrForm.expiry_minutes} onChange={(e) => setQrForm((prev) => ({ ...prev, expiry_minutes: e.target.value }))} />
      <div className="flex items-end">
        <button onClick={onGenerate} disabled={isLoading} className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
          {isLoading ? 'Membuat...' : 'Generate QR'}
        </button>
      </div>
    </div>

    {generatedQr && <QrCodePreview data={generatedQr} />}
  </div>
)

const QrCodePreview = ({ data }) => {
  const [imageUrl, setImageUrl] = useState('')
  const qrValue = data?.qr_payload || data?.qr_code || ''

  useEffect(() => {
    let active = true

    if (!qrValue) {
      setImageUrl('')
      return
    }

    QRCode.toDataURL(qrValue, { width: 280, margin: 2 })
      .then((url) => {
        if (active) setImageUrl(url)
      })
      .catch(() => setImageUrl(''))

    return () => {
      active = false
    }
  }, [qrValue])

  return (
    <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3">
      <div className="flex flex-col md:flex-row gap-4 md:items-center">
        <div className="bg-white border border-gray-200 rounded-xl p-3 w-fit">
          {imageUrl ? <img src={imageUrl} alt="QR Attendance" className="w-64 h-64" /> : <div className="w-64 h-64 grid place-items-center text-sm text-gray-400">Membuat QR...</div>}
        </div>
        <div className="space-y-2 text-sm text-gray-700">
          <p><span className="font-medium">Tipe:</span> {data.type}</p>
          <p><span className="font-medium">Expired:</span> {data.expires_at}</p>
          <p className="text-gray-500">Employee cukup scan QR ini dari menu Absensi. Sistem tetap mengecek radius kantor.</p>
        </div>
      </div>
      <textarea readOnly value={qrValue} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono bg-white" />
    </div>
  )
}

const QrAttendanceBox = ({ canCheckIn, canCheckOut, actionLoading, onOpenScanner }) => (
  <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 space-y-3">
    <div>
      <h3 className="font-semibold text-indigo-900">Absensi Cadangan via QR Scanner</h3>
      <p className="text-sm text-indigo-700 mt-1">Dipakai kalau kamera selfie/foto default bermasalah. QR tetap wajib discan dalam radius kantor.</p>
    </div>
    <div className="flex flex-col sm:flex-row gap-3">
      <button disabled={!canCheckIn || actionLoading} onClick={() => onOpenScanner('check_in')} className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
        <ScanLine className="w-4 h-4 mr-2" /> Scan QR Check In
      </button>
      <button disabled={!canCheckOut || actionLoading} onClick={() => onOpenScanner('check_out')} className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
        <ScanLine className="w-4 h-4 mr-2" /> Scan QR Check Out
      </button>
    </div>
  </div>
)

const QrScannerModal = ({ mode, onScan, onClose }) => {
  const scannerId = 'attendance-qr-scanner'

  useEffect(() => {
    let stopped = false
    const scanner = new Html5QrcodeScanner(scannerId, {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
    }, false)

    scanner.render(
      (decodedText) => {
        if (stopped) return
        stopped = true
        scanner.clear().catch(() => {})
        onScan(decodedText)
      },
      () => {}
    )

    return () => {
      stopped = true
      scanner.clear().catch(() => {})
    }
  }, [mode])

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Scan QR {mode === 'check_out' ? 'Check Out' : 'Check In'}</h2>
            <p className="text-sm text-gray-500 mt-1">Arahkan kamera ke QR yang ditempel di kantor.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div id={scannerId} className="rounded-xl overflow-hidden" />
      </div>
    </div>
  )
}

const RadiusResult = ({ validation, attendance }) => {
  const distance = validation?.distance_meters ?? attendance?.check_in_distance_meters ?? attendance?.check_out_distance_meters
  const radius = validation?.radius_meters
  const within = validation?.allowed ?? attendance?.is_check_in_within_radius ?? attendance?.is_check_out_within_radius

  if (distance === null || distance === undefined) return null

  return (
    <div className={`mt-4 rounded-xl p-4 text-sm ${within ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
      Jarak dari kantor: <span className="font-semibold">{distance} meter</span>{radius ? ` / radius ${radius} meter` : ''}
    </div>
  )
}

const Alert = ({ message }) => (
  <div className={`rounded-xl px-4 py-3 text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
    {message.text}
  </div>
)

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input {...props} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500" />
  </div>
)

const InfoCard = ({ label, value, subValue }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-xl font-bold text-gray-900 mt-1">{value || '-'}</p>
    <p className="text-xs text-gray-500 mt-1">{subValue || '-'}</p>
  </div>
)

const AttendanceTable = ({ rows, isLoading, showEmployee = false }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900">Riwayat Absensi</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {showEmployee && <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Karyawan</th>}
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Shift</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check In</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check Out</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Metode</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Radius</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Late</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Evidence</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoading ? (
            <tr><td colSpan={showEmployee ? 10 : 9} className="px-6 py-8 text-center text-gray-500">Memuat data absensi...</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={showEmployee ? 10 : 9} className="px-6 py-8 text-center text-gray-500">Belum ada data absensi.</td></tr>
          ) : rows.map((attendance) => (
            <tr key={attendance.id} className="hover:bg-gray-50">
              {showEmployee && <td className="px-6 py-4 text-sm text-gray-700">{attendance.employee?.name || '-'}</td>}
              <td className="px-6 py-4 text-sm text-gray-700">{attendance.attendance_date || '-'}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{attendance.shift?.name || '-'}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{formatTime(attendance.check_in_time)}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{formatTime(attendance.check_out_time)}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{formatMethodCell(attendance)}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{formatRadiusCell(attendance)}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{attendance.late_minutes ?? 0} menit</td>
              <td className="px-6 py-4 text-sm text-gray-700">
                <div className="flex gap-2">
                  {attendance.check_in_photo_url && <a className="text-indigo-600 hover:underline" href={attendance.check_in_photo_url} target="_blank" rel="noreferrer">IN</a>}
                  {attendance.check_out_photo_url && <a className="text-indigo-600 hover:underline" href={attendance.check_out_photo_url} target="_blank" rel="noreferrer">OUT</a>}
                  {!attendance.check_in_photo_url && !attendance.check_out_photo_url && '-'}
                </div>
              </td>
              <td className="px-6 py-4"><StatusBadge status={attendance.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const StatusBadge = ({ status }) => {
  const map = {
    present: 'bg-green-100 text-green-700',
    late: 'bg-yellow-100 text-yellow-700',
    absent: 'bg-red-100 text-red-700',
    leave: 'bg-blue-100 text-blue-700',
  }

  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-700'}`}>{status || '-'}</span>
}

const getErrorMessage = (err, fallback) => {
  const errors = err.response?.data?.errors
  if (errors) {
    const firstKey = Object.keys(errors)[0]
    const firstMessage = errors[firstKey]?.[0]
    if (firstMessage) return firstMessage
  }

  return err.response?.data?.message || fallback
}

const normalizeCameraImage = async (file) => {
  if (!file.type.startsWith('image/')) {
    throw new Error('File bukan gambar')
  }

  const imageUrl = URL.createObjectURL(file)

  try {
    const image = await loadImage(imageUrl)
    const maxSize = 1280
    const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
    const width = Math.round(image.width * scale)
    const height = Math.round(image.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0, width, height)

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82))

    if (!blob) {
      throw new Error('Gagal membuat blob gambar')
    }

    return new File([blob], `attendance-${Date.now()}.jpg`, { type: 'image/jpeg' })
  } finally {
    URL.revokeObjectURL(imageUrl)
  }
}

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image()
  image.onload = () => resolve(image)
  image.onerror = reject
  image.src = src
})

const formatTime = (value) => {
  if (!value) return '-'
  return String(value).slice(0, 5)
}

const formatShiftTime = (shift) => {
  if (!shift?.start_time || !shift?.end_time) return '-'
  return `${formatTime(shift.start_time)} - ${formatTime(shift.end_time)}${shift.is_overnight ? ' (overnight)' : ''}`
}

const formatStatus = (status) => {
  const map = {
    present: 'Hadir',
    late: 'Terlambat',
    absent: 'Tidak hadir',
    leave: 'Cuti',
  }

  return map[status] || 'Belum check-in'
}

const formatRadiusCell = (attendance) => {
  const inDistance = attendance.check_in_distance_meters
  const outDistance = attendance.check_out_distance_meters

  if (inDistance === null && outDistance === null) return '-'

  const parts = []
  if (inDistance !== null && inDistance !== undefined) parts.push(`IN ${inDistance}m`)
  if (outDistance !== null && outDistance !== undefined) parts.push(`OUT ${outDistance}m`)
  return parts.join(' / ')
}

const formatMethodCell = (attendance) => {
  const methods = []
  if (attendance.check_in_method) methods.push(`IN ${formatMethod(attendance.check_in_method)}`)
  if (attendance.check_out_method) methods.push(`OUT ${formatMethod(attendance.check_out_method)}`)
  return methods.length ? methods.join(' / ') : '-'
}

const formatMethod = (method) => {
  if (method === 'default_photo_location') return 'Foto+GPS'
  if (method === 'qr_radius_fallback') return 'QR+GPS'
  return method
}

export default AttendancePage
