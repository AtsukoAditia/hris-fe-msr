import { useEffect, useRef, useState } from 'react'
import { useAttendanceStore } from '../../store/attendanceStore'
import { attendanceService } from '../../services/attendanceService'

const AttendancePage = () => {
  const { attendances, todayAttendance, setAttendances, setTodayAttendance } = useAttendanceStore()
  const [isLoading, setIsLoading] = useState(false)
  const [location, setLocation] = useState(null)
  const webcamRef = useRef(null)

  useEffect(() => {
    fetchAttendances()
    getCurrentLocation()
  }, [])

  const fetchAttendances = async () => {
    try {
      setIsLoading(true)
      const res = await attendanceService.getMyAttendances()
      setAttendances(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error('Location error:', err)
      )
    }
  }

  const handleCheckIn = async () => {
    try {
      setIsLoading(true)
      // TODO: capture selfie from webcam
      const payload = { latitude: location?.lat, longitude: location?.lng }
      const res = await attendanceService.checkIn(payload)
      setTodayAttendance(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckOut = async () => {
    try {
      setIsLoading(true)
      const payload = { latitude: location?.lat, longitude: location?.lng }
      const res = await attendanceService.checkOut(payload)
      setTodayAttendance(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Absensi</h1>

      {/* Check-in/out Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Absen Hari Ini</h2>
        <div className="flex gap-4">
          <button
            onClick={handleCheckIn}
            disabled={isLoading || todayAttendance?.check_in_time}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
          >
            Masuk
          </button>
          <button
            onClick={handleCheckOut}
            disabled={isLoading || !todayAttendance?.check_in_time || todayAttendance?.check_out_time}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
          >
            Keluar
          </button>
        </div>
        {/* TODO: Webcam component, QR scanner */}
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Riwayat Kehadiran</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Masuk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keluar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attendances.map((att) => (
                <tr key={att.id}>
                  <td className="px-6 py-4 text-sm">{att.date}</td>
                  <td className="px-6 py-4 text-sm">{att.check_in_time || '-'}</td>
                  <td className="px-6 py-4 text-sm">{att.check_out_time || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">{att.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AttendancePage
