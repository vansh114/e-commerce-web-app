import { useContext } from 'react';
import alertContext from '../context/alert/alertContext';

const Alert = () => {
    const { alert } = useContext(alertContext);
    
    const capitalize = (word) => {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1);
    };

    if (!alert) return null;
    
    return (
        <div style={{ height: '60px' }}>
            <div className={`alert alert-${alert.type} alert-dismissible fade show shadow rounded px-4 py-3 mb-3`} aria-live="assertive" role="alert" style={{ fontSize: '1.05rem', letterSpacing: '0.5px', borderLeft: `6px solid var(--bs-${alert.type})` }}>
                <strong>{capitalize(alert.type)}</strong>: {alert.message}
            </div>
        </div>
    );
};

export default Alert;