import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export default function Header() {
    const { targetYear, targetMonth, setTargetYear, setTargetMonth, planHistory } = useApp();
    const navigate = useNavigate();

    const handlePeriodChange = (newMonth, newYear) => {
        setTargetMonth(newMonth);
        setTargetYear(newYear);
        const existingPlan = planHistory?.find(
            (p) => p.periodYear === newYear && p.periodMonth === newMonth
        );
        if (existingPlan) {
            navigate(`/plan/${existingPlan.planId || existingPlan.id}`);
        } else {
            navigate('/');
        }
    };

    return (
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 sticky top-0 z-50 shrink-0">
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-md cursor-pointer" onClick={() => navigate('/')}>
                    <span className="material-symbols-outlined shrink-0 text-xl">calendar_month</span>
                </div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white cursor-pointer" onClick={() => navigate('/')}>Nöbet Planlayıcı</h2>
            </div>

            <div className="flex flex-1 justify-end gap-4 items-center">
                {/* Period Selector */}
                <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="material-symbols-outlined text-sm text-slate-500">calendar_today</span>
                    <select
                        className="bg-transparent border-none text-sm font-semibold text-slate-700 dark:text-slate-300 focus:ring-0 p-0 pr-4 outline-none cursor-pointer"
                        value={targetMonth}
                        onChange={(e) => handlePeriodChange(Number(e.target.value), targetYear)}
                    >
                        {MONTHS.map((m, i) => (
                            <option key={i + 1} value={i + 1}>{m}</option>
                        ))}
                    </select>
                    <span className="text-slate-300 dark:text-slate-600">/</span>
                    <select
                        className="bg-transparent border-none text-sm font-semibold text-slate-700 dark:text-slate-300 focus:ring-0 p-0 pr-2 outline-none cursor-pointer"
                        value={targetYear}
                        onChange={(e) => handlePeriodChange(targetMonth, Number(e.target.value))}
                    >
                        {[2024, 2025, 2026, 2027].map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

            </div>
        </header>
    );
}
