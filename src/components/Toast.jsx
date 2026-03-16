import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function Toast() {
    const { error, successMsg, clearError, clearSuccess } = useApp();

    // Auto-dismiss success messages
    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(clearSuccess, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMsg, clearSuccess]);

    // Auto-dismiss errors
    useEffect(() => {
        if (error) {
            const timer = setTimeout(clearError, 8000);
            return () => clearTimeout(timer);
        }
    }, [error, clearError]);

    if (!error && !successMsg) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex flex-col gap-3 w-full max-w-sm px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {error && (
                <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-xl">
                    <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
                        <span className="material-symbols-outlined text-white">error</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-0.5">Sistem Hatası</p>
                        <p className="text-sm font-bold truncate pr-4 leading-tight">{error}</p>
                    </div>
                    <button onClick={clearError} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-base">close</span>
                    </button>
                </div>
            )}

            {successMsg && (
                <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl p-4 shadow-2xl flex items-center gap-4 border border-white/10 dark:border-slate-200 backdrop-blur-xl">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                        <span className="material-symbols-outlined text-white">check_circle</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black uppercase tracking-widest text-emerald-400 dark:text-emerald-600 mb-0.5">Başarılı</p>
                        <p className="text-sm font-bold truncate pr-4 leading-tight">{successMsg}</p>
                    </div>
                    <button onClick={clearSuccess} className="p-1 hover:bg-white/10 dark:hover:bg-slate-100 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-base">close</span>
                    </button>
                </div>
            )}
        </div>
    );
}
