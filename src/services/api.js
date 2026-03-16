const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// HTTP durum koduna ve içeriğe göre Türkçe kullanıcı dostu hata mesajı üretir
function parseErrorMessage(status, body, url) {
    const bodyLower = (body || '').toLowerCase();

    // --- 409 Conflict ---
    if (status === 409) {
        if (url.includes('/employees')) return 'Bu e-posta adresiyle kayıtlı bir çalışan zaten mevcut.';
        if (url.includes('/plans')) return 'Bu ay ve yıl için zaten bir plan mevcut. Önce mevcut planı silin veya farklı bir dönem seçin.';
        if (url.includes('/leaves')) return 'Bu çalışan için seçilen tarihlerde zaten bir izin kaydı mevcut.';
        return 'Bu kayıt zaten sistemde mevcut.';
    }

    // --- 400 Bad Request ---
    if (status === 400) {
        if (bodyLower.includes('employee') && bodyLower.includes('active')) return 'Bu çalışan aktif değil veya sistemde kayıtlı değil.';
        if (bodyLower.includes('date')) return 'Tarih bilgisi hatalı. Lütfen geçerli bir tarih aralığı girin.';
        if (bodyLower.includes('phone')) return 'Telefon numarası formatı hatalı. Örnek: 05XX XXX XX XX';
        if (bodyLower.includes('email')) return 'Geçersiz e-posta adresi formatı.';
        if (url.includes('/leaves')) return 'İzin talebi oluşturulamadı. Tarih aralığını ve çalışan bilgilerini kontrol edin.';
        if (url.includes('/plans/generate')) return 'Plan oluşturulamadı. Sistemde en az bir aktif çalışan olması gerekiyor.';
        return 'Gönderilen bilgiler hatalı veya eksik. Lütfen formu kontrol edin.';
    }

    // --- 404 Not Found ---
    if (status === 404) {
        if (url.includes('/plans')) return 'Plan bulunamadı. Silinmiş veya geçersiz bir plana erişmeye çalışıyor olabilirsiniz.';
        if (url.includes('/employees')) return 'Çalışan bulunamadı.';
        return 'Aradığınız kayıt sistemde bulunamadı.';
    }

    // --- 403 Forbidden ---
    if (status === 403) return 'Bu işlem için yetkiniz bulunmuyor.';

    // --- 422 Unprocessable Entity ---
    if (status === 422) {
        if (url.includes('/plans')) return 'Plan oluşturulamadı: Aktif çalışan bulunamadı veya kısıtlamalar nedeniyle atama yapılamıyor.';
        return 'Girilen veriler işlenemiyor. Lütfen bilgileri kontrol edin.';
    }

    // --- 500 Server Error ---
    if (status >= 500) return 'Sunucu şu an yanıt veremiyor. Lütfen birkaç dakika sonra tekrar deneyin.';

    return 'Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.';
}

async function request(url, options = {}) {
    let res;
    try {
        res = await fetch(`${BASE_URL}${url}`, {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options,
        });
    } catch {
        throw new Error('Sunucuya bağlanılamıyor. İnternet bağlantınızı ve sunucunun çalışır durumda olduğunu kontrol edin.');
    }

    if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        throw new Error(parseErrorMessage(res.status, errorText, url));
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
