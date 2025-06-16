import React, {useState, useEffect, useCallback} from "react";
import {FaCogs, FaTools, FaSearch, FaBuffer, FaWater, FaCar} from "react-icons/fa";
import {useParams, useNavigate} from "react-router-dom";
import "./ProgressBar.css";
import io from "socket.io-client";
import BASE_URL from "./config";
import SplashScreen from "./SplashScreen"; // Import the SplashScreen component


const ProgressBar = () => {
    const {record_sr_no, party_name} = useParams();
    const navigate = useNavigate();                              
    const [currentStage, setCurrentStage] = useState(0);
    const [history, setHistory] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 980);
    const [loading, setLoading] = useState(true);
    const [rejection_remark, setRejectionRemark] = useState("");
    const [isRejected, setIsRejected] = useState(false);  // Track if the order is rejected
    const [isLoading, setIsLoading] = useState(false);  // To track the loading state
    const [error, setError] = useState(null);
    const [newWorkOrder] = useState("");
    const [newSubSrNo] = useState("");
    const [componentType, setComponentType] = useState('');

    // Define stages for each component type
    const airPlugStages = [
        {label: "Milling", icon: <FaCogs/>},
        {label: "Grinding", icon: <FaTools/>},
        {label: "Inspection", icon: <FaSearch/>},
        {label: "Lapping", icon: <FaBuffer/>},
        {label: "Jet Fitting", icon: <FaWater/>},
        {label: "Order Ready", icon: <FaCar/>},
    ];

    const airRingStages = [
        {label: "Turning", icon: <FaCogs/>},
        {label: "Grinding", icon: <FaTools/>},
        {label: "Inspection", icon: <FaSearch/>},
        {label: "Lapping", icon: <FaBuffer/>},
        {label: "Order Ready", icon: <FaCar/>},
    ];

    const airSnapStages = [
        {label: "Inspection", icon: <FaSearch/>},
        {label: "Turning", icon: <FaCogs/>},
        {label: "Grinding", icon: <FaTools/>},
        {label: "Order Ready", icon: <FaCar/>},
    ];

    // Function to get the appropriate stages based on component type
    const getStagesForComponent = useCallback((type) => {
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
    }, []);

    const [currentStages, setCurrentStages] = useState(airPlugStages);

    const fetchProgress = useCallback(async () => {
        try {
            const response = await fetch(`${BASE_URL}:5000/ProgressBar/${record_sr_no}/${party_name}`);
            const data = await response.json();
            if (data.currentStage !== undefined) {
                setCurrentStage(data.currentStage);
            }

            // Check if the status is rejected
            if (data.status === "rejected") {
                alert(`This entry is rejected. Reason: ${data.rejection_remark}`);
            }
        } catch (error) {
            console.error("Error fetching progress:", error);
        } finally {
            setLoading(false);
        }
    }, [record_sr_no, party_name]);

    const fetchHistory = useCallback(async () => {
        try {
            const response = await fetch(`${BASE_URL}:5000/fetch-progress?record_sr_no=${record_sr_no}`);
            const result = await response.json();

            if (response.ok && result.data) {
                setHistory(result.data);
                // Get the component type from the first history entry
                if (result.data.length > 0) {
                    const type = result.data[0].type;
                    setComponentType(type);
                    setCurrentStages(getStagesForComponent(type));
                }
            } else {
                console.error("Failed to fetch history:", result.error || "Unknown error");
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    }, [record_sr_no, getStagesForComponent]);

    const fetchStatus = async () => {
        try {
            const response = await fetch(`${BASE_URL}:5000/get-order-status?record_sr_no=${record_sr_no}`);
            const data = await response.json();

            if (data.status === "Rejected") {
                setIsRejected(true);
                setRejectionRemark(data.rejection_remark);
            } else {
                setIsRejected(false);
                setRejectionRemark('');
            }
        } catch (error) {
            console.error("Error fetching status:", error);
            setError("Failed to fetch order status.");
        }
    };

    useEffect(() => {
        fetchStatus();  // Fetch the status when the component mounts
    }, []);
    
    const saveProgress = async (stageIndex, subSrNo, workOrderNo) => {
        try {
            const response = await fetch(
                `${BASE_URL}:5000/ProgressBar/${record_sr_no}/${party_name}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        current_stage: stageIndex,
                        work_order_no: workOrderNo,
                        sub_sr_no: subSrNo,
                        component_type: componentType,
                        stage_label: currentStages[stageIndex]?.label || "Unknown Stage"
                    }),
                }
            );
            const data = await response.json();
            if (data.success) {
                setCurrentStage(data.currentStage);
                const newHistoryEntry = {
                    stage: stageIndex,
                    work_order_no: workOrderNo,
                    sub_sr_no: subSrNo,
                    type: componentType,
                    stage_label: currentStages[stageIndex]?.label || "Unknown Stage"
                };
                setHistory(prevHistory => [...prevHistory, newHistoryEntry]);
            } else {
                throw new Error("Failed to save progress");
            }
        } catch (error) {
            console.error("Error saving progress:", error);
            alert("Failed to save progress. Please try again.");
        }
    };
    useEffect(() => {
        const socket = io("http://localhost:5000");
        socket.on("stageUpdate", (data) => {
            if (data.record_sr_no === record_sr_no && data.party_name === party_name) {
                setCurrentStage(data.current_stage);
            }
        });
        const interval = setInterval(fetchProgress, 2000);
        fetchProgress();
        fetchHistory();
        fetchStatus();
        return () => {
            clearInterval(interval);
            socket.disconnect();
        };
    }, [record_sr_no, party_name, fetchProgress, fetchHistory, fetchStatus]);
    const handleEditStage = async () => {
        const stageIndex = parseInt(prompt("Enter the stage no.: "), 10) - 1;
        if (isNaN(stageIndex) || stageIndex < 0 || stageIndex >= currentStages.length) {
            alert("Invalid stage number. Please enter a valid number between 1 & " + currentStages.length);
            return;
        }
        await saveProgress(stageIndex);
        setCurrentStage(stageIndex);
    };
    const handleReset = async () => {
        try {
            // Fetch the most recent history entry to keep the work_order_no and sub_sr_no intact
            const lastEntry = history[history.length - 1];
            const workOrderNo = lastEntry?.work_order_no || newWorkOrder;  // Keep the most recent or user-entered value
            const subSrNo = lastEntry?.sub_sr_no || newSubSrNo;  // Keep the most recent or user-entered value
            // Only reset the current stage to 0
            const response = await fetch(
                `${BASE_URL}:5000/ProgressBar/${record_sr_no}/${party_name}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        current_stage: 0,  // Reset the stage to 0
                        work_order_no: workOrderNo,  // Keep work_order_no unchanged
                        sub_sr_no: subSrNo,  // Keep sub_sr_no unchanged
                    }),
                }
            );
            const data = await response.json();
            if (data.success) {
                setCurrentStage(0);  // Reset the current stage in the UI
                alert("Progress reset successfully.");
            } else {
                throw new Error("Failed to reset progress.");
            }
        } catch (error) {
            console.error("Error resetting progress:", error);
            alert("Failed to reset progress. Please try again.");
        }
    };
    const handleCancel = () => {
        navigate("../DailyEntries");
    };
    const updateLayout = () => {
        setIsMobile(window.innerWidth <= 980);
    };
    useEffect(() => {
        window.addEventListener("resize", updateLayout);
        return () => window.removeEventListener("resize", updateLayout);
    }, []);
    useEffect(() => {
        const fetchRejectionStatus = async () => {
            try {
                const response = await fetch(
                    `${BASE_URL}:5000/ProgressBar/${record_sr_no}/${party_name}`
                );
                const data = await response.json();

                if (data.status === "Rejected") {
                    alert(`This entry has been Rejected. Reason: ${data.rejection_remark}`);
                }
            } catch (error) {
                console.error("Error fetching rejection status:", error);
            }
        };
        fetchRejectionStatus();
    }, [record_sr_no, party_name]);
    const progressStyle = {
        ...(isMobile
            ? {height: `${(currentStage / (currentStages.length - 1)) * 80}%`}
            : {width: `${(currentStage / (currentStages.length - 1)) * 80}%`}),

        background: isRejected
            ? (isMobile
                    ? "linear-gradient(to bottom, #151ebd, #ff4c4c)"  // Vertical red gradient
                    : "linear-gradient(90deg, rgba(24, 34, 243, 0.99), #ff4c4c)" // Horizontal red gradient
            )
            : ""
    };
    if (loading) {
        return <SplashScreen />;
    }
    const currentStageLabel = currentStages[currentStage]?.label || "Unknown Stage";
    const handleStageAndWorkOrder = async () => {
        // Ensure we are not exceeding the last stage
        const nextStage = Math.min(currentStage + 1, currentStages.length - 1);
        // Automatically fetch values from history or use the most recent entry
        const lastEntry = history[history.length - 1];
        const workOrderNo = lastEntry?.work_order_no || newWorkOrder;
        const subSrNo = lastEntry?.sub_sr_no || newSubSrNo;
        if (!workOrderNo || !subSrNo) {
            alert("Work Order Number and Sub Serial Number are required.");
            return;
        }
        try {
            // Step 1: Save the current stage progress
            const saveResponse = await fetch(
                `${BASE_URL}:5000/ProgressBar/${record_sr_no}/${party_name}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        current_stage: nextStage,
                        work_order_no: workOrderNo,
                        sub_sr_no: subSrNo,
                    }),
                }
            );
            const saveResult = await saveResponse.json();
            if (saveResult.success) {
                setCurrentStage(saveResult.currentStage);
                // Step 2: Add or update the work order after saving progress
                const addResponse = await fetch(`${BASE_URL}:5000/addWorkOrder`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        record_sr_no,
                        party_name,
                        work_order_no: workOrderNo,
                        sub_sr_no: subSrNo,
                    }),
                });
                const addResult = await addResponse.json();
                if (addResult.success) {
                    alert(`${currentStageLabel} stage completed successfully.`);
                    fetchHistory(); // Refresh history to include the new entry
                } else {
                    alert("Failed to add work order. It may already exist.");
                }
            } else {
                throw new Error("Failed to update the stage.");
            }
        } catch (error) {
            console.error("Error handling stage and work order:", error);
            alert("Failed to update stage and work order. Please try again.");
        }
    }

    const handleRejectEntry = async () => {
        // Prompt the user for rejection reason
        const rejection_remark = prompt("Please enter the reason for Rejection:");
        if (!rejection_remark) {
            alert("Rejection reason is required to proceed.");
            return;
        }
    
        // Get the specific entry details
        const lastEntry = history[history.length - 1];
        const workOrderNo = lastEntry?.work_order_no || newWorkOrder;
        const subSrNo = lastEntry?.sub_sr_no || newSubSrNo;
    
        if (!workOrderNo || !subSrNo) {
            alert("Work Order Number and Sub Serial Number are required.");
            return;
        }
    
        setIsLoading(true);
        setError(null);
    
        try {
            const rejectResponse = await fetch(`${BASE_URL}:5000/reject-entry`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    record_sr_no: record_sr_no,        // Add record_sr_no
                    work_order_no: workOrderNo,
                    sub_sr_no: subSrNo,
                    status: "Rejected",
                    rejection_remark: rejection_remark,
                }),
            });
    
            if (rejectResponse.ok) {
                const rejectResult = await rejectResponse.json();
                console.log('Rejection response:', rejectResult);
    
                if (rejectResult.success) {
                    alert("Entry rejected successfully.");
                    fetchHistory();
                    fetchStatus();
                } else {
                    alert(rejectResult.message || "Failed to reject the entry. Please try again.");
                }
            } else {
                const errorData = await rejectResponse.json();
                alert(errorData.message || "Failed to reject the entry due to server error.");
            }
        } catch (error) {
            console.error("Error rejecting the entry:", error);
            setError("Failed to reject the entry. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
// Check for rejected status and display it on the progress bar
    return (
        <div className="progress_bar_stage_container">
            <div className="progress-container">
                <div className="Progress_bar_container">
                    {history.length > 0 ? (
                        <ul>
                            {history.map((entry, index) => (
                                <li
                                    key={index}
                                    style={{listStyle: "none", alignContent: "start"}}
                                    className={entry.stage === currentStage ? "current-stage" : ""}
                                >
                                    <div className="progress-title">
                                        <h3 className="Progress_bar_title">
                                            <span className="component-type">{entry.type}</span>
                                            <br/>
                                            Work Order: {entry.work_order_no}
                                            <br/>
                                            Sub S. No: {entry.sub_sr_no}
                                            <br/>
                                            {party_name}
                                        </h3>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No history available.</p>
                    )}
                    <div className="current-stage-label">
                        Current Stage: <br/>
                        <span
                            style={isRejected ? {color: "#db0202", fontWeight: "bold", marginLeft: "5px"} : {}}
                        >
                            {currentStage} - {isRejected ? "Rejected" : currentStages[currentStage]?.label || "Unknown Stage"}
                        </span>
                    </div>
                    <div className={`progress-bar ${isMobile ? "vertical" : "horizontal"}`}>
                        <div className="progress-bar-line" style={progressStyle}/>
                        {currentStages.map((stage, index) => (
                            <div
                                key={index}
                                className={`progress-step ${index <= currentStage ? "completed" : ""}`}
                                onClick={() => !isRejected && handleStageAndWorkOrder(index, history[index]?.sub_sr_no)}
                                aria-label={`Progress step: ${stage.label}`}
                                style={{
                                    pointerEvents: index > currentStage ? "none" : "auto",
                                    opacity: index > currentStage ? 0.8 : 1
                                }}
                            >
                                <div
                                    className="circle"
                                    style={
                                        index === currentStage && isRejected
                                            ? {backgroundColor: "red", color: "white", border: "2px solid #b78787de"}
                                            : index > currentStage
                                                ? {opacity: 1.5}
                                                : {}
                                    }
                                >
                                    {index < currentStage
                                        ? "✓"
                                        : index === currentStage && isRejected
                                            ? "✘"
                                            : stage.icon}
                                </div>
                                <p
                                    style={{
                                        color: index === currentStage && isRejected ? "#d30707" : "black",
                                        fontWeight: index === currentStage && isRejected ? "bold" : "normal",
                                        opacity: index > currentStage ? 1 : 1,
                                        textAlign: window.innerWidth <= 980 ? "left" : "center",
                                        marginLeft: window.innerWidth <= 980 ? "10px" : "0",
                                    }}
                                >
                                    {stage.label}
                                    {index === currentStage && isRejected && rejection_remark && (
                                        <span style={{
                                            fontSize: "1rem",
                                            color: "#d30707",
                                            display: "block",
                                            marginTop: "4px"
                                        }}>
                                            {`Remark: ${rejection_remark}`}
                                        </span>
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="progress-bar-buttons">
                        <button
                            onClick={handleStageAndWorkOrder}
                            className="btn-add progress_btn"
                            disabled={isRejected}  // Disable button if rejected or loading
                            style={{cursor: isRejected ? 'not-allowed' : 'pointer'}}

                        >
                            {isLoading ? 'Updating...' : 'Update Stage'}
                        </button>
                        <button
                            onClick={handleEditStage}
                            className="btn-edit progress_btn"
                            disabled={isRejected}  // Disable button if rejected or loading
                            style={{cursor: isRejected ? 'not-allowed' : 'pointer'}}

                        >
                            {isLoading ? 'Editing...' : 'Edit Stage'}
                        </button>
                        
                        <button className="btn-cancel progress_btn" style={{cursor: 'pointer'}} onClick={() => navigate(-1)}>Back</button>

                        <button
                            onClick={handleReset}
                            className="btn-reset progress_btn"
                            disabled={isRejected}  // Disable button if rejected or loading
                            style={{cursor: isRejected ? 'not-allowed' : 'pointer'}}

                        >
                            Reset
                        </button>

                        <button
                            onClick={handleRejectEntry}
                            className="btn-reject progress_btn"
                            disabled={isRejected}  // Disable reject button if loading or already rejected
                            style={{cursor: isRejected ? 'not-allowed' : 'pointer'}}

                        >
                            Reject

                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ProgressBar;
