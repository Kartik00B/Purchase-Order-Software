import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import './AirPlugDrillingChart.css';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';

const AirPlugDrillingChart = () => {
    const [fromWorkOrderNo, setFromWorkOrderNo] = useState('');
    const [toWorkOrderNo, setToWorkOrderNo] = useState('');
    const [enabledCharts, setEnabledCharts] = useState({ BB: false, TB: false });
    const [isDateRangeSelected, setIsDateRangeSelected] = useState(false);
    const [filteredTableData, setFilteredTableData] = useState([]);
    const [tableVisible, setTableVisible] = useState(false);
    const [mergedData, setMergedData] = useState([]);
    const [chartButtonsVisible, setChartButtonsVisible] = useState(true);
    const [filteredData, setFilteredData] = useState();
    const lastFilter = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isTableVisible, setIsTableVisible] = useState(false);
    const navigate = useNavigate();
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const [currentChartType, setCurrentChartType] = useState(null);

    // State to track the applicability of each chart range
    const [isBBApplicable, setIsBBApplicable] = useState({ BB: false });
    const [isTBApplicable, setIsTBApplicable] = useState({ TB: false });

    const getDrillingChartType = (bore_jet_type) => {
        if (bore_jet_type === 'BB') {
            return 'BB'; // Return BB for Bore Boring
        } else if (bore_jet_type === 'TB') {
            return 'TB'; // Return TB for Tapered Bore
        }
        return 'N/A'; // Return N/A if not applicable
    };

    // Group and sum data
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

    // Fetch and organize drilling data
    const fetchData = useCallback(async (fromWorkOrderNo, toWorkOrderNo) => {
        try {
            const airPlugHistoryUrl = "http://localhost:5000/airplug-history";
            const finishSizesUrl = "http://localhost:5000/finish-sizes";
            let airPlugHistoryResponse;
            if (fromWorkOrderNo && toWorkOrderNo) {
                airPlugHistoryResponse = await axios.get(`${airPlugHistoryUrl}?fromWorkOrderNo=${fromWorkOrderNo}&toWorkOrderNo=${toWorkOrderNo}`);
            } else {
                airPlugHistoryResponse = await axios.get(airPlugHistoryUrl);
            }
            const finishSizesResponse = await axios.get(finishSizesUrl);
            const rawData = groupAndSumData(airPlugHistoryResponse.data.data);
            const finishSizes = finishSizesResponse.data.data;
            return { rawData, finishSizes };
        } catch (error) {
            console.error("Error fetching data:", error);
            return { rawData: [], finishSizes: [] };
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            const { rawData, finishSizes } = await fetchData();
            const recordSrNos = new Set(rawData.map(item => item.record_sr_no));
            const filteredFinishSizes = finishSizes.filter(item => recordSrNos.has(item.record_sr_no));
            const finishSizeMap = filteredFinishSizes.reduce((acc, curr) => {
                acc[curr.record_sr_no] = {
                    ReamSize: curr.ReamSize,
                    CounterSize: curr.CounterSize,
                    cdx: curr.cdx,
                    t_dispatch_week: curr.t_dispatch_week,
                    drilling_size: parseFloat(curr.drilling_size).toFixed(4),
                    nominal_size: curr.nominal_size,
                    bore_jet_type: curr.bore_jet_type,
                    drilling_chart_type: curr.drilling_chart_type, // Ensure this is included
                };
                return acc;
            }, {});
        
            // Directly create mergedData and apply the filter
            const mergedData = rawData.map((entry) => {
                const sizeDetails = finishSizeMap[entry.record_sr_no] || {};
                const chartRange = sizeDetails.drilling_chart_type; // Use the drilling_chart_type
        
                return {
                    ...entry,
                    ReamSize: sizeDetails.ReamSize || "N/A",
                    CounterSize: sizeDetails.CounterSize || "N/A",
                    cdx: sizeDetails.cdx || "N/A",
                    t_dispatch_week: sizeDetails.t_dispatch_week || "N/A",
                    drilling_size: sizeDetails.drilling_size || "N/A",
                    chart_range: chartRange, // Set the new chart range
                    nominal_size: sizeDetails.nominal_size || "N/A",
                };
            });
        
            // Set mergedData and apply the filter directly
            setMergedData(mergedData);
            applyTBAndBBFilter(mergedData);
        };

        loadData();
    }, [fetchData]);

    const applyTBAndBBFilter = (mergedData) => {
        if (!mergedData || mergedData.length === 0) {
            setIsBBApplicable({ "BB": false });
            setIsTBApplicable({ "TB": false });
            setEnabledCharts({ BB: false, TB: false }); // Disable buttons if no data
            return;
        }
    
        const bbEntries = mergedData.filter(item => item.chart_range === 'BB');
        const tbEntries = mergedData.filter(item => item.chart_range === 'TB');
    
        setIsBBApplicable({ BB: bbEntries.length > 0 });
        setIsTBApplicable({ TB: tbEntries.length > 0 });
    
        // Enable buttons based on the presence of entries
        setEnabledCharts({
            BB: bbEntries.length > 0, // Enable BB button if there are BB entries
            TB: tbEntries.length > 0, // Enable TB button if there are TB entries
        });
    };




    const applyFilters = async () => {
        const { rawData, finishSizes } = await fetchData(fromWorkOrderNo, toWorkOrderNo);
        const recordSrNos = new Set(rawData.map(item => item.record_sr_no));
        const filteredFinishSizes = finishSizes.filter(item => recordSrNos.has(item.record_sr_no));
        const finishSizeMap = filteredFinishSizes.reduce((acc, curr) => {
            acc[curr.record_sr_no] = {
                ReamSize: curr.ReamSize,
                CounterSize: curr.CounterSize,
                cdx: curr.cdx,
                t_dispatch_week: curr.t_dispatch_week,
                drilling_size: curr.drilling_size,
                chart_range: curr.chart_range,
                nominal_size: curr.nominal_size,
                drilling_chart_type: curr.drilling_chart_type, // Ensure this is included
            };
            return acc;
        }, {});
    
        const mergedData = rawData.map((entry) => {
            const sizeDetails = finishSizeMap[entry.record_sr_no] || {};
            return {
                ...entry,
                ReamSize: sizeDetails.ReamSize || "N/A",
                CounterSize: sizeDetails.CounterSize || "N/A",
                cdx: sizeDetails.cdx || "N/A",
                t_dispatch_week: sizeDetails.t_dispatch_week || "N/A",
                drilling_size: sizeDetails.drilling_size || "N/A",
                chart_range: sizeDetails.drilling_chart_type || "N/A", // Use drilling_chart_type
                nominal_size: sizeDetails.nominal_size || "N/A",
            };
        });
    
        console.log(mergedData);
        setMergedData(mergedData);
        applyTBAndBBFilter(mergedData); // Call to apply the filter logic
        setIsDateRangeSelected(true);
    };




    
    const calculateCDX = (nominalSize, highTolerance, lowTolerance, chartType, higherLower) => {
        if (chartType === 'BB') {
            return 4.50; // Fixed value for BB charts
        }
        
        // For TB charts, calculate based on nominal size
        let nominal;
        if (higherLower === 'Yes') {
            // For higher_lower = 'Yes', add tolerances directly to nominal size
            nominal = parseFloat(nominalSize) + (parseFloat(highTolerance) + parseFloat(lowTolerance)) / 2;
        } else {
            // For other cases, use the nominal size as is
            nominal = parseFloat(nominalSize);
        }
        
        if (nominal > 0 && nominal <= 15) {
            return 8.00;
        } else if (nominal > 15 && nominal <= 24) {
            return 10.00;
        } else if (nominal > 24 && nominal <= 30) {
            return 12.00;
        } else if (nominal > 30 && nominal <= 250) {
            return 14.00;
        } else {
            return 14.00;
        }
    };


    // Handle viewing a specific chart
    const handleViewChart = (chartType) => {
        if (!enabledCharts[chartType]) {
            return; // Don't proceed if the chart type is not applicable
        }

        // Log the total number of entries before filtering
        console.log('Total entries before filtering:', mergedData.length);

        // Filter entries based on the chart type
        const filteredData = mergedData.filter(entry => {
            const chartRange = entry.chart_range;
            console.log(`Checking entry with chart_range: ${chartRange}`); // Log the chart_range for each entry
            return chartRange === chartType; // Check for exact match
        });

        // Log the number of entries after filtering
        console.log('Entries after filtering:', filteredData.length);

        if (filteredData.length === 0) {
            console.warn(`No entries found for chart type: ${chartType}`);
        }

        setCurrentChartType(chartType);

        const organizedData = filteredData.reduce((acc, entry) => {
            const workOrderNo = entry.work_order_no.trim();
            const partyName = entry.party_name.trim();
            const city = entry.city.trim();

            if (!acc[workOrderNo]) {
                acc[workOrderNo] = { parties: {} };
            }

            if (!acc[workOrderNo].parties[partyName]) {
                acc[workOrderNo].parties[partyName] = { cities: {} };
            }
            if (!acc[workOrderNo].parties[partyName].cities[city]) {
                acc[workOrderNo].parties[partyName].cities[city] = [];
            }

            acc[workOrderNo].parties[partyName].cities[city].push(entry);
            return acc;
        }, {});

        const dataArray = Object.entries(organizedData).map(([workOrderNo, { parties }]) => ({
            workOrderNo,
            parties,
        }));

        // Log the final number of entries in dataArray
        console.log('Final entries in dataArray:', dataArray.length);

        setFilteredTableData(dataArray);
        setTableVisible(true);
        setChartButtonsVisible(false);
        setIsTableVisible(true);
        lastFilter.current = { chartType, filteredData: dataArray };
    };

    // Helper function to generate chart buttons
    // Helper function to generate chart buttons
    // Helper function to generate chart buttons
