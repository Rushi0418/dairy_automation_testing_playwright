import { useEffect, useMemo, useState } from 'react';
import '../../styles/shared.css';
import environment from '../../Environment/Environment';
import Modal from '../../Components/Modal/Modal';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
);

const Users = () => {
    const [newRowEmail, setNewRowEmail] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [userDetails, setUserDetails] = useState([]);
    const [editData, setEditData] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [parsedToken, setParsedToken] = useState('');

    // Mirrors the original filterTable(): search matches anywhere in the
    // row text, AND-ed with the role dropdown filter.
    const filteredUsers = useMemo(() => {
        const q = search?.trim()?.toLowerCase();
        return userDetails?.filter((u) => {
            const haystack = `${u?.fullName} ${u?.email} ${u?.role} ${u?.username} ${u?.mobileNo}`.toLowerCase();
            const matchesSearch = !q || haystack.includes(q);
            const matchesRole = !roleFilter || u?.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [userDetails, search, roleFilter]);
    useEffect(() => {
        const storedToken = JSON.parse(localStorage.getItem("authToken"));
        setParsedToken(localStorage.getItem('accessToken'));
    }, []);

    useEffect(() => {
        getAllUsers()
    }, [pageIndex, pageSize, parsedToken]);

    const totalPages = Math.max(1, Math.ceil(pageCount / pageSize));

    useEffect(() => {
        if (pageIndex > totalPages) setPageIndex(totalPages);
    }, [totalPages, pageIndex]);

    const startIndex = (pageIndex - 1) * pageSize;
    const paginated = filteredUsers?.slice(startIndex, startIndex + pageSize);

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

    const getAllUsers = () => {
        if (!parsedToken) return;
        setLoading(true);
        let URL = '';
        URL = `${environment?.config?.apiBaseUri}auth/getAllUser?pageNo=${pageIndex - 1}&pageSize=${pageSize}`;

        axios.get(URL, {
            headers: {
                Authorization: `Bearer ${parsedToken}`,
                "Content-Type": "application/json"
            }
        })
            .then((response) => {
                if (response?.status === 200) {
                    setUserDetails(response?.data?.userList);
                    setPageCount(response?.data?.totalUserCount);
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
            <div className="toolbar">
                <div className="toolbar-left">
                    <input
                        className="filter-input"
                        placeholder="Search by name or email"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {/* <select className="filter-input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="">All Roles</option>
                        <option>Admin</option><option>Plant Manager</option><option>Field Agent</option>
                        <option>Accountant</option><option>Driver</option>
                    </select> */}
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)} style={{ background: '#16a34a', color: 'white' }}>
                    <PlusIcon />Create User
                </button>
            </div>
            {showModal && <Modal modalType={'Users'} show={showModal} isEdit={isEdit} editData={editData} getAllUsers={getAllUsers} parsedToken={parsedToken} onClose={() => { setShowModal(false); setIsEdit(false); setEditData([]) }} />}

            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>Full Name</th><th>Email</th><th>User Name</th><th>Role</th><th>Mobile Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((u) => (
                            <tr key={u.email} className={u.email === newRowEmail ? 'row-new' : ''}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div className="avatar-sm" style={{ background: u.avatarBg, color: u.avatarColor }}>
                                            {u?.initials}
                                        </div>
                                        <div className="cell-primary">{u.fullName}</div>
                                    </div>
                                </td>
                                <td className="num">{u?.email}</td>
                                <td className="num">{u?.username}</td>
                                <td><span className={`tag tag-${u?.roleTag}`}><span className="tag-dot" />{u?.role}</span></td>
                                <td className="num">{u?.mobileNo}</td>
                                {/* <td><span className={`tag tag-${u.statusTag}`}><span className="tag-dot" />{u.status}</span></td> */}
                                {/* <td>
                                    <button className="btn btn-ghost btn-sm"
                                    // onClick={() => handleEditUser(u)}
                                    >
                                        Edit
                                    </button>
                                </td> */}
                            </tr>
                        ))}

                        {filteredUsers.length === 0 && (
                            <tr className="empty-row">
                                <td colSpan={7}>No matching users. Try a different search or filter.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="pagination-bar">
                <div className="pagination-info">
                    <span>
                        Showing{" "}
                        {filteredUsers.length === 0 ? 0 : startIndex + 1}-
                        {Math.min(startIndex + pageSize, filteredUsers.length)} of{" "}
                        {filteredUsers.length}
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

export default Users;