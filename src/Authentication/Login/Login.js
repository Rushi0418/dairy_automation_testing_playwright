import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { jwtDecode } from "jwt-decode";
import './Login.css';
import environment from '../../Environment/Environment';

// Ambient drifting milk-drop background — recreated from the original
// inline script that appended randomly sized/positioned/colored divs.
const DROP_COLORS = [
    'rgba(47,102,144,0.5)',
    'rgba(201,138,62,0.45)',
    'rgba(76,140,107,0.4)',
];

const generateDrops = (count = 10) =>
    Array.from({ length: count }, (_, i) => ({
        id: i,
        size: 10 + Math.random() * 22,
        left: Math.random() * 100,
        top: Math.random() * 100,
        color: DROP_COLORS[i % DROP_COLORS.length],
        duration: 5 + Math.random() * 5,
        delay: Math.random() * 4,
    }));

const EyeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3l18 18M10.6 10.6a3 3 0 004.24 4.24M6.6 6.6C4 8.3 2 12 2 12s4 7 10 7c1.7 0 3.2-.4 4.5-1.1M17.4 17.4C19.7 15.8 22 12 22 12s-1.1-2-3-3.7" />
    </svg>
);

const Login = () => {
    const navigate = useNavigate();
    const drops = useMemo(() => generateDrops(10), []);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [shakeEmail, setShakeEmail] = useState(false);
    const [shakePass, setShakePass] = useState(false);
    const [toastMsg, setToastMsg] = useState(null);

    // Auto-dismiss the toast, mirroring the original's transient message.
    useEffect(() => {
        if (!toastMsg) return;
        const t = setTimeout(() => setToastMsg(null), 2600);
        return () => clearTimeout(t);
    }, [toastMsg]);

    const handleClear = () => {
        setEmail('');
        setPassword('');
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        let valid = true;
        if (!email.trim()) {
            setShakeEmail(true);
            valid = false;
        }
        if (!password.trim()) {
            setShakePass(true);
            valid = false;
        }

        setTimeout(() => {
            setShakeEmail(false);
            setShakePass(false);
        }, 420);

        if (!valid) {
            setToastMsg({ text: 'Enter your user name and password to continue', isError: true });
            return;
        }

        const requestBody = {
            userName: email,
            password: password,
        }
        axios({
            url: `${environment.config.apiBaseUri}auth/signIn`,
            method: "POST",
            data: requestBody,
        })
            .then((res) => {
                if (res && res?.data) {
                    const token = res?.data?.token;
                    if (token) {
                        const accessToken = jwtDecode(token);
                        localStorage.setItem("authToken", JSON.stringify(accessToken));
                        localStorage.setItem("accessToken", token);
                        toast.success('Logging in!');
                        setLoading(false);
                        setTimeout(() => {
                            setLoading(false);
                            navigate('/dashboard');
                            handleClear();
                        }, 900);
                    } else {
                        toast.error("Error Logging In please check password and email");
                    }
                }
            })
            .catch((error) => {
                toast.error(`${error?.response?.data?.message}`);
                setLoading(false);
                // if (error.status === 401 && error.code === 'ERR_BAD_REQUEST') {
                //     handleLogOut();
                // }
            });


    };

    return (
        <div className="login-screen">
            {drops.map((d) => (
                <div
                    key={d.id}
                    className="drop"
                    style={{
                        width: d.size,
                        height: d.size,
                        left: `${d.left}%`,
                        top: `${d.top}%`,
                        background: d.color,
                        animationDuration: `${d.duration}s`,
                        animationDelay: `${d.delay}s`,
                    }}
                />
            ))}

            <div className="login-wrap">
                <div className="login-visual">
                    <div className="login-mark">
                        <div className="brand-mark">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M9 2h6l1 5-2 2v9a4 4 0 01-8 0v-9L4 7l1-5z" fill="#fff" opacity="0.95" />
                            </svg>
                        </div>
                        <div>
                            <div className="login-mark-name">Aditya Milk Traders</div>
                            <div className="login-mark-sub">Dairy Ops Console</div>
                        </div>
                    </div>

                    <div className="login-quote">
                        <h2>From the collection can to the crate — one console for the whole cold chain.</h2>
                        <p>Track milk collection, processing batches, vendors, fleet, and dispatch in real time, across every centre.</p>
                    </div>

                    <div className="login-stats">
                        <div><b>342</b><span>Active Vendors</span></div>
                        <div><b>18.4k L</b><span>Collected Today</span></div>
                        <div><b>96%</b><span>On-time Dispatch</span></div>
                    </div>

                    <svg className="milk-wave" viewBox="0 0 500 100" preserveAspectRatio="none">
                        <path d="M0 40 C 100 80, 200 0, 300 40 C 400 80, 450 20, 500 40 L500 100 L0 100 Z" fill="rgba(255,255,255,0.12)" />
                    </svg>
                </div>

                <div className="login-form-side">
                    <h1>Welcome back</h1>
                    <div className="lead">Sign in to your KshirNet console</div>

                    <form onSubmit={handleSubmit} noValidate>
                        <div className={`lfield ${shakeEmail ? 'shake' : ''}`}>
                            <input
                                type="text"
                                autoComplete="username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={email ? 'filled' : ''}
                            />
                            <label>Email or Username</label>
                        </div>

                        <div className={`lfield ${shakePass ? 'shake' : ''}`}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={password ? 'filled' : ''}
                            />
                            <label>Password</label>
                            <button
                                type="button"
                                className="lfield-toggle"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>

                        <div className="login-row">
                            <label className="remember">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                Remember me
                            </label>
                            <button type="button" className="forgot" onClick={() => navigate('/forgot-password')}>
                                Forgot password?
                            </button>
                        </div>

                        <button type="submit" className={`login-btn ${loading ? 'loading' : ''}`}>
                            <span className="spinner" />
                            <span className="btn-text">Sign In</span>
                        </button>
                    </form>

                    <div className="login-divider">OR</div>
                    <div className="login-demo-hint">
                        Demo mode — any email &amp; password signs you in. Try <b>admin@kshirnet.com</b>
                    </div>
                </div>
            </div>

            {toastMsg && (
                <div style={{
                    position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                    background: toastMsg.isError ? 'var(--danger)' : 'var(--text)',
                    color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13,
                    boxShadow: 'var(--shadow-lg)', zIndex: 999,
                }}>
                    {toastMsg.text}
                </div>
            )}
        </div>
    );
};

export default Login;
