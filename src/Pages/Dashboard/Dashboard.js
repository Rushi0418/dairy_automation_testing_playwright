// import { useEffect, useState } from 'react';
// import '../../styles/shared.css';
// import './Dashboard.css';
// import axios from 'axios';
// import environment from '../../Environment/Environment';
// import { toast, ToastContainer } from 'react-toastify';
// // Recreates the original's animateCounters(): eases 0 -> target over 900ms.
// const useCountUp = (target, duration = 2900) => {
//     const [value, setValue] = useState(0);

//     useEffect(() => {
//         let rafId;
//         const start = performance.now();

//         const tick = (now) => {
//             const progress = Math.min(1, (now - start) / duration);
//             const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
//             setValue(target * eased);
//             if (progress < 1) rafId = requestAnimationFrame(tick);
//         };

//         rafId = requestAnimationFrame(tick);
//         return () => cancelAnimationFrame(rafId);
//     }, [target, duration]);

//     return value;
// };

// const CHART_DATA = [
//     { day: 'Mon', value: 15200 },
//     { day: 'Tue', value: 16800 },
//     { day: 'Wed', value: 15900 },
//     { day: 'Thu', value: 17650 },
//     { day: 'Fri', value: 16200 },
//     { day: 'Sat', value: 18420 },
//     { day: 'Sun', value: 14100 },
// ];

// const RECENT_ENTRIES = [
//     { name: 'Vasant Kale', code: 'VND-1042', centre: 'Shirwal Centre', shift: 'AM', qty: 142.5, fat: 4.3, snf: 8.7, rate: 42.10, status: 'Accepted', tag: 'green' },
//     { name: 'Meera Jadhav', code: 'VND-0887', centre: 'Phaltan Centre', shift: 'AM', qty: 98.0, fat: 3.9, snf: 8.4, rate: 39.80, status: 'Accepted', tag: 'green' },
//     { name: 'Sanjay Deshmukh', code: 'VND-0512', centre: 'Baramati Centre', shift: 'AM', qty: 210.0, fat: 3.6, snf: 8.1, rate: 37.50, status: 'Lab Pending', tag: 'amber' },
//     { name: 'Kavita More', code: 'VND-1210', centre: 'Shirwal Centre', shift: 'AM', qty: 76.5, fat: 4.6, snf: 9.0, rate: 44.30, status: 'Accepted', tag: 'green' },
//     { name: 'Anil Bhosale', code: 'VND-0765', centre: 'Phaltan Centre', shift: 'AM', qty: 55.0, fat: 3.2, snf: 7.6, rate: 34.20, status: 'Rejected', tag: 'red' },
// ];

// const UpArrow = () => (
//     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
//         <path d="M5 15l7-7 7 7" />
//     </svg>
// );

// const DownArrow = () => (
//     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
//         <path d="M19 9l-7 7-7-7" />
//     </svg>
// );

// const Dashboard = () => {
//     const [revealed, setRevealed] = useState(false);
//     const [chartReady, setChartReady] = useState(false);
//     const [vehicleCount, setVehicleCount] = useState('');
//     const [shipmentOpenCount, setShipmentOpenCount] = useState('');
//     const [totalSalesCount, setTotalSalesCount] = useState('');
//     const [activeParty, setActiveParty] = useState('');
//     const [totalShipment, setTotalShipment] = useState('');
//     const [parsedToken, setParsedToken] = useState('');
//     const [loading, setLoading] = useState('');
//     const [salesComparison, setSalesComparison] = useState([]);

//     const vehicleCountUp = useCountUp(vehicleCount);
//     const shipmentOpenCountUp = useCountUp(shipmentOpenCount);
//     const totalSalesCountUp = useCountUp(totalSalesCount);
//     const activePartyUp = useCountUp(activeParty);
//     const totalShipmentUp = useCountUp(totalShipment);

//     useEffect(() => {
//         setRevealed(true);
//         const chartTimer = setTimeout(() => setChartReady(true), 80);
//         return () => clearTimeout(chartTimer);
//     }, []);

//     useEffect(() => {
//         const token = localStorage.getItem('accessToken');
//         setParsedToken(token);
//     }, [])

//     useEffect(() => {
//         if (parsedToken) {
//             getAllStatusDetails();
//             getAllSalesComparison();
//         }
//     }, [parsedToken])

//     const getAllStatusDetails = () => {
//         if (!parsedToken) return;
//         setLoading(true);
//         let URL = '';
//         URL = `${environment?.config?.apiBaseUri}dashboard/getAllUser`
//         axios.get(URL, {
//             headers: {
//                 Authorization: `Bearer ${parsedToken}`,
//                 "Content-Type": "application/json"
//             }
//         })
//             .then((response) => {
//                 if (response?.status === 200) {
//                     setVehicleCount(response?.data?.vehicleCount);
//                     setShipmentOpenCount(response?.data?.shipmentOpenCount);
//                     setTotalSalesCount(response?.data?.totalSalesCount);
//                     setActiveParty(response?.data?.activeParty);
//                     setTotalShipment(response?.data?.totalShipment);
//                     setLoading(false);
//                 }
//             })
//             .catch((error) => {
//                 console.error('❌ Error fetching data:', error);
//                 toast.error('Failed to fetch data');
//                 setLoading(false);
//                 if (error.status === 401 && error.code === 'ERR_BAD_REQUEST') {
//                     // handleLogOut();
//                 }
//             });
//     }
//     const getAllSalesComparison = () => {
//         if (!parsedToken) return;

//         setLoading(true);

//         const URL = `${environment?.config?.apiBaseUri}dashboard/sales-comparison`;

//         axios.get(URL, {
//             headers: {
//                 Authorization: `Bearer ${parsedToken}`,
//                 "Content-Type": "application/json"
//             }
//         })
//             .then((response) => {
//                 if (response?.status === 200) {

//                     const data = response.data;

//                     const todaySales = data.todaySales;
//                     const yesterdaySales = data.yesterdaySales;

//                     let todayTag;
//                     let yesterdayTag;

//                     if (todaySales > yesterdaySales) {
//                         todayTag = 'green';
//                         yesterdayTag = 'red';
//                     } else if (yesterdaySales > todaySales) {
//                         todayTag = 'red';
//                         yesterdayTag = 'green';
//                     } else {
//                         todayTag = 'light-orange';
//                         yesterdayTag = 'light-orange';
//                     }

//                     const formattedData = Object.entries(data).map(([key, value]) => {

//                         let tag = 'gray';

//                         if (key === 'todaySales') {
//                             tag = todayTag;
//                         } else if (key === 'yesterdaySales') {
//                             tag = yesterdayTag;
//                         } else if (key === 'percentageChange') {
//                             tag = 'blue';
//                         } else if (key === 'comparison') {
//                             tag = 'gray';
//                         }

//                         return {
//                             label: key
//                                 .replace(/([A-Z])/g, ' $1')
//                                 .replace(/^./, str => str.toUpperCase()),
//                             value,
//                             tag
//                         };
//                     });

//                     setSalesComparison(formattedData);
//                     setLoading(false);
//                 }
//             })
//             .catch((error) => {
//                 console.error('❌ Error fetching data:', error);
//                 toast.error('Failed to fetch data');
//                 setLoading(false);

