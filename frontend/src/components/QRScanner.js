import React from "react";
import { useNavigate } from "react-router-dom";

const QRScanner = () => {
    const navigate = useNavigate();

    const handleScan = (scannedData) => {
        const work_order_no = scannedData; // Assuming `scannedData` contains the `work_order_no`
        navigate(`/progress/${work_order_no}`); // Redirect to ProgressBar with work_order_no
    };

    return (
        <div>
            <h1>QR Scanner</h1>
            {/* Replace with your actual QR scanning logic */}
            <button onClick={() => handleScan("12345")}>Simulate QR Scan</button>
        </div>
    );
};

export default QRScanner;
