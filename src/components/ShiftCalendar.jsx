import React from 'react';

const DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export default function ShiftCalendar({ plan, onAssignmentClick, selectedAssignments = [] }) {
    if (!plan || !plan.dailyShifts || plan.dailyShifts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-gray-50/50 p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-400 mb-4">calendar_month</span>
                <h3 className="text-lg font-bold text-slate-700">Plan Yükleniyor...</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-sm">Henüz bir plan verisi mevcut değil. Lütfen bekleyin veya yeni bir plan oluşturun.</p>
            </div>
        );
    }

    const { periodYear, periodMonth, dailyShifts } = plan;

    const firstDay = new Date(periodYear, periodMonth - 1, 1);
    const daysInMonth = new Date(periodYear, periodMonth, 0).getDate();
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const shiftMap = {};
    dailyShifts.forEach((ds) => {
        shiftMap[ds.shiftDate] = ds;
    });

    const cells = [];
    for (let i = 0; i < startDow; i++) {
        cells.push({ type: 'empty', key: `empty-start-${i}` });
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${periodYear}-${String(periodMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const date = new Date(periodYear, periodMonth - 1, d);
        const dow = date.getDay();
        const isWeekend = dow === 0 || dow === 6;

        const shift = shiftMap[dateStr];
        const isHoliday = shift?.shiftCategory === 'HOLIDAY';

        const today = new Date();
        const isToday = date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate();

        cells.push({
            type: 'day', key: dateStr, day: d, dateStr,
            isWeekend, isHoliday, isToday, shift,
        });
    }

    const totalCells = Math.ceil(cells.length / 7) * 7;
    for (let i = cells.length; i < totalCells; i++) {
        cells.push({ type: 'empty', key: `empty-end-${i}` });
    }

    const handleAssignmentClick = (e, assignment, shift) => {
        e.stopPropagation();
        if (onAssignmentClick) {
            onAssignmentClick(assignment, shift);
        }
    };

    return (
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-enterprise-border overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-enterprise-border grid grid-cols-7 text-center py-3">
                {DAY_NAMES.map((name, i) => (
                    <div key={name} className={`text-xs font-bold uppercase ${i >= 5 ? 'text-red-400' : 'text-enterprise-secondary'}`}>
                        {name}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-[1px] bg-slate-200">
                {cells.map((cell) => {
                    if (cell.type === 'empty') {
                        return <div key={cell.key} className="min-h-[100px] bg-gray-50/40" />;
                    }

                    // Dinamik class'lar
                    let dayBg = 'bg-white';
                    if (cell.isWeekend) dayBg = 'bg-gray-50/50';
                    if (cell.isHoliday) dayBg = 'bg-red-50/20';

                    const assignments = cell.shift?.assignments || [];
                    const primaryAssignment = assignments.find(a => a.role === 'PRIMARY');
                    const backupAssignments = assignments.filter(a => a.role !== 'PRIMARY');

                    return (
                        <div key={cell.key} className={`min-h-[100px] p-2 flex flex-col gap-1 border-r border-b border-transparent ${dayBg} relative group hover:bg-slate-50 transition-colors`}>
                            {cell.isToday && <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>}

                            <div className={`text-right text-sm font-semibold mb-1 ${(cell.isWeekend || cell.isHoliday) ? 'text-red-400' : 'text-slate-400'}`}>
                                {cell.day}
                                {cell.isHoliday && <span className="ml-1 text-[9px] bg-red-100 text-red-600 px-1 py-0.5 rounded uppercase align-middle">Tatil</span>}
                            </div>

                            {/* ASİL Atama */}
                            {primaryAssignment ? (
                                <div
                                    onClick={(e) => handleAssignmentClick(e, primaryAssignment, cell.shift)}
                                    className={`rounded p-1 text-[11px] cursor-pointer transition-all border ${selectedAssignments.includes(primaryAssignment.assignmentId) ? 'bg-primary text-white border-primary shadow-md transform scale-[1.02]' : 'bg-blue-50 border-blue-200 hover:border-blue-300'}`}
                                >
                                    <span className={`font-bold uppercase ${selectedAssignments.includes(primaryAssignment.assignmentId) ? 'text-blue-100' : 'text-blue-800'}`}>ASİL:</span>
                                    <span className="ml-1 leading-tight inline-block">{primaryAssignment.employeeFullName || 'Bilinmiyor'}</span>
                                </div>
                            ) : (
                                <div className="rounded p-1 text-[11px] bg-red-50 border border-red-200 text-red-600 border-dashed text-center">
                                    Atanmadı
                                </div>
                            )}

                            {/* YEDEK Atama(lar) */}
                            {backupAssignments.map(backup => (
                                <div
                                    key={backup.assignmentId}
                                    onClick={(e) => handleAssignmentClick(e, backup, cell.shift)}
                                    className={`rounded p-1 text-[11px] cursor-pointer transition-all border mt-[2px] ${selectedAssignments.includes(backup.assignmentId) ? 'bg-primary text-white border-primary shadow-md transform scale-[1.02]' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}
                                >
                                    <span className={`font-bold uppercase ${selectedAssignments.includes(backup.assignmentId) ? 'text-blue-100' : 'text-gray-600'}`}>YEDEK:</span>
                                    <span className="ml-1 leading-tight inline-block text-slate-600">{backup.employeeFullName || 'Bilinmiyor'}</span>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
