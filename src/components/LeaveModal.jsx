import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function LeaveModal({ onClose }) {
    const { employees, createLeave } = useApp();
    const [employeeId, setEmployeeId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const validate = () => {
        const errs = {};
        if (!employeeId) errs.employeeId = 'Lütfen bir çalışan seçin.';
        if (!startDate) errs.startDate = 'Başlangıç tarihi zorunludur.';
        if (!endDate) {
            errs.endDate = 'Bitiş tarihi zorunludur.';
        } else if (startDate && endDate < startDate) {
            errs.endDate = 'Bitiş tarihi, başlangıç tarihinden önce olamaz.';
        }
        return errs;
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
        setFormErrors({});
        setSubmitting(true);
        try {
            await createLeave(employeeId, startDate, endDate);
            onClose();
        } catch {
            setFormErrors({ submit: 'İzin kaydedilemedi. Lütfen tekrar deneyin.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div 
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">İzin Talebi Oluştur</h2>
                        <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    
                    <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                        Çalışan için yeni bir izin kaydı oluşturun. Bu kayıt plan oluşturulurken otomatik olarak dikkate alınacaktır.
                    </p>

                    {formErrors.submit && (
                        <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 border border-red-100 rounded-2xl">
                            <span className="material-symbols-outlined text-red-500">error</span>
                            <p className="text-sm font-semibold text-red-600">{formErrors.submit}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 px-1">Çalışan *</label>
                            <select
                                className={`w-full h-12 bg-slate-50 dark:bg-slate-800 border-2 rounded-2xl px-4 text-sm font-semibold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all appearance-none cursor-pointer ${formErrors.employeeId ? 'border-red-400' : 'border-transparent'}`}
                                value={employeeId}
                                onChange={(e) => { setEmployeeId(e.target.value); setFormErrors(p => ({...p, employeeId: undefined})); }}
                            >
                                <option value="">Çalışan seçin...</option>
                                {employees.map((emp) => (
                                    <option key={emp.id || emp.employeeId} value={emp.id || emp.employeeId}>
                                        {emp.fullName || `${emp.firstName} ${emp.lastName}`}
                                    </option>
                                ))}
                            </select>
                            {formErrors.employeeId && (
                                <p className="text-[11px] text-red-500 mt-2 px-1 font-semibold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">error</span>
                                    {formErrors.employeeId}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 px-1">Başlangıç *</label>
                                <input
                                    type="date"
                                    className={`w-full h-12 bg-slate-50 dark:bg-slate-800 border-2 rounded-2xl px-4 text-sm font-semibold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all ${formErrors.startDate ? 'border-red-400' : 'border-transparent'}`}
                                    value={startDate}
                                    onChange={(e) => { setStartDate(e.target.value); setFormErrors(p => ({...p, startDate: undefined, endDate: undefined})); }}
                                />
                                {formErrors.startDate && (
                                    <p className="text-[11px] text-red-500 mt-2 px-1 font-semibold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs">error</span>
                                        {formErrors.startDate}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 px-1">Bitiş *</label>
                                <input
                                    type="date"
                                    className={`w-full h-12 bg-slate-50 dark:bg-slate-800 border-2 rounded-2xl px-4 text-sm font-semibold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all ${formErrors.endDate ? 'border-red-400' : 'border-transparent'}`}
                                    value={endDate}
                                    min={startDate || undefined}
                                    onChange={(e) => { setEndDate(e.target.value); setFormErrors(p => ({...p, endDate: undefined})); }}
                                />
                                {formErrors.endDate && (
                                    <p className="text-[11px] text-red-500 mt-2 px-1 font-semibold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs">error</span>
                                        {formErrors.endDate}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col gap-3">
                    <button
                        className="w-full h-14 bg-primary text-white text-base font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                <span>Kaydediliyor...</span>
                            </div>
                        ) : 'Kaydı Tamamla'}
                    </button>
                    <button className="w-full h-12 text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors" onClick={onClose}>
                        Vazgeç
                    </button>
                </div>
            </div>
        </div>
    );
}
