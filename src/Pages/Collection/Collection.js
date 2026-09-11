import { useEffect, useMemo, useState } from 'react';
import '../../styles/shared.css';
import environment from '../../Environment/Environment';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import LogPanel from '../../Components/LogPanel/LogPanel';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const EMPTY_FORM = {
    vendorName: '',
    vendorCode: '',
    centerName: '',
    shift: 'AM',
    qty: '',
    fat: '',
    snf: '',
    can: '',
    collectionDate: '',
};

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
);

const Collection = ({ onViewEntry }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [invalid, setInvalid] = useState({});
    const [loading, setLoading] = useState(false);
    const [openLogPanel, setOpenLogPanel] = useState(false);
    const [pageCount, setPageCount] = useState(0);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [newRowId, setNewRowId] = useState(null);
    const [parsedToken, setParsedToken] = useState('');
    const [search, setSearch] = useState('');
    const [centreFilter, setCentreFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [partnerDetails, setPartnerDetails] = useState([]);
    const [milkCollectionList, setMilkCollectionList] = useState([]);
    const [collectionCenterList, setCollectionCenterList] = useState([]);
    const [editingCollectionId, setEditingCollectionId] = useState(null);
    const [edit, setEdit] = useState(false);


    useEffect(() => {
        // const storedToken = JSON.parse(localStorage.getItem("accessToken"));
        const storedToken = localStorage.getItem("accessToken");
        setParsedToken(storedToken);
    }, []);

    useEffect(() => {
        getAllPartners();
        getAllCollectionCenter();
        getAllMilkCollection();
    }, [parsedToken, pageIndex, pageSize])

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
    };

    const getAllPartners = () => {
        if (!parsedToken) return;
        // setLoading(true);
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
                    // setLoading(false);
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

    const getAllCollectionCenter = () => {
        if (!parsedToken) return;
        // setLoading(true);
        let URL = '';
        URL = `${environment?.config?.apiBaseUri}collectioncenter/getAllCollectionCenter??pageNo=${pageIndex - 1}&pageSize=${pageSize}`;

        axios.get(URL, {
            headers: {
                Authorization: `Bearer ${parsedToken}`,
                "Content-Type": "application/json"
            }
        })
            .then((response) => {
                if (response?.status === 200) {
                    setCollectionCenterList(response?.data?.collectionCenterList);
                    // setLoading(false);
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

    const getAllMilkCollection = () => {
        if (!parsedToken) return;
        // setLoading(true);
        let URL = '';
        URL = `${environment?.config?.apiBaseUri}milkcollection/getAllMilkCollection??pageNo=${pageIndex - 1}&pageSize=${pageSize}`;

        axios.get(URL, {
            headers: {
                Authorization: `Bearer ${parsedToken}`,
                "Content-Type": "application/json"
            }
        })
            .then((response) => {
                if (response?.status === 200) {
                    setMilkCollectionList(response?.data?.milkCollectionList);
                    // setLoading(false);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        const nextInvalid = {
            f_vendorName: !form.vendorName,
            f_qty: !form.qty || parseFloat(form.qty) < 0,
            f_fat: !form.fat || parseFloat(form.fat) < 0,
            f_snf: !form.snf || parseFloat(form.snf) < 0,
        };
        setInvalid(nextInvalid);

        if (Object.values(nextInvalid).some(Boolean)) {
            // setToast({ text: 'Please fill in the required fields', isError: true });
            return;
        }

        const [vendorName, vendorId] = form.vendorName.split(' — ');
        const id = Date.now();



        const requestBody = {
            vendorCode: vendorName,
            collectionCentre: form.centerName.replace(' Centre', ''),
            shift: form.shift,
            quantity: parseFloat(form.qty),
            fatPercent: parseFloat(form.fat),
            snfPercent: parseFloat(form.snf),
            amount: parseFloat(amount) || 0,
            ratePerLitre: parseFloat(rate),
            status: 'Pending',
            canContainerId: form.can,
            collectionDate: form.collectionDate
        }


        let API = '';
        let method = '';

        API = edit
            ? `${environment.config.apiBaseUri}milkcollection/${editingCollectionId}/updateMilkCollection`
            : `${environment.config.apiBaseUri}milkcollection/addMilkCollection`;
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
                    toast.success(res?.data?.message || (edit ? 'Milk Collection Updated Successfully' : 'Milk Collection Add Successfully'));
                    setLoading(false);
                    handleReset();
                    getAllMilkCollection();
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

    const editData = (r) => {
        setEditingCollectionId(r?.id);
        console.log(r.vendorName)
        setForm({
            id: r.id,
            vendorName: r.vendorCode,
            vendorCode: r.vendorCode,
            centerName: r.collectionCentre,
            shift: r.shift,
            qty: parseFloat(r.quantity),
            fat: parseFloat(r.fatPercent),
            snf: parseFloat(r.snfPercent),
            amount: parseFloat(r.amount) || 0,
            ratePerLitre: parseFloat(r.rate),
            status: r.status,
            can: r.canContainerId,
            collectionDate: r.collectionDate

        });
        setInvalid({});
    }

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

    const handleDeleteCollection = (item) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    setLoading(true);
                    const response = await axios.delete(
                        `${environment.config.apiBaseUri}milkcollection/${item?.id}/deleteMilkCollection`,
                        {
                            headers: {
                                authorization: `Bearer ${parsedToken}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (response && response.data) {
                        Swal.fire({
                            title: "Deleted!",
                            text: "Shipment details deleted successfully.",
                            icon: "success"
                        });
                        setLoading(false);
                        getAllCollectionCenter();
                    }
                } catch (error) {
                    setLoading(false);
                    console.error('Delete error:', error);
                    Swal.fire({
                        title: "Error!",
                        text: error?.response?.data?.message || "Failed to delete Shipment details.",
                        icon: "error"
                    });
                    if (error.status === 401 && error.code === 'ERR_BAD_REQUEST') {
                        // handleLogOut();
                    }
                }
            }
        });
    }

    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        return milkCollectionList.filter((r) => {
            const haystack = `${r.collectionDate} ${r.vendorName} ${r.vendorCode} ${r.collectionCentre} ${r.shift} ${r.quantity} ${r.fatPercent} ${r.snfPercent} ${r.amount} ${r.status}`.toLowerCase();
            const matchesSearch = !q || haystack.includes(q);
            const matchesCentre = !centreFilter || r.centre === centreFilter;
            const matchesStatus = !statusFilter || r.status === statusFilter;
            return matchesSearch && matchesCentre && matchesStatus;
        });
    }, [milkCollectionList, search, centreFilter, statusFilter]);

    return (
        <div>
            <div className="grid-2" style={{ gridTemplateColumns: '1fr', marginBottom: 16 }}>
                <div className="card">
                    <div className="card-head">
                        <div>
                            <h3>Log New Collection</h3>
                            <div className="sub">Rate and amount are calculated automatically from Fat % and SNF %</div>
                        </div>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-grid">
                                <div className={`field ${invalid.f_vendorName ? 'invalid' : ''}`}>
                                    <label>Vendor</label>
                                    <select value={form.vendorName} onChange={handleChange('vendorName')}>
                                        <option value="">Select vendor…</option>
                                        {partnerDetails?.map((v) => <option key={v?.id} value={v?.partyCode}>{v?.partyName} - {v?.partyCode}</option>)}
                                    </select>
                                    <div className="field-error">Select a vendor</div>
                                </div>

                                <div className={`field ${invalid.f_centerName ? 'invalid' : ''}`}>
                                    <label>Collection Center</label>
                                    <select value={form.centerName} onChange={handleChange('centerName')}>
                                        <option value="">Select Center...</option>
                                        {collectionCenterList?.map((v) => <option key={v?.id} value={v?.centerName}>{v?.centerName} - {v?.centerCode}</option>)}
                                    </select>
                                    <div className="field-error">Select a vendor</div>
                                </div>



                                <div className="field">
                                    <label>Shift</label>
                                    <select value={form.shift} onChange={handleChange('shift')}>
                                        <option value="AM">Morning (AM)</option>
                                        <option value="PM">Evening (PM)</option>
                                    </select>
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

                                <div className="field">
                                    <label>Rate / Litre (₹)</label>
                                    <input type="text" placeholder="Auto-calculated" disabled value={rate} />
                                    <div className="field-hint">Rate = ₹4.10 × Fat% + ₹1.35 × SNF%</div>
                                </div>

                                <div className="field">
                                    <label>Amount (₹)</label>
                                    <input type="text" placeholder="Auto-calculated" disabled value={amount} />
                                </div>

                                <div className={`field ${invalid.f_dispatchDate ? 'invalid' : ''}`}>

                                    <label htmlFor="dispatch-date">
                                        Collection Date
                                    </label>

                                    <DatePicker
                                        id="dispatch-date"
                                        selected={stringToDate(form.collectionDate)}
                                        onChange={(date) => {
                                            handleChange('collectionDate')({
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
                                        aria-invalid={invalid.f_collectionDate ? 'true' : 'false'}
                                    />

                                    <div className="field-error">
                                        Enter a valid Date
                                    </div>

                                </div>

                                <div className="field">
                                    <label>Can / Container ID</label>
                                    <input type="text" placeholder="e.g. CAN-2291"
                                        value={form.can} onChange={handleChange('can')} />
                                </div>
                            </div>

                            {/* <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                                <button type="submit" className="btn btn-primary" style={{ background: '#16a34a', color: 'white' }}>Save Entry</button>
                                <button type="button" className="btn btn-outline" onClick={handleReset}>Clear</button>
                            </div> */}
                            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                                <button type="submit" className="btn btn-primary" style={{ background: '#16a34a', color: 'white' }}>
                                    {edit ? 'Update Collection' : 'Create Collection'}
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
                    <h3 style={{ fontSize: 15 }}>Milk Collection Log</h3>
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

                    <select
                        className="filter-input"
                        value={centreFilter}
                        onChange={(e) => setCentreFilter(e.target.value)}
                    >
                        <option value="">All Centers</option>

                        {collectionCenterList?.map((v) => (
                            <option key={v?.id} value={v?.centerName}>
                                {v?.centerName}
                            </option>
                        ))}
                    </select>


                    <select className="filter-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All Status</option>
                        <option>Accepted</option><option>Lab Pending</option><option>Rejected</option><option>Pending</option>
                    </select>
                </div>
            </div>

            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th><th>Vendor</th><th>Vendor Code</th><th>Center</th><th>Shift</th><th>Qty (L)</th>
                            <th>Fat %</th><th>SNF %</th><th>Amount</th><th>Status</th><th>Details</th><th>Edit</th><th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>


                        {filteredRows.map((r) => (
                            <tr key={r.id} className={r.id === newRowId ? 'row-new' : ''}>
                                <td className="num">{r.collectionDate}</td>
                                <td className="cell-primary">{r.vendorName}</td>
                                <td className="cell-primary">{r.vendorCode}</td>
                                <td>{r.collectionCentre}</td>
                                <td>{r.shift}</td>
                                <td className="num">{r.quantity}</td>
                                <td className="num">{r.fatPercent}</td>
                                <td className="num">{r.snfPercent}</td>
                                <td className="num">{r.amount}</td>
                                <td><span><span className="tag-dot" />{r.status}</span></td>
                                <td>
                                    <button className="btn btn-ghost btn-sm" onClick={() => onViewEntry?.(r)}>
                                        View
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
                                <td>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => {
                                            handleDeleteCollection(r)
                                        }}
                                        title="Delete"
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {filteredRows.length === 0 && (
                            <tr className="empty-row">
                                <td colSpan={10}>No matching records. Try a different search or filter.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Collection;