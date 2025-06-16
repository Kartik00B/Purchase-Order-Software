import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import "./AirRingBoringChart.css";
import 'font-awesome/css/font-awesome.min.css';
import { QRCodeSVG } from "qrcode.react";
import BASE_URL from "../config";
import { useNavigate, useParams } from "react-router-dom";
// import { jsreport } from 'jsreport-client';

const AirRingBoringChart = () => {
    const { component } = useParams();
    const [airRingBoringData, setAirRingBoringData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [fromWorkOrderNo, setFromWorkOrderNo] = useState("");
    const [toWorkOrderNo, setToWorkOrderNo] = useState("");
    const [isTableVisible, setIsTableVisible] = useState(false);
    const [isDateRangeSelected, setIsDateRangeSelected] = useState(false);
    const navigate = useNavigate();



    // Fetch finish sizes from server
    // Fetch Internal Diameters (AirRing specific data)
    const fetchInternalDiameters = async () => {
        try {
            const response = await axios.get("http://localhost:5000/internal-diameter");
            return response.data.data;
        } catch (error) {
            console.error("Error fetching internal diameters:", error);
            return [];
        }
    };

    // Group and sum data for AirRing
    const groupAndSumAirRingData = (data) => {
        const groupedData = {};
        data.forEach((entry) => {
            const {
                work_order_no: workOrderNo,
                party_name: partyName,
                city,
                nominal_size: nominalSize,
                size_low_bore_size: lowTolerance,
                size_high_bore_size: highTolerance,
            } = entry;

            const uniqueKey = `${workOrderNo}-${partyName}-${city}-${nominalSize}-${lowTolerance}-${highTolerance}`;
            if (!groupedData[uniqueKey]) {
                groupedData[uniqueKey] = {
                    ...entry,
                    qty: parseInt(entry.qty, 10),
                    entries: [entry],
                };
            } else {
                groupedData[uniqueKey].qty += parseInt(entry.qty, 10);
                groupedData[uniqueKey].entries.push(entry);
            }
        });
        return Object.values(groupedData);
    };

    // Fetch and organize AirRing data
    const fetchDailyData = useCallback(async (fromWorkOrderNo, toWorkOrderNo) => {
        try {
            let url = "http://localhost:5000/airring-history";
            if (fromWorkOrderNo && toWorkOrderNo) {
                url += `?fromWorkOrderNo=${fromWorkOrderNo}&toWorkOrderNo=${toWorkOrderNo}`;
            }

            const response = await axios.get(url);
            const rawData = groupAndSumAirRingData(response.data.data);

            // Fetch internal diameter details
            const internalDiameters = await fetchInternalDiameters();
            const internalDiameterMap = internalDiameters.reduce((acc, curr) => {
                acc[curr.record_sr_no] = {
                    baker_internal_diameter: parseFloat(curr.baker_internal_diameter).toFixed(4),
                    non_baker_internal_diameter: parseFloat(curr.non_baker_internal_diameter).toFixed(4),
                    dep: curr.dep,
                    t_dispatch_week: curr.t_dispatch_week,
                    baker_type: curr.baker_type,
                    bore_size: curr.bore_size,
                };
                return acc;
            }, {});

            // Merge grouped data with internal diameter details
            const mergedData = rawData.map((entry) => {
                const sizeDetails = internalDiameterMap[entry.record_sr_no] || {};
                return {
                    ...entry,
                    baker_internal_diameter: sizeDetails.baker_internal_diameter || "N/A",
                    non_baker_internal_diameter: sizeDetails.non_baker_internal_diameter || "N/A",
                    dep: sizeDetails.dep || "N/A",
                    t_dispatch_week: sizeDetails.t_dispatch_week || "N/A",
                    baker_type: sizeDetails.baker_type || "N/A",
                    bore_size: sizeDetails.bore_size || "N/A",

                };
            });

            // Organize AirRing data
            const organizedData = mergedData.reduce((acc, entry) => {
                const workOrderNo = entry.work_order_no.trim();
                const partyName = entry.party_name.trim();
                const city = entry.city.trim();

                if (!acc[workOrderNo]) {
                    acc[workOrderNo] = { date: entry.date, parties: {} };
                }

                if (!acc[workOrderNo].parties[partyName]) {
                    acc[workOrderNo].parties[partyName] = {};
                }

                if (!acc[workOrderNo].parties[partyName][city]) {
                    acc[workOrderNo].parties[partyName][city] = [];
                }

                acc[workOrderNo].parties[partyName][city].push(entry);
                return acc;
            }, {});

            // Convert organized data into array format
            const dataArray = Object.entries(organizedData).map(([workOrderNo, { date, parties }]) => ({
                workOrderNo,
                date,
                parties,
            }));

            setAirRingBoringData(dataArray);
            setFilteredData(dataArray);
        } catch (error) {
            console.error("Error fetching AirRing data:", error);
        }
    }, []);


    useEffect(() => {
        fetchDailyData()
    }, [fetchDailyData]);

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        if (query === "") {
            setFilteredData(airRingBoringData);
        } else {
            setFilteredData(
                airRingBoringData.filter((entry) =>
                    Object.values(entry).some((val) =>
                        String(val).toLowerCase().includes(query)
                    )
                )
            );
        }
    };

    const applyFilters = () => {
        fetchDailyData(fromWorkOrderNo, toWorkOrderNo);
        setIsTableVisible(true);
        setIsDateRangeSelected(true);
    };

    const printRef = useRef();
    const handlePrint = () => {
        const printContent = printRef.current.innerHTML;
        const originalContent = document.body.innerHTML; // Save the original content of the page
        const currentDate = new Date().toLocaleDateString("en-GB"); // Formats date as DD/MM/YYYY

        // Create the date HTML to display on each page
        const dateHTML =
            `<div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-weight: bold;">
                    <img src="/LogoNew.png" style="width: 120px; height:45px; margin-left: 10px;" alt="Logo" />
        <span style="text-align: right; margin-right: 10px;">ISSUE DATE<br/> ${currentDate}</span>
    </div>`;

        // Final content with the date and print content
        const finalContent =
            `<div>
        ${dateHTML}
        ${printContent}
    </div>`;

        // Update document for printing
        document.body.innerHTML = finalContent;

        // Add CSS styles to control page breaks and layout
        const style = document.createElement('style');
        style.innerHTML = `
        @media print {
            @page {
                margin-top: 10;
                size: portrait;
                counter-increment: page;
                        @bottom-right {
                            content: "Page " counter(page);
                            font-size: 14px;
                            margin-bottom: 10px;
                        }
            }
            body {
                font-family: poppins, sans-serif;
                font-size: 18px;
                margin-top:-15px
            }
            .print-container {
                page-break-inside: avoid; /* Prevent page break within entries */
            }
            .entry {
                margin-bottom: 10px; /* Add space between entries */
            }
            /* Force a page break after every 9 entries */
            .entry:nth-child(9n) {
                page-break-after: always;
            }
            /* Ensure that the header and date appear on every printed page */
            body > div {
                display: flex;
                flex-direction: column;
                margin: 0 auto;
            }
            body > div > div {
                position: fixed;
                top: 0;
                right: 0;
                width: 100%;
                text-align: right;
            }

            .airring_boring_data_entry__table th {
                font-size: 22px;
            }
            th.ar_b_gborder {
            word-wrap: break-word;
            border: black solid 1px;
            font-size: 14px;
            }

            /* Add bottom border to the last entry of each page */
            .entry:nth-last-child(1) {
                border-bottom: 1px solid black;
            }
        }
    `;
        document.head.appendChild(style);

        // Trigger print dialog
        window.print();

        // Restore the original content after printing
        document.body.innerHTML = originalContent;
        window.location.reload(); // Reload page to restore the previous state
    };




// Updated handlePrint method with JSReport integration
// const handlePrint = async () => {
//     const currentDate = new Date().toLocaleDateString("en-GB"); // Formats date as DD/MM/YYYY

//     // Structure the data you want to send to JSReport
//     const reportData = {
//         date: currentDate,
//         logoUrl: '/LogoNew.png',
//         tableData: filteredData, // Assuming filteredData is the array you want to print
//     };

//     // JSReport configuration
//     const reportConfig = {
//         template: {
//             content: `
//                 <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-weight: bold;">
//                     <img src="{{logoUrl}}" style="width: 120px; height:45px; margin-left: 10px;" alt="Logo" />
//                     <span style="text-align: right; margin-right: 10px;">ISSUE DATE<br/> {{date}}</span>
//                 </div>

//                 <table>
//                     <thead>
//                         <tr>
//                             <th>Work Order No</th>
//                             <th>SUB SR NO.</th>
//                             <th>QTY</th>
//                             <th>BORE SIZE</th>
//                             <th>ACTUAL SIZE</th>
//                             <th>REMARK</th>
//                             <th>COMPLETE DATE</th>
//                             <th>TENTATIVE DISPATCH DATE</th>
//                             <th>QR Codes</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {{#each tableData}}
//                             <tr>
//                                 <td>{{this.work_order_no}}</td>
//                                 <td>{{this.sub_sr_no}}</td>
//                                 <td>{{this.qty}}</td>
//                                 <td>{{this.bore_size}}</td>
//                                 <td>{{this.actual_size}}</td>
//                                 <td>{{this.remark}}</td>
//                                 <td>{{this.complete_date}}</td>
//                                 <td>{{this.tentative_dispatch_date}}</td>
//                                 <td><img src="{{this.qr_code_url}}" alt="QR Code" style="width: 50px; height: 50px;" /></td>
//                             </tr>
//                         {{/each}}
//                     </tbody>
//                 </table>
//             `,
//             engine: 'handlebars', // You can change the templating engine if needed
//             recipe: 'chrome-pdf', // Use the Chrome PDF recipe for printing as a PDF
//         },
//         data: reportData,
//     };

//     try {
//         // Send the report generation request to JSReport
//         const response = await jsreport.render(reportConfig);

//         // Assuming the response contains the PDF file
//         const pdfBlob = new Blob([response.content], { type: 'application/pdf' });

//         // Create a URL for the PDF and open it in a new window or download
//         const pdfUrl = URL.createObjectURL(pdfBlob);
//         window.open(pdfUrl, '_blank');
//     } catch (error) {
//         console.error('Error generating report:', error);
//     }
// };

      



    return (
        <div className="airring_boring_data_entry__container">
            <div className="airring_boring_table_container">
                <div className="airring_boring-work-order-range-container">
                    {!isDateRangeSelected && (
                        <div className="airring_boring-work-order-range-section">
                            <button className="back-button" onClick={() => navigate(-1)}>⬅ Back</button>

                            <h2 className="airring_boring-work-order-range-title1">Air Ring
                                Boring
                                Chart</h2>
                            <h3 className="airring_boring-work-order-range-title2">Select Work Order
                                Range</h3>
                            <div className="airring_boring-work-order-range-inputs">

                                <label>From Work Order No:
                                    <input
                                        type="text"
                                        value={fromWorkOrderNo}
                                        onChange={(e) => setFromWorkOrderNo(e.target.value)}
                                        placeholder="Enter From Work Order No"
                                    />
                                </label>

                                <label>To Work Order No:
                                    <input
                                        type="text"
                                        value={toWorkOrderNo}
                                        onChange={(e) => setToWorkOrderNo(e.target.value)}
                                        placeholder="Enter To Work Order No"
                                    />
                                </label>

                                <button onClick={applyFilters}>Apply Work Order Range</button>
                            </div>

                        </div>
                    )}
                    <div className="airring_boring_search-container">

                        {/* Render the table only if the date range is selected or data is available */}
                        {isDateRangeSelected && (
                            <div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    placeholder="Search data..."
                                    className="history-search"
                                />


                                <div className="airring_boring_table-container">
                                    <button className="chart-back-button" onClick={() => navigate(-1)}>⬅ Back</button>

                                    <button onClick={handlePrint} className="airring_boring_data_entry_button">
                                        Print Report
                                    </button>
                                    <div className="airring_boring_data_container" ref={printRef}>
                                        <table className="airring_boring_data_entry__table">
                                            <thead>
                                                <tr className="h-title">
                                                    <img src="/LogoNew.png" style={{ width: "0px" }} alt=""></img>
                                                    <th colSpan="14"
                                                        className="airring_boring_data_table_title_1 title_1">
                                                        Quality Management System
                                                        <br />
                                                        AirRing: Boring Chart
                                                    </th>
                                                </tr>
                                                <tr className="t-head">
                                                    <th className="ar_b_gborder blank work">Work Order No</th>
                                                    <th className="ar_b_gborder">SUB SR NO.</th>
                                                    <th className="ar_b_gborder">QTY</th>
                                                    <th className="ar_b_gborder">BORE SIZE</th>
                                                    <th className="ar_b_gborder">ACTUAL SIZE</th>
                                                    <th className="ar_b_gborder">REMARK</th>
                                                    <th className="ar_b_gborder Id">COMPLETE DATE</th>
                                                    <th className="ar_b_gborder Id">TENTATIVE DISPATCH DATE</th>
                                                    <th className="ar_b_gborder">QR Codes</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {isTableVisible && (
                                                    filteredData.map((group, workOrderIndex) => {
                                                        let isWorkOrderDisplayed = false;
                                                        let firstEntryPrinted = false;

                                                        const workOrderEntries = Object.entries(group.parties);
                                                        const isLastGroup = workOrderIndex === filteredData.length - 1;

                                                        return (
                                                            <React.Fragment key={workOrderIndex}>
                                                                {workOrderEntries.map(([partyName, cities], partyIndex) => {
                                                                    return Object.entries(cities).map(([city, entries], cityIndex) => {
                                                                        const isLastCity = cityIndex === Object.entries(cities).length - 1;

                                                                        return entries.map((entry, entryIndex) => {
                                                                            const isLastEntry =
                                                                                isLastGroup && isLastCity && entryIndex === entries.length - 1;
                                                                            const isLastEntryInParty = entryIndex === entries.length - 1;
                                                                            const isFirstEntryInWorkOrder = entryIndex === 0 && partyIndex === 0;

                                                                            const isNewWorkOrder = !isWorkOrderDisplayed && entryIndex === 0;
                                                                            const shouldRemoveTopborder = !isNewWorkOrder;

                                                                            const shouldPrintWorkOrder =
                                                                                !firstEntryPrinted || isFirstEntryInWorkOrder;

                                                                            if (shouldPrintWorkOrder) {
                                                                                firstEntryPrinted = true;
                                                                            }

                                                                            // Calculate rowSpan for work order, party, and city columns
                                                                            const workOrderRowSpan = entries.length;
                                                                            const partyRowSpan = entries.length;
                                                                            // const cityRowSpan = entries.length;


                                                                            const handleQRCodeClick = () => {
                                                                                // Construct the dynamic URL
                                                                                const url = `/ProgressBar/${entry.record_sr_no}/${entry.party_name}`;

                                                                                // Navigate to the constructed URL
                                                                                navigate(url);
                                                                            };

                                                                            return (
                                                                                <tr
                                                                                    key={`${partyIndex}-${cityIndex}-${entryIndex}`}
                                                                                    className={`${shouldRemoveTopborder ? 'no-top-border' : ''} 
                                                                            ${isLastEntryInParty ? 'no-bottom-border' : ''} 
                                                                            ${isLastEntry ? 'last-entry-border' : ''}`}
                                                                                >
                                                                                    {/* Print Work Order */}
                                                                                    {shouldPrintWorkOrder && (
                                                                                        <td
                                                                                            rowSpan={workOrderRowSpan}
                                                                                            className={`airring_boring_party-name-cell ${isLastEntryInParty ? 'no-bottom-border' : ''}`}
                                                                                            style={{
                                                                                                borderTop: '1px dotted black',
                                                                                                verticalAlign: "top"
                                                                                            }}
                                                                                        >
                                                                                            <strong
                                                                                                className="airring_boring_p_span">
                                                                                                <span>{group.workOrderNo}</span>
                                                                                            </strong>
                                                                                        </td>
                                                                                    )}

                                                                                    {/* Print Party and City only for the first row */}
                                                                                    {!shouldPrintWorkOrder && entryIndex === 0 && (
                                                                                        <td
                                                                                            rowSpan={partyRowSpan}
                                                                                            className="airring_boring_party-name-cells"
                                                                                            style={{
                                                                                                pageBreakInside: 'avoid',
                                                                                                verticalAlign: 'top',
                                                                                            }}
                                                                                        >
                                                                                        </td>
                                                                                    )}
                                                                                    <td className="ar_b_gborder">{entry.sub_sr_no}</td>
                                                                                    {/* Display other fields */}
                                                                                    <td className="ar_b_gborder">{entry.qty}</td>
                                                                                    <td className="ar_b_gborder">{entry.bore_size}</td>
                                                                                    <td className="ar_b_gborder blank">{entry.a_size}</td>
                                                                                    <td className="ar_b_gborder rmark">{entry.remark}</td>
                                                                                    <td className="ar_b_gborder blank Id">{entry.complete_date || "___/___/___"}</td>
                                                                                    <td className="ar_b_gborder Id">{entry.t_dispatch_week}</td>
                                                                                    <td className="qr-code"
                                                                                        onClick={handleQRCodeClick}
                                                                                        style={{ cursor: "pointer" }}>
                                                                                        <QRCodeSVG
                                                                                            value={`${BASE_URL}:3000/ProgressBar/${entry.record_sr_no}/${entry.party_name}`}
                                                                                            size={60}
                                                                                            level="H"
                                                                                        />
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        });
                                                                    });
                                                                })}
                                                            </React.Fragment>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AirRingBoringChart;