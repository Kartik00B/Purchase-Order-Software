import React, {useState, useEffect} from "react";
import "./WorkOrderDetails.css";
import {FaBuffer, FaCar, FaCogs, FaSearch, FaTools, FaWater} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const WorkOrderDetails = () => {
    const [workOrderNo, setWorkOrderNo] = useState("");
    const [historyData, setHistoryData] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const backendUrl = process.env.REACT_APP_BACKEND_URL || "";

    // Define stages for each component type
    const airPlugStages = [
        {id: 0, label: "Milling", icon: <FaCogs/>},
        {id: 1, label: "Grinding", icon: <FaTools/>},
        {id: 2, label: "Inspection", icon: <FaSearch/>},
        {id: 3, label: "Lapping", icon: <FaBuffer/>},
        {id: 4, label: "Jet Fitting", icon: <FaWater/>},
        {id: 5, label: "Order Ready", icon: <FaCar/>},
    ];

    const airRingStages = [
        {id: 0, label: "Turning", icon: <FaCogs/>},
        {id: 1, label: "Grinding", icon: <FaTools/>},
        {id: 2, label: "Inspection", icon: <FaSearch/>},
        {id: 3, label: "Lapping", icon: <FaBuffer/>},
        {id: 4, label: "Order Ready", icon: <FaCar/>},
    ];

    const airSnapStages = [
        {id: 0, label: "Inspection", icon: <FaSearch/>},
        {id: 1, label: "Turning", icon: <FaCogs/>},
        {id: 2, label: "Grinding", icon: <FaTools/>},
        {id: 3, label: "Order Ready", icon: <FaCar/>},
    ];

    // Function to get stages based on component type
    const getStagesForComponent = (type) => {
        switch (type?.toLowerCase()) {
            case 'air plug':
                return airPlugStages;
            case 'air ring':
                return airRingStages;
            case 'air snap':
                return airSnapStages;
            default:
                return airPlugStages; // Default to Air Plug stages
        }
    };

    const fetchWorkOrderDetails = async () => {
        if (!workOrderNo) {
            setError("Please enter a work order number");
            setHistoryData([]);
            return;
        }

        try {
            const progressResponse = await fetch(
                `http://localhost:5000/progress-detail?work_order_no=${workOrderNo}`
            );
            if (!progressResponse.ok) throw new Error("Failed to fetch progress");
            const progressData = await progressResponse.json();

            const mergedData = progressData.data.map((order) => {
                const orderDate = new Date(order.timestamp);
                const formattedOrderDate = orderDate.toLocaleDateString("en-GB");
                const today = new Date();
                const timeDifference = today.getTime() - orderDate.getTime();
                const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));

                // Get the appropriate stages for this component type
                const componentStages = getStagesForComponent(order.type);

                return {
                    ...order,
                    date: formattedOrderDate,
                    daysDifference,
                    stages: order.stages.map((stage) => (
                        <div key={stage.current_stage}>
                            {componentStages[stage.current_stage]?.icon} {componentStages[stage.current_stage]?.label}
                        </div>
                    )),
                    rejection_remark: order.rejection_remark || "No Rejection Remark",
                    rejected_stage: order.stages[0]?.current_stage,
                    componentStages // Store the stages array for this component
                };
            });

            setHistoryData(mergedData);
            setError("");
        } catch (err) {
            console.error("Error fetching work order details:", err);
            setError("Failed to fetch data. Please try again later.");
            setHistoryData([]);
        }
    };

    const renderStageWarning = (daysDifference, type) => {
        // Adjust deadline based on component type
        let STAGE_DEADLINE = 5; // Default deadline
        switch (type?.toLowerCase()) {
            case 'air plug':
                STAGE_DEADLINE = 5;
                break;
            case 'air ring':
                STAGE_DEADLINE = 5;
                break;
            case 'air snap':
                STAGE_DEADLINE = 5;
                break;
            default:
                STAGE_DEADLINE = 5;
        }
        
        if (daysDifference > STAGE_DEADLINE) {
            return (
                <div style={{
                    backgroundColor: "#ff4444",
                    color: "white",
                    padding: "8px",
                    borderRadius: "4px",
                    marginTop: "8px",
                    fontWeight: "bold"
                }}>
                    ⚠️ Stage Delayed by {daysDifference - STAGE_DEADLINE} days!
                    <br/>
                    Maximum stage duration: {STAGE_DEADLINE} days
                </div>
            );
        } else {
            return (
                <div style={{
                    color: "white",
                    padding: "8px",
                    borderRadius: "4px",
                    marginTop: "8px"
                }}>
                    ⏳ {STAGE_DEADLINE - daysDifference} days remaining for this stage
                </div>
            );
        }
    };

    return (
        <div className="work-order-container">
            <button className="w_back-button" onClick={() => navigate(-1)}>⬅ Back</button>
            <h1 className="heading">Work Order Details</h1>

            <div className="input-container">
                <input
                    type="text"
                    value={workOrderNo}
                    onChange={(e) => setWorkOrderNo(e.target.value)}
                    placeholder="Enter Work Order Number"
                    className="input-field"
                />
                <button onClick={fetchWorkOrderDetails} className="fetch-button">
                    Fetch Details
                </button>
            </div>

            {error && <p className="error-message">{error}</p>}
            <table className="work-order-table">
                <thead>
                <tr className="table-header">
                    <th className="table-header-cell">Work Order No</th>
                    <th className="table-header-cell">Sub Sr No</th>
                    <th className="table-header-cell">Party Name</th>
                    <th className="table-header-cell">Date</th>
                    <th className="table-header-cell">Type</th>
                    <th className="table-header-cell">Remark</th>
                    <th className="table-header-cell">Rejection Remark</th>
                    <th className="table-header-cell">Current Stage</th>
                </tr>
                </thead>
                <tbody>
                {historyData.length > 0 ? (
                    historyData.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? "even-row" : "odd-row"}>
                            <td className="table-cell">{item.work_order_no}</td>
                            <td className="table-cell">{item.sub_sr_no}</td>
                            <td className="table-cell">{item.party_name}</td>
                            <td className="table-cell">{item.date}</td>
                            <td className="table-cell">{item.type}</td>
                            <td className="table-cell">{item.remark}</td>
                            <td className="table-cell">{item.rejection_remark}</td>
                            <td className={`table-cell ${
                                item.status === "Rejected" ? "rejected" :
                                item.stages.length === 0 ? "no-data" : "active"
                            }`}>
                                {item.status === "Rejected" ? (
                                    <div style={{ color: "white" }}>
                                        Rejected at {item.componentStages[item.rejected_stage]?.label}
                                    </div>
                                ) : item.stages.length > 0 ? (
                                    <>
                                        <div className="stage-item">
                                            {item.stages}
                                        </div>
                                        {renderStageWarning(item.daysDifference, item.type)}
                                    </>
                                ) : (
                                    "No Data Available for this order"
                                )}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="8" className="no-data-cell" style={{color: "red", fontWeight: "bold"}}>
                            No data available for this work order.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default WorkOrderDetails;