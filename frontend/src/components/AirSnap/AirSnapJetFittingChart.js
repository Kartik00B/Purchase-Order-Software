import React, {useCallback, useEffect, useRef, useState} from "react";
import axios from "axios";
import "../JetFittingChart.css";
import 'font-awesome/css/font-awesome.min.css';
import {QRCodeSVG} from 'qrcode.react';
import BASE_URL from "../config";
import {useNavigate, useParams} from "react-router-dom";

const AirSnapJetFittingChart = () => {
    const [airRingJetFittingData, setAirRingJetFittingData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState(""); // Start date for range filter
    const [endDate, setEndDate] = useState(""); // End date for range filter
    const [isTableVisible, setIsTableVisible] = useState(false);
    const [isDateRangeSelected, setIsDateRangeSelected] = useState(false); // Track if date range is selected
    const {chartName} = useParams(); // To get the selected chart name from URL
    const navigate = useNavigate();

    const fetchFinishSizes = async () => {
        try {
            const response = await axios.get("http://localhost:5000/finish-sizes");
            return response.data.data;
        } catch (error) {
            console.error("Error fetching finish sizes:", error);
            return [];
        }
    };

// Function to group and sum data for duplicates
    const groupAndSumData = (data) => {
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

// Fetch jetFitting data from the server and group it
    const fetchDailyData = useCallback(async (startDate, endDate) => {
        try {
            // Construct the URL with date range if provided
            let url = "http://localhost:5000/airplug-history";
            if (startDate && endDate) {
                url += `?startDate=${startDate}&endDate=${endDate}`;
            }

            const response = await axios.get(url);
            const rawData = groupAndSumData(response.data.data);

            // Fetch finish sizes
            const finishSizes = await fetchFinishSizes();
            const finishSizeMap = finishSizes.reduce((acc, curr) => {
                acc[curr.record_sr_no] = {
                    finish_size: parseFloat(curr.finish_size).toFixed(4),
                    rough_size: curr.rough_size,
                    under_size: curr.under_size,
                    dep: curr.dep,
                    t_dispatch_date: curr.t_dispatch_date,
                };
                return acc;
            }, {});

            const groupedData = rawData.map((entry) => {
                const {finish_size, rough_size, under_size, dep, t_dispatch_date} =
                finishSizeMap[entry.record_sr_no] || "N/A";
                return {
                    ...entry,
                    finish_size: finish_size || "N/A",
                    rough_size: rough_size || "N/A",
                    under_size: under_size || "N/A",
                    dep: dep || "N/A",
                    t_dispatch_date: t_dispatch_date || "N/A",
                };
            });

            const organizedData = groupedData.reduce((acc, entry) => {
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

            const dataArray = Object.entries(organizedData).map(
                ([workOrderNo, {date, parties}]) => ({
                    workOrderNo,
                    date,
                    parties,
                })
            );

            setAirRingJetFittingData(dataArray);
            setFilteredData(dataArray);
        } catch (error) {
            console.error("Error fetching jetFitting data:", error);
        }
    }, []);


    useEffect(() => {
        fetchDailyData()
    }, [fetchDailyData]);

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        if (query === "") {
            setFilteredData(airRingJetFittingData);
        } else {
            setFilteredData(
                airRingJetFittingData.filter((entry) =>
                    Object.values(entry).some((val) =>
                        String(val).toLowerCase().includes(query)
                    )
                )
            );
        }
    };

    // Function to apply filters (date range and search query)
    const applyFilters = async () => {
        let filtered = airRingJetFittingData;

        // Filter by date range
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Ensure the end date includes the entire day

            filtered = filtered.filter((entry) => {
                const entryDate = new Date(entry.date.split("T")[0]); // Normalize entry date to 'YYYY-MM-DD'
                return entryDate >= start && entryDate <= end;
            });
            setIsDateRangeSelected(true);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = filtered.filter((entry) => {
                const workOrderNo = entry.workOrderNo.toLowerCase();
                const date = entry.date.toLowerCase();
                const parties = Object.keys(entry.parties).join(" ").toLowerCase();

                return (
                    workOrderNo.includes(searchQuery.toLowerCase()) ||
                    date.includes(searchQuery.toLowerCase()) ||
                    parties.includes(searchQuery.toLowerCase())
                );
            });
        }

        setFilteredData(filtered);
        setIsTableVisible(true);
    };


    // Update both filters on change
    // useEffect(() => {
    // }, [searchQuery, startDate, endDate, jetFittingData]);


    // Handle print functionality
    const printRef = useRef();
    const handlePrint = () => {
        const printContent = printRef.current.innerHTML;
        const originalContent = document.body.innerHTML;

        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
    };

    return (
        <div className="jetFitting_data_entry__container">
            <div className="jetFitting_table_container">

                {/*<div className="jetFitting_search-container">*/}

                {/*	<input*/}
                {/*		type="text"*/}
                {/*		placeholder="Search by Work Order No, Date, or Party Name"*/}
                {/*		value={searchQuery}*/}
                {/*		onChange={handleSearch}*/}
                {/*		className="jetFitting_search-input"*/}
                {/*		autoComplete="on"*/}
                {/*	/>*/}
                {/*	<i className="fa fa-search jetFitting_search-icon"></i>*/}
                {/*	*/}
                {/*</div>*/}


                <div className="date-range-container">
                    {!isDateRangeSelected && (
                        <div className="date-range-section">
                            <h3 style={{fontSize: "38px", textAlign: "center", marginTop: "-5px"}}>AirSnap: Jet Fitting
                                Chart</h3>
                            <h3 style={{fontSize: "28px", textAlign: "center", marginTop: "-5%"}}>Select Date
                                Range</h3>
                            <div className="date-range-inputs">

                                {/*<br />*/}
                                <label>
                                    from Date:
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </label>
                                <label>
                                    to Date:
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </label>
                                <button onClick={applyFilters}>Apply Date Range</button>
                            </div>
                        </div>
                    )}
                    <div className="jetFitting_search-container">

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


                                <div className="jetFitting_table-container">
                                    <button onClick={handlePrint} className="daily_data_entry_button">
                                        Print Report
                                    </button>
                                    <div className="jetFitting_data_container" ref={printRef}>
                                        <table className="jetFitting_data_entry__table">
                                            <thead>
                                            <tr className="h-title">
                                            <img src="/LogoNew.png" style={{width: "0px"}}></img>

                                                <th colSpan="14" className="jetFitting_data_table_title_1 title_1">
                                                    Quality Management System
                                                    <br/>
                                                    AirSnap: Jet Fitting Chart
                                                </th>
                                            </tr>
                                            <tr className="t-head">
                                                <th className="gborder blank work">Work Order No</th>
                                                <th className="gborder">SUB SR NO.</th>
                                                <th className="gborder">QTY</th>
                                                <th className="gborder">Bore Type</th>
                                                <th className="gborder">UNDER SIZE</th>
                                                <th className="gborder blank">ISSUE DATE</th>
                                                <th className="gborder">ROUGH SIZE</th>
                                                <th className="gborder">FINISH SIZE</th>
                                                <th className="gborder blank">ISSUE DATE</th>
                                                <th className="gborder">DEP</th>
                                                <th className="gborder">REMARK</th>
                                                <th className="gborder blank">COMPLETE DATE</th>
                                                <th className="gborder">TENTATIVE DISPATCH DATE</th>
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
                                                                                {shouldPrintWorkOrder && (
                                                                                    <td
                                                                                        rowSpan={workOrderRowSpan}
                                                                                        className={`jetFitting_party-name-cell ${isLastEntryInParty ? 'no-bottom-border' : ''}`}
                                                                                        style={{
                                                                                            borderTop: '1px dotted black',
                                                                                            verticalAlign: "top"
                                                                                        }}
                                                                                    >
                                                                                        <strong
                                                                                            className="jetFitting_p_span">
                                                                                            <span>{group.workOrderNo}</span>
                                                                                        </strong>

                                                                                        {/*<strong>{partyName}</strong>*/}
                                                                                        {/*<br/>*/}
                                                                                        {/*<strong>{city}</strong>*/}
                                                                                    </td>
                                                                                )}

                                                                                {/* Print Party and City only for the first row */}
                                                                                {!shouldPrintWorkOrder && entryIndex === 0 && (
                                                                                    <td
                                                                                        rowSpan={partyRowSpan}
                                                                                        className="jetFitting_party-name-cells"
                                                                                        style={{
                                                                                            pageBreakInside: 'avoid',
                                                                                            verticalAlign: 'top',
                                                                                        }}
                                                                                    >
                                                                                        {/*<strong>{partyName}</strong>*/}
                                                                                        {/*<br/>*/}
                                                                                        {/*<strong>{city}</strong>*/}
                                                                                    </td>
                                                                                )}

                                                                                {/* Entry Details */}
                                                                                {/*<td className="daily_units-cell gborder">*/}
                                                                                {/*	<strong className="daily_p_strong">*/}
                                                                                {/*		SIZE: {entry.nominal_size}*/}
                                                                                {/*	</strong>*/}
                                                                                {/*	<br/>*/}
                                                                                {/*	<strong>*/}
                                                                                {/*		TOL: {entry.size_low_tolerance} / {entry.size_high_tolerance}*/}
                                                                                {/*	</strong>*/}
                                                                                {/*	<br/>*/}
                                                                                {/*	<strong>UNIT: {entry.units}</strong>*/}
                                                                                {/*</td>*/}
                                                                                {/* Display SUB SR NO */}
                                                                                <td className="gborder">{entry.sub_sr_no}</td>
                                                                                {/* Display other fields */}
                                                                                <td className="gborder">{entry.qty}</td>
                                                                                <td className="gborder">{entry.bore_type}</td>
                                                                                <td className="gborder">{entry.under_size}</td>
                                                                                <td className="gborder blank">{entry.issue_date || "__/__/__"}</td>
                                                                                <td className="gborder">{entry.rough_size}</td>
                                                                                <td className="gborder">{entry.finish_size}</td>
                                                                                <td className="gborder blank">{entry.finish_size_issue_date || "__/__/__"}</td>
                                                                                <td className="gborder">{entry.dep}</td>
                                                                                <td className="gborder rmark">{entry.remark}</td>
                                                                                <td className="gborder blank">{entry.complete_date || "__/__/__"}</td>
                                                                                <td className="gborder">{entry.t_dispatch_date}</td>
                                                                                <td className="qr-code"
                                                                                    onClick={handleQRCodeClick}
                                                                                    style={{cursor: "pointer"}}>
                                                                                    <QRCodeSVG
                                                                                        value={`${BASE_URL}:3000/ProgressBar/${entry.record_sr_no}/${entry.party_name}`}
                                                                                        size={55}
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


export default AirSnapJetFittingChart;