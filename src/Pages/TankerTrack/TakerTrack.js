import React, { useState, useRef, useEffect, useCallback } from "react";
import "./TankerTrack.css";
import { useLocation, useNavigate } from "react-router-dom";

const STAGES = [
    {
        key: "SEALED",
        label: "Sealed",
        icon: (
            <>
                <path d="M12 1v6M9 8h6l1 3H8l1-3z" />
                <rect x="6" y="11" width="12" height="9" rx="1.5" />
                <path d="M9 15h6" />
            </>
        ),
    },
    {
        key: "DISPATCHED",
        label: "Dispatched",
        icon: (
            <>
                <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
                <circle cx="7" cy="18" r="1.6" />
                <circle cx="17" cy="18" r="1.6" />
            </>
        ),
    },
    {
        key: "IN_TRANSIT",
        label: "In Transit",
        icon: (
            <>
                <circle cx="12" cy="9" r="3" />
                <path d="M12 21s7-7.5 7-12a7 7 0 0 0-14 0c0 4.5 7 12 7 12z" />
            </>
        ),
    },
    {
        key: "RECEIVED",
        label: "Received",
        icon: (
            <>
                <path d="M12 3v11M8 10l4 4 4-4" />
                <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
            </>
        ),
    },
    {
        key: "COMPLETED",
        label: "Completed",
        icon: <path d="M20 6 9 17l-5-5" />,
    },
];

