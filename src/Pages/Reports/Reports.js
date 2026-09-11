import { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/shared.css';
import './Reports.css';
import environment from '../../Environment/Environment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ExcelIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <path d="M12 3v13M6 10l6 6 6-6" />
        <path d="M4 20h16" />
    </svg>
);


const PdfIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M15 3v5h5" />

        <path
            d="M8.5 16h2.2a1.7 1.7 0 000-3.4H8.5V18"
        />

        <path
            d="M13 18v-5.4h1.5a2.7 2.7 0 010 5.4H13z"
        />
    </svg>
);


const CloseIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <path d="M6 6l12 12M18 6L6 18" />
    </svg>
);

const Reports = () => {
    const [revealed, setRevealed] = useState(false);
    const [parsedToken, setParsedToken] = useState('');
    const [downloadModal, setDownloadModal] = useState({
        open: false,
        reportKey: null,
        format: null
    });

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const [partyList, setPartyList] = useState([]);
    const [managementList, setManagementList] = useState([]);
    const [ownerList, setOwnerList] = useState([]);
    const [selectedParty, setSelectedParty] = useState('');
    const [selectedOwner, setSelectedOwner] = useState('');
    const [selectedManagement, setSelectedManagement] = useState('');

    const [partyLoading, setPartyLoading] = useState(false);
    const [managementLoading, setManagementLoading] = useState(false);
    const [ownerLoading, setOwnerLoading] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

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

    useEffect(() => {
        const storedToken =
            localStorage.getItem('accessToken') || '';
        setParsedToken(storedToken);
        setRevealed(true);
        getAllParties(storedToken);
        getAllManagementDetails(storedToken);
        getAllOwnerDetails(storedToken);
    }, []);

    const REPORT_DATA = {
        salesManagement: {
            group: 'Sales Management',
            title: 'Sales Management',
            description:
                'Download sales and milk dispatch data for the selected date range.',
            file: 'sales-management-report',

            excelEndpoint:
                `https://www.divandsection.in/milkautomation/api/milkdispatch/report/${selectedManagement}/downloadExcel`,

            pdfEndpoint: null,

            requiresParty: false,
            requiresSales: true,
            requiresTransport: false,
            requiresCollection: false,

            icon: (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M4 19V5" />
                    <path d="M4 19h17" />
                    <path d="M8 16v-5" />
                    <path d="M13 16V8" />
                    <path d="M18 16V4" />
                </svg>
            )
        },

        transportManagement: {
            group: 'Transport Management',
            title: 'Transport Management',
            description:
                'Download transporter billing data for the selected date range.',
            file: 'transport-management-report',

            excelEndpoint:
                `https://www.divandsection.in/milkautomation/api/transporter/report/${selectedOwner}/downloadTransportBill`,

            pdfEndpoint: null,

            requiresParty: false,
            requiresSales: false,
            requiresTransport: true,
            requiresCollection: false,

            icon: (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <rect
                        x="2"
                        y="7"
                        width="13"
                        height="10"
                        rx="1.5"
                    />

                    <path d="M15 10h3l4 4v3h-7z" />

                    <circle
                        cx="7"
                        cy="18"
                        r="2"
                    />

                    <circle
                        cx="18"
                        cy="18"
                        r="2"
                    />
                </svg>
            )
        },

        partyManagement: {
            group: 'Party Management',
            title: 'Party Management',
            description:
                'Download party-wise sales data for the selected party and date range.',
            file: 'party-management-report',

            excelEndpoint:
                `https://www.divandsection.in/milkautomation/api/milkdispatch/report/${selectedManagement}/getBypartyNameReport`,

            pdfEndpoint: null,

            requiresParty: true,
            requiresSales: false,
            requiresTransport: false,
            requiresCollection: false,

            icon: (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <circle
                        cx="9"
                        cy="8"
                        r="3"
                    />

                    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />

                    <path d="M16 11c2.8 0 5 2.2 5 5" />

                    <path d="M16 5.5a2.5 2.5 0 010 5" />
                </svg>
            )
        },
        collectionManagement: {
            group: 'Collection  Management',
            title: 'Collection Management',
            description:
                'Download party-wise Milk Collection data for the selected Management and date range.',
            file: 'Milk-Collection-report',

            excelEndpoint:
                `https://www.divandsection.in/milkautomation/api/milkcollection/milk-collection/report/excel?vendorName=${selectedManagement}`,

            pdfEndpoint: `http://www.divandsection.in/milkautomation/api/milkcollection/milk-collection/report/pdf?vendorName=${selectedManagement}`,

            requiresParty: false,
            requiresSales: false,
            requiresTransport: false,
            requiresCollection: true,

            icon: (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <circle
                        cx="9"
                        cy="8"
                        r="3"
                    />

                    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />

                    <path d="M16 11c2.8 0 5 2.2 5 5" />

                    <path d="M16 5.5a2.5 2.5 0 010 5" />
                </svg>
            )
        }
    };

    const getAllParties = async (token) => {
        if (!token) { return; }

        try {
            setPartyLoading(true);
            const URL =
                `${environment?.config?.apiBaseUri || ''}`;
            const response = await axios.get(
                `${URL}party/getAllParty?pageNo=0&pageSize=50`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response?.status === 200) {
                const parties =
                    response?.data?.partyList || [];
                setPartyList(parties);
            }
        } catch (error) {
            console.error(
                '❌ Error fetching parties:',
                error
            );
            setErrorMessage(
                'Failed to load party list.'
            );
        } finally {
            setPartyLoading(false);
        }
    };

    const getAllManagementDetails = async (token) => {

        if (!token) { return; }

        try {
            setManagementLoading(true);
            const URL = `${environment?.config?.apiBaseUri || ''}`;
            const response = await axios.get(
                `${URL}management/getAllDetailsManagment`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response?.status === 200) {
                const managementDetails =
                    response?.data?.body || [];
                setManagementList(managementDetails);
            }
        } catch (error) {
            console.error(
                '❌ Error fetching parties:',
                error
            );
            setErrorMessage(
                'Failed to load management details.'
            );
        } finally {
            setManagementLoading(false);
        }
    };

    const getAllOwnerDetails = async (token) => {

        if (!token) { return; }

        try {
            setOwnerLoading(true);
            const URL = `${environment?.config?.apiBaseUri || ''}`;
            const response = await axios.get(
                `${URL}vehicle/getAllVehicle?pageNo=0&pageSize=50`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response?.status === 200) {
                const ownerDetails =
                    response?.data?.vehicleList || [];
                const uniqueOwners = ownerDetails?.reduce((accumulator, current) => {
                    const isDuplicate = accumulator.some(item => item.ownerName === current.ownerName);

                    if (!isDuplicate) {
                        accumulator.push(current);
                    }

                    return accumulator;
                }, []);
                setOwnerList(uniqueOwners);
            }
        } catch (error) {
            console.error(
                '❌ Error fetching parties:',
                error
            );
            setErrorMessage(
                'Failed to load management details.'
            );
        } finally {
            setOwnerLoading(false);
        }
    };

    const selectedReport =
        downloadModal.reportKey
            ? REPORT_DATA[downloadModal.reportKey]
            : null;

    const closeDownloadModal = () => {

        if (downloadLoading) {
            return;
        }

        setDownloadModal({
            open: false,
            reportKey: null,
            format: null
        });

        setFromDate('');
        setToDate('');
        setSelectedParty('');
        setSelectedManagement('');
        setErrorMessage('');
    };

    const openDownloadModal = (
        reportKey,
        format
    ) => {

        const report =
            REPORT_DATA[reportKey];

        /*
         * Don't open if the endpoint is not available.
         */

        if (
            !report ||
            !report[`${format}Endpoint`]
        ) {
            return;
        }
        setErrorMessage('');
        setFromDate('');
        setToDate('');
        setSelectedParty('');
        setSelectedManagement('');
        setDownloadModal({
            open: true,
            reportKey,
            format
        });
    };

    const getMimeType = (format) => {

        return format === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/pdf';

    };

    const getFileExtension = (format) => {
        return format === 'excel'
            ? 'xlsx'
            : 'pdf';

    };

    const extractFilename = (
        contentDisposition
    ) => {

        if (!contentDisposition) {
            return null;
        }

        const utfMatch =
            contentDisposition.match(
                /filename\*=UTF-8''([^;]+)/i
            );

        if (utfMatch?.[1]) {
            try {
                return decodeURIComponent(
                    utfMatch[1]
                );
            } catch {
                return utfMatch[1];
            }
        }

        const normalMatch =
            contentDisposition.match(
                /filename="?([^";]+)"?/i
            );
        return normalMatch?.[1] || null;
    };

    const handleConfirmDownload =
        async () => {
            setErrorMessage('');

            if (!fromDate || !toDate) {
                setErrorMessage('Please select both From Date and To Date.');
                return;
            }

            if (fromDate > toDate) {
                setErrorMessage(
                    'From Date cannot be later than To Date.'
                );
                return;
            }

            if (!parsedToken) {
                setErrorMessage(
                    'Your session has expired. Please log in again.'
                );
                return;
            }

            const endpoint =
                selectedReport?.[
                `${downloadModal.format}Endpoint`
                ];

            if (!endpoint) {
                setErrorMessage(
                    'The download API for this format is not available yet.'
                );
                return;
            }

            if (
                selectedReport?.requiresParty &&
                !selectedParty && !selectedManagement
            ) {

                setErrorMessage(
                    'Please select a party.'
                );

                return;
            }

            try {
                setDownloadLoading(true);

                const params = {
                    from: fromDate,
                    to: toDate
                };

                if (selectedReport?.requiresParty) {

                    params.partyName =
                        selectedParty;

                }

                const response =
                    await axios.get(
                        endpoint,
                        {
                            params,

                            headers: {
                                Authorization:
                                    `Bearer ${parsedToken}`,

                                Accept:
                                    getMimeType(
                                        downloadModal.format
                                    )
                            },

                            responseType: 'blob'
                        }
                    );

                const contentType =
                    response
                        .headers
                    ?.['content-type'] ||
                    getMimeType(
                        downloadModal.format
                    );

                const blob =
                    new Blob(
                        [response.data],
                        {
                            type: contentType
                        }
                    );

                const url =
                    window.URL.createObjectURL(
                        blob
                    );

                const link =
                    document.createElement(
                        'a'
                    );

                const filenameFromServer =
                    extractFilename(
                        response
                            .headers
                        ?.['content-disposition']
                    );

                let fallbackFilename;

                if (
                    selectedReport?.requiresParty
                ) {
                    const safePartyName =
                        selectedParty
                            .replace(
                                /[^a-zA-Z0-9-_]/g,
                                '-'
                            )
                            .replace(
                                /-+/g,
                                '-'
                            );
                    fallbackFilename =
                        `${safePartyName}-${selectedReport.file}-${fromDate}-to-${toDate}.${getFileExtension(downloadModal.format)}`;

                } else {
                    fallbackFilename =
                        `${selectedReport.file}-${fromDate}-to-${toDate}.${getFileExtension(downloadModal.format)}`;
                }

                link.href = url;
                link.download =
                    filenameFromServer ||
                    fallbackFilename;

                document.body.appendChild(
                    link
                );

                link.click();

                link.remove();
                window.URL.revokeObjectURL(
                    url
                );
                closeDownloadModal();

            } catch (error) {
                console.error(
                    '❌ Report download failed:',
                    error
                );

                let message =
                    `Failed to download ${downloadModal.format === 'excel'
                        ? 'Excel'
                        : 'PDF'
                    } report.`;

                if (
                    error?.response?.data
                    instanceof Blob
                ) {
                    try {
                        const text =
                            await error
                                .response
                                .data
                                .text();

                        const parsed =
                            JSON.parse(text);
                        message =
                            parsed?.message ||
                            message;
                    } catch {

                        /*
                         * Keep generic message.
                         */

                    }
                }
                setErrorMessage(
                    message
                );
            } finally {
                setDownloadLoading(
                    false
                );
            }
        };

    return (

        <div className="reports-page">

            <div className="reports-header">

                <div>
                    <div className="reports-eyebrow">
                        REPORT CENTER
                    </div>
                    <h2>
                        Download PDFs & Reports
                    </h2>
                </div>
            </div>

            <div className="reports-section-grid">
                {Object.entries(
                    REPORT_DATA
                ).map(
                    ([key, cfg], i) => {
                        const pdfAvailable =
                            Boolean(
                                cfg.pdfEndpoint
                            );

                        return (
                            <article className={`report-card ${revealed ? 'reveal' : ''}`}
                                style={{ animationDelay: `${i * 80}ms` }}
                                key={key}>
                                <div className="report-card-top">
                                    <div
                                        className={
                                            `report-card-icon ${key ===
                                                'salesManagement'
                                                ? 'sales'
                                                : key ===
                                                    'transportManagement'
                                                    ? 'transport'
                                                    : 'party'
                                            }`
                                        }
                                    >
                                        {cfg.icon}
                                    </div>
                                    <span className="report-category">{cfg.group}</span>
                                </div>

                                <div className="report-card-content">

                                    <h3>{cfg.title}</h3>

                                    <p>{cfg.description}</p>
                                </div>

                                <div className="report-card-meta">
                                    <div className="report-meta-row">
                                        <span> Export format </span>

                                        <div className="format-badges">
                                            <span className="format-badge excel">
                                                XLSX
                                            </span>

                                            <span className={`format-badge ${pdfAvailable ? 'pdf' : 'pending'}`}>
                                                PDF
                                            </span>
                                        </div>
                                    </div>

                                    <div className="report-meta-row">
                                        <span>
                                            Date range
                                        </span>
                                        <strong>
                                            From / To
                                        </strong>
                                    </div>

                                    {cfg.requiresParty && (
                                        <div className="report-meta-row">
                                            <span>
                                                Filter
                                            </span>

                                            <strong>
                                                Party
                                            </strong>
                                        </div>
                                    )}
                                </div>

                                <div className="report-card-actions">
                                    <button
                                        className="btn btn-outline btn-sm"
                                        type="button"
                                        onClick={() => openDownloadModal(key, 'excel')}
                                    >
                                        <ExcelIcon />
                                        Excel
                                    </button>

                                    <button
                                        className="btn btn-ghost btn-sm"
                                        type="button"
                                        disabled={!pdfAvailable}
                                        title={
                                            !pdfAvailable
                                                ? 'PDF API is pending'
                                                : 'Download PDF'
                                        }
                                        onClick={() => openDownloadModal(key, 'pdf')}
                                    >
                                        <PdfIcon />
                                        {
                                            pdfAvailable
                                                ? 'PDF'
                                                : 'PDF Pending'
                                        }
                                    </button>
                                </div>
                            </article>
                        );
                    }
                )}
            </div>

            {downloadModal.open &&
                selectedReport && (
                    <div
                        className="download-modal-overlay"
                        onMouseDown={closeDownloadModal}
                    >
                        <div
                            className="download-modal"
                            onMouseDown={(e) => e.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={
                                'download-report-title'
                            }>

                            <div className="download-modal-header">
                                <div>
                                    <span className="download-modal-eyebrow">
                                        EXPORT REPORT
                                    </span>

                                    <h3 id="download-report-title">
                                        {selectedReport.title}
                                    </h3>

                                    <p>
                                        {
                                            selectedReport.requiresParty
                                                ? 'Select a party, management name and date range for the report.'
                                                : 'Select the date range for the file you want to download.'
                                        }
                                    </p>
                                </div>

                                <button
                                    className="modal-close"
                                    type="button"
                                    onClick={closeDownloadModal}
                                    disabled={downloadLoading}
                                    aria-label="Close"
                                >
                                    <CloseIcon />
                                </button>
                            </div>

                            <div className="download-modal-body">
                                <div
                                    className={
                                        `download-format-card ${downloadModal.format
                                        }`
                                    }
                                >

                                    <div className="download-format-icon">
                                        {
                                            downloadModal.format ===
                                                'excel'
                                                ? <ExcelIcon />
                                                : <PdfIcon />
                                        }
                                    </div>

                                    <div>
                                        <strong>
                                            Download {
                                                downloadModal.format ===
                                                    'excel'
                                                    ? 'Excel'
                                                    : 'PDF'
                                            }
                                        </strong>
                                        <span>
                                            {
                                                downloadModal.format ===
                                                    'excel'

                                                    ? 'The report will be generated by the backend.'

                                                    : 'The PDF report will be generated by the backend.'
                                            }
                                        </span>
                                    </div>
                                </div>
                                <div className='row g-2'>
                                    {(selectedReport.requiresParty || selectedReport.requiresSales || selectedReport.requiresCollection) && (
                                        <div className="col-md-6">
                                            <div className="form-floating mb-2">
                                                <select
                                                    className="form-select shadow-sm"
                                                    id="managementDetails"
                                                    value={selectedManagement}
                                                    onChange={(e) => setSelectedManagement(e.target.value)}
                                                    // required
                                                    disabled={managementLoading || downloadLoading}
                                                >
                                                    <option value="" className='drpdwn-opts'>
                                                        {
                                                            managementLoading
                                                                ? 'Loading Management Details...'
                                                                : 'Select Management'
                                                        }
                                                    </option>
                                                    {managementList.map(
                                                        (management) => (
                                                            <option className='drpdwn-opts' key={management.id} value={management.challanCode}>
                                                                {management.managementName}
                                                            </option>))}
                                                </select>
                                                <label htmlFor="managementDetails">Management Name</label>
                                            </div>
                                        </div>)}
                                    {selectedReport.requiresParty && (
                                        <div className="col-md-6">
                                            <div className="form-floating mb-2">
                                                <select
                                                    className="form-select shadow-sm"
                                                    id="partyDetails"
                                                    value={selectedParty}
                                                    onChange={(e) => setSelectedParty(e.target.value)}
                                                    // required
                                                    disabled={partyLoading || downloadLoading}
                                                >
                                                    <option className='drpdwn-opts' value="">
                                                        {
                                                            partyLoading
                                                                ? 'Loading parties...'
                                                                : 'Select Party'
                                                        }
                                                    </option>
                                                    {partyList.map(
                                                        (party) => (
                                                            <option className='drpdwn-opts' key={party.id} value={party.partyName}>
                                                                {party.partyName}
                                                            </option>))}
                                                </select>
                                                <label htmlFor="partyDetails">Party</label>
                                            </div>
                                        </div>

                                    )}
                                    {selectedReport.requiresTransport && (
                                        <div className="col-md-6">
                                            <div className="form-floating mb-2">
                                                <select
                                                    className="form-select shadow-sm"
                                                    id="transportDetails"
                                                    value={selectedOwner}
                                                    onChange={(e) => setSelectedOwner(e.target.value)}
                                                    // required
                                                    disabled={ownerLoading || downloadLoading}
                                                >
                                                    <option className='drpdwn-opts' value="">
                                                        {
                                                            ownerLoading
                                                                ? 'Loading Owner details...'
                                                                : 'Select Owner'
                                                        }
                                                    </option>
                                                    {ownerList?.map(
                                                        (owner) => (
                                                            <option className='drpdwn-opts' key={owner.id} value={owner.ownerName}>
                                                                {owner.ownerName}
                                                            </option>))}
                                                </select>
                                                <label htmlFor="transportDetails">Owner Details</label>
                                            </div>
                                        </div>

                                    )}
                                </div>

                                <div className="date-fields">
                                    <div className="date-field">

                                        <label htmlFor="from-date">
                                            From Date
                                        </label>

                                        <DatePicker
                                            id="from-date"
                                            selected={stringToDate(fromDate)}
                                            onChange={(date) => {
                                                setFromDate(dateToString(date));
                                            }}
                                            dateFormat="dd-MM-yyyy"
                                            placeholderText="dd-mm-yyyy"
                                            disabled={downloadLoading}
                                            maxDate={stringToDate(toDate)}
                                            showPopperArrow={false}
                                            todayButton="Today"
                                            isClearable
                                            autoComplete="off"
                                            popperClassName="reports-datepicker-popper"
                                        />
                                    </div>

                                    <div className="date-field">

                                        <label htmlFor="to-date">
                                            To Date
                                        </label>

                                        <DatePicker
                                            id="to-date"
                                            selected={stringToDate(toDate)}
                                            onChange={(date) => {
                                                setToDate(dateToString(date));
                                            }}
                                            dateFormat="dd-MM-yyyy"
                                            placeholderText="dd-mm-yyyy"
                                            disabled={downloadLoading}
                                            minDate={stringToDate(fromDate)}
                                            showPopperArrow={false}
                                            todayButton="Today"
                                            isClearable
                                            autoComplete="off"
                                            popperClassName="reports-datepicker-popper"
                                        />

                                    </div>

                                </div>
                                {errorMessage && (
                                    <div className="download-error" role="alert">
                                        {errorMessage}
                                    </div>
                                )}
                            </div>

                            <div className="download-modal-footer">
                                <button className="btn btn-ghost btn-sm" type="button"
                                    onClick={closeDownloadModal}
                                    disabled={downloadLoading}
                                >
                                    Cancel
                                </button>
                                <button style={{ background: "#16A34A" }} className={'btn btn-primary btn-sm ' + 'download-confirm-btn'}
                                    type="button"
                                    onClick={handleConfirmDownload}
                                    disabled={downloadLoading}
                                >
                                    {downloadLoading ? (
                                        <>
                                            <span className="download-spinner" />
                                            Downloading...
                                        </>
                                    ) : (
                                        <>
                                            {downloadModal.format === 'excel' ? <ExcelIcon /> : <PdfIcon />}
                                            Download {
                                                downloadModal.format ===
                                                    'excel'
                                                    ? 'Excel'
                                                    : 'PDF'
                                            }
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
};
export default Reports;