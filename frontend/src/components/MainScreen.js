import React, { useEffect } from "react";
import axios from "axios"; // Ensure axios is imported
import "./MainScreen.css";
import { useNavigate } from "react-router-dom";

const options = [
    { title: 'AirPlug', route: '/AirPlug', icon: '📊' },
    { title: 'AirRing', route: '/AirRing', icon: '📊' },
    { title: 'AirSnap', route: '/AirSnap', icon: '📊' },
];

function MainScreen() {
    const navigate = useNavigate(); // React Router's navigation hook

    const handleLogout = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            try {
                await axios.post("http://localhost:5000/logout", { userId: user.id });
                localStorage.removeItem("user"); // Clear user data from local storage
                navigate("/login"); // Redirect to login page
            } catch (error) {
                console.error('Error logging out:', error);
            }
        }
    };

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            const user = JSON.parse(localStorage.getItem("user"));
            if (user) {
                const url = "http://localhost:5000/logout";
                const data = JSON.stringify({ userId: user.id });
                navigator.sendBeacon(url, data); // Send logout request
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const handleCardClick = (route) => {
        navigate(route); // Redirects to the specified path
    };


    useEffect(() => {
        const handleActivity = () => {
            // Reset the timeout on user activity
            clearTimeout(timeoutId);
            startTimeout();
        };
    
        const startTimeout = () => {
            timeoutId = setTimeout(() => {
                handleLogout(); // Call the logout function after 15 minutes
            }, 15 * 60 * 1000); // 15 minutes
        };
    
        let timeoutId = setTimeout(() => {
            handleLogout(); // Call the logout function after 15 minutes
        }, 15 * 60 * 1000); // 15 minutes
    
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keypress', handleActivity);
    
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keypress', handleActivity);
        };
    }, []);

    
    return (
            <div className="airplug-main">

            <h1>Welcome to the Krack's Softwares</h1>
            <div className="main-container">
                <div className="main-screen">
                    {options.map((option) => (
                        <div key={option.title} className="card"
                             onClick={() => handleCardClick(option.route)}> {/* Navigate on click */}
                            <div className="card-icon">{option.icon}</div>
                            <h3 className="card-title">{option.title}</h3>
                        </div>
                    ))}
                </div>
                <div className="sub-screen">
                    <div className="sub-screen1">
                        <a href="WorkOrderInput">
                            <button className="sub-btn">Revenue</button>
                        </a>
                        <a href="./ChartSelectionPage">
                            <button className="sub-btn">Generate Charts</button>
                        </a>
                        <a href="./DailyEntries">
                            <button className="sub-btn">Generate Daily Inward Chart</button>
                        </a>
                        <a href="./CustomerDetail">
                            <button className="sub-btn">Entry Form: <br /> Party & City</button>
                        </a>
                        <a href="./WorkOrderDetails">
                            <button className="sub-btn">Work Order Tracking</button>
                        </a>
                        <a href="./OrdersByUID">
                            <button className="sub-btn">Order Summary</button>
                        </a>
                        <a href="./">
                            <button onClick={handleLogout} className="sub-btn">Logout</button> {/* Add logout button */}
                        </a>
                    </div>                
                </div>
            </div>
        </div>
    );
}

export default MainScreen;