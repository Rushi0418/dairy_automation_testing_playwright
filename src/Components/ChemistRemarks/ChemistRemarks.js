import React, { useEffect, useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
import axios from 'axios';
import environment from '../../Environment/Environment';
import { toast, ToastContainer } from 'react-toastify';
import './ChemistRemarks.css';

const ChemistRemarksPanel = ({
    show,
    onHide,
    data,
    onSuccess,
    getAllChallan
}) => {

    const [remarks, setRemarks] = useState({});
    const [loading, setLoading] = useState(false);
    const [remarkStatus, setRemarkStatus] = useState(false);
    const [parsedToken, setParsedToken] = useState(false);

    const remarkFields = [
        {
            key: 'netWeightRemark',
            label: 'Net Weight',
            valueKey: 'netWeight',
            unit: 'Lit'
        },
        {
            key: 'otRemark',
            label: 'OT',
            valueKey: 'ot'
        },
        {
            key: 'temperatureRemark',
            label: 'Temperature',
            valueKey: 'temperature',
            unit: '°C'
        },
        {
            key: 'acidityRemark',
            label: 'Acidity',
            valueKey: 'acidity',
            unit: '%LA'
        },
        {
            key: 'cobRemark',
            label: 'COB',
            valueKey: 'cob'
        },
        {
            key: 'alcoholRemark',
            label: 'Alcohol',
            valueKey: 'alcohol'
        },
        {
            key: 'alkalinePhosphateRemark',
            label: 'Alkaline Phosphate',
            valueKey: 'alkalinePhosphate',
            unit: 'Hrs.'
        },
        {
            key: 'mbrtRemark',
            label: 'MBRT',
            valueKey: 'mbrt',
            unit: 'Hrs.'
        },
        {
            key: 'adulterationRemark',
            label: 'Adulteration',
            valueKey: 'adulteration'
        },
        {
            key: 'fatRemark',
            label: 'FAT',
            valueKey: 'fat',
            unit: '%'
        },
        {
            key: 'clrRemark',
            label: 'CLR',
            valueKey: 'clr'
        },
        {
            key: 'snfRemark',
            label: 'SNF',
            valueKey: 'snf',
            unit: '%'
        },
        {
            key: 'tsRemark',
            label: 'T.S.',
            valueKey: 'ts'
        },
        {
            key: 'proteinRemark',
            label: 'Protein',
            valueKey: 'protein'
        },
        {
            key: 'melamineRemark',
            label: 'Melamine',
            valueKey: 'melamine'
        },
        {
            key: 'antibioticRemark',
            label: 'Antibiotic',
            valueKey: 'antibiotic'
        }
    ];

    useEffect(() => {
        if (!data) {
            setRemarks({});
            return;
        }

        const existingRemarks = {};

        remarkFields.forEach((field) => {
            existingRemarks[field.key] =
                data?.[field.key] &&
                    data[field.key] !== 'NA'
                    ? data[field.key]
                    : '';
        });

        setRemarks(existingRemarks);

    }, [data, show]);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        setParsedToken(token);
    })

    const handleRemarkChange = (field, value) => {

        setRemarks((prev) => ({
            ...prev,
            [field]: value
        }));

    };

    const handleSubmit = async () => {

        setLoading(true);

        try {
            const requestBody = {
                ...data,
                status: remarkStatus,
                ...remarks
            };

            console.log(
                'Chemist Remarks Request:',
                requestBody
            );
            // return;
            const API =
                `${environment.config.apiBaseUri}milkdispatch/updateRemarks/${data?.id}`;

            const response = await axios({
                url: API,
                method: 'PUT',
                data: requestBody,
                headers: {
                    Authorization: `Bearer ${parsedToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response?.data) {

                toast.success(
                    response?.data?.message ||
                    'Remarks saved successfully'
                );

                setLoading(false);
                getAllChallan()
                if (onSuccess) {
                    onSuccess(response.data);
                }

                setTimeout(() => {
                    onHide?.();
                }, 1000);
            }

        } catch (error) {

            console.error(
                '❌ Error saving remarks:',
                error
            );

            toast.error(
                error?.response?.data?.message ||
                'Failed to save remarks'
            );

            setLoading(false);
        }
    };


    return (
        <>
            <Offcanvas
                show={show}
                onHide={onHide}
                placement="end"
                backdrop={true}
                className="chemist-remarks-canvas"
            >

                {/* HEADER */}
                <Offcanvas.Header className="chemist-canvas-header">

                    <div className="chemist-header-content">

                        <div className="chemist-title">
                            QC Remarks
                        </div>

                        <div className="chemist-subtitle">

                            {data?.partyName || 'Party'}

                            {data?.vehicleNo && (
                                <>
                                    <span className="header-separator">
                                        •
                                    </span>

                                    {data.vehicleNo}
                                </>
                            )}

                        </div>

                    </div>

                    <button
                        type="button"
                        className="btn btn-light rounded-circle shadow-sm chemist-close-btn"
                        onClick={onHide}
                    >
                        <i className="bi bi-x fs-5"></i>
                    </button>

                </Offcanvas.Header>


                {/* BODY */}
                <Offcanvas.Body className="chemist-canvas-body">

                    {/* SUMMARY */}
                    <div className="chemist-summary">

                        <div className="summary-item">
                            <span>Milk Type</span>
                            <strong>
                                {data?.milkType || '-'}
                            </strong>
                        </div>

                        <div className="summary-item">
                            <span>Dispatch Date</span>
                            <strong>
                                {data?.dispatchDate || '-'}
                            </strong>
                        </div>

                        <div className="summary-item">
                            <span>Dispatch Time</span>
                            <strong>
                                {data?.dispatchTime || '-'}
                            </strong>
                        </div>

                    </div>


                    {/* INSTRUCTION */}
                    <div className="chemist-info">

                        <i className="bi bi-info-circle"></i>

                        <span>
                            Review each reading and enter the
                            corresponding QC remark.
                        </span>

                    </div>


                    {/* TABLE */}
                    <div className="chemist-table-wrapper">

                        <table className="chemist-table">

                            <thead>
                                <tr>
                                    <th className="sr-column">
                                        #
                                    </th>

                                    <th>
                                        Parameter
                                    </th>

                                    <th className="reading-column">
                                        Reading
                                    </th>

                                    <th className="remark-column">
                                        Remark
                                    </th>
                                </tr>
                            </thead>


                            <tbody>

                                {remarkFields.map((field, index) => (

                                    <tr key={field.key}>

                                        <td className="sr-column">
                                            {index + 1}
                                        </td>

                                        <td>
                                            <div className="parameter-name">
                                                {field.label}
                                            </div>

                                            {field.unit && (
                                                <div className="parameter-unit">
                                                    {field.unit}
                                                </div>
                                            )}
                                        </td>

                                        <td className="reading-column">

                                            <span className="reading-value">
                                                {data?.[field.valueKey] ?? '-'}
                                            </span>

                                        </td>

                                        <td className="remark-column">

                                            <input
                                                type="text"
                                                className="remark-input"
                                                placeholder="Enter remark..."
                                                value={
                                                    remarks[field.key] || ''
                                                }
                                                onChange={(e) =>
                                                    handleRemarkChange(
                                                        field.key,
                                                        e.target.value
                                                    )
                                                }
                                            />

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>
                    <div className='accept-reject-btns gap-2 mt-2'>
                        <button
                            type="button"
                            className="btn"
                            style={{
                                backgroundColor: '#dc3545',
                                color: '#fff',
                                border: 'none'
                            }}
                            onClick={() => {
                                setRemarkStatus('QC_REJECTED')
                                toast.success('Remarks are Rejected please submit to proceed')
                            }}
                        >
                            <i className="bi bi-x-circle me-1"></i>
                            Reject
                        </button>

                        <button
                            type="button"
                            className="btn"
                            style={{
                                backgroundColor: '#198754',
                                color: '#fff',
                                border: 'none'
                            }}
                            onClick={() => {
                                setRemarkStatus('QC_APPROVED')
                                toast.success('Remarks are Accepted please submit to proceed')
                            }}
                        >
                            <i className="bi bi-check-circle me-1"></i>
                            Accept
                        </button>
                    </div>
                </Offcanvas.Body>


                {/* FOOTER */}
                <div className="chemist-canvas-footer">

                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={onHide}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={loading}
                    >

                        {loading ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                ></span>

                                Saving...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check2-circle me-2"></i>
                                Submit Remarks
                            </>
                        )}

                    </button>

                </div>

            </Offcanvas>

            <ToastContainer />

        </>
    );
};

export default ChemistRemarksPanel;