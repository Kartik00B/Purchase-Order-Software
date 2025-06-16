import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const navigate = useNavigate();

    const handleRedirect = () => {
        const record_sr_no = "4554"; // Replace with your dynamic value
        navigate(`/progress/${record_sr_no}`);
    };

    return (
        <div>
            <h1>Welcome to the Tracking System</h1>
            <button onClick={handleRedirect}>Go to Progress Bar</button>
        </div>
    );
};

export default HomePage;
