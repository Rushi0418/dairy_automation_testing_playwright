import React, { useEffect, useRef, useState } from 'react';
import './Modal.css';
import environment from '../../Environment/Environment.js';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { Modal as BootstrapModal } from 'bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";

const Modal = ({ modalType, show, onClose, isEdit, editData, parsedToken, getAllVehicles, getAllShipments, getAllUsers, getAllVendors, getAllChallan, challanId, getAllTransporters, getAllConfigs }) => {
    const modalRef = useRef(null);
    const bsModal = useRef(null);
    const [id, setId] = useState('');
    const [role, setRole] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [userMobileNumber, setUserMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    // Vehicle States
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [ownerMobileNo, setOwnerMobileNo] = useState('');
    const [driverName, setDriverName] = useState('');
    const [driverMobileNo, setDriverMobileNo] = useState('');
    const [rfidTag, setRFIDTag] = useState('');
    const [tankCapacity, setTankCapacity] = useState('');
    // VendorStates
    const [partyName, setPartyName] = useState('');
    const [partyCode, setPartyCode] = useState('');
    const [partyType, setPartyType] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [vendorMobileNo, setVendorMobileNo] = useState('');
    const [vendorAlternateMobileNo, setAlternateMobileNo] = useState('');
    const [vendorEmail, setVendorEmail] = useState('');
    const [vendorAddress, setVendorAddress] = useState('');
    const [vendorCity, setVendorCity] = useState('');
    const [vendorDistrict, setVendorDistrict] = useState('');
    const [vendorState, setVendorState] = useState('');
    const [vendorPinCode, setVendorPinCode] = useState('');
    // Shipment States
    const [shipmentType, setShipmentType] = useState('');
    const [sourcePlant, setsSourcePlant] = useState('');
    const [destinationPlant, setDestinationPlant] = useState('');
    const [ratePerLitre, setRatePerLitre] = useState('');
    const [vehicleDetails, setVehicleDetails] = useState([]);
    // Transporter States 
    const [totalAmount, setTotalAmount] = useState('');
    const [recievedAmount, setRecievedAmount] = useState('');
    const [currentRecievedAmount, setCurrentRecievedAmount] = useState('');
    const [pendingAmount, setPendingAmount] = useState('');
    const [balanceType, setBalanceType] = useState('');
    const [sealId, setSealId] = useState('');
    // Cofig States
    const [fssaiLicNo, setFssaiLicNo] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const pageIndex = 0;
    const pageSize = 100;

    useEffect(() => {
        if (modalType === 'Shipments') {
            getAllVehicleDetails()
        }
        if (isEdit) {
            if (modalType === 'Vehicles') {
                setId(editData?.id);
                setVehicleNumber(editData?.vehicleNumber);
                setVehicleType(editData?.vehicleType);
                setOwnerName(editData?.ownerName);
                setOwnerMobileNo(editData?.ownerMobileNo);
                setDriverName(editData?.driverName);
                setDriverMobileNo(editData?.driverMobileNo);
                setRFIDTag(editData?.rfidTag);
                setTankCapacity(editData?.tankCapacity);
            }
            else if (modalType === 'Users') {
                setId(editData?.id);
                setFullName(editData?.fullName);
                setEmail(editData?.email);
                setUserName(editData?.username);
                setPassword(editData?.password);
                setRole(editData?.role);
                setUserMobileNumber(editData?.mobileNo);

            }
            else if (modalType === 'Vendors') {
                setId(editData?.id);
                setPartyCode(editData?.partyCode);
                setPartyName(editData?.partyName);
                setPartyType(editData?.partyType);
                setContactPerson(editData?.contactPerson);
                setVendorMobileNo(editData?.mobileNo);
                setAlternateMobileNo(editData?.alternateMobileNo);
                setVendorEmail(editData?.email);
                setVendorAddress(editData?.address);
                setVendorCity(editData?.city);
                setVendorDistrict(editData?.district);
                setVendorState(editData?.state);
                setVendorPinCode(editData?.pinCode);

            }
            else if (modalType === 'Shipments') {
                setId(editData?.id);
                setShipmentType(editData?.shipmentType);
                setsSourcePlant(editData?.sourcePlant);
                setDestinationPlant(editData?.destinationPlant);
                setRFIDTag(editData?.rfidTag);
                setDriverName(editData?.driverName);
                setDriverMobileNo(editData?.driverMobile);
                setVehicleNumber(editData?.vehicleNo);
                setRatePerLitre(editData?.ratePerLitre);
                setVehicleType(editData?.vehicleType);
            }
            else if (modalType === 'Transporters') {
                setId(editData?.id);
                setRatePerLitre(editData?.ratePerLitre);
                setTotalAmount(editData?.totalAmount);
                setPendingAmount(editData?.pendingAmount);
                setCurrentRecievedAmount(editData?.recivedAmount);
                setBalanceType(editData?.balName);
            }
        }

        if (!modalRef.current) return;

        if (!bsModal.current) {
            bsModal.current = new BootstrapModal(
                modalRef.current,
                {
                    backdrop: 'static',
                    keyboard: true,
                }
            );
        }

        const handleHidden = () => {
            onClose?.();
        };

        modalRef.current.addEventListener(
            'hidden.bs.modal',
            handleHidden
        );

        if (show) {
            bsModal.current.show();
        } else {
            bsModal.current.hide();
        }

        return () => {
            modalRef.current?.removeEventListener(
                'hidden.bs.modal',
                handleHidden
            );
        };
    }, [show, onClose, modalType, isEdit]);

    useEffect(() => {
        if (!editData?.litre && editData?.ratePerLitre) {
            setTotalAmount('');
            setPendingAmount('');
            return;
        }
        console.log('recieved Working');
        const calculatedTotalAmount = Number(ratePerLitre) * Number(editData?.litre);
        setTotalAmount(calculatedTotalAmount);
        const calculatedPendingAmount = calculatedTotalAmount - Number(currentRecievedAmount) - Number(recievedAmount);
        setPendingAmount(calculatedPendingAmount);
    }, [ratePerLitre, recievedAmount, currentRecievedAmount]);

    const getAllVehicleDetails = () => {
        if (!parsedToken) return;
        setLoading(true);
        let URL = '';
        URL = `${environment?.config?.apiBaseUri}vehicle/getAllVehicle?pageNo=${pageIndex}&pageSize=${pageSize}`;

        axios.get(URL, {
            headers: {
                Authorization: `Bearer ${parsedToken}`,
                "Content-Type": "application/json"
            }
        })
            .then((response) => {
                if (response?.status === 200) {
                    setVehicleDetails(response?.data?.vehicleList);
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

    const handleClose = () => {
        bsModal.current?.hide();
        if (modalType === "Vehicles") {
            setId('');
            setVehicleNumber('');
            setVehicleType('');
            setOwnerName('');
            setOwnerMobileNo('');
            setDriverName('');
            setDriverMobileNo('');
            setRFIDTag('');
            setTankCapacity('');
        } else if (modalType === "Users") {
            setId('');
            setFullName('');
            setEmail('');
            setUserName('');
            setPassword('');
            setRole('');
            setUserMobileNumber('');
        } else if (modalType === "Vendors") {
            setId('');
            setPartyName('');
            setPartyType('');
            setPartyCode('');
            setContactPerson('');
            setVendorMobileNo('');
            setAlternateMobileNo('');
            setVendorEmail('');
            setVendorAddress('');
            setVendorCity('');
            setVendorDistrict('');
            setVendorState('');
            setVendorPinCode('');
        } else if (modalType === 'Shipments') {
            setId('');
            setShipmentType('');
            setsSourcePlant('');
            setDestinationPlant('');
            setRFIDTag('');
            setDriverName('');
            setDriverMobileNo('');
            setVehicleNumber('');
        } else if (modalType === 'Sales') {
            setSealId('');
        } else if (modalType === 'Transporters') {
            setBalanceType('');
            setRecievedAmount(0);
            setPendingAmount(0);
            setTotalAmount(0);
            setRatePerLitre(0);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        const requestBody =
            modalType === "Vehicles" ? {
                vehicleNumber: vehicleNumber,
                vehicleType: vehicleType,
                ownerName: ownerName,
                ownerMobileNo: ownerMobileNo,
                driverName: driverName,
                driverMobileNo: driverMobileNo,
                rfidTag: rfidTag,
                tankCapacity: tankCapacity,
            } : modalType === 'Users' ? {
                fullName: fullName,
                email: email,
                username: userName,
                password: password,
                role: role,
                mobileNo: userMobileNumber
            }
                : modalType === 'Vendors' ? {
                    partyName: partyName,
                    partyType: partyType,
                    contactPerson: contactPerson,
                    mobileNo: vendorMobileNo,
                    alternateMobileNo: vendorAlternateMobileNo,
                    email: vendorEmail,
                    address: vendorAddress,
                    city: vendorCity,
                    district: vendorDistrict,
                    state: vendorState,
                    pinCode: vendorPinCode,
                }
                    : modalType === 'Shipments' ? {
                        shipmentType: shipmentType,
                        sourcePlant: sourcePlant,
                        destinationPlant: destinationPlant,
                        vehicleNo: vehicleNumber,
                        driverName: driverName,
                        driverMobile: driverMobileNo,
                        rfidTag: rfidTag,
                        vehicleType: vehicleType,
                        ratePerLitre: ratePerLitre
                    }
                        : modalType === 'Transporters' ? {
                            ratePerLitre: ratePerLitre,
                            balName: balanceType,
                            recivedAmount: Number(recievedAmount) + Number(currentRecievedAmount),
                            pendingAmount: pendingAmount,
                            totalAmount: totalAmount,
                        }
                            : modalType === 'Config' ? {
                                managementName: fullName,
                                email: email,
                                mobileNo: ownerMobileNo,
                                fsSaiLicNo: fssaiLicNo,
                            } : {}

        // const formData = new FormData()
        // formData.append("sealed", sealId);

        if (isEdit) {
            let API = '';

            API = modalType === 'Vehicles' ? `${environment?.config?.apiBaseUri}vehicle/${id}/updateVehicle` :
                modalType === 'Users' ? `${environment?.config?.apiBaseUri}printer/update/${id}` :
                    modalType === 'Vendors' ? `${environment?.config?.apiBaseUri}party/${id}/updateParty` :
                        modalType === 'Shipments' ? `${environment?.config?.apiBaseUri}shipment/updateShipment/${id}` :
                            modalType === 'Sales' ? `${environment?.config?.apiBaseUri}milkdispatch/updateSealed/${challanId}?sealed=${sealId}` :
                                modalType === 'Transporters' ? `${environment?.config?.apiBaseUri}transporter/updateTransporter/${id}` :
                                    null;

            console.log("requestBody", requestBody)
            axios({
                url: API,
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${parsedToken}`,
                    'Content-Type': 'application/json'
                },
                // data: modalType === 'Sales' ? formData : requestBody,
                data: requestBody,
            })
                .then((res) => {
                    if (res && res?.data) {
                        toast.success(res?.data?.message || 'Details Updated');
                        setTimeout(() => {
                            handleClose();
                        }, 3000);
                        if (modalType === 'Vehicles') {
                            getAllVehicles();
                        } else if (modalType === 'Vendors') {
                            getAllVendors();
                        } else if (modalType === 'Users') {
                            getAllUsers();
                        } else if (modalType === 'Shipments') {
                            getAllShipments();
                        } else if (modalType === 'Sales') {
                            getAllChallan();
                        } else if (modalType === 'Transporter') {
                            getAllTransporters();
                        }
                        setLoading(false);
                    }
                })
                .catch((error) => {
                    toast.error(`${error?.response?.data?.message || 'Update failed'}`);
                    setLoading(false);
                    if (error.status === 401 && error.code === 'ERR_BAD_REQUEST') {
                        handleLogOut();
                    }
                });
        } else {
            let API = '';

            API = modalType === 'Vehicles' ? `${environment.config.apiBaseUri}vehicle/createVehicle` :
                modalType === 'Users' ? `${environment.config.apiBaseUri}auth/signUp` :
                    modalType === 'Vendors' ? `${environment.config.apiBaseUri}party/createParty` :
                        modalType === 'Shipments' ? `${environment?.config?.apiBaseUri}shipment/createShipment` :
                            modalType === 'Config' ? `${environment?.config?.apiBaseUri}management/create` :
                                null;

            axios({
                url: API,
                method: "POST",
                data: requestBody,
                headers: {
                    Authorization: `Bearer ${parsedToken}`,
                    'Content-Type': 'application/json'
                }

            })
                .then((res) => {
                    if (res && res.data) {
                        toast.success(res?.data?.message || 'Registered Successfully'); //I have to show the message from the backend
                        setTimeout(() => {
                            handleClose();
                        }, 3000);
                        if (modalType === 'Vehicles') {
                            getAllVehicles();
                        } else if (modalType === 'Vendors') {
                            getAllVendors();
                        } else if (modalType === 'Users') {
                            getAllUsers();
                        } else if (modalType === 'Shipments') {
                            getAllShipments();
                        }
                        else if (modalType === 'Config') {
                            getAllConfigs();
                        }
                        setLoading(false);
                    }
                })
                .catch((response) => {
                    toast.error(`${response}`);
                    setLoading(false);
                    if (response.status === 401 && response.code === 'ERR_BAD_REQUEST') {
                        handleLogOut();
                    }
                });
        }
    };

    const handleChangeVehicleNumber = (event) => {
        const role = event?.target.value;
        if (role) {
            setVehicleNumber(role);
        } else {

            setVehicleNumber(role);
        }
    };
    //************************************ */ VEHICLE FUNCTIONS****************************************//
    const handleChangeVehicleType = (event) => {
        const value = event?.target.value;
        if (value) {
            setVehicleType(value);
        } else {
            setVehicleType('');
        }
    };

    const handleChangeOwnerName = (event) => {
        const value = event.target.value;
        value ? (() => {
            setOwnerName(value);
        })()
            : (() => {
                setOwnerName('');
            })()
    }

    const handleChangeOwnerMobileNo = (event) => {
        const value = event.target.value;
        value ? (() => {
            setOwnerMobileNo(value);
        })()
            : (() => {
                setOwnerMobileNo('');
            })()
    }
    const handleChangeDriverName = (event) => {
        const value = event.target.value;
        value ? (() => {
            setDriverName(value);
        })()
            : (() => {
                setDriverName('');
            })()
    }
    const handleChangeDriverMobileNumber = (event) => {
        const value = event.target.value;
        value ? (() => {
            setDriverMobileNo(value);
        })()
            : (() => {
                setDriverMobileNo('');
            })()
    }
    const handleChangeRFIDTag = (event) => {
        const value = event.target.value;
        value ? (() => {
            setRFIDTag(value);
        })()
            : (() => {
                setRFIDTag('');
            })()
    }
    const handleChangeTankCapacity = (event) => {
        const value = event.target.value;
        value ? (() => {
            setTankCapacity(value);
        })()
            : (() => {
                setTankCapacity('');
            })()
    }
    // ************************************************ USER FUNCTIONS ****************************************//
    const handleChangeFullName = (event) => {
        const value = event.target.value;
        value ? (() => {
            setFullName(value);
        })()
            : (() => {
                setFullName('');
            })()
    }
    const handleChangeEmail = (event) => {
        const value = event.target.value;
        value ? (() => {
            setEmail(value);
        })()
            : (() => {
                setEmail('');
            })()
    }
    const handleChangeUserName = (event) => {
        const value = event.target.value;
        value ? (() => {
            setUserName(value);
        })()
            : (() => {
                setUserName('');
            })()
    }
    const handleChangePassword = (event) => {
        const value = event.target.value;
        value ? (() => {
            setPassword(value);
        })()
            : (() => {
                setPassword('');
            })()
    }
    const handleChangeRole = (event) => {
        const value = event.target.value;
        value ? (() => {
            setRole(value);
        })()
            : (() => {
                setRole('');
            })()
    }
    const handleChangeUserMobileNumber = (event) => {
        const value = event.target.value;
        value ? (() => {
            setUserMobileNumber(value);
        })()
            : (() => {
                setUserMobileNumber('');
            })()
    }
    //**************************************************VENDOR FUNCTIONS*************************************************** */
    const handleChangePartyCode = (event) => {
        const value = event.target.value;
        value ? (() => {
            setPartyCode(value);
        })()
            : (() => {
                setPartyCode('');
            })()
    }
    const handleChangepartName = (event) => {
        const value = event.target.value;
        value ? (() => {
            setPartyName(value);
        })()
            : (() => {
                setPartyName('');
            })()
    }
    const handleChangePartyType = (event) => {
        const value = event.target.value;
        value ? (() => {
            setPartyType(value);
        })()
            : (() => {
                setPartyType('');
            })()
    }
    const handleChangeContactPerson = (event) => {
        const value = event.target.value;
        value ? (() => {
            setContactPerson(value);
        })()
            : (() => {
                setContactPerson('');
            })()
    }
    const handleChangeVendorMobileNo = (event) => {
        const value = event.target.value;
        value ? (() => {
            setVendorMobileNo(value);
        })()
            : (() => {
                setVendorMobileNo('');
            })()
    }
    const handleChangeAlternateMobileNo = (event) => {
        const value = event.target.value;
        value ? (() => {
            setAlternateMobileNo(value);
        })()
            : (() => {
                setAlternateMobileNo('');
            })()
    }
    const handleChangeVendorEmail = (event) => {
        const value = event.target.value;
        value ? (() => {
            setVendorEmail(value);
        })()
            : (() => {
                setVendorEmail('');
            })()
    }
    const handleChangeVendorAddress = (event) => {
        const value = event.target.value;
        value ? (() => {
            setVendorAddress(value);
        })()
            : (() => {
                setVendorAddress('');
            })()
    }
    const handleChangeVendorCity = (event) => {
        const value = event.target.value;
        value ? (() => {
            setVendorCity(value);
        })()
            : (() => {
                setVendorCity('');
            })()
    }
    const handleChangeVendorDistrict = (event) => {
        const value = event.target.value;
        value ? (() => {
            setVendorDistrict(value);
        })()
            : (() => {
                setVendorDistrict('');
            })()
    }
    const handleChangeVendorState = (event) => {
        const value = event.target.value;
        value ? (() => {
            setVendorState(value);
        })()
            : (() => {
                setVendorState('');
            })()
    }
    const handleChangeVendorPinCode = (event) => {
        const value = event.target.value;
        value ? (() => {
            setVendorPinCode(value);
        })()
            : (() => {
                setVendorPinCode('');
            })()
    }

    //***************************************Shipment Functions********************************************** */
    const handleChangeShipmentVehicleNumber = (event) => {
        const selectedVehicleNumber = event.target.value;

        // Set selected vehicle number
        setVehicleNumber(selectedVehicleNumber);

        // Find the complete vehicle object
        const selectedVehicle = vehicleDetails?.find(
            (vehicle) => vehicle.vehicleNumber === selectedVehicleNumber
        );

        if (selectedVehicle) {
            setDriverName(selectedVehicle.driverName || '');
            setDriverMobileNo(selectedVehicle.driverMobileNo || '');
            setRFIDTag(selectedVehicle.rfidTag || '');
        } else {
            // Clear related fields when nothing is selected
            setDriverName('');
            setDriverMobileNo('');
            setRFIDTag('');
        }
    };

    const handleChangeShipmentType = (event) => {
        const value = event?.target.value;
        if (value) {
            setShipmentType(value);
        } else {
            setShipmentType('');
        }
    };
    const handleChangeSourcePlant = (event) => {
        const value = event?.target.value;
        if (value) {
            setsSourcePlant(value);
        } else {
            setsSourcePlant('');
        }
    };

    const handleChangeDestinationPlant = (event) => {
        const value = event?.target.value;
        if (value) {
            setDestinationPlant(value);
        } else {
            setDestinationPlant('');
        }
    };

    const handleChangeRatePerLitre = (event) => {
        const value = event?.target.value;
        if (value) {
            setRatePerLitre(value);
        } else {
            setRatePerLitre(0);
        }
    };

    const handleChangeTotalAmount = (event) => {
        const value = event?.target.value;
        if (value) {
            setTotalAmount(value);
        } else {
            setTotalAmount(0);
        }
    };
    const handleChangePendingAmount = (event) => {
        const value = event?.target.value;
        if (value) {
            setPendingAmount(value);
        } else {
            setPendingAmount(0);
        }
    };
    const handleChangeRecievedAmount = (event) => {
        const value = event?.target.value;
        if (value) {
            setRecievedAmount(value);
        } else {
            setRecievedAmount(0);
        }
    };
    const handleChangeCurrentRecievedAmount = (event) => {
        const value = event?.target.value;
        if (value) {
            setCurrentRecievedAmount(value);
        } else {
            setCurrentRecievedAmount('');
        }
    };
    const handleChangeBalanceType = (event) => {
        const value = event?.target.value;
        if (value) {
            setBalanceType(value);
        } else {
            setBalanceType(0);
        }
    };

    const handleChangeSealId = (event) => {
        const value = event?.target.value;
        if (value) {
            setSealId(value);
        } else {
            setSealId('');
        }
    };
    const handleChangeFssaiLicNo = (event) => {
        const value = event?.target.value;
        if (value) {
            setFssaiLicNo(value);
        } else {
            setFssaiLicNo('');
        }
    };

    const handleLogOut = () => {
        navigate("/login", { replace: true });
        localStorage.removeItem("accessToken");
        localStorage.removeItem("authToken");
        window.location.reload();
    }

    return ReactDOM.createPortal(
        <>
            {loading && (
                <Box
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(255, 255, 255, 0.4)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 10000,
                    }}
                >
                    {/* <WLoader /> */}
                </Box>
            )}
            <div className="modal fade" tabIndex="-1" ref={modalRef}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content rounded-4 p-3">
                        <div className="modal-header border-0">
                            <h5 className="modal-title fw-bold">
                                {modalType === 'Vehicles' ? (isEdit ? 'Update Vehicle Details' : 'Vehicle Details') :
                                    modalType === 'Users' ? (isEdit ? 'Update User Details' : 'Create New User') :
                                        modalType === 'Vendors' ? (isEdit ? 'Update Vendor Details' : 'Create New Vendor') :
                                            modalType === 'Shipments' ? (isEdit ? 'Update Shipment Details' : 'Create New Shipment') :
                                                modalType === 'Sales' ? (isEdit ? 'Add Seal' : 'Add Seal') :
                                                    modalType === 'Transporters' ? (isEdit ? `Update details for challan No:-${editData?.challanNo}` : 'Add Seal') :
                                                        modalType === 'Config' ? (isEdit ? `Update details for challan No:-${editData?.challanNo}` : 'Add Config')
                                                            : null
                                }
                            </h5>
                            <button
                                type="button"
                                className="btn btn-light rounded-circle shadow custom-close-btn"
                                onClick={handleClose}
                                aria-label="Close"
                            >
                                <i className="bi bi-x fs-5 text-secondary"></i>
                            </button>
                        </div>

                        <form className="px-3 pb-4"
                            onSubmit={handleSubmit}
                        >
                            {modalType === "Vehicles" ? (<>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="form-floating">
                                            <input
                                                type="text"
                                                className="form-control shadow-sm"
                                                id="vehicleNumber"
                                                placeholder="Vehicle Number"
                                                value={vehicleNumber}
                                                onChange={handleChangeVehicleNumber}
                                                required
                                            />
                                            <label htmlFor="vehicleNumber">Vehicle Number</label>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-floating">
                                            <input
                                                type="text"
                                                className="form-control shadow-sm"
                                                id="vehicleType"
                                                placeholder="Vehicle Type"
                                                value={vehicleType}
                                                onChange={handleChangeVehicleType}
                                                required
                                            />
                                            <label htmlFor="vehicleType">Vehicle Type</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-floating">
                                            <input
                                                type="text"
                                                className="form-control shadow-sm"
                                                id="ownerName"
                                                placeholder="Owner Name"
                                                value={ownerName}
                                                onChange={handleChangeOwnerName}
                                                required
                                            />
                                            <label htmlFor="ownerName">Owner Name</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-floating">
                                            <input
                                                type="number"
                                                className="form-control shadow-sm"
                                                id="ownerMobileNo"
                                                placeholder="Owner Mobile Number"
                                                value={ownerMobileNo}
                                                onChange={handleChangeOwnerMobileNo}
                                                required
                                            />
                                            <label htmlFor="ownerMobileNo">Owner Mobile Number</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-floating">
                                            <input
                                                type="text"
                                                className="form-control shadow-sm"
                                                id="driverName"
                                                placeholder="Driver Name"
                                                value={driverName}
                                                onChange={handleChangeDriverName}
                                                required
                                            />
                                            <label htmlFor="driverName">Driver Name</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-floating">
                                            <input
                                                type="number"
                                                className="form-control shadow-sm"
                                                id="driverMobileNo"
                                                placeholder="Driver Mobile Number"
                                                value={driverMobileNo}
                                                onChange={handleChangeDriverMobileNumber}
                                                required
                                            />
                                            <label htmlFor="driverMobileNo">Driver Mobile Number</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-floating">
                                            <input
                                                type="text"
                                                className="form-control shadow-sm"
                                                id="rfidTag"
                                                placeholder="rfidTag"
                                                value={rfidTag}
                                                onChange={handleChangeRFIDTag}
                                                required
                                            />
                                            <label htmlFor="rfidTag">RFID Tag</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-floating">
                                            <input
                                                type="number"
                                                className="form-control shadow-sm"
                                                id="tankCapacity"
                                                placeholder="tankCapacity"
                                                value={tankCapacity}
                                                onChange={handleChangeTankCapacity}
                                                required
                                            />
                                            <label htmlFor="tankCapacity">Tank Capacity</label>
                                        </div>
                                    </div>
                                </div>
                            </>) : modalType === "Users" ? (<>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="form-floating">
                                            <input
                                                type="text"
                                                className="form-control shadow-sm"
                                                id="fullName"
                                                placeholder="Full Name"
                                                value={fullName}
                                                onChange={handleChangeFullName}
                                                required
                                            />
                                            <label htmlFor="fullName">Full Name</label>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-floating">
                                            <input
                                                type="email"
                                                className="form-control shadow-sm"
                                                id="email"
                                                placeholder="Email"
                                                value={email}
                                                onChange={handleChangeEmail}
                                                required
                                            />
                                            <label htmlFor="email">Email</label>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-floating">
                                            <input
                                                type="text"
                                                className="form-control shadow-sm"
                                                id="username"
                                                placeholder="User Name"
                                                value={userName}
                                                onChange={handleChangeUserName}
                                                required
                                            />
                                            <label htmlFor="username">User Name</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-floating">
                                            <select
                                                type="text"
                                                className="form-control shadow-sm"
                                                id="role"
                                                placeholder="Role"
                                                value={role}
                                                onChange={handleChangeRole}
                                                required
                                            >
                                                <option value={''}>Select Role</option>
                                                <option key={"ADMIN"} value={"ADMIN"}>ADMIN</option>
                                                <option key={"USER"} value={"USER"}>USER</option>
                                            </select>
                                            <label htmlFor="loader">Select Role</label>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-floating">
                                            <input
                                                type="password"
                                                className="form-control shadow-sm"
                                                id="password"
                                                placeholder="Password"
                                                value={password}
                                                onChange={handleChangePassword}
                                                required
                                            />
                                            <label htmlFor="password">Password</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-floating">
                                            <input
                                                type="number"
                                                className="form-control shadow-sm"
                                                id="userMobileNumber"
                                                placeholder="Mobile Number"
                                                value={userMobileNumber}
                                                onChange={handleChangeUserMobileNumber}
                                                required
                                            />
                                            <label htmlFor="userMobileNumber">Mobile Number</label>
                                        </div>
                                    </div>
                                </div>
                            </>) :
                                modalType === "Vendors" ? (<>
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    id="partyCode"
                                                    placeholder="Party Code"
                                                    value={partyCode}
                                                    onChange={handleChangePartyCode}
                                                    required
                                                />
                                                <label htmlFor="partyCode">Party Code</label>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    id="partyName"
                                                    placeholder="Party Name"
                                                    value={partyName}
                                                    onChange={handleChangepartName}
                                                    required
                                                />
                                                <label htmlFor="partyName">Party Name</label>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    id="partyType"
                                                    placeholder="Party Type"
                                                    value={partyType}
                                                    onChange={handleChangePartyType}
                                                    required
                                                />
                                                <label htmlFor="partyType">Party Type</label>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    id="contactPerson"
                                                    placeholder="Contact Person"
                                                    value={contactPerson}
                                                    onChange={handleChangeContactPerson}
                                                    required
                                                />
                                                <label htmlFor="contactPerson">Contact Person</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="number"
                                                    className="form-control shadow-sm"
                                                    id="vendorMobileNo"
                                                    placeholder="Mobile Number"
                                                    value={vendorMobileNo}
                                                    onChange={handleChangeVendorMobileNo}
                                                    required
                                                />
                                                <label htmlFor="vendorMobileNo">Mobile Number</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="number"
                                                    className="form-control shadow-sm"
                                                    id="vendorAlternateMobileNo"
                                                    placeholder="Alternate MobileNo"
                                                    value={vendorAlternateMobileNo}
                                                    onChange={handleChangeAlternateMobileNo}
                                                    required
                                                />
                                                <label htmlFor="vendorAlternateMobileNo">Alternate MobileNo</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="email"
                                                    className="form-control shadow-sm"
                                                    id="vendorEmail"
                                                    placeholder="Email"
                                                    value={vendorEmail}
                                                    onChange={handleChangeVendorEmail}
                                                    required
                                                />
                                                <label htmlFor="vendorEmail">Email</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    id="vendorAddress"
                                                    placeholder="Address"
                                                    value={vendorAddress}
                                                    onChange={handleChangeVendorAddress}
                                                    required
                                                />
                                                <label htmlFor="vendorAddress">Address</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    id="vendorCity"
                                                    placeholder="City"
                                                    value={vendorCity}
                                                    onChange={handleChangeVendorCity}
                                                    required
                                                />
                                                <label htmlFor="vendorCity">City</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    id="vendorDistrict"
                                                    placeholder="District"
                                                    value={vendorDistrict}
                                                    onChange={handleChangeVendorDistrict}
                                                    required
                                                />
                                                <label htmlFor="vendorDistrict">District</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    id="vendorState"
                                                    placeholder="State"
                                                    value={vendorState}
                                                    onChange={handleChangeVendorState}
                                                    required
                                                />
                                                <label htmlFor="vendorState">State</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    id="vendorPinCode"
                                                    placeholder="PinCode"
                                                    value={vendorPinCode}
                                                    onChange={handleChangeVendorPinCode}
                                                    required
                                                />
                                                <label htmlFor="vendorPinCode">PinCode</label>
                                            </div>
                                        </div>
                                    </div>
                                </>) : modalType === "Shipments" ? (<>
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    id="shipmentType"
                                                    placeholder="Shipment Type"
                                                    value={shipmentType}
                                                    onChange={handleChangeShipmentType}
                                                    required
                                                    disabled={isEdit}
                                                />
                                                <label htmlFor="shipmentType">Shipment Type</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    id="vehicleType"
                                                    placeholder="Vehicle Type"
                                                    value={vehicleType}
                                                    onChange={handleChangeVehicleType}
                                                    required
                                                    disabled={isEdit}
                                                />
                                                <label htmlFor="vehicleType">Vehicle Type</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    id="ratePerLitre"
                                                    placeholder="Rate Per Litre"
                                                    value={ratePerLitre}
                                                    onChange={handleChangeRatePerLitre}
                                                    required
                                                />
                                                <label htmlFor="ratePerLitre">Rate Per Litre</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    id="sourcePlant"
                                                    placeholder="Source Plant"
                                                    value={sourcePlant}
                                                    onChange={handleChangeSourcePlant}
                                                    required
                                                />
                                                <label htmlFor="sourcePlant">Source Plant</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    id="destinationPlant"
                                                    placeholder="Destination Plant"
                                                    value={destinationPlant}
                                                    onChange={handleChangeDestinationPlant}
                                                    required
                                                />
                                                <label htmlFor="destinationPlant">Destination Plant</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <select
                                                    className="form-select shadow-sm"
                                                    id="vehicleNumber"
                                                    value={vehicleNumber}
                                                    onChange={handleChangeShipmentVehicleNumber}
                                                    required
                                                    disabled={isEdit}
                                                >
                                                    <option value="">Select Vehicle Number</option>

                                                    {vehicleDetails?.map((vehicle) => (
                                                        <option
                                                            key={vehicle.id}
                                                            value={vehicle.vehicleNumber}
                                                        >
                                                            {vehicle.vehicleNumber}
                                                        </option>
                                                    ))}
                                                </select>
                                                <label htmlFor="vehicleNumber">Vehicle Number</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    id="vehicleNumber"
                                                    placeholder="Driver Name"
                                                    value={driverName}
                                                    onChange={handleChangeDriverName}
                                                    required
                                                    disabled
                                                />
                                                <label htmlFor="driverName">Driver Name</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    id="driverMobileNo"
                                                    placeholder="Vehicle Number"
                                                    value={driverMobileNo}
                                                    onChange={handleChangeDriverMobileNumber}
                                                    required
                                                    disabled
                                                />
                                                <label htmlFor="driverMobileNo">Driver Mobile Number</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    id="rfidTag"
                                                    placeholder="RFID Tag"
                                                    value={rfidTag}
                                                    onChange={handleChangeRFIDTag}
                                                    required
                                                    disabled
                                                />
                                                <label htmlFor="rfidTag">RFID Tag</label>
                                            </div>
                                        </div>
                                    </div>
                                </>) : modalType === "Sales" ? (<>
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    id="sealId"
                                                    placeholder="SEAL ID"
                                                    value={sealId}
                                                    onChange={handleChangeSealId}
                                                    required
                                                />
                                                <label htmlFor="sealId">SEAL ID</label>
                                            </div>
                                        </div>
                                    </div>
                                </>) : modalType === "Config" ? (<>
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    id="fullName"
                                                    placeholder="Full Name"
                                                    value={fullName}
                                                    onChange={handleChangeFullName}
                                                    required
                                                />
                                                <label htmlFor="fullName">Full Name</label>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="email"
                                                    className="form-control shadow-sm"
                                                    id="email"
                                                    placeholder="Email"
                                                    value={email}
                                                    onChange={handleChangeEmail}
                                                    required
                                                />
                                                <label htmlFor="email">Email</label>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="number"
                                                    className="form-control shadow-sm"
                                                    id="ownerMobileNo"
                                                    placeholder="Owner Mobile Number"
                                                    value={ownerMobileNo}
                                                    onChange={handleChangeOwnerMobileNo}
                                                    required
                                                />
                                                <label htmlFor="ownerMobileNo">Owner Mobile Number</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    id="fssaiLicNo"
                                                    placeholder="FSSAI License No"
                                                    value={fssaiLicNo}
                                                    onChange={handleChangeFssaiLicNo}
                                                    required
                                                />
                                                <label htmlFor="fssaiLicNo">FSSAI License No</label>
                                            </div>
                                        </div>

                                    </div>
                                </>) : modalType === "Transporters" ? (<>
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="number"
                                                    className="form-control shadow-sm"
                                                    id="ratePerLitre"
                                                    placeholder="Rate/Litre"
                                                    value={ratePerLitre}
                                                    onChange={handleChangeRatePerLitre}
                                                    required
                                                />
                                                <label htmlFor="ratePerLitre">Rate/Litre</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="number"
                                                    className="form-control shadow-sm"
                                                    id="totalAmount"
                                                    placeholder="Total Amount"
                                                    value={totalAmount}
                                                    onChange={handleChangeTotalAmount}
                                                    required
                                                    disabled
                                                />
                                                <label htmlFor="totalAmount">Total Amount</label>
                                            </div>
                                        </div>
                                        {isEdit ? <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    id="recivedAmount "
                                                    placeholder="Recived Amount"
                                                    value={currentRecievedAmount}
                                                    onChange={handleChangeCurrentRecievedAmount}
                                                    required
                                                    disabled
                                                />
                                                <label htmlFor="recivedAmount ">Current Recieved Amount</label>
                                            </div>
                                        </div> : null}
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    id="recivedAmount "
                                                    placeholder="Recived Amount"
                                                    value={recievedAmount}
                                                    onChange={handleChangeRecievedAmount}
                                                    required
                                                />
                                                <label htmlFor="recivedAmount ">Recived Amount</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="number"
                                                    className="form-control shadow-sm"
                                                    id="pendingAmount "
                                                    placeholder="Pending Amount"
                                                    value={pendingAmount}
                                                    onChange={handleChangePendingAmount}
                                                    required
                                                    disabled
                                                />
                                                <label htmlFor="pendingAmount ">Pending Amount</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <select
                                                    className="form-select shadow-sm"
                                                    id="balType"
                                                    value={balanceType}
                                                    onChange={handleChangeBalanceType}
                                                    required
                                                >
                                                    <option value="">Select Payment Type</option>
                                                    <option value="Cash">Cash</option>
                                                    <option value="Online">Online</option>
                                                </select>
                                                <label htmlFor="vehicleNumber">Balance Type</label>
                                            </div>
                                        </div>
                                    </div>
                                </>) :
                                    null}

                            <div className="mt-4 d-grid d-flex justify-content-end align-items-center gap-2">
                                <button type="submit" className="btn shadow-sm" style={{
                                    color: 'white',
                                    // background: 'linear-gradient(135deg, #5ac39f, #0777c5)'
                                    backgroundColor: '#43811f'
                                }}>{modalType === "Vehicles" ? (isEdit ? 'Update Vehicle Details' : 'Register Vehicle Details') :
                                    modalType === "Users" ? (isEdit ? 'Update Users' : 'Create New User') :
                                        modalType === "Vendors" ? (isEdit ? 'Update Vendors' : 'Create New Vendor') :
                                            modalType === "Shipments" ? (isEdit ? 'Update Shipment' : 'Create New Shipment') :
                                                modalType === "Sales" ? (isEdit ? 'SEAL' : 'SEAL') :
                                                    modalType === "Transporters" ? (isEdit ? 'Update Transporter' : 'SEAL') :
                                                        modalType === "Config" ? (isEdit ? 'Update Transporter' : 'Add Config') :
                                                            null}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <ToastContainer position="top-right" />
        </>,
        document.body
    );
};
export default Modal;
