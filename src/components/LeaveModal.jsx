import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function LeaveModal({ onClose }) {
    const { employees, createLeave } = useApp();
    const [employeeId, setEmployeeId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!employeeId || !startDate || !endDate) return;
        setSubmitting(true);
        await createLeave(employeeId, startDate, endDate);
        setSubmitting(false);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal__title">İzin Talebi Oluştur</h2>
                <p className="modal__desc">
                    Çalışan için yeni bir izin kaydı oluşturun. Bu kayıt plan oluşturulurken otomatik olarak dikkate alınacaktır.
                </p>

                <div className="form-group">
                    <label className="form-label">Çalışan</label>
                    <select
                        className="form-select"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                    >
                        <option value="">Çalışan seçin...</option>
                        {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Başlangıç Tarihi</label>
                    <input
                        type="date"
                        className="form-input"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Bitiş Tarihi</label>
                    <input
                        type="date"
                        className="form-input"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>

                <div className="modal__actions">
                    <button className="btn btn--cancel" onClick={onClose}>İptal</button>
                    <button
                        className="btn btn--primary"
                        onClick={handleSubmit}
                        disabled={!employeeId || !startDate || !endDate || submitting}
                    >
                        {submitting ? <span className="loader" /> : 'Kaydet'}
                    </button>
                </div>
            </div>
        </div>
    );
}