const getChartButtons = (chartType) => {
    const isButtonEnabled = enabledCharts[chartType]; // Check if the button should be enabled
    return (
        <div className='airplug-drilling-chart-card'>
            <h4 className="airplug-drilling-chart-card-title">
                Airplug Drilling Chart {chartType}
            </h4>
            <button
                className={`airplug-drilling-chart-button ${!isButtonEnabled ? 'button-blur' : ''}`} // Apply blur class if not enabled
                onClick={() => handleReViewChart(chartType)}
            >
                View Chart
            </button>
        </div>
    );
};

    const handleFromWorkOrderChange = (event) => {
        setFromWorkOrderNo(event.target.value);
    };

    const handleToWorkOrderChange = (event) => {
        setToWorkOrderNo(event.target.value);
    };
    
    const handleBackButtonClick = () => {
        setTableVisible(false);
        setChartButtonsVisible(true);
    };
    
    const handleComponentBackButtonClick = () => {
        setSelectedComponent(true);
    };
    
    const handleChartBackButtonClick = () => {
        setIsDateRangeSelected(false);
        // navigate('/AirPlugDrillingChart')
    };

    const handleReViewChart = (chartType) => {
        if (lastFilter.current && lastFilter.current.chartType === chartType) {
            setFilteredTableData(lastFilter.current.filteredData);
            setTableVisible(true);
            setChartButtonsVisible(false);
        } else {
            handleViewChart(chartType)
        }
    };
    
    
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
    
        if (query === "") {
            setFilteredTableData(filteredTableData); // Reset to the original data if the search query is empty
        } else {
            // Check if the last filter matches the current search query
            if (lastFilter.current && lastFilter.current.filteredData) {
                const results = lastFilter.current.filteredData.filter(group =>
                    group.workOrderNo.toLowerCase().includes(query)
                );
                setFilteredTableData(results);
            } else {
                // If no last filter, filter the original data
                const results = filteredTableData.filter(group =>
                    group.workOrderNo.toLowerCase().includes(query)
                );
                setFilteredTableData(results);
            }
        }
    };

    const printRef = useRef();
    const handlePrint = () => {
        const printContent = printRef.current.innerHTML;
        const originalContent = document.body.innerHTML;
        const currentDate = new Date().toLocaleDateString("en-GB");

        const dateHTML =
            `<div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-weight: bold;">
                <img src="/LogoNew.png" style="width: 120px; height:45px; margin-left: 10px;" alt="Logo" />
                <span style="text-align: right; margin-right: 10px;">ISSUE DATE<br/> ${currentDate}</span>
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
                    font-family: poppins, sans-serif;
                    font-size: 14px;
                    margin-top:-15px
                }
                .print-container {
                    page-break-inside: avoid;
                }
                .entry {
                    margin-bottom: 10px;
                }
                .entry:nth-child(13n) {
                    page-break-after: always;
                }
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

                th.ap_d_gborder {
                word-wrap: break-word;
                border: black solid 1px;
                font-size: 14px;
                }
                .entry:nth-last-child(1) {
                    border-bottom: 1px dotted grey;
                }
            }
        `;
        document.head.appendChild(style);

        window.print();

        document.body.innerHTML = originalContent;
        window.location.reload();
    };

    return (
        <div className='airplug-drilling-chart-selection-page'>
            <div className="airplug_drilling_data_entry__container">
                <div className="airplug_drilling_table_container">
                    <div className="airplug_drilling-work-order-range-container">
                        {!isDateRangeSelected && (
                            <div className="airplug_drilling-work-order-range-section">
                                <button className="back-button" onClick={() => navigate(-1)}>⬅ Back</button>
                                
                                <h2 className="airplug_drilling-work-order-range-title1">Air Plug  <br />Drilling Chart</h2>
                                <h3 className="airplug_drilling-work-order-range-title2">Select Work Order Range</h3>
                                <div className="airplug_drilling-work-order-range-inputs">

                                    <label>From Work Order No:
                                        <input
                                            type="text"
                                            value={fromWorkOrderNo}
                                            onChange={handleFromWorkOrderChange}
                                            placeholder="Enter From Work Order No"
                                        />
                                    </label>

                                    <label>To Work Order No:
                                        <input
                                            type="text"
                                            value={toWorkOrderNo}
                                            onChange={handleToWorkOrderChange}
                                            placeholder="Enter To Work Order No"
                                        />
                                    </label>

                                    <button onClick={applyFilters}>Apply Work Order Range</button>
                                </div>
                            </div>
                        )}

                        {chartButtonsVisible && isDateRangeSelected && (
                            <div className="airplug_drilling-chart-options-container">
                                <button className="airplug-drilling-charts-back-button" onClick={() => navigate(-1)}>⬅ Back</button>
                                <h2 className='airplug-drilling-chart-options-header'>Air Plug Drilling <br/>Chart Options</h2>

                                <div className='airplug-drilling-chart-options'>
                                    {getChartButtons('BB')}
                                    {getChartButtons('TB')}
                                </div>
                            </div>
                        )}
                        <div className="airplug_drilling_search-container">
                            {tableVisible && (
                                <div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={handleSearch}
                                        placeholder="Search data..."
                                        className="history-search"
                                    />
                                    <div className="airplug_drilling_table-container">
                                        <button className="airplug-drilling-chart-back-button" onClick={handleBackButtonClick}>⬅ Back</button>
                                        <button className="airplug_drilling_data_entry_button"  onClick={handlePrint}>
                                            Print Report
                                        </button>
                                        <div className="airplug_drilling_data_container" ref={printRef}>
                                            {currentChartType && (
                                                <table className="airplug_drilling_data_entry__table">
                                                    <thead>
                                                        <tr className="h-title">
                                                        <img src="/LogoNew.png" style={{width: "0px"}} alt=""></img>
                                                        <th colSpan="14"
                                                                className="airplug_drilling_data_table_title_1 title_1">
                                                                Quality Management System
                                                                <br/>
                                                                AirPlug: Drilling Chart : {currentChartType}
                                                            </th>
                                                        </tr>
                                                        <tr className="t-head">
                                                            <th className="ap_d_gborder blank work">Work Order No</th>
                                                            <th className="ap_d_gborder">SUB SR NO.</th>
                                                            <th className="ap_d_gborder">QTY</th>
                                                            <th className="ap_d_gborder">FINISH SIZE</th>
                                                            <th className="ap_d_gborder c">CDX</th>
                                                            <th className="ap_d_gborder blank work">UNITS</th>
                                                            <th className="ap_d_gborder">R/S</th>
                                                            <th className="ap_d_gborder">C/S</th>
                                                            <th className="ap_d_gborder">BORE TYPE</th>
                                                            <th className="ap_d_gborder">JET COUNT</th>
                                                            <th className="ap_d_gborder">REMARK</th>
                                                            <th className="ap_d_gborder">COMPLETE DATE</th>
                                                            <th className="ap_d_gborder Id">TENTATIVE DISPATCH DATE</th>
                                                            <th className="ap_d_gborder">QR Codes</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {isTableVisible && (
                                                            filteredTableData.map((group, workOrderIndex) => {
                                                                const workOrderEntries = Object.entries(group.parties);
                                                                const isLastGroup = workOrderIndex === filteredTableData.length - 1;

                                                                // Calculate total row span for the work order
                                                                let totalWorkOrderRowSpan = 0;
                                                                workOrderEntries.forEach(([partyName, party]) => {
                                                                    Object.entries(party.cities).forEach(([city, entries]) => {
                                                                        totalWorkOrderRowSpan += entries.length;
                                                                    });
                                                                });
                                                                return (
                                                                    <React.Fragment key={workOrderIndex}>
                                                                        {workOrderEntries.map(([partyName, party], partyIndex) => {
                                                                            // Calculate total row span for the party
                                                                            let totalPartyRowSpan = 0;
                                                                            Object.entries(party.cities).forEach(([city, entries]) => {
                                                                                totalPartyRowSpan += entries.length;
                                                                            });
                                                                            return Object.entries(party.cities).map(([city, entries], cityIndex) => {
                                                                                const isLastCity = cityIndex === Object.entries(party.cities).length - 1;
                                                                                return entries.map((entry, entryIndex) => {
                                                                                    const isLastEntry =
                                                                                        isLastGroup && isLastCity && entryIndex === entries.length - 1;
                                                                                    const isLastEntryInParty = entryIndex === entries.length - 1;
                                                                                    const isFirstEntryInWorkOrder = entryIndex === 0 && partyIndex === 0 && cityIndex === 0;

                                                                                    const shouldPrintWorkOrder = isFirstEntryInWorkOrder;



                                                                                    // Calculate rowSpan for work order, party, and city columns
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
                                                                                            className={`${isLastEntryInParty ? 'no-bottom-border' : ''}
                                                                                            ${isLastEntry ? 'last-entry-border' : ''}`}
                                                                                        >
                                                                                            {/* Print Work Order */}
                                                                                            {shouldPrintWorkOrder && (
                                                                                                <td
                                                                                                    rowSpan={workOrderRowSpan}
                                                                                                    className={`airplug_grinding_party-name-cell ${isLastEntryInParty ? 'no-bottom-border' : ''}`}
                                                                                                    style={{
                                                                                                        borderTop: '1px dotted black',
                                                                                                        verticalAlign: "top"
                                                                                                    }}
                                                                                                >
                                                                                                    <strong
                                                                                                        className="airplug_grinding_p_span">
                                                                                                        <span>{group.workOrderNo}</span>
                                                                                                    </strong>

                                                                                                </td>
                                                                                            )}
                                                                                            {!shouldPrintWorkOrder && entryIndex === 0 && (
                                                                                                <td
                                                                                                    rowSpan={partyRowSpan}
                                                                                                    className="airplug_grinding_party-name-cells"
                                                                                                    style={{
                                                                                                        pageBreakInside: 'avoid',
                                                                                                        verticalAlign: 'top',
                                                                                                    }}
                                                                                                >
                                                                                                </td>
                                                                                            )}
                                                                                            {/* Display SUB SR NO */}
                                                                                            <td className="ap_d_gborder">{entry.sub_sr_no}</td>
                                                                                            {/* Display other fields */}
                                                                                            <td className="ap_d_gborder">{entry.qty}</td>
                                                                                            <td className="ap_d_gborder blank">{entry.drilling_size}</td>
                                                                                            <td className="ap_d_gborder blank">{parseFloat(entry.cdx).toFixed(2)}</td>
                                                                                            <td className="ap_d_gborder blank">{entry.units}</td>
                                                                                            <td className="ap_d_gborder blank">{parseFloat(entry.ReamSize).toFixed(2)}</td>
                                                                                            <td className="ap_d_gborder blank">{parseFloat(entry.CounterSize).toFixed(2)}</td>
                                                                                            <td className="ap_d_gborder blank">{entry.bore_jet_type}</td>
                                                                                            <td className="ap_d_gborder blank">{entry.jet_count}</td>
                                                                                            <td className="ap_d_gborder blank">{entry.remark}</td>
                                                                                            <td className="ap_d_gborder blank">__/__/__</td>
                                                                                            <td className="ap_d_gborder Id">{entry.t_dispatch_week}</td>
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
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AirPlugDrillingChart;