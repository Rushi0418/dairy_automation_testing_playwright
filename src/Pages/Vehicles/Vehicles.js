import { useEffect, useMemo, useState } from 'react';
import '../../styles/shared.css';
import environment from '../../Environment/Environment';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import Modal from '../../Components/Modal/Modal';
import Swal from 'sweetalert2';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
);

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

const Vehicle = () => {
    const [newRowId, setNewRowId] = useState(null);

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pageIndex, setPageIndex] = useState(1); // 1-based UI page (was 0 — caused negative startIndex on first load)
    const [pageSize, setPageSize] = useState(10);
    const [vehicleDetails, setVehicleDetails] = useState([]);
    const [editData, setEditData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [parsedToken, setParsedToken] = useState('');
    const [totalRecords, setTotalRecords] = useState(0); // raw item count from server

    // Real page count, derived from the server's item count — was previously
    // being set directly to the raw item count (e.g. 23 "pages" for 23 vehicles).
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

    const filteredVehicles = useMemo(() => {
        const q = search.trim().toLowerCase();
        return vehicleDetails?.filter((v) => {
            const haystack = `${v?.vehicleNumber} ${v?.vehicleType} ${v?.ownerName} ${v?.ownerMobileNo} ${v?.driverName} ${v?.driverMobileNo} ${v?.rfidTag} ${v?.tankCapacity}`.toLowerCase();
            const matchesSearch = !q || haystack.includes(q);
            const matchesType = !typeFilter || v?.type === typeFilter;
            const matchesStatus = !statusFilter || v?.status === statusFilter;
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [vehicleDetails, search, typeFilter, statusFilter]);

    useEffect(() => {
        getAllVehicles();
    }, [pageIndex, pageSize, parsedToken]);

    useEffect(() => {
        const storedToken = JSON.parse(localStorage.getItem("authToken"));
        setParsedToken(localStorage.getItem('accessToken'));
    }, []);

    // Reset to page 1 whenever page size changes, so we don't end up
    // requesting a page number that no longer exists for the new size.
    useEffect(() => {
        setPageIndex(1);
    }, [pageSize]);

    // Clamp down if the current page no longer exists (e.g. after a delete
    // shrinks the total). Only reacts to totalPages changing, not pageIndex,
    // so it doesn't fight with normal next/prev clicks.
    useEffect(() => {
        if (pageIndex > totalPages) setPageIndex(totalPages);
    }, [totalPages]);

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

    const getAllVehicles = () => {
        if (!parsedToken) return;
        setLoading(true);
        let URL = '';
        // pageIndex is now 1-based in the UI, so we send pageIndex - 1 to
        // match the backend's 0-indexed pageNo.
        URL = `${environment?.config?.apiBaseUri}vehicle/getAllVehicle?pageNo=${pageIndex - 1}&pageSize=${pageSize}`;

        axios.get(URL, {
            headers: {
                Authorization: `Bearer ${parsedToken}`,
                "Content-Type": "application/json"
            }
        })
            .then((response) => {
                if (response?.status === 200) {
                    setVehicleDetails(response?.data?.vehicleList);
                    setTotalRecords(response?.data?.totalVehicleCount || 0);
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

    const handleDeleteVehicle = (item) => {
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
                        `${environment.config.apiBaseUri}vehicle/${item?.id}/deleteVehicle`,
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
                            text: "Vehicle details deleted successfully.",
                            icon: "success"
                        });
                        setLoading(false);
                        getAllVehicles();
                    }
                } catch (error) {
                    setLoading(false);
                    console.error('Delete error:', error);
                    Swal.fire({
                        title: "Error!",
                        text: error?.response?.data?.message || "Failed to delete Vehicle details.",
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
                        placeholder="Search by vehicle no. or driver"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)} style={{ background: '#16a34a', color: 'white' }}>
                    <PlusIcon />Create Vehicle
                </button>

            </div>
            {showModal && <Modal modalType={'Vehicles'} show={showModal} isEdit={isEdit} editData={editData} getAllVehicles={getAllVehicles} parsedToken={parsedToken} onClose={() => { setShowModal(false); setIsEdit(false); setEditData([]) }} />}

            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>Vehicle No.</th><th>Type</th><th>Owner Name</th><th>Owner Number</th>
                            <th>Driver Name</th><th>Driver Number</th><th>RFID Tag</th><th>Tank Capacity</th>
                            <th>Edit</th><th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVehicles?.map((v) => (
                            <tr key={v?.id} className={v?.id === newRowId ? 'row-new' : ''}>
                                <td className="cell-primary num">{v.vehicleNumber}</td>
                                <td>{v.vehicleType}</td>
                                <td>{v.ownerName}</td>
                                <td>{v.ownerMobileNo}</td>
                                <td>{v.driverName}</td>
                                <td>{v.driverMobileNo}</td>
                                <td>{v.rfidTag}</td>
                                <td>{v.tankCapacity}</td>
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
                                                        setEditData(v);
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    className="dropdown-item text-danger"
                                                    onClick={() => handleDeleteVehicle(v)}
                                                >
                                                    Delete
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
                                        setEditData(v);
                                    }}
                                ><i className="bi bi-pencil me-2"></i>
                                </button></td>
                                <td> <button
                                    className="dropdown-item text-danger"
                                    onClick={() => handleDeleteVehicle(v)}
                                ><i className="bi bi-trash me-2"></i>
                                </button></td>
                            </tr>
                        ))}

                        {filteredVehicles?.length === 0 && (
                            <tr className="empty-row">
                                <td colSpan={8}>No matching vehicles. Try a different search or filter.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="pagination-bar">
                <div className="pagination-info">
                    <span>
                        Showing{" "}
                        {totalRecords === 0 ? 0 : (pageIndex - 1) * pageSize + 1}-
                        {Math.min(pageIndex * pageSize, totalRecords)} of{" "}
                        {totalRecords}
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
                        disabled={pageIndex <= 1}
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
                        disabled={pageIndex >= totalPages}
                        onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
                    >
                        <FaChevronRight size={11} />
                    </button>
                </div>
            </div>
            <ToastContainer position="top-right" />
        </div>
    );
};

export default Vehicle;