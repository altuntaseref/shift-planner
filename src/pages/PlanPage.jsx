import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ShiftCalendar from '../components/ShiftCalendar';
import LeftSidebar from '../components/LeftSidebar';

const MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export default function PlanPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        employees, currentPlan, loading,
        fetchPlan, publishPlan, swapShifts, replacePrimary,
        setTargetMonth, setTargetYear
    } = useApp();

    const [selectedAssignments, setSelectedAssignments] = useState([]);
    const [swapMode, setSwapMode] = useState(false);
    const [replaceMode, setReplaceMode] = useState(false);
    const [showPublishConfirm, setShowPublishConfirm] = useState(false);

    useEffect(() => {
        if (id) {
            fetchPlan(id);
        }
    }, [id, fetchPlan]);

    useEffect(() => {
        if (currentPlan) {
            setTargetMonth(currentPlan.periodMonth);
            setTargetYear(currentPlan.periodYear);
        }
    }, [currentPlan, setTargetMonth, setTargetYear]);

    const isDraft = currentPlan?.status === 'DRAFT';
    const isPublished = currentPlan?.status === 'PUBLISHED';

    // ─── Swap & Replace Logic ───
    const handleSwapToggle = () => {
        setSwapMode(!swapMode);
        setReplaceMode(false);
        setSelectedAssignments([]);
    };

    const handleReplaceToggle = () => {
        setReplaceMode(!replaceMode);
        setSwapMode(false);
        setSelectedAssignments([]);
    };

    const handleAssignmentClick = (assignment, shift) => {
        if (swapMode) {
            setSelectedAssignments((prev) => {
                if (prev.includes(assignment.assignmentId)) {
                    return prev.filter((a) => a !== assignment.assignmentId);
                }
                const next = [...prev, assignment.assignmentId];
                if (next.length === 2) {
                    swapShifts(next[0], next[1]);
                    setSwapMode(false);
                    return [];
                }
                return next;
            });
        } else if (replaceMode) {
            if (assignment.role === 'PRIMARY') {
                replacePrimary(assignment.assignmentId);
                setReplaceMode(false);
                setSelectedAssignments([]);
            }
        }
    };

    const handlePublish = async () => {
        setShowPublishConfirm(false);
        await publishPlan();
    };

    const totalDays = currentPlan?.dailyShifts?.length || 0;
    const conflicts = 0; // Simulated conflicts logic here

    return (
        <div className="flex flex-col flex-1 overflow-hidden bg-gray-50">
            {/* Top Toolbar specific to Draft Page */}
            <header className="bg-white border-b border-enterprise-border h-16 flex items-center justify-between px-6 shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold text-enterprise-primary">
                        {isDraft ? 'Taslak Plan' : 'Yayınlanmış Plan'}
                    </h1>
                    {currentPlan && (
                        <span className={`px-2 py-1 text-xs font-semibold rounded uppercase tracking-wider ${isDraft ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                            {MONTHS[currentPlan.periodMonth - 1]} {currentPlan.periodYear}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-enterprise-secondary mr-2">
                        <span className={`flex h-2 w-2 rounded-full ${isDraft ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></span>
                        <span>{isDraft ? 'Düzenleme Modu' : 'Salt Okunur (Yayında)'}</span>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 min-h-0">
                <LeftSidebar />

                {/* Center Main Area (Calendar View) */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6">

                    {/* Mode Alerts */}
                    {swapMode && (
                        <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg shadow-sm mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <span className="material-symbols-outlined text-primary">swap_horiz</span>
                            <div className="flex-1">
                                <p className="font-bold text-primary text-sm">Takas Modu Aktif</p>
                                <p className="text-xs text-slate-600">Takas etmek istediğiniz 2 atamayı seçin ({selectedAssignments.length}/2)</p>
                            </div>
                            <button onClick={() => { setSwapMode(false); setSelectedAssignments([]); }} className="text-xs font-bold text-primary hover:text-primary-dark uppercase px-3 py-1 bg-white rounded shadow-sm">İptal</button>
                        </div>
                    )}

                    {replaceMode && (
                        <div className="bg-amber-50 md:bg-amber-100/50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <span className="material-symbols-outlined text-amber-600">swap_vert</span>
                            <div className="flex-1">
                                <p className="font-bold text-amber-700 text-sm">Devret Modu Aktif</p>
                                <p className="text-xs text-amber-600">Devretmek istediğiniz ASİL nöbetçiye tıklatarak yerine yedek personeli geçirin.</p>
                            </div>
                            <button onClick={() => { setReplaceMode(false); setSelectedAssignments([]); }} className="text-xs font-bold text-amber-700 hover:text-amber-900 uppercase px-3 py-1 bg-white rounded shadow-sm">İptal</button>
                        </div>
                    )}

                    {/* Loader */}
                    {loading && !currentPlan ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <ShiftCalendar
                            plan={currentPlan}
                            onAssignmentClick={handleAssignmentClick}
                            selectedAssignments={selectedAssignments}
                        />
                    )}
                </main>

                {/* Right Sidebar (Actions) */}
                <aside className="w-64 bg-white border-l border-enterprise-border p-6 flex flex-col gap-4 shrink-0 overflow-y-auto" id="action-panel">
                    <div className="text-xs font-bold text-enterprise-secondary uppercase tracking-widest mb-2">Aksiyonlar</div>

                    {isDraft && (
                        <>
                            <button
                                onClick={handleSwapToggle}
                                disabled={loading}
                                className={`w-full border-2 py-4 px-6 rounded-lg transition-all flex flex-col items-center justify-center gap-1 group ${swapMode ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white border-primary text-primary hover:bg-blue-50 font-bold'}`}
                            >
                                <span className={`material-symbols-outlined transition-transform duration-500 ${swapMode ? 'animate-pulse' : 'group-hover:rotate-180'}`}>swap_horiz</span>
                                <span className="text-sm font-black uppercase">Takas</span>
                                <span className="text-[10px] font-normal opacity-80">Nöbetleri takas et</span>
                            </button>

                            <button
                                onClick={() => setShowPublishConfirm(true)}
                                disabled={loading}
                                className="w-full bg-enterprise-primary hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-slate-400/50 transition-all flex flex-col items-center justify-center gap-1 mt-2"
                            >
                                <span className="material-symbols-outlined">send</span>
                                <span className="text-sm font-black uppercase">Yayınla</span>
                                <span className="text-[10px] font-normal opacity-70">Planı onayla & mail at</span>
                            </button>
                        </>
                    )}

                    {isPublished && (
                        <button
                            onClick={handleReplaceToggle}
                            disabled={loading}
                            className={`w-full border-2 py-4 px-6 rounded-lg transition-all flex flex-col items-center justify-center gap-1 group mt-2 ${replaceMode ? 'bg-amber-500 border-amber-500 text-white shadow-lg' : 'bg-white border-amber-500 text-amber-600 hover:bg-amber-50 font-bold'}`}
                        >
                            <span className="material-symbols-outlined transition-transform duration-500 group-hover:-translate-y-1">swap_vert</span>
                            <span className="text-sm font-black uppercase">Devret</span>
                            <span className="text-[10px] font-normal opacity-80">Asil nöbeti yedeğe at</span>
                        </button>
                    )}

                    <div className="mt-auto border-t border-enterprise-border pt-4">
                        <h4 className="text-xs font-semibold text-enterprise-primary mb-2">Plan Özeti</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-enterprise-secondary">Toplam Gün:</span>
                                <span className="font-medium">{totalDays}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-enterprise-secondary">Boş Slot:</span>
                                <span className="font-medium text-green-600">0</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-enterprise-secondary">Çakışma:</span>
                                <span className={`font-medium ${conflicts > 0 ? 'text-red-500' : 'text-slate-400'}`}>{conflicts}</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Footer */}
            <footer className="h-8 bg-enterprise-primary text-[10px] text-slate-400 px-6 flex items-center justify-between shrink-0">
                <div>OCEAN Nöbet Planlayıcı - Yönetim Arayüzü</div>
                <div>{new Date().toLocaleDateString('tr-TR')}</div>
            </footer>

            {/* Publish Confirmation Modal */}
            {showPublishConfirm && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <span className="material-symbols-outlined text-2xl">send</span>
                        </div>
                        <h3 className="text-lg font-bold text-center text-slate-800 mb-2">Planı Yayınla</h3>
                        <p className="text-sm text-center text-slate-500 mb-6">Bu ayın planını yayınlamak üzeresiniz. Tüm personellere nöbetlerini bildiren bir e-posta gönderilecektir. Onaylıyor musunuz?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowPublishConfirm(false)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors">İptal</button>
                            <button onClick={handlePublish} className="flex-1 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all flex items-center justify-center">
                                {loading ? <span className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></span> : 'Evet, Yayınla'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
