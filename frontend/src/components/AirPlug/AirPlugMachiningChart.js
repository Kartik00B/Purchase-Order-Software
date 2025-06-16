import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import './AirPlugMachiningChart.css';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';

const AirPlugMachiningChart = () => {
    const [fromWorkOrderNo, setFromWorkOrderNo] = useState('');
    const [toWorkOrderNo, setToWorkOrderNo] = useState('');
    const [enabledCharts, setEnabledCharts] = useState({ BB: null, TB: null });
    const [isDateRangeSelected, setIsDateRangeSelected] = useState(false);
    const [filteredTableData, setFilteredTableData] = useState([]);
    const [tableVisible, setTableVisible] = useState(false);
    const [mergedData, setMergedData] = useState([]);
    const [chartButtonsVisible, setChartButtonsVisible] = useState(true);
    const [filteredData, setFilteredData] = useState([]);
    const lastFilter = useRef(null);
    // const printRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isTableVisible, setIsTableVisible] = useState(false);
    const navigate = useNavigate();
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const [currentChartType, setCurrentChartType] = useState(null);
    const [currentChartRange, setCurrentChartRange] = useState(null);




    const BB_RANGES = [
        { "type": "BB Chart Range From 2.50 - 70.00", label: 'BB 2.50-70.00', min: 2.5, max: 70.0 },
        { "type": "BB Chart Range From 70.00 - Above", label: 'BB 70.00-Above', min: 70.0, max: Infinity },
    ];

    const TB_RANGES = [
        { "type": "TB Chart Range From 2.50 - 70.00", label: 'TB 2.50-70.00', min: 2.5, max: 70.0 },
        { "type": "TB Chart Range From 70.00 - Above", label: 'TB 70.00-Above', min: 70.0, max: Infinity },
    ];

    // State to track the applicability of each chart range
    const [isBBApplicable, setIsBBApplicable] = useState({ "BB 2.50-70.00": false, "BB 70.00-Above": false });
    const [isTBApplicable, setIsTBApplicable] = useState({ "TB 2.50-70.00": false, "TB 70.00-Above": false });

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

    // Fetch and organize machining data
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
            // console.log("Raw Data:", rawData);
            // console.log("Finish Sizes:", finishSizes);
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
                    finish_size: parseFloat(curr.finish_size).toFixed(4),
                    rough_size: curr.rough_size,
                    under_size: curr.under_size,
                    dep: curr.dep,
                    t_dispatch_week: curr.t_dispatch_week,
                    machining_size: curr.machining_size,
                    chart_range: curr.chart_range,
                    nominal_size: curr.nominal_size,
                };
                return acc;
            }, {});

            const mergedData = rawData.map((entry) => {
                const sizeDetails = finishSizeMap[entry.record_sr_no] || {};
                return {
                    ...entry,
                    finish_size: sizeDetails.finish_size || "N/A",
                    rough_size: sizeDetails.rough_size || "N/A",
                    under_size: sizeDetails.under_size || "N/A",
                    dep: sizeDetails.dep || "N/A",
                    t_dispatch_week: sizeDetails.t_dispatch_week || "N/A",
                    machining_size: sizeDetails.machining_size || "N/A",
                    chart_range: sizeDetails.chart_range || "N/A",
                    nominal_size: sizeDetails.nominal_size || "N/A",
                };
            });
            // console.log("Merged Data:", mergedData);
            applyTBAndBBFilter(mergedData);
            setMergedData(mergedData);
        };

        loadData();
    }, [fetchData]);

    const applyFilters = async () => {
        const { rawData, finishSizes } = await fetchData(fromWorkOrderNo, toWorkOrderNo);
        const recordSrNos = new Set(rawData.map(item => item.record_sr_no));
        const filteredFinishSizes = finishSizes.filter(item => recordSrNos.has(item.record_sr_no));
        const finishSizeMap = filteredFinishSizes.reduce((acc, curr) => {
            acc[curr.record_sr_no] = {
                finish_size: parseFloat(curr.finish_size).toFixed(4),
                rough_size: curr.rough_size,
                under_size: curr.under_size,
                dep: curr.dep,
                t_dispatch_week: curr.t_dispatch_week,
                machining_size: curr.machining_size,
                chart_range: curr.chart_range,
                nominal_size: curr.nominal_size,
            };
            return acc;
        }, {});

        const mergedData = rawData.map((entry) => {
            const sizeDetails = finishSizeMap[entry.record_sr_no] || {};
            return {
                ...entry,
                finish_size: sizeDetails.finish_size || "N/A",
                rough_size: sizeDetails.rough_size || "N/A",
                under_size: sizeDetails.under_size || "N/A",
                dep: sizeDetails.dep || "N/A",
                t_dispatch_week: sizeDetails.t_dispatch_week || "N/A",
                machining_size: sizeDetails.machining_size || "N/A",
                chart_range: sizeDetails.chart_range || "N/A",
                nominal_size: sizeDetails.nominal_size || "N/A",
            };
        });
        applyTBAndBBFilter(mergedData);
        setMergedData(mergedData);
        setIsDateRangeSelected(true);
    };

    //Filter for apply tb and bb charts
    const applyTBAndBBFilter = (mergedData) => {
        if (!mergedData || mergedData.length === 0) {
            setIsBBApplicable({ "BB 2.50-70.00": false, "BB 70.00-Above": false });
            setIsTBApplicable({ "TB 2.50-70.00": false, "TB 70.00-Above": false });
            setEnabledCharts({ BB: null, TB: null }); // Disable all charts if no data
            return;
        }

        const bbApplicable = { "BB 2.50-70.00": false, "BB 70.00-Above": false };
        const tbApplicable = { "TB 2.50-70.00": false, "TB 70.00-Above": false };

        mergedData.forEach((item) => {
            const { chart_range: chartRange, machining_size: machiningSize } = item;
            const isMachiningSizeValid = (min, max) => machiningSize >= min && machiningSize <= max;
            const isMachiningSizeAbove = (min) => machiningSize > min;

            if (chartRange === 'BB 2.50-70.00' && isMachiningSizeValid(2.5, 70)) {
                bbApplicable["BB 2.50-70.00"] = true;
            }
            if (chartRange === 'BB 70.00-Above' && isMachiningSizeAbove(70)) {
                bbApplicable["BB 70.00-Above"] = true;
            }
            if (chartRange === 'TB 2.50-70.00' && isMachiningSizeValid(2.5, 70)) {
                tbApplicable["TB 2.50-70.00"] = true;
            }
            if (chartRange === 'TB 70.00-Above' && isMachiningSizeAbove(70)) {
                tbApplicable["TB 70.00-Above"] = true;
            }
        });

        setIsBBApplicable(bbApplicable);
        setIsTBApplicable(tbApplicable);
        setEnabledCharts({
            BB: Object.values(bbApplicable).some((value) => value) ? Object.keys(bbApplicable) : null,
            TB: Object.values(tbApplicable).some((value) => value) ? Object.keys(tbApplicable) : null,
        });
    };
     // Handle viewing a specific chart
    const handleViewChart = (chartType, sizeRange) => {
        const isApplicable = chartType === 'BB' ? isBBApplicable : isTBApplicable;
        if (!isApplicable[`${chartType} ${sizeRange}`]) {
            return; // Don't proceed if the chart type is not applicable
        }
        const [minSize, maxSize] = sizeRange.split('-').map(parseFloat);

        // Filter the data based on chart type and size range
        const filteredData = mergedData.filter(entry =>
            entry.chart_range === `${chartType} ${sizeRange}` &&
            entry.machining_size >= minSize &&
            (maxSize ? entry.machining_size <= maxSize : true)
        );
        setCurrentChartType(chartType); // Update the chart type
        setCurrentChartRange(sizeRange); // Update the chart range
        
        // Organize the filtered data by work order and then by party
        const organizedData = filteredData.reduce((acc, entry) => {
            const workOrderNo = entry.work_order_no.trim();
            const partyName = entry.party_name.trim();
            const city = entry.city.trim();

            if (!acc[workOrderNo]) {
                acc[workOrderNo] = { parties: {} };
            }

            if (!acc[workOrderNo].parties[partyName]) {
                acc[workOrderNo].parties[partyName] = {cities: {}};
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
        setFilteredTableData(dataArray);
        console.log(filteredTableData);
        setTableVisible(true);
        setChartButtonsVisible(false);
        setIsTableVisible(true);
        lastFilter.current = { chartType, sizeRange, filteredData: dataArray };
    };
      // Helper function to generate chart buttons
    const getChartButtons = (chartType) => {
        const ranges = chartType === 'BB' ? BB_RANGES : TB_RANGES;
        const isApplicable = chartType === 'BB' ? isBBApplicable : isTBApplicable;
        return ranges.map((range) => (
            <div className='airplug-machining-chart-card' key={range.label}>
                <h4 className="airplug-machining-chart-card-title">
                    Chart Range of the 
                    
                    {range.label}
                </h4>
                <button
                    className={`airplug-machining-chart-button ${!isApplicable[range.label] ? 'chart-button-disabled' : ''}`}
                    onClick={() => handleReViewChart(chartType, range.label.split(' ')[1])}
                >
                    View Chart
                </button>
            </div>
        ));
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
    const handleReViewChart = (chartType, sizeRange) => {
        if (lastFilter.current && lastFilter.current.chartType === chartType && lastFilter.current.sizeRange === sizeRange) {
            setFilteredTableData(lastFilter.current.filteredData);
            console.log(filteredData);
            setTableVisible(true);
            setChartButtonsVisible(false);
        } else {
            handleViewChart(chartType, sizeRange)
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
    
                th.ap_m_gborder {
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

    // const handleSearch = (e) => {
    //     const query = e.target.value.toLowerCase();
    //     setSearchQuery(query);
    //     if (query === "") {
    //         setFilteredData(mergedData);
    //     } else {
    //         setFilteredData(
    //             filteredTableData.filter(group => {
    //                 const searchFields = [
    //                     group.workOrderNo,
    //                     ...Object.keys(group.parties), // Include party names
    //                     ...Object.values(group.parties).flatMap(party => Object.keys(party.cities)), // Include city names
    //                     ...Object.values(group.parties).flatMap(party => Object.values(party.cities)).flat() // Include all entries
    //                 ];

    //                 return searchFields.some(field => {
    //                     if (typeof field === 'object' && field !== null && typeof field.sub_sr_no !== 'undefined') {
    //                         // If it's an entry, check all properties including sub_sr_no
    //                         return Object.values(field).some(val => {
    //                             const normalizedValue = (typeof val === 'string' ? val : String(val)).toLowerCase();
    //                             return normalizedValue.includes(query);
    //                         });
    //                     } else {
    //                         // If it's not an object or it's null, check it directly
    //                         const normalizedField = (typeof field === 'string' ? field : String(field)).toLowerCase();
    //                         return normalizedField.includes(query);
    //                     }
    //                 });
    //             })
    //         );
    //     }
    // };


    // const handleSearch = (e) => {
    //     const query = e.target.value.toLowerCase();
    //     setSearchQuery(query);
    //     if (query === "") {
    //         setFilteredData(filteredData);
    //     } else {
    //         setFilteredData(
    //             filteredData.filter((entry) =>
    //                 Object.values(entry).some((val) =>
    //                     String(val).toLowerCase().includes(query)
    //                 )
    //             )
    //         );
    //     }
    // };



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



    return (
        <div className='airplug-machining-chart-selection-page'>
            <div className="airplug_machining_data_entry__container">
                <div className="airplug_machining_table_container">

                        {!isDateRangeSelected && (
                    <div className="airplug_machining-work-order-range-container">
                            <div className="airplug_machining-work-order-range-section">
                                <button className="back-button" onClick={() => navigate(-1)}>⬅ Back</button>
                                <h2 className="airplug_machining-work-order-range-title1">Air Plug  <br/>Machining Chart</h2>
                                <h3 className="airplug_machining-work-order-range-title2">Select Work Order Range</h3>
                                <div className="airplug_machining-work-order-range-inputs">

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
                            </div>
                        )}

                        {chartButtonsVisible && isDateRangeSelected && (
                            <div className="airplug_machining-chart-options-container">
                                    <button className="airplug-machining-chart-back-button" onClick={() => navigate(-1)}>⬅ Back</button>

                                    <h2 className='airplug-machining-chart-options-header'>BB Chart Options</h2>
                                    {/* <br/> */}
                                <div className='airplug-machining-chart-options'>
                                 {getChartButtons('BB')}
                                </div>
                                <h2 className='airplug-machining-chart-options-header'>TB Chart Options</h2>
                                <div className='airplug-machining-chart-options'>
                                  {getChartButtons('TB')}
                                </div>
                            </div>
                        )}
                        <div className="airplug_machining_search-container">
                            {tableVisible && (
                                <div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={handleSearch}
                                        placeholder="Search data..."
                                        className="history-search"
                                    />
                                    <div className="airplug_machining_table-container">
                                        <button className='chart-back-button' onClick={handleBackButtonClick}>⬅ Back</button>
                                        <button onClick={handlePrint} className="airplug_machining_data_entry_button">
                                            Print Report
                                        </button>
                                        <div className="airplug_machining_data_container" ref={printRef}>
                                            {currentChartType && currentChartRange && (
                                            <table className="airplug_machining_data_entry__table">
                                                <thead>
                                                    <tr className="h-title">
                                                    <img src="/LogoNew.png" style={{width: "0px"}} alt=""></img>
                                                    <th colSpan="14"
                                                            className="airplug_machining_data_table_title_1 title_1">
                                                            AirPlug: Machining Chart : {currentChartType}
                                                            <br />
                                                            Range: {currentChartRange} 
                                                        </th>
                                                    </tr>
                                                    <tr className="t-head">
                                                        <th className="ap_m_gborder blank work">Work Order No</th>
                                                        <th className="ap_m_gborder">SUB SR NO.</th>
                                                        <th className="ap_m_gborder">QTY</th>
                                                        <th className="ap_m_gborder">MACHINING SIZE</th>
                                                        <th className="ap_m_gborder">REMARK</th>
                                                        <th className="ap_m_gborder">COMPLETE DATE</th>
                                                        <th className="ap_m_gborder Id">TENTATIVE DISPATCH DATE</th>
                                                        <th className="ap_m_gborder">QR Codes</th>
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

                                                                                {/* Print Party and City only for the first row */}
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
                                                                                        <td className="ap_m_gborder">{entry.sub_sr_no}</td>
                                                                                        {/* Display other fields */}
                                                                                        <td className="ap_m_gborder">{entry.qty}</td>
                                                                                        <td className="ap_m_gborder blank">{entry.machining_size}</td>
                                                                                        <td className="ap_m_gborder blank">{entry.remark}</td>
                                                                                        <td className="ap_m_gborder blank">__/__/__</td>
                                                                                        <td className="ap_m_gborder Id">{entry.t_dispatch_week}</td>
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
    );
};

export default AirPlugMachiningChart;