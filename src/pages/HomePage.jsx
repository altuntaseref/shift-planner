import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LeaveModal from '../components/LeaveModal';
import LeftSidebar from '../components/LeftSidebar';

const MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export default function HomePage() {
    const navigate = useNavigate();
    const {
        planHistory, targetYear, targetMonth,
        generatePlan, fetchPlanHistory, loading,
    } = useApp();

    const [showLeaveModal, setShowLeaveModal] = useState(false);

    useEffect(() => {
        fetchPlanHistory();
    }, [fetchPlanHistory]);

    const handleGeneratePlan = async () => {
        const plan = await generatePlan();
        if (plan) {
            navigate(`/plan/${plan.planId || plan.id}`);
        }
    };

    const handleOpenPlan = (planId) => {
        navigate(`/plan/${planId}`);
    };

    const sortedHistory = [...planHistory].sort((a, b) => {
        if (a.periodYear !== b.periodYear) return b.periodYear - a.periodYear;
        return b.periodMonth - a.periodMonth;
    });

    return (
        <div className="flex flex-1 overflow-hidden">
            <LeftSidebar />

            {/* Center Area: Planning Workspace */}
            <main className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-900 overflow-y-auto">
                <div className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Nöbet Planlama Alanı</h1>
                            <p className="text-slate-500 mt-1">Ekip nöbetlerini ve kaynak dağılımını yapılandırın ve yönetin.</p>
                        </div>
                    </div>

                    {/* Pending Reviews Section */}
                    {sortedHistory.some(p => p.status === 'DRAFT') && (
                        <div className="mb-12">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="flex h-3 w-3 rounded-full bg-amber-500 animate-pulse"></span>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">İnceleme Bekleyen Taslaklar</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sortedHistory.filter(p => p.status === 'DRAFT').map((plan) => (
                                    <div
                                        key={plan.planId || plan.id}
                                        onClick={() => handleOpenPlan(plan.planId || plan.id)}
                                        className="bg-white dark:bg-slate-800 border-2 border-primary ring-4 ring-primary/5 rounded-2xl p-6 cursor-pointer hover:shadow-2xl transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0">
                                            <div className="bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-wider shadow-sm">İnceleme Gerekli</div>
                                        </div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                                <span className="material-symbols-outlined text-2xl">pending_actions</span>
                                            </div>
                                            <span className="px-3 py-1 text-[10px] font-black uppercase rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                                                TASLAK
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1 group-hover:text-primary transition-colors">
                                            {MONTHS[plan.periodMonth - 1]} {plan.periodYear} Planı
                                        </h3>
                                        <p className="text-sm text-slate-500 mb-6 font-medium">Job tarafından otomatik üretildi</p>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                                            <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                                <span>İncele ve Yayınla</span>
                                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Published Plans History */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-sm">Plan Geçmişi</h2>
                            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-4"></div>
                        </div>
                        {sortedHistory.filter(p => p.status === 'PUBLISHED').length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sortedHistory.filter(p => p.status === 'PUBLISHED').map((plan) => (
                                    <div
                                        key={plan.planId || plan.id}
                                        onClick={() => handleOpenPlan(plan.planId || plan.id)}
                                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:border-slate-300 transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                                <span className="material-symbols-outlined">check_circle</span>
                                            </div>
                                            <span className="px-3 py-1 text-[10px] font-bold uppercase rounded-full bg-green-50 text-green-600 border border-green-200">
                                                Yayınlandı
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 group-hover:text-primary transition-colors">
                                            {MONTHS[plan.periodMonth - 1]} {plan.periodYear} Planı
                                        </h3>
                                        <p className="text-sm text-slate-500 mb-6 font-medium">Planlama Tamamlandı</p>

                                        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700">
                                            <span className="text-xs text-slate-400 opacity-60">ID: {(plan.planId || plan.id)?.substring(0, 8)}</span>
                                            <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">visibility</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="min-h-[200px] border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-800 shadow-sm">
                                <span className="material-symbols-outlined text-slate-300 text-4xl mb-2">history</span>
                                <p className="text-slate-500 text-sm font-medium">Henüz yayınlanmış bir plan bulunmuyor.</p>
                            </div>
                        )}
                    </div>

                    {sortedHistory.length === 0 && (
                        <div className="grid grid-cols-1 gap-6">
                            <div className="min-h-[400px] border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center bg-white dark:bg-slate-800 shadow-sm p-12 text-center">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-sm">
                                    <span className="material-symbols-outlined text-3xl">view_kanban</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 underline decoration-primary/30 underline-offset-4">Planlama Alanı Boş</h3>
                                <p className="text-slate-500 max-w-sm mt-3 leading-relaxed">Şu anda kayıtlı bir plan bulunmuyor. Her ayın 20'sinde otomatik oluşturulur veya butonu kullanarak hemen başlayabilirsiniz.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Right Sidebar: Quick Actions */}
            <aside className="w-72 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col gap-6 shrink-0">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Aksiyonlar</h3>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleGeneratePlan}
                            disabled={loading}
                            className="w-full flex items-center justify-between px-4 py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-75"
                        >
                            <span className="flex items-center gap-3">
                                {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">edit_calendar</span>}
                                Taslak Plan Oluştur
                            </span>
                        </button>

                        <button
                            onClick={() => setShowLeaveModal(true)}
                            className="w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
                        >
                            <span className="flex items-center gap-3">
                                <span className="material-symbols-outlined">event_busy</span>
                                İzin Oluştur
                            </span>
                        </button>
                    </div>
                </div>

                <div className="mt-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Son Aktiviteler</h3>
                    <div className="space-y-4">
                        {sortedHistory.slice(0, 3).map((plan, i) => (
                            <div key={i} className="flex gap-3 relative before:absolute before:left-[7px] before:top-5 before:bottom-[-20px] before:w-px before:bg-slate-200 dark:before:bg-slate-700 last:before:hidden">
                                <div className={`w-4 h-4 rounded-full ring-4 ring-white dark:ring-slate-900 z-10 mt-1 ${plan.status === 'PUBLISHED' ? 'bg-primary' : 'bg-amber-500'}`}></div>
                                <div>
                                    <p className="text-xs font-semibold">
                                        Plan {plan.status === 'PUBLISHED' ? 'Yayına Alındı' : 'Taslak Halinde'}
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">{MONTHS[plan.periodMonth - 1]} {plan.periodYear}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Leave Modal */}
            {showLeaveModal && <LeaveModal onClose={() => setShowLeaveModal(false)} />}
        </div>
    );
}
