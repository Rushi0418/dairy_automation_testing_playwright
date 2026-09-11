import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Navbar.css';

// Route path -> [title, eyebrow]. Mirrors the original's `titles` map,
// keyed by path instead of the old SPA `view` name.
const PAGE_META = {
    '/dashboard': ['Dashboard', 'TODAY · OVERVIEW'],
    '/collection': ['Milk Collection', 'OPERATIONS · INTAKE'],
    '/processing': ['Processing', 'OPERATIONS · BATCHES'],
    '/shipment': ['Shipment Master', 'OPERATIONS · DISPATCH'],
    '/partners': ['Vendor Management', 'MASTERS · VEDORS'],
    '/sales': ['Sales Management', 'MASTERS · SALES'],
    '/vehicle': ['Vehicle Master', 'MASTERS · FLEET'],
    '/users': ['User Management', 'MASTERS · ACCESS CONTROL'],
    '/transporter': ['Transporter Management', 'TRANSPORTER · TRANSPORTER'],
    '/reports': ['Reports', 'INSIGHTS · EXPORTS'],
    '/configs': ['Configurations', 'Configs · Config'],
};

const DEFAULT_META = ['Dashboard', 'TODAY · OVERVIEW'];

const Navbar = ({ collapsed, setCollapsed }) => {
    const location = useLocation();
    const [search, setSearch] = useState('');

    const [title, eyebrow] = PAGE_META[location.pathname] || DEFAULT_META;

    return (
        <div className="topbar">
            <div className="topbar-left">
                <button
                    className="collapse-btn"
                    title="Toggle sidebar"
                    aria-label="Toggle sidebar"
                    onClick={() => setCollapsed((prev) => !prev)}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <path d="M9 4v16" />
                    </svg>
                </button>
                <div>
                    <div className="page-eyebrow mono">{eyebrow}</div>
                    <div className="page-title">{title}</div>
                </div>
            </div>

            <div className="topbar-right">
                <div className="search-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="7" />
                        <path d="M21 21l-4.3-4.3" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search vendor, vehicle, batch…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <button className="icon-btn" title="Notifications">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8a6 6 0 10-12 0c0 3-1 5-2 6h16c-1-1-2-3-2-6z" />
                        <path d="M9.5 20a2.5 2.5 0 005 0" />
                    </svg>
                    <span className="dot-alert" />
                </button>

                <button className="icon-btn" title="Settings">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1 1.55V21a2 2 0 01-4 0v-.09a1.7 1.7 0 00-1-1.51 1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.7 1.7 0 00.34-1.87 1.7 1.7 0 00-1.55-1H3a2 2 0 010-4h.09a1.7 1.7 0 001.51-1 1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06a1.7 1.7 0 001.87.34H9a1.7 1.7 0 001-1.55V3a2 2 0 014 0v.09a1.7 1.7 0 001 1.51 1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06a1.7 1.7 0 00-.34 1.87V9a1.7 1.7 0 001.55 1H21a2 2 0 010 4h-.09a1.7 1.7 0 00-1.51 1z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Navbar;