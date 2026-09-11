import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';

// Route path -> nav item config. Add an entry here whenever a new
// protected page/route is added to AppRoutes.js.
const NAV_GROUPS = [
    {
        label: 'Overview',
        items: [
            {
                path: '/dashboard',
                label: 'Dashboard',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="9" rx="1.5" />
                        <rect x="14" y="3" width="7" height="5" rx="1.5" />
                        <rect x="14" y="12" width="7" height="9" rx="1.5" />
                        <rect x="3" y="16" width="7" height="5" rx="1.5" />
                    </svg>
                ),
            },
        ],
    },
    {
        label: 'Operations',
        items: [
            {
                path: '/collection',
                label: 'Milk Collection',
                badge: 128,
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 2h6l1 5-2 2v9a4 4 0 01-8 0v-9L8 7l1-5z" />
                    </svg>
                ),
            },
            {
                path: '/processing',
                label: 'Processing',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 3" />
                    </svg>
                ),
            },
            {
                path: '/shipment',
                label: 'Shipment Master',
                badge: 14,
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 7.5L12 3 3 7.5 12 12l9-4.5z" />
                        <path d="M3 7.5v9L12 21l9-4.5v-9" />
                        <path d="M12 12v9" />
                    </svg>
                ),
            },
        ],
    },
    {
        label: 'Masters',
        items: [
            {
                path: '/partners',
                label: 'Vendor Management',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 10l1.5-6h15L21 10" />
                        <path d="M3 10h18v9a1 1 0 01-1 1H4a1 1 0 01-1-1v-9z" />
                        <path d="M9 14a3 3 0 006 0" />
                    </svg>
                ),
            },
            {
                path: '/vehicle',
                label: 'Vehicle Master',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="8" width="14" height="8" rx="1.5" />
                        <path d="M16 11h3l3 3v2h-6z" />
                        <circle cx="6.5" cy="18" r="1.7" />
                        <circle cx="16.5" cy="18" r="1.7" />
                    </svg>
                ),
            },
            {
                path: '/users',
                label: 'User Management',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="8" r="3.2" />
                        <path d="M2.5 20c0-3.6 2.9-6.2 6.5-6.2s6.5 2.6 6.5 6.2" />
                        <circle cx="18" cy="8.5" r="2.4" />
                        <path d="M15.5 13.8c2.7.3 4.7 2.5 4.7 5.4" />
                    </svg>
                ),
            },
            {
                path: '/sales',
                label: 'Sales Management',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="8" r="3.2" />
                        <path d="M2.5 20c0-3.6 2.9-6.2 6.5-6.2s6.5 2.6 6.5 6.2" />
                        <circle cx="18" cy="8.5" r="2.4" />
                        <path d="M15.5 13.8c2.7.3 4.7 2.5 4.7 5.4" />
                    </svg>
                ),
            },
        ],
    },
    {
        label: 'Transporter',
        items: [
            {
                path: '/transporter',
                label: 'Transporter Management',
                icon: (
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M3 6h11v11H3z" />
                        <path d="M14 10h4l3 3v4h-7z" />
                        <circle cx="7.5" cy="18" r="2" />
                        <circle cx="18" cy="18" r="2" />
                        <path d="M14 14h7" />
                    </svg>
                ),
            },
        ],
    },
    {
        label: 'Configurations',
        items: [
            {
                path: '/configs',
                label: 'Add Configurations',
                icon: (
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.4v-.2a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 8.4 15a1.7 1.7 0 0 0-1.56-1.03H6.6v-2.4h.24A1.7 1.7 0 0 0 8.4 10a1.7 1.7 0 0 0-.34-1.88L8 8.06l1.7-1.7.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 12.67 5.2V5h2.4v.2a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.7 1.7-.06.06A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.56 1.03h.24v2.4h-.24A1.7 1.7 0 0 0 19.4 15z"
                        />
                    </svg>
                ),
            },
        ],
    },
    {
        label: 'Insights',
        items: [
            {
                path: '/reports',
                label: 'Reports',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 21V9M12 21V3M20 21v-7" />
                    </svg>
                ),
            },
        ],
    },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const navRef = useRef(null);
    const [pillStyle, setPillStyle] = useState({ transform: 'translateY(0px)', opacity: 0 });
    const [parsedToken, setParsedToken] = useState('');
    const [userName, setUserName] = useState('');
    const [role, setRole] = useState('');

    useEffect(() => {
        const token = JSON.parse(localStorage.getItem('authToken'));
        setParsedToken(token);
        setUserName(token?.fullName);
        setRole(token?.role);
    }, [])

    useLayoutEffect(() => {
        const movePill = () => {
            const activeEl = navRef.current?.querySelector('.nav-item.active');
            const navEl = navRef.current;
            if (!activeEl || !navEl) return;
            const navRect = navEl.getBoundingClientRect();
            const itemRect = activeEl.getBoundingClientRect();
            setPillStyle({
                transform: `translateY(${itemRect.top - navRect.top + navEl.scrollTop}px)`,
                opacity: 1,
            });
        };
        movePill();
        // Collapse/expand is width-animated (0.2s), so re-measure after it settles.
        const settleTimer = setTimeout(movePill, 210);

        window.addEventListener('resize', movePill);
        return () => {
            clearTimeout(settleTimer);
            window.removeEventListener('resize', movePill);
        };
    }, [location.pathname, collapsed]);

    const handleNavClick = (path) => {
        navigate(path);
        if (window.innerWidth <= 720) {
            setCollapsed(true);
        }
    };

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="brand">
                <div className="brand-mark">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M9 2h6l1 5-2 2v9a4 4 0 01-8 0v-9L4 7l1-5z" fill="#fff" opacity="0.95" />
                    </svg>
                </div>
                <div className="brand-text">
                    <div className="brand-name">ADITYA MILK TRADERS</div>
                    <div className="brand-sub">Dairy Ops Console</div>
                </div>
            </div>

            <nav className="nav-scroll" ref={navRef}>
                <div className="nav-pill" style={pillStyle} />
                {/* <div
                    className="nav-pill"
                    style={{
                        ...pillStyle,
                        background: "red",
                        opacity: 0.5
                    }}
                /> */}

                {NAV_GROUPS.map((group) => (
                    <div key={group.label}>
                        <div className="nav-group-label">{group.label}</div>
                        {group.items.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <div
                                    key={item.path}
                                    className={`nav-item ${isActive ? 'active' : ''}`}
                                    onClick={() => handleNavClick(item.path)}
                                >
                                    {item.icon}
                                    <span className="nav-label">{item.label}</span>
                                    {item.badge != null && <span className="badge">{item.badge}</span>}
                                    <span className="nav-tooltip">{item.label}</span>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </nav>

            <div className="sidebar-foot">
                {/* <div className="avatar-sm"></div> */}
                <div className="foot-text" style={{ flex: 1 }}>
                    <div className="foot-name">{userName}</div>
                    <div className="foot-role">{role}</div>
                </div>
                <button
                    className="icon-btn logout-link"
                    title="Sign out"
                    style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.14)' }}
                    onClick={() => {
                        navigate('/')
                        localStorage.clear('accessToken');
                        localStorage.clear('authToken');
                    }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="#C6DED8" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                        <path d="M16 17l5-5-5-5" />
                        <path d="M21 12H9" />
                    </svg>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;