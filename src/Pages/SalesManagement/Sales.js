import { useEffect, useMemo, useState } from 'react';
import '../../styles/shared.css';
import environment from '../../Environment/Environment';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import LogPanel from '../../Components/LogPanel/LogPanel';
import ChemistRemarksPanel from '../../Components/ChemistRemarks/ChemistRemarks';
import Modal from '../../Components/Modal/Modal';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

const Sales = ({ onViewEntry }) => {

    const [vehicleDetails, setVehicleDetails] = useState([]);
    const EMPTY_FORM = {
        vendor: '',
        qty: '',
        fat: '',
        snf: '',
        milkType: '',
        vehicleNo: vehicleDetails[0],
        dispatchDate: '',
        dispatchTime: '',
        ot: '',
        temperature: '',
        acidity: '',
        cob: '',
        alcohol: '',
        alkalinePhosphate: '',
        mbrt: '',
        adulteration: '',
        clr: '',
        ts: '',
        protein: '',
        melamine: '',
        antibiotic: '',
        challanCode: '',
    };

    const [form, setForm] = useState(EMPTY_FORM);
    const [invalid, setInvalid] = useState({});
    const [newRowId, setNewRowId] = useState(null);

    const [search, setSearch] = useState('');
    const [centreFilter, setCentreFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [openLogPanel, setOpenLogPanel] = useState(false);
    const [pageCount, setPageCount] = useState(0);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [partnerDetails, setPartnerDetails] = useState([]);
    const [challanDetails, setChallanDetails] = useState([]);
    const [selectedLogData, setSelectedLogData] = useState([]);
    const [remarksData, setRemarksData] = useState([]);
    const [configDetails, setConfigDetails] = useState([]);
    const [showRemarks, setShowRemarks] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [edit, setEdit] = useState(false);
    const [editingChallanId, setEditingChallanId] = useState(null); // tracks which challan is being edited, separate from `challanId` used by the Seal flow
    const [challanId, setChallanId] = useState(0);
    const [parsedToken, setParsedToken] = useState('');
    const [challanAction, setChallanAction] = useState('');
    const [trackVehicle, setTrackVehicle] = useState('');
    const [challanCode, setchallanCode] = useState('');

    const navigate = useNavigate();
    const handleTrack = (track) => {
        navigate('/track-tanker', {
            state: {
                track: track
            }
        });
    }

    // const [toast, setToast] = useState(null);

    // useEffect(() => {
    //     if (!toast) return;
    //     const t = setTimeout(() => setToast(null), 2800);
    //     return () => clearTimeout(t);
    // }, [toast]);

    useEffect(() => {
        // const storedToken = JSON.parse(localStorage.getItem("accessToken"));
        const storedToken = localStorage.getItem("accessToken");
        setParsedToken(storedToken);
    }, []);

    useEffect(() => {
        getAllPartners();
        getAllShipment();
        getAllChallan();
        getAllConfigs();
    }, [parsedToken, pageIndex, pageSize])

    // Live rate/amount calc — same formula as the original recalcCollection().
    const { rate, amount } = useMemo(() => {
        const qty = parseFloat(form.qty) || 0;
        const fat = parseFloat(form.fat) || 0;
        const snf = parseFloat(form.snf) || 0;
        if (fat > 0 || snf > 0) {
            const r = fat * 4.10 + snf * 1.35;
            return {
                rate: `₹${r.toFixed(2)}`,
                amount: qty > 0 ? `₹${(r * qty).toFixed(2)}` : '',
            };
        }
        return { rate: '', amount: '' };
    }, [form.qty, form.fat, form.snf]);

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleReset = () => {
        setForm(EMPTY_FORM);
        setInvalid({});
        setEdit(false);
        setEditingChallanId(null);
    };

    const convertTo12Hour = (time) => {
        if (!time) return '';
        const match = time.trim().match(/^(\d{1,2}):(\d{2}):\d{2}$/);
        if (!match) return time; // not the expected shape — show raw value rather than lose it

        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const period = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        if (hours === 0) hours = 12;

        return `${String(hours).padStart(2, '0')}:${minutes} ${period}`;
    };

    const isValidTime = (time) => {
        const regex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
        return regex.test(time);
    };

    const convertToLocalTime = (time) => {
        if (!time) return null;

        const match = time.trim().match(
            /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
        );

        if (!match) return null;

        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const period = match[3].toUpperCase();

        if (period === "AM" && hours === 12) {
            hours = 0;
        }

        if (period === "PM" && hours !== 12) {
            hours += 12;
        }

        return `${String(hours).padStart(2, "0")}:${minutes}:00`;
    };

    const editData = (r) => {
        setEditingChallanId(r?.id);
        setForm({
            vendor: r?.partyName || '',
            qty: r?.netWeight ?? '',
            fat: r?.fat ?? '',
            snf: r?.snf ?? '',
            milkType: r?.milkType || '',
            vehicleNo: r?.vehicleNo || '',
            dispatchDate: r?.dispatchDate || '',
            dispatchTime: convertTo12Hour(r?.dispatchTime),
            ot: r?.ot || '',
            temperature: r?.temperature ?? '',
            acidity: r?.acidity ?? '',
            cob: r?.cob || '',
            alcohol: r?.alcohol || '',
            alkalinePhosphate: r?.alkalinePhosphate ?? '',
            mbrt: r?.mbrt ?? '',
            adulteration: r?.adulteration || '',
            clr: r?.clr ?? '',
            ts: r?.ts ?? '',
            protein: r?.protein ?? '',
            melamine: r?.melamine || '',
            antibiotic: r?.antibiotic || '',
            challanCode: r?.challanCode || ''
        });
        setInvalid({});
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const nextInvalid = {
            f_vendor: !form.vendor,
            f_qty: !form.qty || parseFloat(form.qty) < 0,
            f_fat: !form.fat || parseFloat(form.fat) < 0,
            f_snf: !form.snf || parseFloat(form.snf) < 0,
            f_dispatchTime: !form.dispatchTime || !isValidTime(form.dispatchTime),
        };
        setInvalid(nextInvalid);

        // if (Object.values(nextInvalid).some(Boolean)) {
        //     setToast({ text: 'Please fill in the required fields', isError: true });
        //     return;
        // }

        const [vendorName, vendorId] = form.vendor.split(' — ');
        const id = Date.now();

        const requestBody = {
            partyName: vendorName,
            vehicleNo: form.vehicleNo,
            milkType: form.milkType,
            dispatchDate: form.dispatchDate,
            dispatchTime: convertToLocalTime(form.dispatchTime),
            challanCode: form.challanCode,

            netWeight: parseFloat(form.qty),
            ot: form.ot,
            temperature: parseFloat(form.temperature),
            acidity: parseFloat(form.acidity),
            cob: form.cob,
            alcohol: form.alcohol,
            alkalinePhosphate: parseFloat(form.alkalinePhosphate),
            mbrt: parseFloat(form.mbrt),
            adulteration: form.adulteration,
            fat: parseFloat(form.fat),
            clr: parseFloat(form.clr),
            snf: parseFloat(form.snf),
            ts: parseFloat(form.ts),
            protein: parseFloat(form.protein),
            melamine: form.melamine,
            antibiotic: form.antibiotic,

            netWeightRemark: "NA",
            otRemark: "NA",
            temperatureRemark: "NA",
            acidityRemark: "NA",
            cobRemark: "NA",
            alcoholRemark: "NA",
            alkalinePhosphateRemark: "NA",
            mbrtRemark: "NA",
            adulterationRemark: "NA",
            fatRemark: "NA",
            clrRemark: "NA",
            snfRemark: "NA",
            tsRemark: "NA",
            proteinRemark: "NA",
            melamineRemark: "NA",
            antibioticRemark: "NA"
        }
        let API = '';
        let method = '';

        API = edit
            ? `${environment.config.apiBaseUri}milkdispatch/${editingChallanId}/updateChallan`
            : `${environment.config.apiBaseUri}milkdispatch/addChallan`;
        method = edit ? 'PUT' : 'POST';

        axios({
            url: API,
            method: method,
            data: requestBody,
            headers: {
                Authorization: `Bearer ${parsedToken}`,
                'Content-Type': 'application/json'
            }

        })
            .then((res) => {
                if (res && res.data) {
                    toast.success(res?.data?.message || (edit ? 'Updated Successfully' : 'Registered Successfully'));
                    setLoading(false);
                    handleReset();
                    getAllChallan();
                }
            })
            .catch((error) => {
                console.error('❌ Error fetching data:', error);
                toast.error('Please try again error occured');
                setLoading(false);
                if (error.status === 401 && error.code === 'ERR_BAD_REQUEST') {
                    // handleLogOut();
                }
            });
    };

    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        return challanDetails?.filter((r) => {
            const haystack = `${r.date} ${r.vendor} ${r.centre} ${r.shift} ${r.qty} ${r.fat} ${r.snf} ${r.amount} ${r.status}`.toLowerCase();
            const matchesSearch = !q || haystack.includes(q);
            const matchesCentre = !centreFilter || r.centre === centreFilter;
            const matchesStatus = !statusFilter || r.status === statusFilter;
            return matchesSearch && matchesCentre && matchesStatus;
        });
    }, [challanDetails, search, centreFilter, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(pageCount / pageSize));

    useEffect(() => {
        if (pageIndex > totalPages) setPageIndex(totalPages);
    }, [totalPages, pageIndex]);

    const startIndex = (pageIndex - 1) * pageSize;
    const paginated = filteredRows?.slice(startIndex, startIndex + pageSize);

    const stringToDate = (value) => {
        if (!value) return null;

        const [year, month, day] = value.split('-').map(Number);

        if (!year || !month || !day) {
            return null;
        }

        return new Date(year, month - 1, day);
    };

    const dateToString = (date) => {
        if (!date) return '';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const getPageNumbers = () => {
        const pages = [];
        const delta = 1;

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= pageIndex - delta && i <= pageIndex + delta)
            ) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== "...") {
                pages.push("...");
            }
        }
        return pages;
    };

    const getAllPartners = () => {
        if (!parsedToken) return;
        setLoading(true);
        let URL = '';
        URL = `${environment?.config?.apiBaseUri}party/getAllParty??pageNo=${pageIndex - 1}&pageSize=${pageSize}`;

        axios.get(URL, {
            headers: {
                Authorization: `Bearer ${parsedToken}`,
                "Content-Type": "application/json"
            }
        })
            .then((response) => {
                if (response?.status === 200) {
                    setPartnerDetails(response?.data?.partyList);
                    setLoading(false);
                }
            })
            .catch((error) => {
                console.error('❌ Error fetching data:', error);
                toast.error('Failed to fetch data');
                setLoading(false);
                if (error.status === 401 && error.code === 'ERR_BAD_REQUEST') {
                    // handleLogOut();
                }
            });
    }
    const getAllShipment = () => {
        if (!parsedToken) return;
        setLoading(true);
        let URL = '';
        URL = `${environment?.config?.apiBaseUri}shipment/getAllShipment?pageNo=${pageIndex - 1}&pageSize=${pageSize}`;

        axios.get(URL, {
            headers: {
                Authorization: `Bearer ${parsedToken}`,
                "Content-Type": "application/json"
            }
        })
            .then((response) => {
                if (response?.status === 200) {
                    const openVehicles = response?.data?.shipmentList;
                    setVehicleDetails(openVehicles?.filter(veh => veh.status === 'OPEN'));
                    setLoading(false);
                }
            })
            .catch((error) => {
                console.error('❌ Error fetching data:', error);
                toast.error('Failed to fetch data');
                setLoading(false);
                if (error.status === 401 && error.code === 'ERR_BAD_REQUEST') {
                    // handleLogOut();
                }
            });
    }
    const getAllChallan = () => {
        if (!parsedToken) return;
        setLoading(true);
        let URL = '';
        URL = `${environment?.config?.apiBaseUri}milkdispatch/getAllChallan?pageNo=${pageIndex - 1}&pageSize=${pageSize}`;

        axios.get(URL, {
            headers: {
                Authorization: `Bearer ${parsedToken}`,
                "Content-Type": "application/json"
            }
        })
            .then((response) => {
                if (response?.status === 200) {
                    setChallanDetails(response?.data?.milkDispatchList);
                    setPageCount(response?.data?.totalMilkDispatchCount);
                    setLoading(false);
                }
            })
            .catch((error) => {
                console.error('❌ Error fetching data:', error);
                toast.error('Failed to fetch data');
                setLoading(false);
                if (error.status === 401 && error.code === 'ERR_BAD_REQUEST') {
                    // handleLogOut();
                }
            });
    }
    const getAllConfigs = () => {
        if (!parsedToken) return;
        setLoading(true);
        let URL = '';
        URL = `${environment?.config?.apiBaseUri}management/getAllDetailsManagment`;

        axios.get(URL, {
            headers: {
                Authorization: `Bearer ${parsedToken}`,
                "Content-Type": "application/json"
            }
        })
            .then((response) => {
                if (response?.status === 200) {
                    setConfigDetails(response?.data?.body);
                    setLoading(false);
                }
            })
            .catch((error) => {
                console.error('❌ Error fetching data:', error);
                toast.error('Failed to fetch data');
                setLoading(false);
                if (error.status === 401 && error.code === 'ERR_BAD_REQUEST') {
                    // handleLogOut();
                }
            });
    }

    return (
        <div>
            <div className="grid-2" style={{ gridTemplateColumns: '1fr', marginBottom: 16 }}>
                <div className="card">
                    <div className="card-head">
                        <div>
                            <h3>{edit ? 'Edit Sales Entry' : 'Log New Collection'}</h3>
                            <div className="sub">
                                {edit
                                    ? `Updating dispatch record${editingChallanId ? ` #${editingChallanId}` : ''} — change the fields below and save.`
                                    : 'Rate and amount are calculated automatically from Fat % and SNF %'}
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-grid">
                                <div className={`field ${invalid.f_vendor ? 'invalid' : ''}`}>
                                    <label>Partner</label>
                                    <select value={form.vendor} onChange={handleChange('vendor')}>
                                        <option value="">Select Party…</option>
                                        {partnerDetails?.map((v) => <option key={v?.id} value={v?.partyName}>{v?.partyName}</option>)}
                                    </select>
                                    <div className="field-error">Select a Party</div>
                                </div>

                                <div className="field">
                                    <label>Vehicle Number</label>
                                    <select value={form.vehicleNo} onChange={handleChange('vehicleNo')}>
                                        <option value="">Select Vehicle…</option>
                                        {vehicleDetails?.map((c) => <option key={c?.id} value={c?.vehicleNo}>{c?.vehicleNo}</option>)}
                                    </select>
                                </div>
                                <div className="field">
                                    <label>Management Name</label>
                                    <select value={form.challanCode} onChange={handleChange('challanCode')}>
                                        <option value="">Select Owner…</option>
                                        {configDetails?.map((c) => <option key={c?.id} value={c?.challanCode}>{c?.managementName}</option>)}
                                    </select>
                                </div>

                                <div className='field'>
                                    <label>Milk Type</label>
                                    <input type="text" placeholder="e.g. Cow Milk"
                                        value={form.milkType} onChange={handleChange('milkType')} />
                                    <div className="field-error">Enter a valid quantity</div>
                                </div>

                                <div className={`field ${invalid.f_qty ? 'invalid' : ''}`}>
                                    <label>Quantity (Litres)</label>
                                    <input type="number" step="0.1" min="0" placeholder="e.g. 142.5"
                                        value={form.qty} onChange={handleChange('qty')} />
                                    <div className="field-error">Enter a valid quantity</div>
                                </div>

                                <div className={`field ${invalid.f_fat ? 'invalid' : ''}`}>
                                    <label>Fat %</label>
                                    <input type="number" step="0.1" min="0" max="12" placeholder="e.g. 4.2"
                                        value={form.fat} onChange={handleChange('fat')} />
                                    <div className="field-error">Enter Fat % (0–12)</div>
                                </div>

                                <div className={`field ${invalid.f_snf ? 'invalid' : ''}`}>
                                    <label>SNF %</label>
                                    <input type="number" step="0.1" min="0" max="12" placeholder="e.g. 8.6"
                                        value={form.snf} onChange={handleChange('snf')} />
                                    <div className="field-error">Enter SNF % (0–12)</div>
                                </div>

                                {/* <div className="field">
                                    <label>Rate / Litre (₹)</label>
                                    <input type="text" placeholder="Auto-calculated" disabled value={rate} />
                                    <div className="field-hint">Rate = ₹4.10 × Fat% + ₹1.35 × SNF%</div>
                                </div>

                                <div className="field">
                                    <label>Amount (₹)</label>
                                    <input type="text" placeholder="Auto-calculated" disabled value={amount} />
                                </div> */}

                                <div className={`field ${invalid.f_ot ? 'invalid' : ''}`}>
                                    <label>Ot</label>
                                    <input type="text" placeholder="e.g. OK"
                                        value={form.ot} onChange={handleChange('ot')} />
                                    <div className="field-error">Enter a valid Status</div>
                                </div>

                                <div className={`field ${invalid.f_temperature ? 'invalid' : ''}`}>
                                    <label>Temperature (°C)</label>
                                    <input type="number" step="0.1" min="0" placeholder="e.g. 35.5"
                                        value={form.temperature} onChange={handleChange('temperature')} />
                                    <div className="field-error">Enter a valid temperature</div>
                                </div>

                                <div className={`field ${invalid.f_acidity ? 'invalid' : ''}`}>
                                    <label>Acidity</label>
                                    <input type="number" step="0.1" min="0" placeholder="e.g. 0.117"
                                        value={form.acidity} onChange={handleChange('acidity')} />
                                    <div className="field-error">Enter a valid pH</div>
                                </div>

                                <div className={`field ${invalid.f_cob ? 'invalid' : ''}`}>
                                    <label>cob</label>
                                    <input type="text" placeholder="e.g. -Ve"
                                        value={form.cob} onChange={handleChange('cob')} />
                                    <div className="field-error">Enter a valid value</div>
                                </div>

                                <div className={`field ${invalid.f_alcohol ? 'invalid' : ''}`}>
                                    <label>Alcohol</label>
                                    <input type="text" placeholder="e.g. -Ve"
                                        value={form.alcohol} onChange={handleChange('alcohol')} />
                                    <div className="field-error">Enter a valid Value</div>
                                </div>

                                <div className={`field ${invalid.f_alkalinePhosphate ? 'invalid' : ''}`}>
                                    <label>Alkaline Phosphate</label>
                                    <input type="number" step="0.1" min="0" placeholder="e.g. 2.5"
                                        value={form.alkalinePhosphate} onChange={handleChange('alkalinePhosphate')} />
                                    <div className="field-error">Enter a valid Value</div>
                                </div>

                                <div className={`field ${invalid.f_mbrt ? 'invalid' : ''}`}>
                                    <label>mbrt</label>
                                    <input type="number" step="0.1" min="0" placeholder="e.g. 1.5"
                                        value={form.mbrt} onChange={handleChange('mbrt')} />
                                    <div className="field-error">Enter a valid quantity</div>
                                </div>

                                <div className={`field ${invalid.f_adulteration ? 'invalid' : ''}`}>
                                    <label>Adulteration</label>
                                    <input type="text" placeholder="e.g. -Ve"
                                        value={form.adulteration} onChange={handleChange('adulteration')} />
                                    <div className="field-error">Enter a valid quantity</div>
                                </div>

                                <div className={`field ${invalid.f_clr ? 'invalid' : ''}`}>
                                    <label>clr</label>
                                    <input type="number" step="0.1" min="0" placeholder="e.g. 28.0"
                                        value={form.clr} onChange={handleChange('clr')} />
                                    <div className="field-error">Enter a valid quantity</div>
                                </div>

                                <div className={`field ${invalid.f_ts ? 'invalid' : ''}`}>
                                    <label>ts</label>
                                    <input type="number" step="0.1" min="0" placeholder="e.g. 11.70"
                                        value={form.ts} onChange={handleChange('ts')} />
                                    <div className="field-error">Enter a valid quantity</div>
                                </div>

                                <div className={`field ${invalid.f_protein ? 'invalid' : ''}`}>
                                    <label>Protein</label>
                                    <input type="number" step="0.1" min="0" placeholder="e.g. 2.80"
                                        value={form.protein} onChange={handleChange('protein')} />
                                    <div className="field-error">Enter a valid quantity</div>
                                </div>

                                <div className={`field ${invalid.f_melamine ? 'invalid' : ''}`}>
                                    <label>Melamine</label>
                                    <input type="text" placeholder="e.g. -Ve"
                                        value={form.melamine} onChange={handleChange('melamine')} />
                                    <div className="field-error">Enter a valid quantity</div>
                                </div>

                                <div className={`field ${invalid.f_antibiotic ? 'invalid' : ''}`}>
                                    <label>Antibiotic</label>
                                    <input type="text" placeholder="e.g. -Ve"
                                        value={form.antibiotic} onChange={handleChange('antibiotic')} />
                                    <div className="field-error">Enter a valid quantity</div>
                                </div>
                                <div className={`field ${invalid.f_dispatchDate ? 'invalid' : ''}`}>

                                    <label htmlFor="dispatch-date">
                                        Dispatch Date
                                    </label>

                                    <DatePicker
                                        id="dispatch-date"
                                        selected={stringToDate(form.dispatchDate)}
                                        onChange={(date) => {
                                            handleChange('dispatchDate')({
                                                target: {
                                                    value: dateToString(date)
                                                }
                                            });
                                        }}
                                        dateFormat="dd-MM-yyyy"
                                        placeholderText="dd-mm-yyyy"
                                        showPopperArrow={false}
                                        todayButton="Today"
                                        isClearable
                                        autoComplete="off"
                                        popperClassName="reports-datepicker-popper"
                                        aria-invalid={invalid.f_dispatchDate ? 'true' : 'false'}
                                    />

                                    <div className="field-error">
                                        Enter a valid Date
                                    </div>

                                </div>
                                {/* <div className={`field ${invalid.f_dispatchTime ? 'invalid' : ''}`}>
                                    <label>Dispatch Time</label>
                                    <input type="time" placeholder="e.g. -Ve"
                                        value={form.dispatchTime} onChange={handleChange('dispatchTime')} />
                                    <div className="field-error">Enter a valid Time</div>
                                </div> */}
                                <div className={`field ${invalid.f_dispatchTime ? 'invalid' : ''}`}>
                                    <label>Dispatch Time</label>

                                    <input
                                        type="text"
                                        placeholder="e.g. 02:30 PM"
                                        value={form.dispatchTime}
                                        onChange={handleChange('dispatchTime')}
                                    />

                                    <div className="field-error">
                                        Enter a valid Time
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                                <button type="submit" className="btn btn-primary" style={{ background: '#16a34a', color: 'white' }}>
                                    {edit ? 'Update Challan' : 'Create Challan'}
                                </button>
                                <button type="button" className="btn btn-outline" onClick={handleReset}>
                                    {edit ? 'Cancel' : 'Clear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="toolbar">
                <div className="toolbar-left">
                    <h3 style={{ fontSize: 15 }}>Sales Log</h3>
                    <span className="result-count">
                        {filteredRows.length} record{filteredRows.length === 1 ? '' : 's'}
                    </span>
                </div>
                <div className="toolbar-left">
                    <input
                        className="filter-input"
                        placeholder="Search vendor or can ID"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select className="filter-input" value={centreFilter} onChange={(e) => setCentreFilter(e.target.value)}>
                        <option value="">All Centres</option>
                        <option>Shirwal</option><option>Phaltan</option><option>Baramati</option>
                    </select>
                    <select className="filter-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All Status</option>
                        <option>Accepted</option><option>Lab Pending</option><option>Rejected</option>
                    </select>
                </div>
            </div>
            {showModal && <Modal modalType={'Sales'} show={showModal} getAllChallan={getAllChallan} parsedToken={parsedToken} challanId={challanId} isEdit={true} onClose={() => { setShowModal(false); setChallanId(0) }} />}
            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>Partner Name</th>
                            <th>Vehicle No</th>
                            <th>Milk Type</th>
                            <th>Dis. Date</th>
                            <th>Dis. Time</th>
                            <th>Status</th>
                            {/* <th>Seal/Review</th> */}
                            <th>Review</th>
                            <th>Seal</th>
                            <th>View</th>
                            <th>Track</th>
                            <th>Print</th>
                            <th>Edit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRows?.map((r) => (
                            <tr key={r?.id} className={r?.id === newRowId ? 'row-new' : ''}>
                                <td className="num">{r?.partyName}</td>
                                <td className="num">{r?.vehicleNo}</td>
                                <td className="cell-primary">{r?.milkType}</td>
                                <td>{r?.dispatchDate}</td>
                                <td>{r?.dispatchTime}</td>
                                {/* <td className="num">{r.qty.toFixed(1)}</td> */}
                                {/* <td className="num">{r.fat.toFixed(1)}</td> */}
                                {/* <td className="num">{r.snf.toFixed(1)}</td> */}

                                <td><span className={`tag tag-${r?.tag}`}><span className="tag-dot" />{r?.status}</span></td>
                                {/* <td>
                                    <button className="btn btn-ghost btn-sm"
                                        onClick={
                                            r.status === 'QC_PENDING'
                                                ? () => {
                                                    setShowRemarks(true);
                                                    setRemarksData(r);
                                                }
                                                : r.status === 'QC_APPROVED'
                                                    ? () => {
                                                        setShowModal(true);
                                                        setChallanId(r?.id);
                                                    }
                                                    : r.status === 'QC_REJECTED'
                                                        ? () => {
                                                            setShowRemarks(true);
                                                            setRemarksData(r);
                                                        }
                                                        : () => { }
                                        }
                                    >
                                        {r?.status === 'QC_PENDING' ? 'Remarks' : r?.status === 'QC_APPROVED' ? 'Seal' : r?.status === 'QC_REJECTED' ? 'Remarks' : null}
                                    </button>
                                </td> */}
                                {/* <td>
                                    <button className="btn btn-ghost btn-sm"
                                        onClick={() => {
                                            setShowRemarks(true);
                                            setRemarksData(r);
                                        }}>
                                        Review
                                    </button>
                                </td> */}
                                <td>
    <button
        className="btn btn-ghost btn-sm"
        disabled={r.status === "COMPLETED"}
        onClick={() => {
            if (r.status === "COMPLETED") return;

            setShowRemarks(true);
            setRemarksData(r);
        }}
    >
        Review
    </button>
</td>
                                {/* <td>
                                    <button className="btn btn-ghost btn-sm"
                                        onClick={() => {
                                            setShowModal(true);
                                            setChallanId(r?.id);
                                        }}>
                                        Seal
                                    </button>
                                </td> */}
                                <td>
    <button
        className={`btn btn-ghost btn-sm ${
            r.status === "COMPLETED"
                ? "opacity-50 cursor-not-allowed"
                : ""
        }`}
        disabled={r.status === "COMPLETED"}
        onClick={() => {
            if (r.status === "COMPLETED") return;

            setShowModal(true);
            setChallanId(r?.id);
        }}
    >
        Seal
    </button>
</td>
                                <td>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => {
                                            setOpenLogPanel(true)
                                            setSelectedLogData(r)
                                            setChallanAction('View')
                                        }}
                                        title="View"
                                    >
                                        <i className="bi bi-eye"></i>
                                    </button>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => handleTrack(r)}
                                        title="Track"
                                    >
                                        <i class="bi bi-geo-alt"></i>
                                    </button>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => {
                                            setOpenLogPanel(true)
                                            setSelectedLogData(r)
                                            setChallanAction('Print')
                                        }}
                                        title="Print"
                                    >
                                        <i className="bi bi-printer"></i>
                                    </button>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => {
                                            setEdit(true);
                                            editData(r);
                                        }}
                                        title="Edit"
                                    >
                                        <i className="bi bi-pencil-square"></i>
                                    </button>
                                </td>

                            </tr>
                        ))}
                        <LogPanel
                            show={openLogPanel}
                            onHide={() => setOpenLogPanel(false)}
                            data={selectedLogData}
                            challanAction={challanAction}
                        />
                        <ChemistRemarksPanel
                            show={showRemarks}
                            onHide={() => setShowRemarks(false)}
                            data={remarksData}
                            getAllChallan={getAllChallan}
                        />
                        {filteredRows?.length === 0 && (
                            <tr className="empty-row">
                                <td colSpan={10}>No matching records. Try a different search or filter.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="pagination-bar">
                <div className="pagination-info">
                    <span>
                        Showing{" "}
                        {filteredRows.length === 0 ? 0 : startIndex + 1}-
                        {Math.min(startIndex + pageSize, filteredRows.length)} of{" "}
                        {filteredRows.length}
                    </span>

                    <select
                        className="page-size-select"
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                    >
                        {PAGE_SIZE_OPTIONS.map((size) => (
                            <option key={size} value={size}>
                                {size} / page
                            </option>
                        ))}
                    </select>
                </div>

                <div className="pagination-controls">
                    <button
                        className="page-nav-btn"
                        disabled={pageIndex === 1}
                        onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                    >
                        <FaChevronLeft size={11} />
                    </button>

                    {getPageNumbers().map((page, idx) =>
                        page === "..." ? (
                            <span key={`ellipsis-${idx}`} className="page-ellipsis">
                                …
                            </span>
                        ) : (
                            <button
                                key={page}
                                className={
                                    page === pageIndex
                                        ? "page-number active"
                                        : "page-number"
                                }
                                onClick={() => setPageIndex(page)}
                            >
                                {page}
                            </button>
                        )
                    )}

                    <button
                        className="page-nav-btn"
                        disabled={pageIndex === totalPages}
                        onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
                    >
                        <FaChevronRight size={11} />
                    </button>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Sales;