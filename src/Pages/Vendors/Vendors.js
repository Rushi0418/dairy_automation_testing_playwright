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

const Vendor = () => {
    const [newRowId, setNewRowId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editData, setEditData] = useState([]);
    const [vendorDetails, setVendorDetails] = useState([]);
    const [pageIndex, setpageIndex] = useState(1);
    const [pageCount, setPageCount] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [search, setSearch] = useState('');
    const [centreFilter, setCentreFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [parsedToken, setParsedToken] = useState('');

    useEffect(() => {
        const storedToken = JSON.parse(localStorage.getItem("authToken"));
        setParsedToken(localStorage.getItem('accessToken'));
    }, []);

    const filteredVendors = useMemo(() => {
        const q = search.trim().toLowerCase();
        return vendorDetails.filter((v) => {
            const haystack = `${v?.partyName} ${v?.partyCode} ${v?.partyType} ${v?.mobileNo} ${v?.contactPerson} ${v?.alternateMobileNo} ${v?.email} ${v?.city} ${v?.district} ${v?.state} ${v?.pinCode}`.toLowerCase();
            const matchesSearch = !q || haystack.includes(q);
            // const matchesCentre = !centreFilter || v.centre === centreFilter;
            // const matchesStatus = !statusFilter || v.status === statusFilter;
            return matchesSearch;
        });
    }, [vendorDetails, search, centreFilter, statusFilter]);

    useEffect(() => {
        getAllVendors();
    }, [pageIndex, pageSize, parsedToken]);

    const totalPages = Math.max(1, Math.ceil(pageCount / pageSize));

    useEffect(() => {
        if (pageIndex > totalPages) setpageIndex(totalPages);
    }, [totalPages, pageIndex]);

    const startIndex = (pageIndex - 1) * pageSize;
    const paginated = filteredVendors?.slice(startIndex, startIndex + pageSize);

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

    const getAllVendors = () => {
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
                    setVendorDetails(response?.data?.partyList);
                    setPageCount(response?.data?.totalPartyCount);
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

    const handleDeleteVendor = (item) => {
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
                            text: "Vendor details deleted successfully.",
                            icon: "success"
                        });
                        setLoading(false);
                        getAllVendors();
                    }
                } catch (error) {
                    setLoading(false);
                    console.error('Delete error:', error);
                    Swal.fire({
                        title: "Error!",
                        text: error?.response?.data?.message || "Failed to delete Vendor details.",
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
                        placeholder="Search vendor"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {/* <select className="filter-input" value={centreFilter} onChange={(e) => setCentreFilter(e.target.value)}>
                        <option value="">All Centres</option>
                        <option>Shirwal</option><option>Phaltan</option><option>Baramati</option>
                    </select>
                    <select className="filter-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All Status</option>
                        <option>Active</option><option>Under Review</option><option>Suspended</option>
                    </select> */}
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)} style={{ background: '#16a34a', color: 'white' }}>
                    <PlusIcon />Create Vendor
                </button>
            </div>

            {showModal && <Modal modalType={'Vendors'} show={showModal} isEdit={isEdit} editData={editData} getAllVendors={getAllVendors} parsedToken={parsedToken} onClose={() => { setShowModal(false); setIsEdit(false); setEditData([]) }} />}

            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>Vendor Name</th>
                            <th>Vendor Code</th>
                            <th>Email</th>
                            <th>Type</th>
                            <th>Contact Person</th>
                            <th>Mobile No</th>
                            <th>Alt. Mobile No</th>
                            <th>Address</th>
                            {/* <th>City</th> */}
                            {/* <th>District</th> */}
                            {/* <th>State</th> */}
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVendors?.map((v) => (
                            <tr key={v?.id} className={v?.id === newRowId ? 'row-new' : ''}>
                                <td>
                                    <div className="cell-primary">{v?.partyName}</div>
                                </td>
                                <td>{v?.partyCode}</td>
                                <td>{v?.email}</td>
                                <td>{v?.partyType}</td>
                                <td>{v?.contactPerson}</td>
                                <td className="num">{v?.mobileNo}</td>
                                <td className="num">{v?.alternateMobileNo}</td>
                                <td>{v?.address}</td>
                                {/* <td>{v?.city}</td> */}
                                {/* <td>{v?.district}</td> */}
                                {/* <td>{v?.state}</td> */}
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
                                                    onClick={() => handleDeleteVendor(v)}
                                                >
                                                    Delete
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </td> */}
                                <td> <button
                                    className="dropdown-item"
                                    onClick={() => {
                                        setIsEdit(true);
                                        setShowModal(true);
                                        setEditData(v);
                                    }}
                                > <i className="bi bi-pencil me-2"></i>
                                </button></td>
                                <td><button
                                    className="dropdown-item action-item text-danger rounded-2"
                                    onClick={() => handleDeleteVendor(v)}
                                >
                                </button> <i className="bi bi-trash me-2"></i></td>
                            </tr>
                        ))}

                        {filteredVendors.length === 0 && (
                            <tr className="empty-row">
                                <td colSpan={9}>No matching vendors. Try a different search or filter.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="pagination-bar">
                <div className="pagination-info">
                    <span>
                        Showing{" "}
                        {filteredVendors.length === 0 ? 0 : startIndex + 1}-
                        {Math.min(startIndex + pageSize, filteredVendors.length)} of{" "}
                        {filteredVendors.length}
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
                        onClick={() => setpageIndex((p) => Math.max(1, p - 1))}
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
                                onClick={() => setpageIndex(page)}
                            >
                                {page}
                            </button>
                        )
                    )}

                    <button
                        className="page-nav-btn"
                        disabled={pageIndex === totalPages}
                        onClick={() => setpageIndex((p) => Math.min(totalPages, p + 1))}
                    >
                        <FaChevronRight size={11} />
                    </button>
                </div>
            </div>

            <ToastContainer />
        </div>
    );
};

export default Vendor;