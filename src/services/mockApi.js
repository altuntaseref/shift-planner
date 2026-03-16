// ═══════════════════════════════════════════════════════
//  OCEAN Shift Planner — Mock API
//  Backend'deki algoritmanın frontend tarafındaki replikası
//  Adil dağıtım, izin kontrolü, tatil-öncelikli atama
// ═══════════════════════════════════════════════════════

import {
    EMPLOYEES, EMPLOYEE_STATS, LEAVE_REQUESTS, PLAN_STORE,
    HOLIDAYS_2026, getHoliday, getHolidaysForMonth, getLeavesForMonth,
    isEmployeeOnLeave, uuid,
} from './mockData';

// Simulate network delay
const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

// ─── GET /api/v1/employees ───────────────────────────
export async function getActiveEmployees() {
    await delay(300);
    return EMPLOYEES.filter(e => e.active);
}

// ─── GET /api/v1/leaves?year=&month= ────────────────
export async function getLeaveRequests(year, month) {
    await delay(200);
    if (year && month) {
        return getLeavesForMonth(year, month);
    }
    return [...LEAVE_REQUESTS];
}

// ─── POST /api/v1/leaves ────────────────────────────
export async function createLeaveRequest(data) {
    await delay(300);
    const employee = EMPLOYEES.find(e => e.id === data.employeeId);
    const newLeave = {
        id: uuid(),
        employeeId: data.employeeId,
        employeeFullName: employee?.fullName || 'Bilinmeyen',
        startDate: data.startDate,
        endDate: data.endDate,
    };
    LEAVE_REQUESTS.push(newLeave);
    return newLeave;
}

