import { useEffect, useMemo, useState } from 'react';
import '../../styles/shared.css';
import environment from '../../Environment/Environment';
import Modal from '../../Components/Modal/Modal';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
);

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

const Transporter = () => {
    const [newRowId, setNewRowId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState([]);
    const [transporterDetails, setTransporterDetails] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pageSize, setPageSize] = useState(5);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageCount, setPageCount] = useState(0);
    const [parsedToken, setParsedToken] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const filteredTransporter = useMemo(() => {
        const q = search.trim().toLowerCase();
        return transporterDetails?.filter((s) => {
            const haystack = `${s.id} ${s.route} ${s.vehicle} ${s.product} ${s.status}`.toLowerCase();
            const matchesSearch = !q || haystack.includes(q);
            const matchesStatus = !statusFilter || s.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [transporterDetails, search, statusFilter]);

    useEffect(() => {
        const storedToken = JSON.parse(localStorage.getItem("authToken"));
        setParsedToken(localStorage.getItem('accessToken'));
    }, []);

    useEffect(() => {
        getAllTransporters();
    }, [parsedToken, pageIndex, pageSize]);

    const totalPages = Math.max(1, Math.ceil(pageCount / pageSize));

    useEffect(() => {
        if (pageIndex > totalPages) setPageIndex(totalPages);
    }, [totalPages, pageIndex]);

    const startIndex = (pageIndex - 1) * pageSize;
    const paginated = filteredTransporter?.slice(startIndex, startIndex + pageSize);

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

    const getAllTransporters = () => {
        if (!parsedToken) return;
        setLoading(true);
        let URL = '';
        URL = `${environment?.config?.apiBaseUri}transporter/getAllTransporter?pageNo=${pageIndex - 1}&pageSize=${pageSize}`;

        axios.get(URL, {
            headers: {
                Authorization: `Bearer ${parsedToken}`,
                "Content-Type": "application/json"
            }
        })
            .then((response) => {
                if (response?.status === 200) {
                    setTransporterDetails(response?.data?.transporterList);
                    setPageCount(response?.data?.totalTransporterCount);
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

    const handleDeleteTransporter = (item) => {
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
                        `${environment.config.apiBaseUri}party/${item?.id}/deleteParty`,
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
                        getAllTransporters();
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

    return (
        <div>
            <div className="toolbar">
                <div className="toolbar-left">
                    <input
                        className="filter-input"
                        placeholder="Search Transporter or destination"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {/* <select className="filter-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All Status</option>
                        <option>In Transit</option><option>Delivered</option><option>Delayed</option><option>Scheduled</option>
                    </select> */}
                </div>
                {/* <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)} style={{ background: '#16a34a', color: 'white' }}>
                    <PlusIcon />Create Shipment
                </button> */}
            </div>
            {showModal && <Modal modalType={'Transporters'} show={showModal} isEdit={isEdit} editData={editData} getAllTransporters={getAllTransporters} parsedToken={parsedToken} onClose={() => { setShowModal(false); setIsEdit(false); setEditData([]) }} />}

            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>Vehicle No.</th><th>Destination</th><th>Litres</th><th>Rate/Litre</th><th>Total Amount</th><th>Recieved Amount</th><th>Pending Amount</th>
                            <th>Transporter Date</th><th>Shipment No.</th><th>Edit</th>
                            {/* <th>Status</th><th>Action</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransporter?.map((t) => (
                            <tr key={t.id} className={t.id === newRowId ? 'row-new' : ''}>
                                <td className="cell-primary num">{t.vehicleNo}</td>

                                <td>{t.transportTo}</td>
                                <td>{t.litre}</td>
                                <td className="num">{t.ratePerLitre}</td>
                                <td className="num">{t.totalAmount}</td>
                                <td className="num">{t.recivedAmount}</td>
                                <td className="num">{t.pendingAmount}</td>
                                <td>{t.transporterDate}</td>
                                <td className="num">{t.shipmentNo}</td>
                                {/* <td><span className={`tag tag-${t.tag}`}><span className="tag-dot" />{t.status}</span></td> */}
                                {/* <td className="d-md-table-cell align-middle py-3 px-2">
                                    <div className="dropdown" style={{ position: 'static' }}>
                                        <button
                                            className="btn btn-light btn-sm dropdown-toggle"
                                            data-bs-toggle="dropdown"
                                        >
                                            Actions
                                        </button>
                                        <ul
                                            className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 p-2"
                                            style={{ minWidth: '180px', zIndex: 9999 }}
                                        >
                                            <li>
                                                <button
                                                    className="dropdown-item"
                                                    onClick={() => {
                                                        setIsEdit(true);
                                                        setShowModal(true);
                                                        setEditData(t);
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </td> */}
                                <td><button
                                    className="dropdown-item"
                                    onClick={() => {
                                        setIsEdit(true);
                                        setShowModal(true);
                                        setEditData(t);
                                    }}
                                >
                                    <i className="bi bi-pencil me-2"></i>
                                </button></td>
                            </tr>
                        ))}

                        {filteredTransporter.length === 0 && (
                            <tr className="empty-row">
                                <td colSpan={9}>No matching shipments. Try a different search or filter.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="pagination-bar">
                <div className="pagination-info">
                    <span>
                        Showing{" "}
                        {filteredTransporter.length === 0 ? 0 : startIndex + 1}-
                        {Math.min(startIndex + pageSize, filteredTransporter.length)} of{" "}
                        {filteredTransporter.length}
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
        </div>
    );
};

export default Transporter;