//                 if (error.status === 401 && error.code === 'ERR_BAD_REQUEST') {
//                     // handleLogOut();
//                 }
//             });
//     };

//     const maxChartValue = Math.max(...CHART_DATA.map((d) => d.value));

//     return (
//         <div>
//             <div className="kpi-row">
//                 <div className={`kpi-card ${revealed ? 'reveal' : ''}`} style={{ animationDelay: '200ms' }}>
//                     <div className="kpi-top">
//                         <div>
//                             <div className="kpi-label">Vehicle Count</div>
//                             <div className="kpi-value">
//                                 {Math.round(vehicleCountUp).toLocaleString('en-IN')}{' '}
//                                 {/* <span style={{ fontSize: 14, color: 'var(--text-faint)', fontWeight: 600 }}></span> */}
//                             </div>
//                         </div>
//                         <div className="gauge">
//                             <svg viewBox="0 0 48 40" aria-label="Truck">
//                                 {/* Truck body */}
//                                 <rect x="4" y="10" width="25" height="20" rx="2" fill="none" stroke="var(--border)" strokeWidth="2" />

//                                 {/* Truck cabin */}
//                                 <path
//                                     d="M29 17h7l7 7v6H29V17z"
//                                     fill="none"
//                                     stroke="var(--border)"
//                                     strokeWidth="2"
//                                     strokeLinejoin="round"
//                                 />

//                                 {/* Cabin window */}
//                                 <path d="M31 19h5l4 5H31v-5z" fill="var(--dairy-blue)" opacity="0.85" />

//                                 {/* Wheels */}
//                                 <circle cx="13" cy="31" r="4" fill="var(--dairy-blue)" />
//                                 <circle cx="36" cy="31" r="4" fill="var(--dairy-blue)" />

//                                 {/* Wheel centers */}
//                                 <circle cx="13" cy="31" r="1.5" fill="var(--border)" />
//                                 <circle cx="36" cy="31" r="1.5" fill="var(--border)" />

//                                 {/* Animated truck movement */}
//                                 <animateTransform
//                                     attributeName="transform"
//                                     type="translate"
//                                     from="-15 0"
//                                     to="10 0"
//                                     dur="0.9s"
//                                     fill="freeze"
//                                 />
//                             </svg>
//                         </div>
//                     </div>
//                 </div>

//                 <div className={`kpi-card ${revealed ? 'reveal' : ''}`} style={{ animationDelay: '600ms' }}>
//                     <div className="kpi-top">
//                         <div>
//                             <div className="kpi-label">Open Shipment / Total Shipment</div>
//                             <div className="kpi-value">{Math.round(shipmentOpenCountUp).toLocaleString('en-IN')}
//                                 <span style={{ color: 'var(--text-faint)' }}> / </span>
//                                 {Math.round(totalShipmentUp).toLocaleString('en-IN')}
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className={`kpi-card ${revealed ? 'reveal' : ''}`} style={{ animationDelay: '1000ms' }}>
//                     <div className="kpi-top">
//                         <div>
//                             <div className="kpi-label">Total Sales Count</div>
//                             <div className="kpi-value">{Math.round(totalSalesCountUp).toLocaleString('en-IN')}</div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className={`kpi-card ${revealed ? 'reveal' : ''}`} style={{ animationDelay: '1400ms' }}>
//                     <div className="kpi-top">
//                         <div>
//                             <div className="kpi-label">Active Party</div>
//                             <div className="kpi-value">
//                                 {/* {fatValue.toFixed(1)} */}
//                                 {/* <span style={{ fontSize: 14, color: 'var(--text-faint)' }}> / </span> */}
//                                 {/* {snfValue.toFixed(1)} */}
//                                 {Math.round(activePartyUp).toLocaleString('en-IN')}
//                             </div>
//                         </div>
//                     </div>
//                     {/* <div className="kpi-delta up"><UpArrow /> Within quality band</div> */}
//                 </div>
//             </div>
//             {/* 
//             <div className="grid-2">
//                 <div className="card">
//                     <div className="card-head">
//                         <div>
//                             <h3>Collection — Last 7 Days</h3>
//                             <div className="sub">Litres collected across all collection centres</div>
//                         </div>
//                         <button className="btn btn-outline btn-sm">Export</button>
//                     </div>
//                     <div className="card-body chart-wrap">
//                         <div className="bar-chart">
//                             {CHART_DATA.map((item, i) => {
//                                 const pct = ((item.value / maxChartValue) * 100).toFixed(1);
//                                 return (
//                                     <div className="bar-col" key={item.day}>
//                                         <div className="bar-col-value">{(item.value / 1000).toFixed(1)}k</div>
//                                         <div
//                                             className="bar"
//                                             style={{
//                                                 height: chartReady ? `${pct}%` : '0%',
//                                                 transitionDelay: `${i * 80}ms`,
//                                             }}
//                                         />
//                                         <div className="bar-label">{item.day}</div>
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                     </div>
//                 </div>

//                 <div className="card">
//                     <div className="card-head">
//                         <div><h3>Sales Comparison</h3>
//                             <div className="sub">Comparig recent and last data</div>
//                         </div>
//                     </div>
//                     <div className="card-body">
//                         <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//                             {salesComparison.map((f) => (
//                                 <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                                     <span className={`tag tag-${f.tag}`}><span className="tag-dot" />{f.label}</span>
//                                     <b className="mono">{f.value}</b>
//                                 </div>
//                             ))}
//                         </div>

//                          <div className="stat-inline" style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
//                             <div><b>96%</b>On-time pickups</div>
//                             <div><b>1,240 km</b>Covered today</div>
//                         </div>  
//                     </div>
//                 </div>
//             </div> */}

//             {/* <div className="card">
//                 <div className="card-head">
//                     <div><h3>Recent Collection Entries</h3><div className="sub">Latest logs across shifts</div></div>
//                     <button className="btn btn-shadow-sm" style={{ color: 'white', background: '#22c55e' }}>
//                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
//                         New Entry
//                     </button>
//                 </div>
//                 <div className="card-body" style={{ padding: 0 }}>
//                     <table>
//                         <thead>
//                             <tr>
//                                 <th>Vendor</th><th>Centre</th><th>Shift</th><th>Qty (L)</th>
//                                 <th>Fat %</th><th>SNF %</th><th>Rate/L</th><th>Status</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {RECENT_ENTRIES.map((row) => (
//                                 <tr key={row.code}>
//                                     <td>
//                                         <div className="cell-primary">{row.name}</div>
//                                         <div className="cell-sub">{row.code}</div>
//                                     </td>
//                                     <td>{row.centre}</td>
//                                     <td>{row.shift}</td>
//                                     <td className="num">{row.qty.toFixed(1)}</td>
//                                     <td className="num">{row.fat.toFixed(1)}</td>
//                                     <td className="num">{row.snf.toFixed(1)}</td>
//                                     <td className="num">₹{row.rate.toFixed(2)}</td>
//                                     <td><span className={`tag tag-${row.tag}`}><span className="tag-dot" />{row.status}</span></td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div> */}
//             <ToastContainer />
//         </div>
//     );
// };

// export default Dashboard;