export default function TankerTrack() {
    const [screen, setScreen] = useState("scan"); // 'scan' | 'manifest'
    const [status, setStatusMsg] = useState("Camera is off.");
    const [statusErr, setStatusErr] = useState(false);
    const [isLive, setIsLive] = useState(false);
    const [manualOpen, setManualOpen] = useState(false);
    const [manualValue, setManualValue] = useState("");
    const [record, setRecord] = useState(null); // vehicle record from API
    const [advanceBusy, setAdvanceBusy] = useState(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(document.createElement("canvas"));
    const streamRef = useRef(null);
    const rafRef = useRef(null);
    const manualInputRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    // Guard against arriving here with no router state at all (e.g. direct
    // URL visit), which would otherwise throw on `.track`.
    const trackVehicleNumber = location.state?.track;

    const setStatus = useCallback((msg, isErr) => {
        setStatusMsg(msg);
        setStatusErr(!!isErr);
    }, []);

    const stopCamera = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
        }
        streamRef.current = null;
        setIsLive(false);
        setStatus("Camera is off.");
    }, [setStatus]);

    const openManifestFromRaw = useCallback(
        async (raw, opts) => {
            const redirect = !opts || opts.redirect !== false;
            const vehicleNo = parseVehicleNo(raw);

            if (!vehicleNo) {
                setStatus("Could not read a vehicle number from that QR.", true);
                return;
            }

            if (redirect && typeof window !== "undefined") {
                const url = new URL(window.location.href);
                url.searchParams.set("vehicle", vehicleNo);
                window.history.pushState(
                    { vehicle: vehicleNo },
                    "",
                    url.pathname + "?" + url.searchParams.toString()
                );
            }

            setStatus("Loading vehicle data…");

            try {
                const rec = await fetchVehicleData(vehicleNo);
                setRecord(rec);
                setScreen("manifest");
                setStatus("");
            } catch (e) {
                console.error("Vehicle API error:", e);
                setStatus(e.message || "Unable to load vehicle data.", true);
            }
        },
        [setStatus]
    );

    // Arriving here via router state (e.g. a "Track" button/link elsewhere
    // in the app that navigates with `state={{ track: { vehicleNo } }}`)
    // should run the exact same manifest-loading flow as scanning a QR code
    // or typing the number in manually — not just silently fetch and drop
    // the result. `redirect: false` because the URL for this entry point is
    // already owned by react-router, not the `?vehicle=` query-param scheme
    // used by the QR/manual-entry paths.
    useEffect(() => {
        const vehicleNo = trackVehicleNumber?.vehicleNo;
        if (vehicleNo) {
            openManifestFromRaw(vehicleNo, { redirect: false });
        }
    }, [trackVehicleNumber, openManifestFromRaw]);

    const tick = useCallback(async () => {
        const video = videoRef.current;
        if (!streamRef.current || !video) return;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const jsQR = window.jsQR;
            const code = jsQR && jsQR(imgData.data, imgData.width, imgData.height);
            if (code && code.data) {
                setStatus("QR detected ✓");
                stopCamera();
                openManifestFromRaw(code.data);
                return;
            }
        }
        rafRef.current = requestAnimationFrame(tick);
    }, [openManifestFromRaw, setStatus, stopCamera]);

    const startCamera = useCallback(async () => {
        try {
            setStatus("Requesting camera access…");
            await loadJsQR();
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setIsLive(true);
            setStatus("Scanning…");
            rafRef.current = requestAnimationFrame(tick);
        } catch (e) {
            setStatus('Camera unavailable — use "Enter vehicle no." instead.', true);
        }
    }, [setStatus, tick]);

    const handleStartStopClick = () => {
        if (streamRef.current) stopCamera();
        else startCamera();
    };

    const submitManual = () => {
        const v = manualValue.trim();
        if (!v) {
            setStatus("Type a vehicle number first.", true);
            return;
        }
        openManifestFromRaw(v);
    };

    const showScanScreen = useCallback(() => {
        setScreen("scan");
        setManualOpen(false);
        setManualValue("");
        setStatus("Camera is off.");
    }, [setStatus]);

    const handleRescan = () => {
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.delete("vehicle");
            window.history.pushState({}, "", url.pathname + (url.search || ""));
        }
        showScanScreen();
    };

    const handleSetStage = async (key) => {
        if (!record || !record.id) {
            setStatus("Vehicle record ID is missing.", true);
            return;
        }
        const previousStatus = record.status;
        setAdvanceBusy(true);
        try {
            await updateVehicleStatus(record.id, key);
            const latestRecord = await fetchVehicleData(record.vehicleNo);
            setRecord(latestRecord);
            loggerSafe(
                "Status updated: " +
                latestRecord.vehicleNo +
                " | " +
                previousStatus +
                " -> " +
                latestRecord.status
            );
            if (latestRecord.status === "COMPLETED") {
                navigate("/sales");
                return;
            }
        } catch (e) {
            console.error("Status update error:", e);
            setStatus(e.message || "Unable to update status.", true);
        } finally {
            setAdvanceBusy(false);
        }
    };

    // Browser back/forward + initial load from ?vehicle=...
    useEffect(() => {
        const initFromUrl = () => {
            const v = new URLSearchParams(window.location.search).get("vehicle");
            if (v) openManifestFromRaw(v, { redirect: false });
        };
        initFromUrl();

        const onPopState = () => {
            const v = new URLSearchParams(window.location.search).get("vehicle");
            if (v) openManifestFromRaw(v, { redirect: false });
            else showScanScreen();
        };
        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---------- Milk Dispatch API ----------
    const API_BASE_URL = "https://www.divandsection.in/milkautomation/api/milkdispatch";

    async function fetchVehicleData(vehicleNo) {
        const url = API_BASE_URL + "/getByChallan/" + encodeURIComponent(vehicleNo);

        const response = await fetch(url, {
            method: "GET",
            headers: { Accept: "application/json" },
        });

        let data = null;
        try {
            data = await response.json();
        } catch (e) {
            throw new Error("Invalid API response");
        }

        if (!response.ok) {
            throw new Error((data && data.message) || "Vehicle data not found");
        }

        return data;
    }

    async function updateVehicleStatus(id, status) {
        const url = API_BASE_URL + "/updateStatus/" + encodeURIComponent(id);

        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ status }),
        });

        let data = null;
        try {
            data = await response.json();
        } catch (e) {
            // Some APIs return 200/204 without a JSON body.
        }

        if (!response.ok) {
            throw new Error((data && data.message) || "Unable to update status");
        }

        return data;
    }

    // Accepts either a raw vehicle number string, or a JSON payload
    // like {"vehicleNo": "..."} — either way, resolves to a vehicle no.
    function parseVehicleNo(raw) {
        const str = String(raw).trim();
        // QR encodes a link to this page, e.g. https://host/tanker-track.html?vehicle=MH12AB1234
        if (/^https?:\/\//i.test(str)) {
            try {
                const u = new URL(str);
                const v = u.searchParams.get("vehicle");
                if (v) return v.toUpperCase().trim();
            } catch (e) {
                /* not a valid URL, fall through */
            }
        }
        // QR encodes a JSON payload, e.g. {"vehicleNo":"MH12AB1234"}
        try {
            const obj = JSON.parse(str);
            if (obj && (obj.vehicleNo || obj.VehicleNo || obj.vehicle_no)) {
                return String(obj.vehicleNo || obj.VehicleNo || obj.vehicle_no)
                    .toUpperCase()
                    .trim();
            }
        } catch (e) {
            /* not JSON, fall through */
        }
        // QR encodes the plain vehicle number
        return str.toUpperCase();
    }

    function loggerSafe(message) {
        console.log("[Tanker Track] " + message);
    }

    // Loads the jsQR script from cdnjs once and resolves when ready.
    let jsQRLoadPromise = null;
    function loadJsQR() {
        if (typeof window !== "undefined" && window.jsQR) return Promise.resolve(window.jsQR);
        if (jsQRLoadPromise) return jsQRLoadPromise;
        jsQRLoadPromise = new Promise((resolve, reject) => {
            const existing = document.querySelector('script[data-jsqr="true"]');
            if (existing) {
                existing.addEventListener("load", () => resolve(window.jsQR));
                existing.addEventListener("error", reject);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.js";
            script.async = true;
            script.dataset.jsqr = "true";
            script.onload = () => resolve(window.jsQR);
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return jsQRLoadPromise;
    }

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
        };
    }, []);

    const activeIdx = record ? Math.max(0, STAGES.findIndex((s) => s.key === record.status)) : 0;
    const isComplete = activeIdx >= STAGES.length - 1;

    return (
        <div className="tt-root">
            {/* Header */}
            <div className="tt-header">
                <div className="tt-mark">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#0B4C8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 3h8l4 4v3H4V7l2-4z" />
                        <path d="M4 10h14v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9z" />
                    </svg>
                </div>
                <div>
                    <h1>Tanker Track</h1>
                    <p>Milk dairy tanker manifest &amp; seal log</p>
                </div>
            </div>

            {/* SCAN SCREEN */}
            {screen === "scan" && (
                <div className="tt-card">
                    <div className={`tt-scan-frame${isLive ? " tt-live" : ""}`}>
                        <video ref={videoRef} playsInline muted />
                        {!isLive && (
                            <div className="tt-scan-idle">
                                <svg viewBox="0 0 24 24" fill="none" stroke="#5C6B85" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="7" height="7" rx="1" />
                                    <rect x="14" y="3" width="7" height="7" rx="1" />
                                    <rect x="3" y="14" width="7" height="7" rx="1" />
                                    <path d="M14 14h3v3h-3zM19 14h2M14 19h2M19 19h2" />
                                </svg>
                                <div>Point the camera at the tanker&apos;s vehicle&nbsp;QR to open its manifest.</div>
                            </div>
                        )}
                        <div className="tt-reticle">
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className="tt-scanline"></div>
                    </div>

                    <div className="tt-scan-controls">
                        <div className={`tt-status-line${statusErr ? " tt-err" : ""}`}>{status}</div>
                        <div className="tt-btn-row">
                            <button className="tt-btn tt-btn-primary" onClick={handleStartStopClick}>
                                {isLive ? "Stop camera" : "Start camera"}
                            </button>
                            <button
                                className="tt-btn tt-btn-ghost"
                                onClick={() => {
                                    setManualOpen((v) => {
                                        const next = !v;
                                        if (next) setTimeout(() => manualInputRef.current && manualInputRef.current.focus(), 0);
                                        return next;
                                    });
                                }}
                            >
                                Enter vehicle no.
                            </button>
                        </div>
                        <div className={`tt-manual${manualOpen ? " tt-open" : ""}`}>
                            <input
                                ref={manualInputRef}
                                type="text"
                                placeholder="e.g. MH12 AB 1234"
                                maxLength={20}
                                value={manualValue}
                                onChange={(e) => setManualValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") submitManual();
                                }}
                            />
                            <button className="tt-btn tt-btn-primary" onClick={submitManual}>
                                Open
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MANIFEST SCREEN */}
            {screen === "manifest" && record && (
                <div className="tt-card tt-manifest tt-open">
                    <div className="tt-manifest-top">
                        <div>
                            <div className="tt-vno-label">Vehicle No.</div>
                            <div className="tt-vno">{record.vehicleNo || "—"}</div>
                        </div>
                        <button className="tt-rescan-x" title="Scan another tanker" onClick={handleRescan}>
                            ↺
                        </button>
                    </div>

                    <div className="tt-doc-fields">
                        <div className="tt-doc-field">
                            <div className="tt-f-label">Shipment No.</div>
                            <div className="tt-f-val">{record.shipmentNo || "—"}</div>
                        </div>
                        <div className="tt-doc-field">
                            <div className="tt-f-label">Challan No.</div>
                            <div className="tt-f-val">{record.challanNo || "—"}</div>
                        </div>
                    </div>

                    <div className="tt-progress-section">
                        <div className="tt-progress-heading">Seal log · sealed to completed</div>

                        <div className="tt-stages">
                            {STAGES.map((s, i) => {
                                const done = i < activeIdx;
                                const current = i === activeIdx;
                                const cls = done ? "tt-done" : current ? "tt-current" : "";
                                return (
                                    <div key={s.key} className={`tt-stage ${cls}`}>
                                        <div className="tt-seal">
                                            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                {s.icon}
                                            </svg>
                                        </div>
                                        <div className="tt-stage-label">{s.label}</div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="tt-advance-row">
                            {isComplete ? (
                                <button className="tt-btn tt-btn-primary" disabled>
                                    Process completed
                                </button>
                            ) : (
                                <button className="tt-btn tt-btn-primary" disabled={advanceBusy} onClick={() => handleSetStage(STAGES[activeIdx + 1].key)}>
                                    {advanceBusy ? "Updating…" : "Mark as " + STAGES[activeIdx + 1].label.toLowerCase()}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="tt-note">Vehicle data and status are loaded from the Milk Dispatch API.</div>
                    {statusErr && status && <div className="tt-note tt-note-err">{status}</div>}
                </div>
            )}
        </div>
    );
}