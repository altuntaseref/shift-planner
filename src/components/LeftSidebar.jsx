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
        fetchLeaves, fetchHolidays, setError,
    } = useApp();

    const [isAddMode, setIsAddMode] = useState(false);
    const [newEmp, setNewEmp] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [adding, setAdding] = useState(false);
    const [empErrors, setEmpErrors] = useState({});

    // Accordion state
    const [leavesOpen, setLeavesOpen] = useState(false);
    const [holidaysOpen, setHolidaysOpen] = useState(false);

    // Holiday add state
    const [isHolidayAddMode, setIsHolidayAddMode] = useState(false);
    const [newHoliday, setNewHoliday] = useState({ holidayName: '', holidayDate: '' });
    const [addingHoliday, setAddingHoliday] = useState(false);
    const [holidayErrors, setHolidayErrors] = useState({});

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
            setError(e.message);
        }
    };

    const handleAddEmployee = async () => {
        const errs = {};
        if (!newEmp.firstName.trim()) errs.firstName = 'Ad alanı zorunludur.';
        if (!newEmp.lastName.trim()) errs.lastName = 'Soyad alanı zorunludur.';
        if (!newEmp.email.trim()) {
            errs.email = 'E-posta alanı zorunludur.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmp.email)) {
            errs.email = 'Geçerli bir e-posta adresi girin. Örnek: ad@sirket.com';
        } else if (employees.some(e => e.email?.toLowerCase() === newEmp.email.toLowerCase())) {
            errs.email = 'Bu e-posta adresiyle kayıtlı bir çalışan zaten mevcut.';
        }
        if (newEmp.phone && !/^[0-9+\s\-]{7,15}$/.test(newEmp.phone)) {
            errs.phone = 'Geçersiz telefon formatı. Örnek: 0532 123 45 67';
        }
        if (Object.keys(errs).length > 0) { setEmpErrors(errs); return; }
        setEmpErrors({});
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
            setEmpErrors({ submit: e.message });
        } finally {
            setAdding(false);
        }
    };

    const handleAddHoliday = async () => {
        const errs = {};
        if (!newHoliday.holidayName.trim()) errs.holidayName = 'Tatil adı zorunludur.';
        if (!newHoliday.holidayDate) {
            errs.holidayDate = 'Tarih zorunludur.';
        } else {
            const d = new Date(newHoliday.holidayDate);
            const selectedYear = d.getFullYear();
            const selectedMonth = d.getMonth() + 1;
            if (selectedYear !== targetYear || selectedMonth !== targetMonth) {
                errs.holidayDate = `Tarih, seçili dönem olan ${targetYear}/${String(targetMonth).padStart(2,'0')} ayına ait olmalıdır.`;
            }
        }
        if (Object.keys(errs).length > 0) { setHolidayErrors(errs); return; }
        setHolidayErrors({});
        setAddingHoliday(true);
        try {
            await api.insertHolidays([{ holidayName: newHoliday.holidayName, holidayDate: newHoliday.holidayDate }]);
            setNewHoliday({ holidayName: '', holidayDate: '' });
            setIsHolidayAddMode(false);
            fetchHolidays(targetYear, targetMonth);
        } catch (e) {
            setHolidayErrors({ submit: e.message });
        } finally {
            setAddingHoliday(false);
        }
    };

    return (
        <aside className="w-80 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto shrink-0 hidden lg:flex">
            {/* Team Section */}
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Çalışanlar ({employees.length})</h3>
                    <button onClick={() => setIsAddMode(!isAddMode)} className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all active:scale-95">
                        <span className="material-symbols-outlined text-[18px]">{isAddMode ? 'close' : 'person_add'}</span>
                    </button>
                </div>

                {isAddMode && (
                    <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-2 duration-300">
                        {empErrors.submit && (
                            <div className="flex items-start gap-2 p-3 mb-3 bg-red-50 border border-red-100 rounded-xl">
                                <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
                                <p className="text-xs text-red-600 font-semibold">{empErrors.submit}</p>
                            </div>
                        )}
                        <div className="space-y-3">
                            <input
                                value={newEmp.firstName}
                                onChange={e => { setNewEmp({ ...newEmp, firstName: e.target.value }); setEmpErrors(p => ({ ...p, firstName: undefined })); }}
                                placeholder="Ad *"
                                className={`w-full text-sm px-3 py-2.5 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-primary/5 ${empErrors.firstName ? 'border-red-400 bg-red-50' : 'border-transparent bg-white dark:bg-slate-800 focus:border-primary'}`}
                            />
                            {empErrors.firstName && <p className="text-[10px] text-red-500 font-bold ml-1">{empErrors.firstName}</p>}
                            
                            <input
                                value={newEmp.lastName}
                                onChange={e => { setNewEmp({ ...newEmp, lastName: e.target.value }); setEmpErrors(p => ({ ...p, lastName: undefined })); }}
                                placeholder="Soyad *"
                                className={`w-full text-sm px-3 py-2.5 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-primary/5 ${empErrors.lastName ? 'border-red-400 bg-red-50' : 'border-transparent bg-white dark:bg-slate-800 focus:border-primary'}`}
                            />
                            {empErrors.lastName && <p className="text-[10px] text-red-500 font-bold ml-1">{empErrors.lastName}</p>}
                            
                            <input
                                value={newEmp.email}
                                onChange={e => { setNewEmp({ ...newEmp, email: e.target.value }); setEmpErrors(p => ({ ...p, email: undefined })); }}
                                placeholder="E-posta *"
                                type="email"
                                className={`w-full text-sm px-3 py-2.5 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-primary/5 ${empErrors.email ? 'border-red-400 bg-red-50' : 'border-transparent bg-white dark:bg-slate-800 focus:border-primary'}`}
                            />
                            {empErrors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{empErrors.email}</p>}
                            
                            <input
                                value={newEmp.phone}
                                onChange={e => { setNewEmp({ ...newEmp, phone: e.target.value }); setEmpErrors(p => ({ ...p, phone: undefined })); }}
                                placeholder="Telefon (05XX XXX XX XX)"
                                type="tel"
                                className={`w-full text-sm px-3 py-2.5 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-primary/5 ${empErrors.phone ? 'border-red-400 bg-red-50' : 'border-transparent bg-white dark:bg-slate-800 focus:border-primary'}`}
                            />
                            {empErrors.phone && <p className="text-[10px] text-red-500 font-bold ml-1">{empErrors.phone}</p>}
                            
                            <button onClick={handleAddEmployee} disabled={adding} className="w-full h-12 bg-primary text-white text-sm font-black rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 disabled:opacity-50 mt-2">
                                {adding ? 'Ekleniyor...' : 'Çalışan Ekle'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    {employees.map((emp, i) => (
                        <div key={emp.employeeId || emp.id} className="group relative flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-100 dark:hover:border-slate-700 transition-all cursor-default">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm shadow-primary/10`}>
                                {(emp.fullName ? emp.fullName.charAt(0) : (emp.firstName?.charAt(0) || '')).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{emp.fullName || `${emp.firstName} ${emp.lastName}`}</p>
                                <p className="text-[10px] font-semibold text-slate-400 truncate opacity-60">Sirket Çalışanı</p>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteEmployee(emp.id || emp.employeeId); }} 
                                className="w-8 h-8 rounded-lg bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all transform scale-90 group-hover:scale-100"
                            >
                                <span className="material-symbols-outlined text-[18px]">person_remove</span>
                            </button>
                        </div>
                    ))}
                    {employees.length === 0 && (
                        <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-700">
                            <span className="material-symbols-outlined text-slate-300 text-3xl mb-1">group_off</span>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kayıt Bulunamadı</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Sections with Divider */}
            <div className="mt-auto space-y-px bg-slate-100 dark:bg-slate-800">
                
                {/* Accordion: Leaves */}
                <div className="bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
                    <button
                        onClick={() => setLeavesOpen(!leavesOpen)}
                        className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[18px]">event_busy</span>
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">İzinler</p>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{targetYear} {MONTHS[targetMonth - 1]}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {leaves.length > 0 && (
                                <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[9px] font-black flex items-center justify-center">{leaves.length}</span>
                            )}
                            <span className={`material-symbols-outlined text-slate-300 transition-transform duration-300 ${leavesOpen ? 'rotate-180' : ''}`}>expand_more</span>
                        </div>
                    </button>
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${leavesOpen ? 'max-h-[400px] border-b border-slate-50' : 'max-h-0'}`}>
                        <div className="px-6 pb-6 space-y-3">
                            {leaves.map((leave, idx) => {
                                const emp = employees.find(e => (e.employeeId || e.id) === leave.employeeId);
                                return (
                                    <div key={idx} className="p-3 rounded-xl bg-orange-50/50 border border-orange-100/50 flex flex-col gap-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-black uppercase tracking-tighter text-orange-500">{leave.leaveType || 'Yıllık İzin'}</span>
                                            <span className="text-[9px] font-bold text-orange-400 opacity-70">{leave.startDate}</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-700 truncate">{emp?.fullName || leave.employeeFullName || 'Çalışan'}</p>
                                    </div>
                                );
                            })}
                            {leaves.length === 0 && <p className="text-[10px] text-center font-bold text-slate-300 uppercase py-2">İzin Kaydı Yok</p>}
                        </div>
                    </div>
                </div>

                {/* Accordion: Holidays */}
                <div className="bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
                    <button
                        onClick={() => setHolidaysOpen(!holidaysOpen)}
                        className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[18px]">celebration</span>
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tatiller</p>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{MONTHS[targetMonth - 1]} Programı</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             {holidaysOpen && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsHolidayAddMode(!isHolidayAddMode); }}
                                    className="w-6 h-6 rounded-lg bg-purple-500 text-white flex items-center justify-center hover:bg-purple-600 transition-all active:scale-90"
                                >
                                    <span className="material-symbols-outlined text-[14px]">{isHolidayAddMode ? 'close' : 'add'}</span>
                                </button>
                            )}
                            <span className={`material-symbols-outlined text-slate-300 transition-transform duration-300 ${holidaysOpen ? 'rotate-180' : ''}`}>expand_more</span>
                        </div>
                    </button>
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${holidaysOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
                        <div className="px-6 pb-6 pt-2">
                            {isHolidayAddMode && (
                                <div className="mb-4 p-4 rounded-2xl bg-purple-50/50 border border-purple-100/50 space-y-3 animate-in fade-in duration-300">
                                    <input value={newHoliday.holidayName} onChange={e => { setNewHoliday({ ...newHoliday, holidayName: e.target.value }); setHolidayErrors(p => ({...p, holidayName: undefined})); }} placeholder="Tatil Adı *" className="w-full text-xs px-3 py-2 rounded-xl bg-white border-2 border-transparent focus:border-purple-400 outline-none transition-all" />
                                    <input value={newHoliday.holidayDate} onChange={e => { setNewHoliday({ ...newHoliday, holidayDate: e.target.value }); setHolidayErrors(p => ({...p, holidayDate: undefined})); }} type="date" className="w-full text-xs px-3 py-2 rounded-xl bg-white border-2 border-transparent focus:border-purple-400 outline-none transition-all" />
                                    <button onClick={handleAddHoliday} disabled={addingHoliday} className="w-full py-2 bg-purple-600 text-white text-[10px] font-black uppercase rounded-lg shadow-md hover:bg-purple-700 active:scale-95 transition-all">Ekle</button>
                                </div>
                            )}
                            <div className="space-y-3">
                                {holidays.map((hol, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-50 dark:border-slate-700 shadow-sm">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center shrink-0">
                                            <span className="text-[10px] font-black text-primary">{(hol.holidayDate || hol.date)?.split('-')[2]}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{hol.holidayName || hol.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Resmi Tatil</p>
                                        </div>
                                    </div>
                                ))}
                                {holidays.length === 0 && <p className="text-[10px] text-center font-bold text-slate-300 uppercase py-2">Tatil Kaydı Yok</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
