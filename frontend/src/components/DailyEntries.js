import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import "./DailyEntries.css";
import 'font-awesome/css/font-awesome.min.css';
import { QRCodeSVG } from 'qrcode.react';
import BASE_URL from "./config";
import { useNavigate } from "react-router-dom";

const InwardChart = () => {
    const [dailyData, setDailyData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [fromWorkOrderNo, setFromWorkOrderNo] = useState("");
    const [toWorkOrderNo, setToWorkOrderNo] = useState("");
    const [isTableVisible, setIsTableVisible] = useState(false);
    const [showDateRange, setShowDateRange] = useState(true);
    const [isDateRangeSelected, setIsDateRangeSelected] = useState(false);
    const navigate = useNavigate();


    // Function to group and sum data for duplicates
    const groupAndSumData = (data) => {
        const groupedData = {};

        data.forEach((entry) => {
            const {
                work_order_no: workOrderNo,
                party_name: partyName,
                city,
                nominal_size: nominalSize,
                label_size,
                size_low_tolerance: lowTolerance,
                size_high_tolerance: highTolerance,
            } = entry;

            const uniqueKey = `${workOrderNo}-${partyName}-${city}-${nominalSize}-${label_size}-${lowTolerance}-${highTolerance}`;

            if (!groupedData[uniqueKey]) {
                groupedData[uniqueKey] = {
                    ...entry,
                    qty: parseInt(entry.qty, 10), // Initialize quantity
                    entries: [entry], // Store all original entries for reference if needed
                };
            } else {
                // Increment quantity for duplicates
                groupedData[uniqueKey].qty += parseInt(entry.qty, 10);
                groupedData[uniqueKey].entries.push(entry); // Keep track of repeated entries
            }
        });

        return Object.values(groupedData); // Return grouped data as an array
    };

    // Fetch daily data from the server and group it
    const fetchDailyData = useCallback(async (fromWO = "", toWO = "") => {
        try {
            const response = await axios.get("http://localhost:5000/history", {
                params: {
                    fromWorkOrderNo: fromWO,
                    toWorkOrderNo: toWO
                }
            });
    
            const groupedData = groupAndSumData(response.data.data);    

            // Filter by date
            const filteredByDate = groupedData.filter(entry => {
                const entryDate = new Date(entry.formatted_date);
                const start = new Date(startDate);
                const end = new Date(endDate);
                return (!startDate || entryDate >= start) && (!endDate || entryDate <= end);
            });

            const filteredByWO = filteredByDate.filter(entry => {
                const wo = entry.work_order_no.trim();
                return (
                    (!fromWO || wo >= fromWO.trim()) &&
                    (!toWO || wo <= toWO.trim())
                );
            });

            // Organize grouped data
            const organizedData = filteredByWO.reduce((acc, entry) => {
                const workOrderNo = entry.work_order_no.trim();
                const partyName = entry.party_name.trim();
                const city = entry.city.trim();

                if (!acc[workOrderNo]) {
                    acc[workOrderNo] = { formatted_date: entry.formatted_date, parties: {} };
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

            const dataArray = Object.entries(organizedData).map(([workOrderNo, { formatted_date, parties }]) => ({
                workOrderNo,
                formatted_date,
                parties,
            }));

            // Sort entries by sub_sr_no within each work order
dataArray.forEach(group => {
    const sortedParties = {};
    Object.entries(group.parties).forEach(([partyName, cities]) => {
        const sortedCities = {};
        Object.entries(cities).forEach(([city, entries]) => {
            // Sort entries by sub_sr_no
            sortedCities[city] = entries.sort((a, b) => a.sub_sr_no - b.sub_sr_no);
        });
        sortedParties[partyName] = sortedCities;
    });
    group.parties = sortedParties; // Update the parties with sorted cities
});

            setDailyData(dataArray);
            setFilteredData(dataArray);
        } catch (error) {
            console.error("Error fetching daily data:", error);
        }
    }, [startDate, endDate]);


    useEffect(() => {
        fetchDailyData();
    }, [fetchDailyData]);

    // Filter daily data based on search query
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        if (query === "") {
            setFilteredData(dailyData);
        } else {
            setFilteredData(
                dailyData.filter((entry) =>
                    Object.values(entry).some((val) =>
                        String(val).toUpperCase().includes(query)
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


    // Handle print functionality
    const printRef = useRef();
    const handlePrint = () => {
        const printContent = printRef.current.innerHTML;
        const originalContent = document.body.innerHTML;
        const currentDate = new Date().toLocaleDateString("en-GB");

        const dateHTML =
            `<div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-weight: bold;">
                <img src="/LogoNew.png" style="width: 120px; height:45px; margin-left: 10px;" alt="Logo" />
        <span style="text-align: right; margin-right: 10px; font-size: 12px;">ISSUE DATE <br/> ${currentDate}</span>
            </div>`;

        const finalContent =
            `<div>
                ${dateHTML}
                ${printContent}
            </div>`;

        document.body.innerHTML = finalContent;

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
                    font-family: Arial, sans-serif;
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

            th.gborder {
            word-wrap: break-word;
            border: black solid 1px;
            font-size: 14px;
            }
            
            /* Add bottom border to the last entry of each page */
            // .entry:nth-last-child(1) {
            //     border-bottom: 1px solid black;
            // }
        }
        `;
        document.head.appendChild(style);

        // Add data attributes for continued work orders
        const tables = document.getElementsByClassName('daily_data_entry__table');
        for (let table of tables) {
            const rows = table.getElementsByTagName('tr');
            let currentWorkOrder = '';
            let isFirstOnPage = true;

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const workOrderCell = row.querySelector('.daily_party-name-cell');
                
                if (workOrderCell) {
                    const workOrderText = workOrderCell.textContent.trim();
                    if (workOrderText !== currentWorkOrder) {
                        currentWorkOrder = workOrderText;
                        isFirstOnPage = true;
                    } else {
                        if (!isFirstOnPage) {
                            row.setAttribute('data-continued', 'true');
                        }
                    }
                }

                // Reset isFirstOnPage after every 9 rows (page break)
                if ((i + 1) % 7 === 0) {
                    isFirstOnPage = true;
                }
            }
        }

        window.print();

        document.body.innerHTML = originalContent;
        window.location.reload();
    };

    const handleFilter = () => {
        fetchDailyData();
        setShowDateRange(false);
    };

    return (
        <div className="daily_data_entry__container">
            <div className="daily_data_entry__data-container">
                {!isDateRangeSelected && (
                    <div className="airplug_grinding-work-order-range-container">
                        <div className="airplug_grinding-work-order-range-section">
                            <button className="back-button" onClick={() => navigate(-1)}>⬅ Back</button>
                            <h2 className="airplug_grinding-work-order-range-title1">Daily Inward<br />
                                Chart</h2>
                            <h3 className="airplug_grinding-work-order-range-title2">Select Work Order
                                Range</h3>
                            <div className="airplug_grinding-work-order-range-inputs">

                                <label>From Work Order No:
                                    <input
                                        type="text"
                                        value={fromWorkOrderNo}
                                        onChange={(e) => setFromWorkOrderNo(e.target.value)}
                                        placeholder="From Work Order No"
                                    />

                                </label>

                                <label>To Work Order No:
                                    <input
                                        type="text"
                                        value={toWorkOrderNo}
                                        onChange={(e) => setToWorkOrderNo(e.target.value)}
                                        placeholder="To Work Order No"
                                    />
                                </label>

                                <button onClick={applyFilters}>Apply Work Order Range</button>
                            </div>

                        </div>
                    </div>
                )}
                <div className="daily_search-container">
                    {isDateRangeSelected && (
                        <div>

                            <input
                                type="text"
                                placeholder="Search by Work Order No, Date, or Party Name"
                                value={searchQuery}
                                onChange={handleSearch}
                                className="search-input"
                                autoComplete="on"
                            />
                            {/* <i className="fa fa-search daily_search-icon"></i> */}

                            <br />

                            <div className="daily_table-container">
                                <button className="chart-back-button" onClick={() => navigate(-1)}>⬅ Back</button>
                                <button onClick={handlePrint} className="daily_data_entry_button">
                                    Print Report
                                </button>

                                <div className="daily_table_container" ref={printRef}>
                                    {/*<h3 className="daily_data__print-title">AirPlug Inward Chart</h3>*/}
                                    <table className="daily_data_entry__table">
                                        <thead>
                                            <tr className="h-title">
                                            <img src="/LogoNew.png" style={{width: "0px"}} alt=""></img>

                                                <th colSpan="13" className="daily_data_table_title_1 title_1">
                                                    Quality Management System
                                                    <br />
                                                    Inward Chart
                                                </th>
                                            </tr>
                                            <tr className="t-head">
                                                <th>Work Order No, Date & Party & City</th>
                                                <th>Nominal Size</th>
                                                <th>Jet Count</th>
                                                <th>Bore/Jet Type</th>
                                                <th>Higher Lower</th>
                                                <th>Sub Sr No</th>
                                                <th>Qty</th>
                                                <th>Set</th>
                                                <th>Remark</th>
                                                <th>Qr Codes</th>
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
                                                                            isLastGroup &&
                                                                            isLastCity &&
                                                                            entryIndex === entries.length - 1;

                                                                        // const subSrNo = String(entryIndex + 1).padStart(2, "0");
                                                                        const isLastEntryInParty = entryIndex === entries.length - 1;
                                                                        const isFirstEntryInWorkOrder = entryIndex === 0 && partyIndex === 0;

                                                                        const isNewWorkOrder = !isWorkOrderDisplayed && entryIndex === 0;
                                                                        const shouldRemoveTopBorder = !isNewWorkOrder;

                                                                        const shouldPrintWorkOrder =
                                                                            !firstEntryPrinted || isFirstEntryInWorkOrder;

                                                                        if (shouldPrintWorkOrder) {
                                                                            firstEntryPrinted = true;
                                                                        }

                                                                        // Calculate rowspan for work order, party, and city columns
                                                                        const workOrderRowSpan = entries.length;
                                                                        const partyRowSpan = entries.length;


                                                                        const handleQRCodeClick = () => {
                                                                            // Construct the dynamic URL
                                                                            const url = `/ProgressBar/${entry.record_sr_no}/${entry.party_name}`;

                                                                            // Navigate to the constructed URL
                                                                            navigate(url);
                                                                        };


                                                                        return (
                                                                            <tr
                                                                                key={`${partyIndex}-${cityIndex}-${entryIndex}`}
                                                                                className={`${shouldRemoveTopBorder ? "no-top-border" : ""}
                                    ${isLastEntryInParty ? "no-bottom-border" : ""}
                                    ${isLastEntry ? "last-entry-border" : ""}`}
                                                                            >
                                                                                {shouldPrintWorkOrder && (
                                                                                    <td
                                                                                        rowSpan={workOrderRowSpan}
                                                                                        className={`daily_party-name-cell ${isLastEntryInParty ? "no-bottom-border" : ""}`}
                                                                                        style={{ borderTop: "1px dotted black", verticalAlign: "top", paddingTop: "5px" }}
                                                                                    >
                                                                                        <strong className="daily_p_span">
                                                                                            <span>{group.workOrderNo}</span> {group.formatted_date}
                                                                                        </strong>
                                                                                        <br />
                                                                                        <strong className="p_name">{partyName}</strong>
                                                                                        <br />
                                                                                        <strong>{city}</strong>
                                                                                    </td>
                                                                                )}

                                                                                {!shouldPrintWorkOrder && entryIndex === 0 && (
                                                                                    <td
                                                                                        rowSpan={partyRowSpan}
                                                                                        className="daily_party-name-cells"
                                                                                        style={{
                                                                                            pageBreakInside: "avoid",
                                                                                            verticalAlign: "top",
                                                                                            padding: "5px",

                                                                                        }} /* Added vertical alignment */
                                                                                    >
                                                                                        <strong className="p_name">{partyName}</strong>
                                                                                        <br />
                                                                                        <strong>{city}</strong>
                                                                                    </td>

                                                                                )}

                                                                                <td className="daily_units-cell border">
                                                                                    <strong
                                                                                        className="daily_p_strong">SIZE: {entry.nominal_size.toFixed(4)}</strong>
<strong className="label_size">
    {entry.label_size && entry.label_size !== 'undefinedundefined' && entry.label_size !== 'undefinednull' ? `${entry.label_size}` : ''}
</strong>                                        <br/>


                                                                                    <strong>
                                                                                        TOL: {entry.size_low_tolerance.toFixed(4)} / {entry.size_high_tolerance.toFixed(4)}
                                                                                    </strong>
                                                                                    <br />
                                                                                    <strong>UNIT: {entry.units}</strong>
                                                                                </td>
                                                                                <td className="border">{entry.jet_count}</td>
                                                                                <td className="border">{entry.bore_jet_type}</td>
                                                                                <td className="border">{entry.higher_lower}</td>
                                                                                <td className="border">{entry.sub_sr_no}</td>
                                                                                <td className="border">{entry.qty}</td>
                                                                                <td className="border">{entry.air_plug_set}</td>
                                                                                <td className="daily_txt border">{entry.remark}</td>

                                                                                <td className="qr-code" onClick={handleQRCodeClick} style={{ cursor: "pointer" }}>
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
        </div >
    );
};

export default InwardChart;