// ─── POST /api/v1/plans/generate ─────────────────────
// Bu fonksiyon backend'deki ShiftPlanGeneratorService'i simüle eder
export async function generateShiftPlan(periodYear, periodMonth) {
    await delay(800);

    const activeEmployees = EMPLOYEES.filter(e => e.active);
    const n = activeEmployees.length;
    if (n === 0) throw new Error('Aktif çalışan bulunamadı!');

    const daysInMonth = new Date(periodYear, periodMonth, 0).getDate();
    const holidays = getHolidaysForMonth(periodYear, periodMonth);
    const holidayDates = new Set(holidays.map(h => h.date));

    // ── ADIM 1: Hazırlık ──
    // Kota hesaplama: Toplam gün / çalışan sayısı
    const maxQuota = Math.ceil(daysInMonth / n);

    // Çalışan başına kalan kota
    const quotaMap = {};
    activeEmployees.forEach(e => { quotaMap[e.id] = maxQuota; });

    // Çalışan başına bu ay atanan günler
    const assignedCount = {};
    activeEmployees.forEach(e => { assignedCount[e.id] = 0; });

    // İstatistik kopyası (mutate etmemek için)
    const stats = {};
    activeEmployees.forEach(e => {
        stats[e.id] = { ...(EMPLOYEE_STATS[e.id] || { totalShifts: 0, weekdayCount: 0, weekendCount: 0, holidayCount: 0 }) };
    });

    // ── TÜM GÜNLER İÇİN ATAMA HAZIRLA ──
    const dailyShifts = [];

    // ── ADIM 2: Her gün için kategori belirle ──
    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${periodYear}-${String(periodMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const date = new Date(periodYear, periodMonth - 1, d);
        const dow = date.getDay();
        const isWeekend = dow === 0 || dow === 6;
        const isHoliday = holidayDates.has(dateStr);

        let category;
        if (isHoliday) category = 'HOLIDAY';
        else if (isWeekend) category = 'WEEKEND';
        else category = 'WEEKDAY';

        days.push({ day: d, dateStr, date, dow, isWeekend, isHoliday, category });
    }

    // ── ADIM 2: Holiday-First Dağıtım ──
    // Tatil günlerini, geçmişte en az tatil nöbeti tutmuş kişilere ata
    const holidayDays = days.filter(d => d.category === 'HOLIDAY');
    const otherDays = days.filter(d => d.category !== 'HOLIDAY');

    // Dağıtım fonksiyonu: Uygun çalışanı bul
    function findBestEmployee(dateStr, category) {
        const available = activeEmployees.filter(e => {
            // İzinli mi kontrolü
            if (isEmployeeOnLeave(e.id, dateStr)) return false;
            // Kota aşımı kontrolü
            if (assignedCount[e.id] >= maxQuota) return false;
            return true;
        });

        if (available.length === 0) {
            // Kota sınırını gevşet — herkese izin ver
            const fallback = activeEmployees.filter(e => !isEmployeeOnLeave(e.id, dateStr));
            if (fallback.length === 0) return null;
            // En az atananı seç
            fallback.sort((a, b) => assignedCount[a.id] - assignedCount[b.id]);
            return fallback[0];
        }

        // İstatistiğe göre sırala (en az = öncelikli)
        available.sort((a, b) => {
            const sa = stats[a.id];
            const sb = stats[b.id];
            if (category === 'HOLIDAY') return sa.holidayCount - sb.holidayCount;
            if (category === 'WEEKEND') return sa.weekendCount - sb.weekendCount;
            return sa.weekdayCount - sb.weekdayCount;
        });

        // Eğer eşitse, toplam nöbet sayısına bak
        const best = available.filter(e => {
            const s = stats[e.id];
            const sBest = stats[available[0].id];
            if (category === 'HOLIDAY') return s.holidayCount === sBest.holidayCount;
            if (category === 'WEEKEND') return s.weekendCount === sBest.weekendCount;
            return s.weekdayCount === sBest.weekdayCount;
        });

        // Eşitler arasında toplam en az olanı seç
        best.sort((a, b) => stats[a.id].totalShifts - stats[b.id].totalShifts);
        return best[0];
    }

    // Yedek bul
    function findBackup(dateStr, primaryId) {
        const available = activeEmployees.filter(e => {
            if (e.id === primaryId) return false;
            if (isEmployeeOnLeave(e.id, dateStr)) return false;
            return true;
        });

        if (available.length === 0) return null;

        // Round-robin style: en az toplam nöbet
        available.sort((a, b) => stats[a.id].totalShifts - stats[b.id].totalShifts);
        return available[0];
    }

    // ── Tatil günlerini dağıt ──
    for (const day of holidayDays) {
        const primary = findBestEmployee(day.dateStr, 'HOLIDAY');
        if (primary) {
            assignedCount[primary.id]++;
            stats[primary.id].holidayCount++;
            stats[primary.id].totalShifts++;
            if (day.isWeekend) stats[primary.id].weekendCount++;
        }
        day.primaryEmployee = primary;
        day.backupEmployee = primary ? findBackup(day.dateStr, primary.id) : null;
    }

    // ── ADIM 3: Kalan günleri dağıt (Weekend-first, sonra Weekday) ──
    const weekendDays = otherDays.filter(d => d.category === 'WEEKEND');
    const weekdayDays = otherDays.filter(d => d.category === 'WEEKDAY');

    // Hafta sonu günleri
    for (const day of weekendDays) {
        const primary = findBestEmployee(day.dateStr, 'WEEKEND');
        if (primary) {
            assignedCount[primary.id]++;
            stats[primary.id].weekendCount++;
            stats[primary.id].totalShifts++;
        }
        day.primaryEmployee = primary;
        day.backupEmployee = primary ? findBackup(day.dateStr, primary.id) : null;
    }

    // Hafta içi günleri
    for (const day of weekdayDays) {
        const primary = findBestEmployee(day.dateStr, 'WEEKDAY');
        if (primary) {
            assignedCount[primary.id]++;
            stats[primary.id].weekdayCount++;
            stats[primary.id].totalShifts++;
        }
        day.primaryEmployee = primary;
        day.backupEmployee = primary ? findBackup(day.dateStr, primary.id) : null;
    }

    // ── ADIM 5: DailyShift + ShiftAssignment objelerini oluştur ──
    for (const day of days) {
        const assignments = [];
        if (day.primaryEmployee) {
            assignments.push({
                assignmentId: uuid(),
                employeeId: day.primaryEmployee.id,
                employeeFullName: day.primaryEmployee.fullName,
                role: 'PRIMARY',
            });
        }
        if (day.backupEmployee) {
            assignments.push({
                assignmentId: uuid(),
                employeeId: day.backupEmployee.id,
                employeeFullName: day.backupEmployee.fullName,
                role: 'BACKUP_1',
            });
        }

        dailyShifts.push({
            dailyShiftId: uuid(),
            shiftDate: day.dateStr,
            shiftCategory: day.category,
            assignments,
        });
    }

    // ── Plan oluştur ──
    const plan = {
        planId: uuid(),
        periodYear,
        periodMonth,
        status: 'DRAFT',
        dailyShifts,
        createdAt: new Date().toISOString(),
    };

    // Depoya kaydet
    PLAN_STORE[plan.planId] = plan;

    return plan;
}

// ─── GET /api/v1/plans/{id} ──────────────────────────
export async function getShiftPlanById(id) {
    await delay(300);
    const plan = PLAN_STORE[id];
    if (!plan) throw new Error(`Plan bulunamadı: ${id}`);
    return { ...plan };
}

// ─── PATCH /api/v1/plans/{id}/publish ────────────────
export async function publishShiftPlan(id) {
    await delay(600);
    const plan = PLAN_STORE[id];
    if (!plan) throw new Error(`Plan bulunamadı: ${id}`);
    if (plan.status === 'PUBLISHED') throw new Error('Plan zaten yayınlanmış!');

    plan.status = 'PUBLISHED';
    plan.publishedAt = new Date().toISOString();

    // Kara Kaplı Defter güncelleme burada simüle edilir
    // (Gerçek backend'de istatistikler DB'ye yazılır)
    return null;
}

// ─── POST /api/v1/plans/{id}/swap ────────────────────
export async function swapShifts(planId, firstAssignmentId, secondAssignmentId) {
    await delay(500);
    const plan = PLAN_STORE[planId];
    if (!plan) throw new Error(`Plan bulunamadı: ${planId}`);

    let first = null, second = null;
    let day1 = null, day2 = null;

    for (const ds of plan.dailyShifts) {
        for (const a of ds.assignments) {
            if (a.assignmentId === firstAssignmentId) { first = a; day1 = ds; }
            if (a.assignmentId === secondAssignmentId) { second = a; day2 = ds; }
        }
    }

    if (!first || !second) throw new Error('Atama bulunamadı!');

    const emp1Id = first.employeeId;
    const emp1Name = first.employeeFullName;
    const emp2Id = second.employeeId;
    const emp2Name = second.employeeFullName;

    // 1. Temel rolleri (mesela Asil - Asil) takas et
    first.employeeId = emp2Id;
    first.employeeFullName = emp2Name;
    second.employeeId = emp1Id;
    second.employeeFullName = emp1Name;

    // 2. Çakışmayı önle: "Hem asil hem yedek olma" durumunu karşılıklı yedekleri devrederek çöz
    if (day1) {
        for (const a of day1.assignments) {
            if (a.assignmentId !== firstAssignmentId && a.employeeId === emp2Id) {
                a.employeeId = emp1Id;
                a.employeeFullName = emp1Name;
            }
        }
    }

    if (day2) {
        for (const a of day2.assignments) {
            if (a.assignmentId !== secondAssignmentId && a.employeeId === emp1Id) {
                a.employeeId = emp2Id;
                a.employeeFullName = emp2Name;
            }
        }
    }

    return null;
}

// ─── POST /api/v1/plans/{id}/replace/{assignmentId} ──
export async function replaceShiftEmployee(planId, assignmentId) {
    await delay(500);
    const plan = PLAN_STORE[planId];
    if (!plan) throw new Error(`Plan bulunamadı: ${planId}`);
    if (plan.status !== 'PUBLISHED') throw new Error('Replace sadece yayınlanmış planlarda yapılabilir!');

    // İlgili daily shift'i ve assignment'ı bul
    for (const ds of plan.dailyShifts) {
        const primaryIdx = ds.assignments.findIndex(a => a.assignmentId === assignmentId && a.role === 'PRIMARY');
        if (primaryIdx === -1) continue;

        const backupIdx = ds.assignments.findIndex(a => a.role === 'BACKUP_1');
        if (backupIdx === -1) throw new Error('Bu gün için yedek nöbetçi bulunmuyor!');

        const primary = ds.assignments[primaryIdx];
        const backup = ds.assignments[backupIdx];

        // Swap roles: PRIMARY <-> BACKUP_1
        const tmpId = primary.employeeId;
        const tmpName = primary.employeeFullName;

        primary.employeeId = backup.employeeId;
        primary.employeeFullName = backup.employeeFullName;

        backup.employeeId = tmpId;
        backup.employeeFullName = tmpName;

        // İstatistik transferi simülasyonu
        // Gerçek backend'de: devreden -1, devralan +1 zorluk puanı
        return null;
    }

    throw new Error('Atama bulunamadı!');
}

// ─── Tüm Planları Getir (Ek: Geçmiş planlar) ────────
export async function getAllPlans() {
    await delay(200);
    return Object.values(PLAN_STORE).map(p => ({
        planId: p.planId,
        periodYear: p.periodYear,
        periodMonth: p.periodMonth,
        status: p.status,
        createdAt: p.createdAt,
        publishedAt: p.publishedAt,
        totalDays: p.dailyShifts?.length || 0,
    }));
}

// ─── Tatilleri Getir ────────────────────────────────
export async function getHolidaysForMonthApi(year, month) {
    await delay(100);
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    return HOLIDAYS_2026.filter(h => h.date.startsWith(prefix));
}