import { useEffect, useMemo, useState } from 'react';
import '../../styles/shared.css';
import './Dashboard.css';
import axios from 'axios';
import environment from '../../Environment/Environment';
import { toast, ToastContainer } from 'react-toastify';

/* =========================================================
   DASHBOARD STATIC DATA
   ========================================================= */

const CHART_DATA = [
    { day: 'Mon', value: 15200 },
    { day: 'Tue', value: 16800 },
    { day: 'Wed', value: 15900 },
    { day: 'Thu', value: 17650 },
    { day: 'Fri', value: 16200 },
    { day: 'Sat', value: 18420 },
    { day: 'Sun', value: 14100 },
];

const RECENT_ENTRIES = [
    {
        name: 'Vasant Kale',
        code: 'VND-1042',
        centre: 'Shirwal Centre',
        shift: 'AM',
        qty: 142.5,
        fat: 4.3,
        snf: 8.7,
        rate: 42.10,
        status: 'Accepted',
        tag: 'green',
        time: '07:45 AM',
    },
    {
        name: 'Meera Jadhav',
        code: 'VND-0887',
        centre: 'Phaltan Centre',
        shift: 'AM',
        qty: 98.0,
        fat: 3.9,
        snf: 8.4,
        rate: 39.80,
        status: 'Accepted',
        tag: 'green',
        time: '08:15 AM',
    },
    {
        name: 'Sanjay Deshmukh',
        code: 'VND-0512',
        centre: 'Baramati Centre',
        shift: 'AM',
        qty: 210.0,
        fat: 3.6,
        snf: 8.1,
        rate: 37.50,
        status: 'Lab Pending',
        tag: 'amber',
        time: '09:05 AM',
    },
    {
        name: 'Kavita More',
        code: 'VND-1210',
        centre: 'Shirwal Centre',
        shift: 'AM',
        qty: 76.5,
        fat: 4.6,
        snf: 9.0,
        rate: 44.30,
        status: 'Accepted',
        tag: 'green',
        time: '09:20 AM',
    },
];

/* =========================================================
   COUNT UP
   ========================================================= */

const useCountUp = (target, duration = 1200) => {
    const numericTarget = Number(target) || 0;

    const [value, setValue] = useState(0);

    useEffect(() => {
        let rafId;

        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min(
                1,
                (now - start) / duration
            );

            const eased =
                1 - Math.pow(1 - progress, 3);

            setValue(numericTarget * eased);

            if (progress < 1) {
                rafId = requestAnimationFrame(tick);
            }
        };

        rafId = requestAnimationFrame(tick);

        return () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
        };
    }, [numericTarget, duration]);

    return value;
};

/* =========================================================
   ICONS
   ========================================================= */

const TruckIcon = ({ className = '' }) => (
    <svg
        className={className}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
    >
        <path
            d="M3.5 7.5H19V22H3.5V7.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
        />

        <path
            d="M19 12H24L28.5 16.5V22H19V12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
        />

        <path
            d="M23 12V16.5H28.5"
            stroke="currentColor"
            strokeWidth="2"
        />

        <circle
            cx="9"
            cy="23"
            r="3"
            stroke="currentColor"
            strokeWidth="2"
        />

        <circle
            cx="23"
            cy="23"
            r="3"
            stroke="currentColor"
            strokeWidth="2"
        />
    </svg>
);

const ShipmentIcon = () => (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
            d="M6 9.5L16 4L26 9.5V22.5L16 28L6 22.5V9.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
        />

        <path
            d="M6 9.5L16 15L26 9.5"
            stroke="currentColor"
            strokeWidth="2"
        />

        <path
            d="M16 15V28"
            stroke="currentColor"
            strokeWidth="2"
        />

        <path
            d="M11 7L21 12.5"
            stroke="currentColor"
            strokeWidth="2"
        />
    </svg>
);

