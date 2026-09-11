import { useEffect, useMemo, useState } from 'react';
import '../../styles/shared.css';
import environment from '../../Environment/Environment';
import Modal from '../../Components/Modal/Modal';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
);


const Config = () => {
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

    useEffect(() => {
        setParsedToken(localStorage.getItem('accessToken'));
    }, []);

    useEffect(() => {
        if (parsedToken) {
            getAllConfigs();
        }
    }, [parsedToken]);

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
                    setTransporterDetails(response?.data?.body);
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
                        getAllConfigs();
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
            <div className="toolbar justify-content-end">
                <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)} style={{ background: '#16a34a', color: 'white' }}>
                    <PlusIcon />Add Configuration
                </button>
            </div>
            {showModal && <Modal modalType={'Config'} show={showModal} isEdit={isEdit} editData={editData} getAllConfigs={getAllConfigs} parsedToken={parsedToken} onClose={() => { setShowModal(false); setIsEdit(false); setEditData([]) }} />}

            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th><th>Mobile Number</th><th>Email</th><th>FSSAI-License</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transporterDetails?.map((t) => (
                            <tr key={t.id}>
                                <td className="cell-primary num">{t.managementName}</td>
                                <td>{t.mobileNo}</td>
                                <td>{t.email}</td>
                                <td>{t.fsSaiLicNo}</td>
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
                                {/* <td><button
                                    className="dropdown-item"
                                    onClick={() => {
                                        setIsEdit(true);
                                        setShowModal(true);
                                        setEditData(t);
                                    }}
                                >
                                    <i className="bi bi-pencil me-2"></i>
                                </button></td> */}
                            </tr>
                        ))}

                        {transporterDetails?.length === 0 && (
                            <tr className="empty-row">
                                <td colSpan={9}>No matching shipments. Try a different search or filter.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Config;