import React from 'react';

const DAY_NAMES = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const SHORT_DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export default function ShiftCalendar({ plan, onAssignmentClick, selectedAssignments = [] }) {
    if (!plan || !plan.dailyShifts || plan.dailyShifts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/50 p-12 text-center animate-pulse">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-3xl text-slate-300">hourglass_empty</span>
                </div>
                <h3 className="text-xl font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Plan Yükleniyor</h3>
                <p className="text-sm text-slate-400 mt-2 max-w-xs font-semibold">Sistem verileri analiz ediyor ve takvimi hazırlıyor. Lütfen bekleyin.</p>
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
        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-white dark:border-slate-700">
            {/* Header: Days of Week */}
            <div className="grid grid-cols-7 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                {SHORT_DAY_NAMES.map((name, i) => (
                    <div key={name} className={`py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] ${i >= 5 ? 'text-red-500' : 'text-slate-400'}`}>
                        {name}
                    </div>
                ))}
            </div>

            {/* Calendar Body */}
            <div className="grid grid-cols-7 gap-px">
                {cells.map((cell) => {
                    if (cell.type === 'empty') {
                        return <div key={cell.key} className="min-h-[140px] bg-slate-50 dark:bg-slate-900/40 opacity-50" />;
                    }

                    const assignments = cell.shift?.assignments || [];
                    const primaryAssignment = assignments.find(a => a.role === 'PRIMARY');
                    const backupAssignments = assignments.filter(a => a.role !== 'PRIMARY');

                    return (
                        <div 
                            key={cell.key} 
                            className={`min-h-[140px] p-3 flex flex-col gap-2 transition-all duration-300 relative group
                                ${cell.isWeekend ? 'bg-slate-50/50 dark:bg-slate-900/60' : 'bg-white dark:bg-slate-900'}
                                ${cell.isHoliday ? 'bg-red-50/30' : ''}
                                hover:bg-primary-light/30 dark:hover:bg-primary-dark/10
                            `}
                        >
                            {/* Today Indicator */}
                            {cell.isToday && (
                                <div className="absolute top-0 left-0 right-0 h-1 bg-primary z-10 shadow-[0_0_8px_rgba(19,91,236,0.5)]"></div>
                            )}

                            {/* Date Number & Badge */}
                            <div className="flex justify-between items-start mb-1">
                                <div className={`px-2 py-0.5 rounded-lg text-xs font-black tracking-tight ${cell.isToday ? 'bg-primary text-white shadow-md' : (cell.isWeekend || cell.isHoliday ? 'text-red-500' : 'text-slate-300 group-hover:text-slate-600')}`}>
                                    {cell.day}
                                </div>
                                {cell.isHoliday && (
                                    <div className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shadow-sm">Tatil</div>
                                )}
                            </div>

                            {/* Assignments Stack */}
                            <div className="flex flex-col gap-1.5 flex-1 mt-1">
                                {primaryAssignment ? (
                                    <button
                                        onClick={(e) => handleAssignmentClick(e, primaryAssignment, cell.shift)}
                                        className={`w-full text-left rounded-xl p-2.5 transition-all group/tag relative overflow-hidden flex flex-col gap-0.5 border-2
                                            ${selectedAssignments.includes(primaryAssignment.assignmentId) 
                                                ? 'bg-primary border-primary text-white shadow-lg -translate-y-0.5 scale-[1.02]' 
                                                : 'bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-700 hover:border-primary/30 hover:bg-slate-50'}`}
                                    >
                                        <div className={`text-[8px] font-black uppercase tracking-widest ${selectedAssignments.includes(primaryAssignment.assignmentId) ? 'text-white/70' : 'text-primary'}`}>Asil Nöbet</div>
                                        <div className={`text-[11px] font-bold truncate ${selectedAssignments.includes(primaryAssignment.assignmentId) ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                                            {primaryAssignment.employeeFullName || '---'}
                                        </div>
                                    </button>
                                ) : (
                                    <div className="rounded-xl p-2.5 bg-red-50/50 border-2 border-dashed border-red-100 flex items-center justify-center">
                                        <span className="text-[10px] font-black text-red-300 uppercase tracking-widest">Boş Slot</span>
                                    </div>
                                )}

                                {backupAssignments.map(backup => (
                                    <button
                                        key={backup.assignmentId}
                                        onClick={(e) => handleAssignmentClick(e, backup, cell.shift)}
                                        className={`w-full text-left rounded-xl p-2.5 transition-all group/tag flex flex-col gap-0.5 border-2
                                            ${selectedAssignments.includes(backup.assignmentId) 
                                                ? 'bg-primary border-primary text-white shadow-lg -translate-y-0.5 scale-[1.02]' 
                                                : 'bg-slate-100/50 dark:bg-slate-800/50 border-transparent hover:border-slate-200 hover:bg-slate-100'}`}
                                    >
                                        <div className={`text-[8px] font-black uppercase tracking-widest ${selectedAssignments.includes(backup.assignmentId) ? 'text-white/70' : 'text-slate-400'}`}>Yedek</div>
                                        <div className={`text-[11px] font-bold truncate opacity-80 ${selectedAssignments.includes(backup.assignmentId) ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {backup.employeeFullName || '---'}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
