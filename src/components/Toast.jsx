import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function Toast() {
    const { error, successMsg, clearError, clearSuccess } = useApp();

    // Auto-dismiss success messages
    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(clearSuccess, 4000);
            return () => clearTimeout(timer);
        }
    }, [successMsg, clearSuccess]);

    // Auto-dismiss errors after a while
    useEffect(() => {
        if (error) {
            const timer = setTimeout(clearError, 8000);
            return () => clearTimeout(timer);
        }
    }, [error, clearError]);

    if (!error && !successMsg) return null;

    if (error) {
        return (
            <div className="toast toast--error">
                <span className="material-symbols-outlined">error</span>
                {error}
                <button className="toast__close" onClick={clearError}>×</button>
            </div>
        );
    }

    return (
        <div className="toast toast--success">
            <span className="material-symbols-outlined">check_circle</span>
            {successMsg}
            <button className="toast__close" onClick={clearSuccess}>×</button>
        </div>
    );
}
