import React, {useEffect, useState} from "react";
import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";
import "./History.css";
import {QRCodeSVG} from "qrcode.react";
import BASE_URL from "./config";

const History = () => {
    const [historyData, setHistoryData] = useState([]); // Original data from API
    const [filteredData, setFilteredData] = useState([]); // Data after filtering
    const [startDate, setStartDate] = useState(""); // State for start date
    const [endDate, setEndDate] = useState(""); // State for end date
    const navigate = useNavigate(); // useNavigate hook for navigation
    const [isTableVisible, setIsTableVisible] = useState(false);
    const [isDateRangeSelected, setIsDateRangeSelected] = useState(false); // Track if date range is selected
    const {chartName} = useParams(); // To get the selected chart name from URL
    const [searchQuery, setSearchQuery] = useState("");

    const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";


    useEffect(() => {
        // Fetch history data from API
        axios
            .get("http://localhost:5000/history")
            .then((response) => {
                setHistoryData(response.data.data);
                setFilteredData(response.data.data); // Set filtered data initially
            })
            .catch((error) => {
                console.error("Error fetching history data:", error);
            });
    }, []);

    // Navigate to Dashboard
    const handleNavigate = () => {
        navigate("/AirPlug");
    };

    // Handle QR Code Click
    const handleQRCodeClick = (entry) => {
        if (entry.record_sr_no && entry.party_name) {
            const qrUrl = `${BASE_URL}:3000/ProgressBar/${entry.record_sr_no}/${entry.party_name}`;
            // console.log("QR Code Clicked:", qrUrl);
            navigate(`/ProgressBar/${entry.record_sr_no}/${entry.party_name}`);
        } else {
            console.error("Invalid entry data for QR code navigation:", entry);
        }
    };


    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        if (query === "") {
            setFilteredData(historyData);
        } else {
            setFilteredData(
                historyData.filter((entry) =>
                    Object.values(entry).some((val) =>
                        String(val).toLowerCase().includes(query)
                    )
                )
            );
        }
    };


    // Handle search and filter by both date range and search query
    const applyFilters = () => {
        let filtered = historyData;

        // Filter by date range
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // To ensure the end date includes the entire day

            filtered = filtered.filter((entry) => {
                const entryDate = new Date(entry.date); // Ensure entry has a date field in 'YYYY-MM-DD' format
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

    return (
        <div className="history__container">
            <div className="date-range-container">
                {!isDateRangeSelected && (
                    <div className="airsnap_grinding_table_container">
                        <h3 style={{fontSize: "38px", textAlign: "center", marginTop: "-5px"}}>Purchase History</h3>

                        <h3 style={{fontSize: "28px", textAlign: "center", marginTop: "-5px"}}>Select Date
                            Range</h3>
                        <div className="history-work-order-range-container">

                            {/*<br />*/}
                            <label className="history_label">
                                from Date:
                                <input
                                 className="history_input"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </label>
                            <label className="history_label">
                                to Date:
                                
                                <input
                                className="history_input"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </label>
                            <button className="air_snap_button" onClick={applyFilters}>Apply Filter</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Date Range Filter Inputs */}

            {/* History Table */}


                {/* Render the table only if the date range is selected or data is available */}
                {isDateRangeSelected && (
            <div className="grinding_search-container">
                    <div>
                                                    <button className="h-back-button" onClick={() => navigate(-1)}>⬅ Back</button>

                        <h3 className="history__title">History of Purchase Orders</h3>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearch}
                            placeholder="Search data..."
                            className="history-search"
                        />
                        <br/>
                        <div className="table-container">
                            <table className="history__table">

                                <thead>
                                <tr>
                                    <th>Work Order No</th>
                                    <th>Party Name</th>
                                    <th>Purchase Order</th>
                                    <th>Date</th>
                                    <th>Units</th>
                                    <th>Sub Sr No</th>
                                    <th>Nominal Size</th>
                                    <th>Size Low Tolerance</th>
                                    <th>Size High Tolerance</th>
                                    <th>BORE TYPE</th>
                                    <th>Higher/ Lower</th>
                                    <th>Dispatch week</th>
                                    <th>Remark</th>
                                    <th>QR Codes</th>
                                </tr>
                                </thead>
                                <tbody>

                                {filteredData.map((entry) => (
                                    <tr key={entry.record_sr_no}>
                                        <td>{entry.work_order_no}</td>
                                        <td>{entry.party_name}</td>
                                        <td>{entry.purchase_order}</td>
                                        <td>{entry.date}</td>
                                        <td>{entry.units}</td>
                                        <td>{entry.sub_sr_no}</td>
                                        <td>{entry.nominal_size}</td>
                                        <td>{entry.size_low_tolerance}</td>
                                        <td>{entry.size_high_tolerance}</td>
                                        <td>{entry.bore_type}</td>
                                        <td>{entry.higher_lower}</td>
                                        <td>{entry.dispatch_week}</td>
                                        <td className="remrk">{entry.remark}</td>
                                        <td
                                            className="qr-code"
                                            onClick={() => handleQRCodeClick(entry)}
                                            style={{cursor: "pointer"}}
                                        >
                                            <QRCodeSVG
                                                value={`${BASE_URL}:3000/ProgressBar/${entry.record_sr_no}/${entry.party_name}`}
                                                size={60}
                                                level="H"
                                            />
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            <div className="tab-navigation">
                                <button className="tab-button" onClick={handleNavigate}>
                                    Go to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
            </div>


                )}
            {/* Navigate to Dashboard Button */}
        </div>
    );
};

export default History;
