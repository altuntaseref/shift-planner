// ═══════════════════════════════════════════════════════
//  OCEAN Shift Planner — Mock Data
//  Backend çalışıyormuş gibi gerçekçi veriler
// ═══════════════════════════════════════════════════════

let _id = 1;
const uuid = () => `mock-${String(_id++).padStart(4, '0')}-${Date.now().toString(36)}`;

// ─── Çalışanlar ──────────────────────────────────────
export const EMPLOYEES = [
    { id: 'emp-001', fullName: 'Ahmet Yılmaz', email: 'ahmet.yilmaz@ocean.com', phone: '+90 532 111 2233', active: true },
    { id: 'emp-002', fullName: 'Ayşe Demir', email: 'ayse.demir@ocean.com', phone: '+90 535 222 3344', active: true },
    { id: 'emp-003', fullName: 'Mehmet Kaya', email: 'mehmet.kaya@ocean.com', phone: '+90 542 333 4455', active: true },
    { id: 'emp-004', fullName: 'Fatma Şahin', email: 'fatma.sahin@ocean.com', phone: '+90 553 444 5566', active: true },
    { id: 'emp-005', fullName: 'Can Özdemir', email: 'can.ozdemir@ocean.com', phone: '+90 544 555 6677', active: true },
    { id: 'emp-006', fullName: 'Zeynep Aksoy', email: 'zeynep.aksoy@ocean.com', phone: '+90 536 666 7788', active: true },
];

// ─── Türkiye Resmi Tatilleri 2026 ────────────────────
export const HOLIDAYS_2026 = [
    { date: '2026-01-01', name: 'Yılbaşı' },
    { date: '2026-04-23', name: 'Ulusal Egemenlik ve Çocuk Bayramı' },
    { date: '2026-05-01', name: 'Emek ve Dayanışma Günü' },
    {
        date: '2026-05-19', name: "Atatürk'ü Anma, Gençlik ve Spor Bayramı"
    },
    // Ramazan Bayramı (2026 tahmini)
    { date: '2026-03-20', name: 'Ramazan Bayramı 1. Gün' },
    { date: '2026-03-21', name: 'Ramazan Bayramı 2. Gün' },
    { date: '2026-03-22', name: 'Ramazan Bayramı 3. Gün' },
    // Kurban Bayramı (2026 tahmini)
    { date: '2026-05-27', name: 'Kurban Bayramı 1. Gün' },
    { date: '2026-05-28', name: 'Kurban Bayramı 2. Gün' },
    { date: '2026-05-29', name: 'Kurban Bayramı 3. Gün' },
    { date: '2026-05-30', name: 'Kurban Bayramı 4. Gün' },
    { date: '2026-07-15', name: '15 Temmuz Demokrasi ve Millî Birlik Günü' },
    { date: '2026-08-30', name: 'Zafer Bayramı' },
    { date: '2026-10-29', name: 'Cumhuriyet Bayramı' },
];

// ─── İzin Talepleri ──────────────────────────────────
export let LEAVE_REQUESTS = [
    { id: 'leave-001', employeeId: 'emp-002', employeeFullName: 'Ayşe Demir', startDate: '2026-03-09', endDate: '2026-03-13' },
    { id: 'leave-002', employeeId: 'emp-006', employeeFullName: 'Zeynep Aksoy', startDate: '2026-03-23', endDate: '2026-03-27' },
    { id: 'leave-003', employeeId: 'emp-003', employeeFullName: 'Mehmet Kaya', startDate: '2026-04-20', endDate: '2026-04-24' },
    { id: 'leave-004', employeeId: 'emp-001', employeeFullName: 'Ahmet Yılmaz', startDate: '2026-05-04', endDate: '2026-05-08' },
];

// ─── Çalışan İstatistikleri (Kara Kaplı Defter) ─────
export const EMPLOYEE_STATS = {
    'emp-001': { totalShifts: 42, weekdayCount: 28, weekendCount: 10, holidayCount: 4 },
    'emp-002': { totalShifts: 40, weekdayCount: 27, weekendCount: 9, holidayCount: 4 },
    'emp-003': { totalShifts: 43, weekdayCount: 29, weekendCount: 10, holidayCount: 4 },
    'emp-004': { totalShifts: 41, weekdayCount: 28, weekendCount: 9, holidayCount: 4 },
    'emp-005': { totalShifts: 39, weekdayCount: 26, weekendCount: 9, holidayCount: 4 },
    'emp-006': { totalShifts: 41, weekdayCount: 27, weekendCount: 10, holidayCount: 4 },
};

// ─── Plan Deposu (Hafıza) ────────────────────────────
export const PLAN_STORE = {};

// ─── Helper: Tarihin tatil olup olmadığını kontrol et ─
export function getHoliday(dateStr) {
    return HOLIDAYS_2026.find(h => h.date === dateStr);
}

// ─── Helper: Ay için tatilleri getir ─────────────────
export function getHolidaysForMonth(year, month) {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    return HOLIDAYS_2026.filter(h => h.date.startsWith(prefix));
}

// ─── Helper: Ay için izinleri getir ──────────────────
export function getLeavesForMonth(year, month) {
    return LEAVE_REQUESTS.filter(l => {
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0);
        return start <= monthEnd && end >= monthStart;
    });
}

// ─── Helper: Çalışan o tarihte izinli mi? ────────────
export function isEmployeeOnLeave(employeeId, dateStr) {
    const d = new Date(dateStr);
    return LEAVE_REQUESTS.some(l => {
        if (l.employeeId !== employeeId) return false;
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        return d >= start && d <= end;
    });
}

export { uuid };
