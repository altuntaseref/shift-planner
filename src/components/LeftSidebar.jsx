import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../services/api';

const MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export default function LeftSidebar() {
    const {
        employees, leaves, holidays, fetchEmployees,
        targetYear, targetMonth,
        fetchLeaves, fetchHolidays,
    } = useApp();

    const [isAddMode, setIsAddMode] = useState(false);
    const [newEmp, setNewEmp] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [adding, setAdding] = useState(false);

    // Holiday add state
    const [isHolidayAddMode, setIsHolidayAddMode] = useState(false);
    const [newHoliday, setNewHoliday] = useState({ holidayName: '', holidayDate: '' });
    const [addingHoliday, setAddingHoliday] = useState(false);

    useEffect(() => {
        fetchEmployees();
        fetchLeaves(targetYear, targetMonth);
        fetchHolidays(targetYear, targetMonth);
    }, [fetchEmployees, fetchLeaves, fetchHolidays, targetYear, targetMonth]);

    const handleDeleteEmployee = async (id) => {
        if (!window.confirm("Bu personeli pasif yapmak istediğinize emin misiniz? Nöbet algoritmasında artık kullanılmayacaktır.")) return;
        try {
            await api.deleteEmployee(id);
            fetchEmployees();
        } catch (e) {
            console.error("Çalışan silinemedi:", e);
        }
    };

    const handleAddEmployee = async () => {
        if (!newEmp.firstName || !newEmp.lastName || !newEmp.email) return;
        setAdding(true);
        try {
            await api.createEmployee({
                firstName: newEmp.firstName,
                lastName: newEmp.lastName,
                email: newEmp.email,
                phone: newEmp.phone
            });
            setNewEmp({ firstName: '', lastName: '', email: '', phone: '' });
            setIsAddMode(false);
            fetchEmployees();
        } catch (e) {
            console.error("Çalışan eklenemedi:", e);
        } finally {
            setAdding(false);
        }
    };

    const handleAddHoliday = async () => {
        if (!newHoliday.holidayName || !newHoliday.holidayDate) return;
        setAddingHoliday(true);
        try {
            await api.insertHolidays([{
                holidayName: newHoliday.holidayName,
                holidayDate: newHoliday.holidayDate
            }]);
            setNewHoliday({ holidayName: '', holidayDate: '' });
            setIsHolidayAddMode(false);
            fetchHolidays(targetYear, targetMonth);
        } catch (e) {
            console.error("Tatil eklenemedi:", e);
        } finally {
            setAddingHoliday(false);
        }
    };

    return (
        <aside className="w-80 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto shrink-0 hidden lg:flex">
            {/* Team Section */}
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Çalışanlar ({employees.length})</h3>
                    <button onClick={() => setIsAddMode(!isAddMode)} className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">{isAddMode ? 'close' : 'add'}</span>
                    </button>
                </div>

                {isAddMode && (
                    <div className="mb-4 p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-2">
                        <input value={newEmp.firstName} onChange={e => setNewEmp({ ...newEmp, firstName: e.target.value })} placeholder="Ad" className="w-full text-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:bg-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                        <input value={newEmp.lastName} onChange={e => setNewEmp({ ...newEmp, lastName: e.target.value })} placeholder="Soyad" className="w-full text-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:bg-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                        <input value={newEmp.email} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} placeholder="E-posta" type="email" className="w-full text-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:bg-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                        <input value={newEmp.phone} onChange={e => setNewEmp({ ...newEmp, phone: e.target.value })} placeholder="Telefon Numarası" type="tel" className="w-full text-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:bg-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                        <button onClick={handleAddEmployee} disabled={adding} className="w-full bg-primary text-white text-xs font-bold py-2 rounded-lg disabled:opacity-50 hover:bg-primary-dark transition-colors mt-1 hover:shadow-md">Ekle</button>
                    </div>
                )}

                <div className="space-y-3">
                    {employees.map(emp => (
                        <div key={emp.employeeId || emp.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group">
                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                                {emp.fullName ? emp.fullName.charAt(0) : (emp.firstName?.charAt(0) || '')}{(emp.lastName?.charAt(0) || '')}
                            </div>
                            <div className="overflow-hidden flex-1">
                                <p className="text-sm font-semibold truncate">{emp.fullName || `${emp.firstName} ${emp.lastName}`}</p>
                                <p className="text-[10px] text-slate-500">{emp.title || emp.email || 'Çalışan'}</p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteEmployee(emp.id || emp.employeeId); }} className="opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-red-50 text-red-500 hover:text-red-700 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-[14px]">person_off</span>
                                <span className="text-[10px] font-bold">Pasif Et</span>
                            </button>
                        </div>
                    ))}
                    {employees.length === 0 && (
                        <p className="text-xs text-slate-400">Çalışan bulunamadı.</p>
                    )}
                </div>
            </div>

            {/* Leaves Section */}
            <div className="px-6 pb-6">
                <div className="h-px bg-slate-100 dark:bg-slate-800 mb-6"></div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">İzinler ({targetYear} {MONTHS[targetMonth - 1]})</h3>
                    <span className="material-symbols-outlined text-slate-400 text-sm">event_busy</span>
                </div>
                <div className="space-y-3">
                    {leaves.map((leave, idx) => {
                        const emp = employees.find(e => (e.employeeId || e.id) === leave.employeeId);
                        const empName = emp ? (emp.fullName || `${emp.firstName} ${emp.lastName}`) : leave.employeeFullName || 'Çalışan';
                        return (
                            <div key={idx} className="p-3 rounded-lg bg-orange-50 dark:bg-slate-800 border border-orange-100 dark:border-slate-700">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-xs font-bold text-orange-600 uppercase">{leave.leaveType || 'Yıllık İzin'}</p>
                                    <p className="text-[10px] font-medium text-orange-400">{leave.startDate} - {leave.endDate}</p>
                                </div>
                                <p className="text-xs font-semibold text-slate-700 truncate">{empName}</p>
                            </div>
                        )
                    })}
                    {leaves.length === 0 && (
                        <p className="text-xs text-slate-400">Bu ay için izin kaydı bulunmuyor.</p>
                    )}
                </div>
            </div>

            {/* Holidays Section */}
            <div className="px-6 pb-6 mt-auto">
                <div className="h-px bg-slate-100 dark:bg-slate-800 mb-6"></div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Bayramlar / Tatiller ({targetYear} {MONTHS[targetMonth - 1]})</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsHolidayAddMode(!isHolidayAddMode)} className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center hover:bg-purple-200 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">{isHolidayAddMode ? 'close' : 'add'}</span>
                        </button>
                    </div>
                </div>

                {isHolidayAddMode && (
                    <div className="mb-4 p-3 rounded-lg border border-purple-200 bg-purple-50 space-y-2">
                        <input value={newHoliday.holidayName} onChange={e => setNewHoliday({ ...newHoliday, holidayName: e.target.value })} placeholder="Bayram/Tatil Adı" className="w-full text-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:bg-slate-800 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400" />
                        <input value={newHoliday.holidayDate} onChange={e => setNewHoliday({ ...newHoliday, holidayDate: e.target.value })} type="date" className="w-full text-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:bg-slate-800 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400" />
                        <button onClick={handleAddHoliday} disabled={addingHoliday} className="w-full bg-purple-600 text-white text-xs font-bold py-2 rounded-lg disabled:opacity-50 hover:bg-purple-700 transition-colors mt-1 hover:shadow-md">Ekle</button>
                    </div>
                )}
                <div className="space-y-3">
                    {holidays.map((hol, idx) => {
                        return (
                            <div key={idx} className="p-3 rounded-lg bg-purple-50 dark:bg-slate-800 border border-purple-100 dark:border-slate-700">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-xs font-bold text-purple-600 uppercase">Resmi Tatil</p>
                                    <p className="text-[10px] font-medium text-purple-400">{hol.holidayDate || hol.date}</p>
                                </div>
                                <p className="text-xs font-semibold text-slate-700 truncate">{hol.holidayName || hol.name}</p>
                            </div>
                        )
                    })}
                    {holidays.length === 0 && (
                        <p className="text-xs text-slate-400">Bu ayda resmi tatil bulunmuyor.</p>
                    )}
                </div>
            </div>
        </aside>
    );
}
