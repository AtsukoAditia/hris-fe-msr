import { create } from 'zustand'

export const useAttendanceStore = create((set) => ({
  todayAttendance: null,
  attendanceList: [],
  isLoading: false,
  checkinStatus: null, // 'checkin' | 'checkout' | null

  setTodayAttendance: (data) => set({ todayAttendance: data }),
  setAttendanceList: (list) => set({ attendanceList: list }),
  setCheckinStatus: (status) => set({ checkinStatus: status }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ todayAttendance: null, checkinStatus: null }),
}))

