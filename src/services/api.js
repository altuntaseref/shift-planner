const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

async function request(url, options = {}) {
    const res = await fetch(`${BASE_URL}${url}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error ${res.status}: ${errorText}`);
    }
    if (res.status === 204 || res.headers.get('content-length') === '0') return null;
    return res.json();
}

// ─── Employee API ────────────────────────────────────
export const getActiveEmployees = () => request('/employees');

export const createEmployee = (data) =>
    request('/employees', { method: 'POST', body: JSON.stringify(data) });

export const deleteEmployee = (id) =>
    request(`/employees/${id}?isActive=false`, { method: 'PATCH' });

// ─── Leave Request API ───────────────────────────────
export const getLeaveRequests = (year, month) => {
    if (year && month) return request(`/leaves?year=${year}&month=${month}`);
    return request('/leaves/all');
};

export const createLeaveRequest = (data) =>
    request('/leaves', { method: 'POST', body: JSON.stringify(data) });

// ─── Holiday API ─────────────────────────────────────
export const insertHolidays = (data) =>
    request('/holidays', { method: 'POST', body: JSON.stringify(data) });

export const getHolidaysForMonthApi = (year, month) =>
    request(`/holidays?year=${year}&month=${month}`);

// ─── Shift Plan API ──────────────────────────────────
export const getAllPlans = () => request('/plans');

export const generateShiftPlan = (periodYear, periodMonth) =>
    request('/plans/generate', {
        method: 'POST',
        body: JSON.stringify({ periodYear, periodMonth }),
    });

export const getShiftPlanById = (id) => request(`/plans/${id}`);

export const publishShiftPlan = (id) =>
    request(`/plans/${id}/publish`, { method: 'PATCH' });

export const swapShifts = (planId, firstAssignmentId, secondAssignmentId) =>
    request(`/plans/${planId}/swap`, {
        method: 'POST',
        body: JSON.stringify({ firstAssignmentId, secondAssignmentId }),
    });

export const replaceShiftEmployee = (planId, assignmentId) =>
    request(`/plans/${planId}/replace/${assignmentId}`, { method: 'POST' });