const SalesIcon = () => (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
            d="M5 26V18"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
        />

        <path
            d="M13 26V13"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
        />

        <path
            d="M21 26V8"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
        />

        <path
            d="M4 9L10 5L15 8L25 3"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />

        <path
            d="M21 3H25V7"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const PartyIcon = () => (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle
            cx="12"
            cy="10"
            r="4"
            stroke="currentColor"
            strokeWidth="2"
        />

        <circle
            cx="22"
            cy="11"
            r="3.5"
            stroke="currentColor"
            strokeWidth="2"
        />

        <path
            d="M4 26C4 20.5 7.5 17 12 17C16.5 17 20 20.5 20 26"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        />

        <path
            d="M19 18C23.5 17.7 27 20.5 28 25"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        />
    </svg>
);

const DropIcon = () => (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
            d="M16 3C16 3 7 13.5 7 19C7 24.2 11 28 16 28C21 28 25 24.2 25 19C25 13.5 16 3 16 3Z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
        />

        <path
            d="M11.5 20.5C12 23 13.5 24.5 16 25"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        />
    </svg>
);

const ScaleIcon = () => (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
            d="M16 5V27"
            stroke="currentColor"
            strokeWidth="2"
        />

        <path
            d="M8 8H24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        />

        <path
            d="M8 8L3.5 17H12.5L8 8Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
        />

        <path
            d="M24 8L19.5 17H28.5L24 8Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
        />

        <path
            d="M10 27H22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        />
    </svg>
);

const ChartIcon = () => (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
            d="M5 27V19"
            stroke="currentColor"
            strokeWidth="2"
        />

        <path
            d="M13 27V14"
            stroke="currentColor"
            strokeWidth="2"
        />

        <path
            d="M21 27V9"
            stroke="currentColor"
            strokeWidth="2"
        />

        <path
            d="M5 11L11 8L16 11L26 4"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />

        <path
            d="M22 4H26V8"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
        />
    </svg>
);

/* =========================================================
   REALISTIC MILK TRUCK
   ========================================================= */

const MilkTruck = ({
    side = 'left',
    label = 'MILK IMPORT',
}) => {
    const isRight = side === 'right';

    return (
        <svg
            className="milk-truck-svg"
            viewBox="0 0 570 250"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={label}
        >
            <defs>
                <linearGradient
                    id={`truckMetal-${side}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                >
                    <stop offset="0%" stopColor="#707a82" />
                    <stop offset="8%" stopColor="#f9fbfc" />
                    <stop offset="20%" stopColor="#aab2b8" />
                    <stop offset="35%" stopColor="#ffffff" />
                    <stop offset="49%" stopColor="#7d878f" />
                    <stop offset="64%" stopColor="#f8fafb" />
                    <stop offset="80%" stopColor="#a2abb2" />
                    <stop offset="94%" stopColor="#f6f8f9" />
                    <stop offset="100%" stopColor="#737d85" />
                </linearGradient>

                <linearGradient
                    id={`truckCab-${side}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                >
                    {isRight ? (
                        <>
                            <stop offset="0%" stopColor="#75b9ff" />
                            <stop offset="40%" stopColor="#2985dc" />
                            <stop offset="100%" stopColor="#0759a5" />
                        </>
                    ) : (
                        <>
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="50%" stopColor="#dce2e6" />
                            <stop offset="100%" stopColor="#9ca5ab" />
                        </>
                    )}
                </linearGradient>

                <linearGradient
                    id={`truckGlass-${side}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                >
                    <stop
                        offset="0%"
                        stopColor="#e7faff"
                        stopOpacity=".95"
                    />

                    <stop
                        offset="38%"
                        stopColor="#ccebf5"
                        stopOpacity=".72"
                    />

                    <stop
                        offset="62%"
                        stopColor="#496d80"
                        stopOpacity=".9"
                    />

                    <stop
                        offset="100%"
                        stopColor="#d9f1f8"
                        stopOpacity=".92"
                    />
                </linearGradient>

                <linearGradient
                    id={`truckHighlight-${side}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                >
                    <stop
                        offset="0%"
                        stopColor="#ffffff"
                        stopOpacity="0"
                    />

                    <stop
                        offset="45%"
                        stopColor="#ffffff"
                        stopOpacity=".9"
                    />

                    <stop
                        offset="55%"
                        stopColor="#ffffff"
                        stopOpacity=".18"
                    />

                    <stop
                        offset="100%"
                        stopColor="#ffffff"
                        stopOpacity="0"
                    />
                </linearGradient>

                <filter
                    id={`truckShadow-${side}`}
                    x="-30%"
                    y="-30%"
                    width="170%"
                    height="180%"
                >
                    <feDropShadow
                        dx="0"
                        dy="10"
                        stdDeviation="7"
                        floodColor="#17232c"
                        floodOpacity=".23"
                    />
                </filter>
            </defs>

            <ellipse
                cx="288"
                cy="222"
                rx="220"
                ry="13"
                fill="#1e2a32"
                opacity=".12"
            />

            <g filter={`url(#truckShadow-${side})`}>
                {/* Chassis */}
                <rect
                    x="75"
                    y="180"
                    width="425"
                    height="11"
                    rx="5"
                    fill="#222a30"
                />

                <rect
                    x="110"
                    y="190"
                    width="330"
                    height="6"
                    rx="3"
                    fill="#59636a"
                />

                {/* Tanker body */}
                <path
                    d="M70 84
                       Q70 67 87 67
                       H357
                       Q371 67 371 84
                       V164
                       Q371 178 357 178
                       H83
                       Q70 178 70 164
                       Z"
                    fill={`url(#truckMetal-${side})`}
                    stroke="#505b63"
                    strokeWidth="2.5"
                />

                {/* Tanker rounded ends */}
                <path
                    d="M70 84Q70 67 88 67"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="4"
                    opacity=".7"
                />

                <path
                    d="M70 151Q70 178 89 178"
                    fill="none"
                    stroke="#59636b"
                    strokeWidth="4"
                    opacity=".5"
                />

                {/* Tanker reflection */}
                <path
                    d="M91 77C155 65 277 65 350 76"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="7"
                    strokeLinecap="round"
                    opacity=".75"
                />

                <path
                    d="M90 103C160 94 276 96 353 105"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity=".35"
                />

                {/* Tanker bands */}
                {[135, 225, 315].map((x) => (
                    <g key={x}>
                        <path
                            d={`M${x} 69V176`}
                            stroke="#59636b"
                            strokeWidth="3"
                            opacity=".43"
                        />

                        <path
                            d={`M${x + 5} 70V174`}
                            stroke="#ffffff"
                            strokeWidth="2"
                            opacity=".48"
                        />
                    </g>
                ))}

                {/* Tanker top caps */}
                <g>
                    <ellipse
                        cx="150"
                        cy="63"
                        rx="29"
                        ry="7"
                        fill="#6d777e"
                        stroke="#424c53"
                        strokeWidth="2"
                    />

                    <ellipse
                        cx="150"
                        cy="61"
                        rx="21"
                        ry="5"
                        fill="#e3e7e9"
                    />

                    <ellipse
                        cx="285"
                        cy="63"
                        rx="29"
                        ry="7"
                        fill="#6d777e"
                        stroke="#424c53"
                        strokeWidth="2"
                    />

                    <ellipse
                        cx="285"
                        cy="61"
                        rx="21"
                        ry="5"
                        fill="#e3e7e9"
                    />
                </g>

                {/* Cab */}
                <path
                    d="M371 81
                       H456
                       Q468 81 478 91
                       L511 126
                       V180
                       H363
                       V98
                       Q363 81 371 81Z"
                    fill={`url(#truckCab-${side})`}
                    stroke="#45515a"
                    strokeWidth="2.5"
                />

                {/* Cab glass */}
                <path
                    d="M378 90
                       H447
                       L473 119
                       H378
                       Z"
                    fill={`url(#truckGlass-${side})`}
                    stroke="#4a5963"
                    strokeWidth="2"
                />

                <path
                    d="M451 91L483 121H451Z"
                    fill={`url(#truckGlass-${side})`}
                    stroke="#4a5963"
                    strokeWidth="2"
                />

                <path
                    d="M383 92H442L427 106H382Z"
                    fill="#ffffff"
                    opacity=".35"
                />

                {/* Door */}
                <path
                    d="M379 122V173H449V122"
                    fill="none"
                    stroke="#4d5961"
                    strokeWidth="2"
                    opacity=".55"
                />

                {/* Door handle */}
                <rect
                    x="431"
                    y="136"
                    width="12"
                    height="3"
                    rx="1.5"
                    fill="#39444b"
                />

                {/* Head lamp */}
                <rect
                    x="500"
                    y="140"
                    width="8"
                    height="14"
                    rx="2"
                    fill="#ffe4a0"
                />

                {/* Rear connector */}
                <path
                    d="M70 119H48V151H70"
                    fill="none"
                    stroke="#4e5961"
                    strokeWidth="8"
                />

                <path
                    d="M48 120V150"
                    stroke="#171e24"
                    strokeWidth="4"
                />

                {/* Wheels */}
                {[110, 340, 415, 470].map((x) => (
                    <g key={x}>
                        <circle
                            cx={x}
                            cy="193"
                            r="27"
                            fill="#1d2328"
                            stroke="#0d1115"
                            strokeWidth="4"
                        />

                        <circle
                            cx={x}
                            cy="193"
                            r="15"
                            fill="#c8ced2"
                            stroke="#4a545c"
                            strokeWidth="4"
                        />

                        <circle
                            cx={x}
                            cy="193"
                            r="5"
                            fill="#59636b"
                        />

                        <circle
                            cx={x - 7}
                            cy="186"
                            r="2"
                            fill="#ffffff"
                            opacity=".45"
                        />
                    </g>
                ))}

                {/* Label */}
                <rect
                    x="151"
                    y="119"
                    width="151"
                    height="28"
                    rx="14"
                    fill="#ffffff"
                    opacity=".78"
                />

                <text
                    x="226"
                    y="138"
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="900"
                    fill={isRight ? "#dc9714" : "#11866f"}
                    letterSpacing="1"
                >
                    {label}
                </text>

                {/* Gloss sweep */}
                <path
                    d="M85 72H350"
                    stroke={`url(#truckHighlight-${side})`}
                    strokeWidth="5"
                    strokeLinecap="round"
                    opacity=".85"
                />
            </g>
        </svg>
    );
};

/* =========================================================
   REALISTIC STORAGE TANK
   ========================================================= */

const StorageTank = () => (
    <svg
        className="storage-tank-svg"
        viewBox="0 0 330 430"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Milk storage tank"
    >
        <defs>
            <linearGradient
                id="storageMetal"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
            >
                <stop offset="0%" stopColor="#67727a" />
                <stop offset="8%" stopColor="#f5f7f8" />
                <stop offset="19%" stopColor="#9ba5ac" />
                <stop offset="34%" stopColor="#ffffff" />
                <stop offset="49%" stopColor="#69747d" />
                <stop offset="63%" stopColor="#f9fbfc" />
                <stop offset="78%" stopColor="#a0a9b0" />
                <stop offset="91%" stopColor="#f8fafb" />
                <stop offset="100%" stopColor="#6c767e" />
            </linearGradient>

            <linearGradient
                id="storageTop"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
            >
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#aab3b9" />
                <stop offset="100%" stopColor="#505b63" />
            </linearGradient>

            <filter
                id="storageShadow"
                x="-60%"
                y="-30%"
                width="220%"
                height="180%"
            >
                <feDropShadow
                    dx="0"
                    dy="10"
                    stdDeviation="8"
                    floodColor="#1e2b34"
                    floodOpacity=".22"
                />
            </filter>
        </defs>

        <ellipse
            cx="165"
            cy="411"
            rx="115"
            ry="10"
            fill="#1c2b34"
            opacity=".12"
        />

        <g filter="url(#storageShadow)">
            {/* Top cage */}
            <path
                d="M88 66V20
                   M111 66V13
                   M140 62V9
                   M165 62V6
                   M191 62V10
                   M218 66V14
                   M240 66V21"
                stroke="#626d74"
                strokeWidth="3"
                fill="none"
            />

            <path
                d="M88 20H240
                   M91 34H237
                   M94 48H234"
                stroke="#58636b"
                strokeWidth="3"
                fill="none"
            />

            {/* Tank top */}
            <ellipse
                cx="165"
                cy="66"
                rx="76"
                ry="27"
                fill="url(#storageTop)"
                stroke="#4d5860"
                strokeWidth="3"
            />

            <ellipse
                cx="165"
                cy="60"
                rx="54"
                ry="15"
                fill="#e9edef"
                opacity=".62"
            />

            {/* Tank body */}
            <rect
                x="88"
                y="64"
                width="154"
                height="238"
                rx="46"
                fill="url(#storageMetal)"
                stroke="#4e5961"
                strokeWidth="3"
            />

            {/* Lower cone */}
            <path
                d="M88 286L111 330H219L242 286Z"
                fill="url(#storageMetal)"
                stroke="#4e5961"
                strokeWidth="3"
            />

            <path
                d="M111 330L139 369H191L219 330Z"
                fill="#818b92"
                stroke="#4e5961"
                strokeWidth="3"
            />

            {/* Tank highlights */}
            <path
                d="M108 89V273"
                stroke="#ffffff"
                strokeWidth="11"
                strokeLinecap="round"
                opacity=".52"
            />

            <path
                d="M128 82V285"
                stroke="#dfe7eb"
                strokeWidth="4"
                opacity=".48"
            />

            <path
                d="M214 86V284"
                stroke="#ffffff"
                strokeWidth="4"
                opacity=".27"
            />

            {/* Horizontal tank reflections */}
            <path
                d="M96 102H235"
                stroke="#ffffff"
                strokeWidth="3"
                opacity=".30"
            />

            <path
                d="M96 263H235"
                stroke="#4e5961"
                strokeWidth="3"
                opacity=".35"
            />

            {/* Ladder */}
            <path
                d="M242 72V318"
                stroke="#505b63"
                strokeWidth="5"
            />

            <path
                d="M262 72V318"
                stroke="#505b63"
                strokeWidth="5"
            />

            {[94, 116, 138, 160, 182, 204, 226, 248, 270, 292].map(
                (y) => (
                    <path
                        key={y}
                        d={`M242 ${y}H262`}
                        stroke="#68737b"
                        strokeWidth="4"
                    />
                )
            )}

            {/* Top valve */}
            <ellipse
                cx="165"
                cy="7"
                rx="14"
                ry="5"
                fill="#4c575e"
            />

            <rect
                x="158"
                y="1"
                width="14"
                height="12"
                rx="4"
                fill="#707a81"
            />

            {/* Milk logo */}
            <path
                d="M165 102C165 102 145 126 145 140C145 152 153 161 165 161C177 161 185 152 185 140C185 126 165 102 165 102Z"
                fill="#36b9ee"
                stroke="#146c9f"
                strokeWidth="3"
            />

            <path
                d="M153 141C156 148 161 152 167 152"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
            />

            <text
                x="165"
                y="187"
                textAnchor="middle"
                fontSize="21"
                fontWeight="900"
                fill="#263b52"
            >
                MILK
            </text>

            <text
                x="165"
                y="208"
                textAnchor="middle"
                fontSize="12"
                fontWeight="900"
                fill="#31465b"
                letterSpacing="1.2"
            >
                STORAGE
            </text>

            {/* Legs */}
            <path
                d="M109 327V395
                   M139 368V405
                   M191 368V405
                   M221 327V395"
                stroke="#59646c"
                strokeWidth="7"
            />

            <ellipse
                cx="109"
                cy="400"
                rx="14"
                ry="5"
                fill="#77828a"
            />

            <ellipse
                cx="139"
                cy="409"
                rx="14"
                ry="5"
                fill="#77828a"
            />

            <ellipse
                cx="191"
                cy="409"
                rx="14"
                ry="5"
                fill="#77828a"
            />

            <ellipse
                cx="221"
                cy="400"
                rx="14"
                ry="5"
                fill="#77828a"
            />
        </g>
    </svg>
);

/* =========================================================
   ANIMATED PIPE
   ========================================================= */

const FlowPipe = ({
    direction = 'right',
    type = 'green',
}) => {
    return (
        <div
            className={`milk-pipe milk-pipe-${type} milk-pipe-${direction}`}
            aria-hidden="true"
        >
            <div className="milk-pipe-body">
                <div className="pipe-highlight" />
            </div>

            <div className="pipe-arrows">
                <span>›</span>
                <span>›</span>
                <span>›</span>
                <span>›</span>
                <span>›</span>
            </div>
        </div>
    );
};

/* =========================================================
   KPI CARD
   ========================================================= */

const KpiCard = ({
    title,
    value,
    subtitle,
    icon,
    tone,
    trend,
    trendDirection = 'up',
}) => {
    return (
        <article className={`dashboard-kpi dashboard-kpi-${tone}`}>
            <div className="dashboard-kpi-icon">
                {icon}
            </div>

            <div className="dashboard-kpi-content">
                <div className="dashboard-kpi-label">
                    {title}
                </div>

                <div className="dashboard-kpi-value">
                    {value}
                </div>

                <div className="dashboard-kpi-subtitle">
                    {subtitle}
                </div>
            </div>

            {trend && (
                <div
                    className={`dashboard-kpi-trend dashboard-trend-${trendDirection}`}
                >
                    {trendDirection === 'up' && '↗'}
                    {trendDirection === 'down' && '↘'}
                    {trendDirection === 'flat' && '—'}
                    <span>{trend}</span>
                </div>
            )}
        </article>
    );
};

/* =========================================================
   COLLECTION CHART
   ========================================================= */

const CollectionChart = () => {
    const width = 760;
    const height = 245;

    const paddingLeft = 44;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 38;

    const chartWidth =
        width - paddingLeft - paddingRight;

    const chartHeight =
        height - paddingTop - paddingBottom;

    const maxValue = Math.max(
        ...CHART_DATA.map((item) => item.value)
    );

    const minValue = 0;

    const points = CHART_DATA.map((item, index) => {
        const x =
            paddingLeft +
            (index /
                (CHART_DATA.length - 1)) *
            chartWidth;

        const y =
            paddingTop +
            chartHeight -
            ((item.value - minValue) /
                (maxValue - minValue)) *
            chartHeight;

        return {
            ...item,
            x,
            y,
        };
    });

    const linePath = points
        .map(
            (point, index) =>
                `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
        )
        .join(' ');

    const areaPath = `
        ${linePath}
        L ${points[points.length - 1].x} ${height - paddingBottom}
        L ${points[0].x} ${height - paddingBottom}
        Z
    `;

    return (
        <div className="collection-chart">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
                className="collection-chart-svg"
            >
                <defs>
                    <linearGradient
                        id="collectionArea"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor="#18ad8a"
                            stopOpacity=".24"
                        />

                        <stop
                            offset="100%"
                            stopColor="#18ad8a"
                            stopOpacity=".015"
                        />
                    </linearGradient>
                </defs>

                {[0, 5000, 10000, 15000, 20000].map(
                    (value) => {
                        const y =
                            paddingTop +
                            chartHeight -
                            (value / 20000) *
                            chartHeight;

                        return (
                            <g key={value}>
                                <line
                                    x1={paddingLeft}
                                    x2={width - paddingRight}
                                    y1={y}
                                    y2={y}
                                    className="chart-grid-line"
                                />

                                <text
                                    x={paddingLeft - 9}
                                    y={y + 4}
                                    textAnchor="end"
                                    className="chart-y-label"
                                >
                                    {value === 0
                                        ? '0'
                                        : `${value / 1000}k`}
                                </text>
                            </g>
                        );
                    }
                )}

                <path
                    d={areaPath}
                    className="chart-area"
                    fill="url(#collectionArea)"
                />

                <path
                    d={linePath}
                    className="chart-line"
                />

                {points.map((point) => (
                    <g key={point.day}>
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r="5"
                            className="chart-point"
                        />

                        <circle
                            cx={point.x}
                            cy={point.y}
                            r="10"
                            className="chart-point-glow"
                        />

                        <text
                            x={point.x}
                            y={height - 13}
                            textAnchor="middle"
                            className="chart-x-label"
                        >
                            {point.day}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
};

/* =========================================================
   EFFICIENCY RING
   ========================================================= */

const EfficiencyRing = ({ value = 85 }) => {
    const radius = 47;
    const circumference = 2 * Math.PI * radius;

    const offset =
        circumference -
        (value / 100) * circumference;

    return (
        <div className="efficiency-ring">
            <svg viewBox="0 0 120 120">
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    className="efficiency-track"
                />

                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    className="efficiency-progress"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>

            <div className="efficiency-value">
                <strong>{value}%</strong>
                <span>Operations</span>
                <span>Efficiency</span>
            </div>
        </div>
    );
};

/* =========================================================
   DASHBOARD
   ========================================================= */

const Dashboard = () => {
    const [revealed, setRevealed] = useState(false);

    const [vehicleCount, setVehicleCount] = useState(0);
    const [shipmentOpenCount, setShipmentOpenCount] = useState(0);
    const [totalSalesCount, setTotalSalesCount] = useState(0);
    const [activeParty, setActiveParty] = useState(0);
    const [totalShipment, setTotalShipment] = useState(0);

    const [importPercent, setImportPercent] = useState(0);
    const [exportPercent, setExportPercent] = useState(0);
    const [importLitre, setImportLitre] = useState(0);
    const [exportLitre, setExportLitre] = useState(0);

    const [parsedToken, setParsedToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [salesComparison, setSalesComparison] =
        useState([]);

    const vehicleCountUp = useCountUp(vehicleCount);
    const shipmentOpenCountUp =
        useCountUp(shipmentOpenCount);
    const totalSalesCountUp =
        useCountUp(totalSalesCount);
    const activePartyUp =
        useCountUp(activeParty);
    const totalShipmentUp =
        useCountUp(totalShipment);

    useEffect(() => {
        setRevealed(true);
        const token = localStorage.getItem('accessToken');
        setParsedToken(token || '');
    }, []);

    useEffect(() => {
        if (parsedToken) {
            getAllStatusDetails();
            getAllSalesComparison();
            // getAllMilkMovementDetails();
            // getAllTodaysOperationDetails();
        }
    }, [parsedToken]);

    const getAllStatusDetails = () => {
        if (!parsedToken) return;

        setLoading(true);

        const URL =
            `${environment?.config?.apiBaseUri}` +
            `dashboard/getAllUser`;

        axios
            .get(URL, {
                headers: {
                    Authorization:
                        `Bearer ${parsedToken}`,
                    'Content-Type':
                        'application/json',
                },
            })
            .then((response) => {
                if (response?.status === 200) {
                    const data =
                        response?.data || {};

                    setVehicleCount(
                        Number(data?.vehicleCount) || 0
                    );

                    setShipmentOpenCount(
                        Number(
                            data?.shipmentOpenCount
                        ) || 0
                    );

                    setTotalSalesCount(
                        Number(
                            data?.totalSalesCount
                        ) || 0
                    );

                    setActiveParty(
                        Number(data?.activeParty) || 0
                    );

                    setTotalShipment(
                        Number(
                            data?.totalShipment
                        ) || 0
                    );
                }
            })
            .catch((error) => {
                console.error(
                    '❌ Error fetching dashboard data:',
                    error
                );

                toast.error(
                    'Failed to fetch dashboard data'
                );
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const getAllSalesComparison = () => {
        if (!parsedToken) return;

        const URL =
            `${environment?.config?.apiBaseUri}` +
            `dashboard/sales-comparison`;

        axios
            .get(URL, {
                headers: {
                    Authorization:
                        `Bearer ${parsedToken}`,
                    'Content-Type':
                        'application/json',
                },
            })
            .then((response) => {
                if (response?.status === 200) {
                    const data =
                        response?.data || {};

                    const todaySales =
                        Number(
                            data?.todaySales
                        ) || 0;

                    const yesterdaySales =
                        Number(
                            data?.yesterdaySales
                        ) || 0;

                    let todayTag;
                    let yesterdayTag;

                    if (
                        todaySales >
                        yesterdaySales
                    ) {
                        todayTag = 'green';
                        yesterdayTag = 'red';
                    } else if (
                        yesterdaySales >
                        todaySales
                    ) {
                        todayTag = 'red';
                        yesterdayTag = 'green';
                    } else {
                        todayTag =
                            'light-orange';
                        yesterdayTag =
                            'light-orange';
                    }

                    const formattedData =
                        Object.entries(data).map(
                            ([key, value]) => {
                                let tag = 'gray';

                                if (
                                    key ===
                                    'todaySales'
                                ) {
                                    tag =
                                        todayTag;
                                } else if (
                                    key ===
                                    'yesterdaySales'
                                ) {
                                    tag =
                                        yesterdayTag;
                                } else if (
                                    key ===
                                    'percentageChange'
                                ) {
                                    tag = 'blue';
                                }

                                return {
                                    label: key
                                        .replace(
                                            /([A-Z])/g,
                                            ' $1'
                                        )
                                        .replace(
                                            /^./,
                                            (str) =>
                                                str.toUpperCase()
                                        ),
                                    value,
                                    tag,
                                };
                            }
                        );

                    setSalesComparison(
                        formattedData
                    );
                }
            })
            .catch((error) => {
                console.error(
                    '❌ Error fetching sales comparison:',
                    error
                );
            });
    };

    const getAllMilkMovementDetails = () => {
        if (!parsedToken) return;
        setLoading(true);
        const URL = `${environment?.config?.apiBaseUri}` + `dashboard/getAllmilkMovement`;

        axios
            .get(URL, {
                headers: {
                    Authorization:
                        `Bearer ${parsedToken}`,
                    'Content-Type':
                        'application/json',
                },
            })
            .then((response) => {
                if (response?.status === 200) {
                    const data =
                        response?.data || {};

                    setVehicleCount(Number(data?.vehicleCount) || 0);

                    setShipmentOpenCount(Number(data?.shipmentOpenCount) || 0);

                    setTotalSalesCount(Number(data?.totalSalesCount) || 0);

                    setActiveParty(Number(data?.activeParty) || 0);

                    setTotalShipment(Number(data?.totalShipment) || 0);
                }
            })
            .catch((error) => {
                console.error(
                    '❌ Error fetching dashboard data:',
                    error
                );

                toast.error(
                    'Failed to fetch dashboard data'
                );
            })
            .finally(() => {
                setLoading(false);
            });
    };
    const getAllTodaysOperationDetails = () => {
        if (!parsedToken) return;

        setLoading(true);

        const URL =
            `${environment?.config?.apiBaseUri}` +
            `dashboard/getTodaysOperationDetails`;

        axios
            .get(URL, {
                headers: {
                    Authorization:
                        `Bearer ${parsedToken}`,
                    'Content-Type':
                        'application/json',
                },
            })
            .then((response) => {
                if (response?.status === 200) {
                    const data =
                        response?.data || {};

                    setVehicleCount(
                        Number(data?.vehicleCount) || 0
                    );

                    setShipmentOpenCount(
                        Number(
                            data?.shipmentOpenCount
                        ) || 0
                    );

                    setTotalSalesCount(
                        Number(
                            data?.totalSalesCount
                        ) || 0
                    );

                    setActiveParty(
                        Number(data?.activeParty) || 0
                    );

                    setTotalShipment(
                        Number(
                            data?.totalShipment
                        ) || 0
                    );
                }
            })
            .catch((error) => {
                console.error(
                    '❌ Error fetching dashboard data:',
                    error
                );

                toast.error(
                    'Failed to fetch dashboard data'
                );
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const importLitres = 2541;
    const distributionLitres = 1275;

    const importPercentage = 79;
    const distributionPercentage = 52;

    const efficiency = useMemo(() => {
        if (!importLitres) return 0;

        return (
            (distributionLitres /
                importLitres) *
            100
        );
    }, []);

    const formattedEfficiency =
        efficiency.toFixed(1);

    return (
        <div
            className={`dashboard-page ${revealed
                ? 'dashboard-page-visible'
                : ''
                }`}
        >
            <section className="dashboard-intro">
                <div>

                </div>

                <div className="dashboard-live-status">
                    <span className="live-pulse" />
                    <span>LIVE</span>
                    <small>
                        System Active
                    </small>
                </div>
            </section>

            <section className="dashboard-kpi-grid">
                <KpiCard
                    title="Vehicles"
                    value={Math.round(
                        vehicleCountUp
                    ).toLocaleString('en-IN')}
                    subtitle="Total Vehicles"
                    icon={<TruckIcon />}
                    tone="green"
                    trend="0%"
                    trendDirection="up"
                />

                <KpiCard
                    title="Shipments"
                    value={
                        <>
                            {Math.round(
                                shipmentOpenCountUp
                            ).toLocaleString(
                                'en-IN'
                            )}

                            <span className="kpi-slash">
                                /
                            </span>

                            {Math.round(
                                totalShipmentUp
                            ).toLocaleString(
                                'en-IN'
                            )}
                        </>
                    }
                    subtitle="Open / Total"
                    icon={<ShipmentIcon />}
                    tone="blue"
                    trend="0%"
                    trendDirection="flat"
                />

                <KpiCard
                    title="Today's Sales"
                    value={Math.round(
                        totalSalesCountUp
                    ).toLocaleString('en-IN')}
                    subtitle="Total Sales Count"
                    icon={<SalesIcon />}
                    tone="purple"
                    trend="0%"
                    trendDirection="up"
                />

                <KpiCard
                    title="Active Parties"
                    value={Math.round(
                        activePartyUp
                    ).toLocaleString('en-IN')}
                    subtitle="Active Vendors"
                    icon={<PartyIcon />}
                    tone="orange"
                    trend="0%"
                    trendDirection="up"
                />
            </section>

            <section className="milk-movement-card">
                <div className="milk-movement-header">
                    <div>
                        <h2>
                            MILK MOVEMENT
                        </h2>

                        <p>
                            Real-time milk flow
                            from collection
                            to distribution
                        </p>
                    </div>

                    <div className="processing-badge">
                        <span />
                        PROCESSING LIVE
                    </div>
                </div>

                <div className="milk-flow-stage">
                    <div className="flow-metric flow-metric-left">
                        <span className="flow-metric-eyebrow">
                            IMPORT / COLLECTION
                        </span>

                        <strong>
                            {importPercentage}%
                        </strong>

                        <b>
                            {importLitres.toLocaleString(
                                'en-IN'
                            )}{' '}
                            L
                        </b>

                        <small>
                            Liters
                        </small>
                    </div>

                    <div className="flow-truck flow-truck-left">
                        <MilkTruck
                            side="left"
                            label="MILK IMPORT"
                        />
                    </div>

                    <div className="flow-pipe-wrapper flow-pipe-wrapper-left">
                        <FlowPipe
                            type="green"
                            direction="right"
                        />
                    </div>

                    <div className="flow-storage">
                        <StorageTank />

                        <div className="storage-label">
                            <span className="storage-live-dot" />

                            <div>
                                <strong>
                                    Processing &
                                    Storage
                                </strong>

                                <small>
                                    Live Status
                                </small>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PIPE */}
                    <div className="flow-pipe-wrapper flow-pipe-wrapper-right">
                        <FlowPipe
                            type="orange"
                            direction="right"
                        />
                    </div>

                    {/* RIGHT TRUCK */}
                    <div className="flow-truck flow-truck-right">
                        <MilkTruck
                            side="right"
                            label="MILK DISTRIBUTION"
                        />
                    </div>

                    {/* RIGHT INFO */}
                    <div className="flow-metric flow-metric-right">
                        <span className="flow-metric-eyebrow">
                            DISTRIBUTION
                        </span>

                        <strong>
                            {distributionPercentage}%
                        </strong>

                        <b>
                            {distributionLitres.toLocaleString(
                                'en-IN'
                            )}{' '}
                            L
                        </b>

                        <small>
                            Liters
                        </small>
                    </div>
                </div>
            </section>

            {/* =================================================
                ANALYTICS
            ================================================= */}

            <section className="dashboard-analysis-grid">
                {/* COLLECTION CHART */}
                <article className="dashboard-panel collection-panel">
                    <div className="panel-header">
                        <div>
                            <h3>
                                COLLECTION TREND
                            </h3>

                            <p>
                                This Week
                            </p>
                        </div>

                        <button
                            type="button"
                            className="chart-filter"
                        >
                            Liters
                            <span>⌄</span>
                        </button>
                    </div>

                    <div className="chart-highlight">
                        <span>
                            Weekly collection
                        </span>

                        <strong>
                            18,650 L
                        </strong>
                    </div>

                    <CollectionChart />
                </article>

                {/* TODAY OPERATIONS */}
                <article className="dashboard-panel operations-panel">
                    <div className="panel-header">
                        <div>
                            <h3>
                                TODAY'S
                                OPERATIONS
                            </h3>

                            <p>
                                Current activity
                            </p>
                        </div>
                    </div>

                    <div className="operations-content">
                        <div className="operations-list">
                            <div className="operation-item">
                                <div className="operation-icon green">
                                    <DropIcon />
                                </div>

                                <span>
                                    Milk Collection
                                    Records
                                </span>

                                <strong>
                                    128
                                </strong>
                            </div>

                            <div className="operation-item">
                                <div className="operation-icon blue">
                                    <TruckIcon />
                                </div>

                                <span>
                                    Active Vehicles
                                </span>

                                <strong>
                                    {Math.round(
                                        vehicleCountUp
                                    )}
                                </strong>
                            </div>

                            <div className="operation-item">
                                <div className="operation-icon purple">
                                    <ShipmentIcon />
                                </div>

                                <span>
                                    Total Shipments
                                </span>

                                <strong>
                                    {Math.round(
                                        totalShipmentUp
                                    )}
                                </strong>
                            </div>

                            <div className="operation-item">
                                <div className="operation-icon orange">
                                    <PartyIcon />
                                </div>

                                <span>
                                    Active Parties
                                </span>

                                <strong>
                                    {Math.round(
                                        activePartyUp
                                    )}
                                </strong>
                            </div>
                        </div>

                        <EfficiencyRing
                            value={85}
                        />
                    </div>
                </article>
            </section>

            {/* =================================================
                SECONDARY METRIC CARDS
            ================================================= */}

            <section className="secondary-metrics">
                <article className="secondary-card secondary-green">
                    <div className="secondary-icon">
                        <DropIcon />
                    </div>

                    <div>
                        <span>
                            Total Import
                        </span>

                        <strong>
                            {importLitres.toLocaleString(
                                'en-IN'
                            )}{' '}
                            L
                        </strong>

                        <small>
                            Liters
                        </small>
                    </div>

                    <div className="secondary-trend positive">
                        ↗ 12.5%
                    </div>
                </article>

                <article className="secondary-card secondary-red">
                    <div className="secondary-icon">
                        <TruckIcon />
                    </div>

                    <div>
                        <span>
                            Total Distribution
                        </span>

                        <strong>
                            {distributionLitres.toLocaleString(
                                'en-IN'
                            )}{' '}
                            L
                        </strong>

                        <small>
                            Liters
                        </small>
                    </div>

                    <div className="secondary-trend negative">
                        ↘ 8.3%
                    </div>
                </article>

                <article className="secondary-card secondary-blue">
                    <div className="secondary-icon">
                        <ScaleIcon />
                    </div>

                    <div>
                        <span>
                            Import vs
                            Distribution
                        </span>

                        <strong>
                            2.0 : 1
                        </strong>

                        <small>
                            Ratio
                        </small>
                    </div>

                    <div className="secondary-trend neutral">
                        — 0.0%
                    </div>
                </article>

                <article className="secondary-card secondary-purple">
                    <div className="secondary-icon">
                        <ChartIcon />
                    </div>

                    <div>
                        <span>
                            Efficiency
                        </span>

                        <strong>
                            {formattedEfficiency}%
                        </strong>

                        <small>
                            Distribution
                            Efficiency
                        </small>
                    </div>

                    <div className="secondary-trend positive-purple">
                        ↗ 5.7%
                    </div>
                </article>
            </section>

            {/* =================================================
                RECENT COLLECTIONS
            ================================================= */}

            {/* <section className="dashboard-panel recent-panel">
                <div className="panel-header recent-header">
                    <div>
                        <h3>
                            RECENT MILK
                            COLLECTIONS
                        </h3>

                        <p>
                            Latest collection
                            entries across
                            centres
                        </p>
                    </div>

                    <button
                        type="button"
                        className="view-all-button"
                    >
                        View All
                        <span>→</span>
                    </button>
                </div>

                <div className="collection-table-wrapper">
                    <table className="collection-table">
                        <thead>
                            <tr>
                                <th>
                                    VENDOR NAME
                                </th>

                                <th>
                                    CENTRE
                                </th>

                                <th>
                                    SHIFT
                                </th>

                                <th>
                                    QUANTITY
                                </th>

                                <th>
                                    FAT (%)
                                </th>

                                <th>
                                    SNF (%)
                                </th>

                                <th>
                                    RATE (₹/L)
                                </th>

                                <th>
                                    STATUS
                                </th>

                                <th>
                                    TIME
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {RECENT_ENTRIES.map(
                                (row) => (
                                    <tr
                                        key={
                                            row.code
                                        }
                                    >
                                        <td>
                                            <div className="vendor-cell">
                                                <div className="vendor-avatar">
                                                    {row.name
                                                        .split(
                                                            ' '
                                                        )
                                                        .map(
                                                            (
                                                                item
                                                            ) =>
                                                                item[0]
                                                        )
                                                        .slice(
                                                            0,
                                                            2
                                                        )
                                                        .join(
                                                            ''
                                                        )}
                                                </div>

                                                <div>
                                                    <strong>
                                                        {
                                                            row.name
                                                        }
                                                    </strong>

                                                    <small>
                                                        {
                                                            row.code
                                                        }
                                                    </small>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            {
                                                row.centre
                                            }
                                        </td>

                                        <td>
                                            <span
                                                className={`shift-badge shift-${row.shift.toLowerCase()}`}
                                            >
                                                {
                                                    row.shift
                                                }
                                            </span>
                                        </td>

                                        <td className="table-number">
                                            {row.qty.toFixed(
                                                1
                                            )}{' '}
                                            L
                                        </td>

                                        <td className="table-number">
                                            {row.fat.toFixed(
                                                1
                                            )}
                                        </td>

                                        <td className="table-number">
                                            {row.snf.toFixed(
                                                1
                                            )}
                                        </td>

                                        <td className="table-number">
                                            ₹
                                            {row.rate.toFixed(
                                                2
                                            )}
                                        </td>

                                        <td>
                                            <span
                                                className={`status-badge status-${row.tag}`}
                                            >
                                                <i />
                                                {
                                                    row.status
                                                }
                                            </span>
                                        </td>

                                        <td className="table-time">
                                            {
                                                row.time
                                            }
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </section> */}

            {/* Keep existing Toast functionality */}
            <ToastContainer />
        </div>
    );
};

export default Dashboard;