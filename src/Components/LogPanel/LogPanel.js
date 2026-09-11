import React, { useEffect } from 'react';
import { Offcanvas } from 'react-bootstrap';
import './LogPanel.css';

const LogPanel = ({ show, onHide, data, challanAction }) => {

    useEffect(() => {
        const handleAfterPrint = () => {
            document.body.classList.remove('printing-challan');
        };

        window.addEventListener('afterprint', handleAfterPrint);

        return () => {
            window.removeEventListener('afterprint', handleAfterPrint);
            document.body.classList.remove('printing-challan');
        };
    }, []);

    const formatDate = (date) => {
        if (!date) return '';

        const parts = date.split('-');

        if (parts.length === 3) {
            return `${parts[2]}.${parts[1]}.${parts[0]}`;
        }

        return date;
    };

    const rows = [
        {
            srno: '1)',
            narration: 'Net Wt. (Lit)',
            result: data?.netWeight ?? '',
            remark: data?.netWeightRemark ?? ' '
        },
        {
            srno: '2)',
            narration: 'OT',
            result: data?.ot ?? '',
            remark: data?.otRemark ?? ' '
        },
        {
            srno: '3)',
            narration: 'Temp. C',
            result: data?.temperature ?? '',
            remark: data?.temperatureRemark ?? ' '
        },
        {
            srno: '4)',
            narration: 'Acidity (%LA)',
            result: data?.acidity ?? '',
            remark: data?.acidityRemark ?? ' '
        },
        {
            srno: '5)',
            narration: 'COB',
            result: data?.cob ?? '',
            remark: data?.cobRemark ?? ' '
        },
        {
            srno: '6)',
            narration: 'Alchohol',
            result: data?.alcohol ?? '',
            remark: data?.alcoholRemark ?? ' '
        },
        {
            srno: '7)',
            narration: 'Alkaline Phosphate Test Hrs.',
            result: data?.alkalinePhosphate ?? '',
            remark: data?.alkalinePhosphateRemark ?? ' '
        },
        {
            srno: '8)',
            narration: 'MBRT (Hrs.)',
            result: data?.mbrt ?? '',
            remark: data?.mbrtRemark ?? ' '
        },
        {
            srno: '9)',
            narration: 'Adulteration',
            result: data?.adulteration ?? '',
            remark: data?.adulterationRemark ?? ' '
        },
        {
            srno: '10)',
            narration: 'FAT %',
            result: data?.fat ?? '',
            remark: data?.fatRemark ?? ' '
        },
        {
            srno: '11)',
            narration: 'CLR',
            result: data?.clr ?? '',
            remark: data?.clrRemark ?? ' '
        },
        {
            srno: '12)',
            narration: 'SNF %',
            result: data?.snf ?? '',
            remark: data?.snfRemark ?? ' '
        },
        {
            srno: '13)',
            narration: 'T.S.',
            result: data?.ts ?? '',
            remark: data?.tsRemark ?? ' '
        },
        {
            srno: '14)',
            narration: 'Protein',
            result: data?.protein ?? '',
            remark: data?.proteinRemark ?? ' '
        },
        {
            srno: '15)',
            narration: 'Melamine',
            result: data?.melamine ?? '',
            remark: data?.melamineRemark ?? ' '
        },
        {
            srno: '16)',
            narration: 'Antibiotic',
            result: data?.antibiotic ?? '',
            remark: data?.antibioticRemark ?? ' '
        }
    ];

    const handlePrint = () => {
        document.body.classList.add('printing-challan');

        setTimeout(() => {
            window.print();

            setTimeout(() => {
                document.body.classList.remove('printing-challan');
            }, 500);
        }, 100);
    };

    return (
        <Offcanvas
            show={show}
            onHide={onHide}
            placement="end"
            backdrop={false}
            className="custom-offcanvas-end-activity"
        >

            {/* Header */}
            <Offcanvas.Header className="border-bottom position-relative">

                <Offcanvas.Title className="d-flex align-items-center">
                    <span className="fw-semibold fs-5">
                        Dispatch Challan
                    </span>
                </Offcanvas.Title>

                <div className="d-flex align-items-center gap-2">
                    {challanAction === 'View' ? <button
                        type="button"
                        className="btn btn-dark btn-sm custom-print-btn"
                        onClick={handlePrint}
                        title="Download Challan"
                    >
                        <i className="bi bi-download me-1"></i>
                        Download
                    </button> :
                        <button
                            type="button"
                            className="btn btn-dark btn-sm custom-print-btn"
                            onClick={handlePrint}
                            title="Print Challan"
                        >
                            <i className="bi bi-printer me-1"></i>
                            Print
                        </button>}


                    <button
                        type="button"
                        className="btn btn-light rounded-circle shadow custom-close-btn"
                        aria-label="Close"
                        onClick={onHide}
                    >
                        <i className="bi bi-x fs-5 text-secondary"></i>
                    </button>

                </div>

            </Offcanvas.Header>

            {/* Body */}
            <Offcanvas.Body className="challan-offcanvas-body">

                <div
                    id="dispatch-challan"
                    className="challan-sheet"
                >

                    {/* =====================================================
                        ORGANIZATION NAME
                    ====================================================== */}

                    <div className="challan-header">
                        <h1 className="challan-org-name">
                            {data?.managementName || ''}
                        </h1>

                        <div className="challan-contact">
                            <span>
                                Email: {data?.email || ''}
                            </span>

                            <span className="contact-separator">|</span>

                            <span>
                                Contact: {data?.mobileNo || ''}
                            </span>
                            <span className="contact-separator">|</span>

                            <span>
                                FSSAI: {data?.fsSaiLicNo || ''}
                            </span>
                        </div>
                    </div>


                    {/* =====================================================
                        DOCUMENT TITLE
                    ====================================================== */}

                    <div className="challan-doc-title">

                        <div className="challan-main-title">
                            DISPATCH CHALLAN
                        </div>

                        <div className="challan-sub-title">
                            ONLY FOR INDUSTRIAL USE, NOT SALE DIRECT TO PUBLIC
                        </div>

                    </div>


                    {/* =====================================================
                        CHALLAN META INFORMATION
                    ====================================================== */}

                    <div className="challan-meta">

                        <div className="challan-field">
                            <label>Party Name :</label>
                            <span>
                                {data?.partyName || ''}
                            </span>
                        </div>


                        <div className="challan-field">
                            <label>Challan No. :</label>
                            <span>
                                {data?.challanNo || ''}
                            </span>
                        </div>


                        <div className="challan-field">
                            <label>Vehicle No :</label>
                            <span>
                                {data?.vehicleNo || ''}
                            </span>
                        </div>


                        <div className="challan-field">
                            <label>Dispatch Date :</label>
                            <span>
                                {formatDate(data?.dispatchDate)}
                            </span>
                        </div>


                        <div className="challan-field">
                            <label>Milk Type :</label>
                            <span>
                                {data?.milkType || ''}
                            </span>
                        </div>


                        <div className="challan-field">
                            <label>Dispatch Time :</label>
                            <span>
                                {data?.dispatchTime || ''}
                            </span>
                        </div>

                    </div>


                    {/* =====================================================
                        RESULT TABLE
                    ====================================================== */}

                    <table className="challan-results-table">

                        <thead>

                            <tr>

                                <th className="challan-srno-header">
                                    Srno
                                </th>

                                <th>
                                    Narration
                                </th>

                                <th className="challan-results-header">
                                    Results
                                </th>

                                <th>
                                    Received Remark
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {rows.map((row, index) => (

                                <tr key={index}>

                                    <td className="challan-srno">
                                        {row.srno}
                                    </td>

                                    <td className="challan-narration">
                                        {row.narration}
                                    </td>

                                    <td className="challan-result">
                                        {row.result}
                                    </td>

                                    <td className="challan-remark">
                                        {row.remark}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>


                    {/* =====================================================
                        SEALED
                    ====================================================== */}

                    <div className="challan-sealed-row">

                        <label>Sealed –</label>

                        <div className="sealed-item">
                            <span>1)</span>
                            <span className="sealed-line">
                                {data?.sealed || ''}
                            </span>
                        </div>

                        {/* <div className="sealed-item">
                            <span>2)</span>
                            <span className="sealed-line">
                                {data?.sealed || ''}
                            </span>
                        </div> */}

                    </div>


                    {/* =====================================================
                        SIGNATURE SECTION
                    ====================================================== */}

                    <div className="challan-sign-row">

                        <div>
                            Q.C. Chemist Sign –
                        </div>

                        <div>
                            Driver's Sign –
                        </div>

                    </div>


                    {/* =====================================================
                        RECEIVER SECTION
                    ====================================================== */}

                    <table className="challan-receiver">

                        <tbody>

                            <tr>

                                <th style={{ width: '28%' }}>
                                    For Receiver Only
                                </th>

                                <th style={{ width: '20%' }}>
                                    Date
                                </th>

                                <th style={{ width: '20%' }}>
                                    Time
                                </th>

                                <th>
                                    Sign &amp; Name
                                </th>

                            </tr>


                            <tr>

                                <td>
                                    &nbsp;
                                </td>

                                <td>
                                    &nbsp;
                                </td>

                                <td>
                                    &nbsp;
                                </td>

                                <td>
                                    &nbsp;
                                </td>

                            </tr>

                        </tbody>

                    </table>

                </div>

            </Offcanvas.Body>

        </Offcanvas>
    );
};

export default LogPanel;