import React, {useCallback, useEffect, useRef, useState} from "react";
import axios from "axios";
import "./AirRingSettingPlugSettingDiscLappingChart.css";
import 'font-awesome/css/font-awesome.min.css';
import {QRCodeSVG} from "qrcode.react";
import BASE_URL from "../config";
import {useNavigate, useParams} from "react-router-dom";

const AirRingSettingPlugSettingDiscLappingChart = () => {
    const {component} = useParams();
    const [airRingMachiningData, setAirRingMachiningData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [fromWorkOrderNo, setFromWorkOrderNo] = useState("");
    const [toWorkOrderNo, setToWorkOrderNo] = useState("");
    const [isTableVisible, setIsTableVisible] = useState(false);
    const [isDateRangeSelected, setIsDateRangeSelected] = useState(false);
    const navigate = useNavigate();

    const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

    // Fetch finish sizes from server
    // Fetch Internal Diameters (AirRing specific data)
    const fetchInternalDiameters = async () => {
        try {
            const response = await axios.get("http://localhost:5000/calculate-finish-values");
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
                size_low_tolerance: lowTolerance,
                size_high_tolerance: highTolerance,
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
                    Low: parseFloat(curr.Low).toFixed(4),
                    High: parseFloat(curr.High).toFixed(4),
                    t_dispatch_week: curr.t_dispatch_week,
                };
                return acc;
            }, {});

            // Merge grouped data with internal diameter details
            const mergedData = rawData.map((entry) => {
                const sizeDetails = internalDiameterMap[entry.record_sr_no] || {};
                return {
                    ...entry,
                    Low: sizeDetails.Low || "N/A",
                    High: sizeDetails.High || "N/A",
                    t_dispatch_week: sizeDetails.t_dispatch_week || "N/A",
                };
            });

            // Organize AirRing data
            const organizedData = mergedData.reduce((acc, entry) => {
                const workOrderNo = entry.work_order_no.trim();
                const partyName = entry.party_name.trim();
                const city = entry.city.trim();

                if (!acc[workOrderNo]) {
                    acc[workOrderNo] = {date: entry.date, parties: {}};
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
            const dataArray = Object.entries(organizedData).map(([workOrderNo, {date, parties}]) => ({
                workOrderNo,
                date,
                parties,
            }));

            setAirRingMachiningData(dataArray);
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
            setFilteredData(airRingMachiningData);
        } else {
            setFilteredData(
                airRingMachiningData.filter((entry) =>
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
        <span style="text-align: right; margin-right: 10px; font-size: 12px;">ISSUE DATE <br/> ${currentDate}</span>
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
                    size: landscape;
                    counter-increment: page;
                    @bottom-right {
                        content: "Page " counter(page);
                        font-size: 14px;
                        margin-bottom: 10px;
                    }
                }
            body {
                font-family: poppins, sans-serif;
                font-size: 16px;
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


    return (
        <div className="ar_spd_lapping_data_entry__container">
            <div className="ar_spd_lapping_table_container">
                <div className="machining-work-order-range-container">
                    {!isDateRangeSelected && (
                        <div className="machining-work-order-range-section">
                            <button className="back-button" onClick={() => navigate(-1)}>⬅ Back</button>

                            <h2 className="machining-work-order-range-title1">Air Ring
                                <br />
                                Setting Plug and Setting Disc : Lapping Chart
                                Chart</h2>
                            <h3 className="machining-work-order-range-title2">Select Work Order
                                Range</h3>
                            <div className="machining-work-order-range-inputs">

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
                    <div className="ar_spd_lapping_search-container">

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
                                <div className="ar_spd_lapping_table-container">                            
                                    <button className="chart-back-button" onClick={() => navigate(-1)}>⬅ Back</button>

                                    <button onClick={handlePrint} className="machining_data_entry_button">
                                        Print Report
                                    </button>
                                    <div className="ar_spd_lapping_data_container" ref={printRef}>
                                        <table className="ar_spd_lapping_data_entry__table">
                                            <thead>
                                            <tr className="h-title">
                                            <img src="/LogoNew.png" style={{width: "0px"}} alt=""></img>
                                            <th colSpan="11"
                                                    className="ar_spd_lapping_data_table_title_1 title_1">
                                                    Quality Management System
                                                    <br/>
                                                    Setting Plug and Setting Disc:<br /> Lapping Chart                                                </th>
                                            </tr>
                                            <tr className="t-head">
                                                <th className="gborder blank work">ISSUE DATE</th>
                                                <th className="gborder blank work">Work Order No</th>
                                                <th className="gborder">SUB SR NO.</th>
                                                <th className="gborder">QTY</th>
                                                <th className="gborder Id">LIMIT</th>
                                                <th className="gborder">FINISH SIZE</th>
                                                <th className="gborder">ACTUAL SIZE</th>
                                                <th className="gborder">REMARK</th>
                                                <th className="gborder Id">COMPLETE DATE</th>
                                                <th className="gborder Id">TENTATIVE DISPATCH DATE</th>
                                                <th className="gborder">QR Codes</th>
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
                                                                                <td className="gborder lgblank" style={{borderLeft:"1px solid black", width:'9%'}}>{entry.complete_date || "___/___/___"}</td>
                                                                                {shouldPrintWorkOrder && (
                                                                                    <td
                                                                                    rowSpan={workOrderRowSpan}
                                                                                    className={`ar_spd_lapping_party-name-cell ${isLastEntryInParty ? 'no-bottom-border' : ''}`}
                                                                                    style={{
                                                                                            borderTop: '1px dotted black',
                                                                                            verticalAlign: "top"
                                                                                        }}
                                                                                        >
                                                                                        <strong
                                                                                            className="ar_spd_lapping_p_span">
                                                                                            <span>{group.workOrderNo}</span>
                                                                                        </strong>

                                                                                    </td>
                                                                                )}

                                                                                {/* Print Party and City only for the first row */}
                                                                                {!shouldPrintWorkOrder && entryIndex === 0 && (
                                                                                    <td
                                                                                        rowSpan={partyRowSpan}
                                                                                        className="ar_spd_lapping_party-name-cells"
                                                                                        style={{
                                                                                            pageBreakInside: 'avoid',
                                                                                            verticalAlign: 'top',
                                                                                        }}
                                                                                    >
                                                                                    </td>
                                                                                )}

                                                                               
                                                                                <td className="gborder">{entry.sub_sr_no}</td>
                                                                                {/* Display other fields */}
                                                                                <td className="gborder">{entry.qty}</td>

                                                                                <td className="daily_units-cell gborder">
                                                                                	<span className="daily_p_strong" style={{textAlign:"start"}}>
                                                                                		H
                                                                                        <br />
                                                                                        L
                                                                                	</span>
																					</td>
																				<td className="daily_units-cell gborder">
                                                                                	<span className="daily_p_strong" style={{textAlign:"start"}}>
                                                                                		{entry.High}
																						<br />
                                                                                		{entry.Low}
                                                                                	</span>
																					</td>
                                                                                <td className="gborder"></td>
                                                                                <td className="gborder rmark">{entry.remark}</td>
                                                                                <td className="gborder blank Id">
                                                                                <span className="daily_p_strong" style={{textAlign:"start"}}>
                                                                                		___/___/___
                                                                                        <br />
                                                                                        <br/>
                                                                                        
                                                                                        ___/___/___
                                                                                	</span>
																					</td>
                                                                                <td className="gborder Id">{entry.t_dispatch_week}</td>
                                                                                <td className="qr-code"
                                                                                    onClick={handleQRCodeClick}
                                                                                    style={{cursor: "pointer"}}>
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

export default AirRingSettingPlugSettingDiscLappingChart;  