import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as api from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [employees, setEmployees] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [planHistory, setPlanHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Target period state
    const now = new Date();
    const [targetYear, setTargetYear] = useState(now.getFullYear());
    const [targetMonth, setTargetMonth] = useState(now.getMonth() + 1); // 1-indexed

    const clearError = () => setError(null);
    const clearSuccess = () => setSuccessMsg(null);

    const fetchEmployees = useCallback(async () => {
        try {
            const data = await api.getActiveEmployees();
            setEmployees(data);
        } catch (err) {
            setError(err.message);
        }
    }, []);

    const fetchLeaves = useCallback(async (year, month) => {
        try {
            const y = year || targetYear;
            const m = month || targetMonth;
            const data = await api.getLeaveRequests(y, m);
            setLeaves(data);
        } catch (err) {
            setError(err.message);
        }
    }, [targetYear, targetMonth]);

    const fetchHolidays = useCallback(async (year, month) => {
        try {
            const y = year || targetYear;
            const m = month || targetMonth;
            const data = await api.getHolidaysForMonthApi(y, m);
            setHolidays(data);
        } catch (err) {
            setError(err.message);
        }
    }, [targetYear, targetMonth]);

    const fetchPlanHistory = useCallback(async () => {
        try {
            const data = await api.getAllPlans();
            setPlanHistory(data);
        } catch (err) {
            setError(err.message);
        }
    }, []);

    // Fetch initial data globally
    useEffect(() => {
        fetchPlanHistory();
        fetchEmployees();
    }, [fetchPlanHistory, fetchEmployees]);

    const generatePlan = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.generateShiftPlan(targetYear, targetMonth);
            setCurrentPlan(data);
            setSuccessMsg(`${targetMonth}/${targetYear} dönemi için taslak plan başarıyla oluşturuldu!`);
            // Refresh plan history
            const history = await api.getAllPlans();
            setPlanHistory(history);
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [targetYear, targetMonth]);

    const fetchPlan = useCallback(async (id) => {
        setLoading(true);
        try {
            const data = await api.getShiftPlanById(id);
            setCurrentPlan(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const publishPlan = useCallback(async () => {
        if (!currentPlan) return;
        setLoading(true);
        try {
            await api.publishShiftPlan(currentPlan.planId);
            setCurrentPlan((prev) => ({ ...prev, status: 'PUBLISHED' }));
            setSuccessMsg('Plan başarıyla yayınlandı! Çalışanlara mail gönderildi.');
            // Refresh plan history
            const history = await api.getAllPlans();
            setPlanHistory(history);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [currentPlan]);

    const swapShifts = useCallback(async (firstAssignmentId, secondAssignmentId) => {
        if (!currentPlan) return;
        setLoading(true);
        try {
            await api.swapShifts(currentPlan.planId, firstAssignmentId, secondAssignmentId);
            // Refresh the plan
            const data = await api.getShiftPlanById(currentPlan.planId);
            setCurrentPlan(data);
            setSuccessMsg('Takas işlemi başarıyla tamamlandı!');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [currentPlan]);

    const replacePrimary = useCallback(async (assignmentId) => {
        if (!currentPlan) return;
        setLoading(true);
        try {
            await api.replaceShiftEmployee(currentPlan.planId, assignmentId);
            const data = await api.getShiftPlanById(currentPlan.planId);
            setCurrentPlan(data);
            setSuccessMsg('Asil nöbetçi başarıyla yedekle değiştirildi!');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [currentPlan]);

    const createLeave = useCallback(async (employeeId, startDate, endDate) => {
        try {
            await api.createLeaveRequest({ employeeId, startDate, endDate });
            await fetchLeaves();
            setSuccessMsg('İzin talebi başarıyla kaydedildi!');
        } catch (err) {
            setError(err.message);
        }
    }, [fetchLeaves]);

    const value = {
        employees, leaves, holidays, currentPlan, planHistory,
        loading, error, successMsg,
        targetYear, targetMonth,
        setTargetYear, setTargetMonth,
        setCurrentPlan,
        fetchEmployees, fetchLeaves, fetchHolidays, fetchPlanHistory,
        generatePlan, fetchPlan, publishPlan,
        swapShifts, replacePrimary, createLeave,
        clearError, clearSuccess,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
};
