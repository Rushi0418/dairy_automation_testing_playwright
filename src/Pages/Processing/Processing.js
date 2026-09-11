import { useEffect, useMemo, useState } from 'react';
import '../../styles/shared.css';
import './Processing.css';

const STAGES = [
    {
        id: 'intake',
        title: 'Raw Intake',
        meta: '18,420 L received',
        fill: 100,
        connector: false,
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 2h6l1 5-2 2v9a4 4 0 01-8 0v-9L8 7l1-5z" />
            </svg>
        ),
    },
    {
        id: 'pasteurization',
        title: 'Pasteurization',
        meta: 'Batch B-1182 · 72°C / 15s',
        fill: 82,
        connector: true,
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v6M12 22v-6M4.9 4.9l4.2 4.2M19.1 19.1l-4.2-4.2M4.9 19.1l4.2-4.2M19.1 4.9l-4.2 4.2" />
            </svg>
        ),
    },
    {
        id: 'chilling',
        title: 'Chilling',
        meta: 'Cooled to 4°C',
        fill: 64,
        connector: true,
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C9 6 6 9 6 13a6 6 0 0012 0c0-4-3-7-6-11z" />
            </svg>
        ),
    },
    {
        id: 'packaging',
        title: 'Packaging',
        meta: 'Pouch / Crate / Tetra',
        fill: 41,
        connector: true,
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M4 9h16" />
            </svg>
        ),
    },
];

const INITIAL_BATCHES = [
    { id: 'B-1182', product: 'Toned Milk (Pouch)', input: 6200, stage: 'Pasteurization', tag: 'blue', started: '06:10', eta: '08:40', yield: '—' },
    { id: 'B-1181', product: 'Ghee', input: 2400, stage: 'Chilling', tag: 'amber', started: '05:20', eta: '11:00', yield: '—' },
    { id: 'B-1180', product: 'Curd / Dahi', input: 1800, stage: 'Packaging', tag: 'green', started: '04:00', eta: '08:00', yield: '1,760 units' },
    { id: 'B-1179', product: 'Full Cream (Tetra)', input: 5000, stage: 'Dispatched', tag: 'gray', started: 'Yesterday', eta: 'Completed', yield: '4,890 L' },
];

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
);

const Processing = ({ onTrackBatch }) => {
    const [batches] = useState(INITIAL_BATCHES);
    const [fillsReady, setFillsReady] = useState(false);
    const [toast, setToast] = useState(null);
    const [parsedToken, setParsedToken] = useState('');

    // Animate the pipeline stage bars in from 0% -> target width on mount.
    useEffect(() => {
        const t = setTimeout(() => setFillsReady(true), 100);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const storedToken = JSON.parse(localStorage.getItem("authToken"));
        setParsedToken(localStorage.getItem('accessToken'));
    }, []);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 2800);
        return () => clearTimeout(t);
    }, [toast]);

    const handleStartBatch = () => {
        // "Start New Batch" opens a modal in the original (openModal('batch')).
        // Wire this up once the shared Modal component exists.
        setToast({ text: 'Batch creation modal coming soon' });
    };

    return (
        <div>
            <div className="pipeline">
                {STAGES.map((stage) => (
                    <div className="stage" key={stage.id}>
                        {stage.connector && <div className="stage-connector" />}
                        <div className="stage-icon">{stage.icon}</div>
                        <div className="stage-title">{stage.title}</div>
                        <div className="stage-meta">{stage.meta}</div>
                        <div className="stage-fill">
                            <div
                                className="stage-fill-bar"
                                style={{ width: fillsReady ? `${stage.fill}%` : '0%' }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="toolbar">
                <h3 style={{ fontSize: 15 }}>Active Batches</h3>
                <button className="btn btn-primary btn-sm" onClick={handleStartBatch} style={{ background: '#16a34a', color: 'white' }}>
                    <PlusIcon />Start New Batch
                </button>
            </div>

            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>Batch ID</th><th>Product Line</th><th>Input (L)</th><th>Stage</th>
                            <th>Started</th><th>Est. Completion</th><th>Yield</th><th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {batches.map((b) => (
                            <tr key={b.id}>
                                <td className="cell-primary num">{b.id}</td>
                                <td>{b.product}</td>
                                <td className="num">{b.input.toLocaleString('en-IN')}</td>
                                <td><span className={`tag tag-${b.tag}`}><span className="tag-dot" />{b.stage}</span></td>
                                <td className="num">{b.started}</td>
                                <td className="num">{b.eta}</td>
                                <td className="num">{b.yield}</td>
                                <td>
                                    <button className="btn btn-ghost btn-sm" onClick={() => onTrackBatch?.(b)}>
                                        Track
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {toast && (
                <div style={{
                    position: 'fixed', bottom: 24, right: 24,
                    background: 'var(--pine-dark)', color: '#fff', padding: '12px 16px',
                    borderRadius: 10, fontSize: 13, fontWeight: 500,
                    boxShadow: 'var(--shadow-lg)', zIndex: 200, minWidth: 240,
                }}>
                    {toast.text}
                </div>
            )}
        </div>
    );
};

export default Processing;