import { useCallback } from 'react';
import { useAttendanceStore } from '../store/attendanceStore';
import attendanceService from '../services/attendanceService';

export const useAttendance = () => {
  const {
    attendances,
    todayAttendance,
    isLoading,
    error,
    setAttendances,
    setTodayAttendance,
    setLoading,
    setError,
  } = useAttendanceStore();

  const fetchAttendances = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await attendanceService.getAll(params);
      setAttendances(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attendances');
    } finally {
      setLoading(false);
    }
  }, [setAttendances, setLoading, setError]);

  const fetchTodayAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getToday();
      setTodayAttendance(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch today attendance');
    } finally {
      setLoading(false);
    }
  }, [setTodayAttendance, setLoading, setError]);

  const checkIn = useCallback(async (data) => {
    try {
      setLoading(true);
      const response = await attendanceService.checkIn(data);
      setTodayAttendance(response.data.data);
      return { success: true, data: response.data.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Check-in failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [setTodayAttendance, setLoading, setError]);

  const checkOut = useCallback(async (data) => {
    try {
      setLoading(true);
      const response = await attendanceService.checkOut(data);
      setTodayAttendance(response.data.data);
      return { success: true, data: response.data.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Check-out failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [setTodayAttendance, setLoading, setError]);

  return {
    attendances,
    todayAttendance,
    isLoading,
    error,
    fetchAttendances,
    fetchTodayAttendance,
    checkIn,
    checkOut,
  };
};

export default useAttendance;
