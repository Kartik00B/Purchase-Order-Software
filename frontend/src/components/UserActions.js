import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
// import {formatDateTime} from './utils';
import './UserActions.css';

const UserActions = () => {
    const { userId } = useParams(); // Get user ID from URL
    const [actions, setActions] = useState([]);

    useEffect(() => {
        fetchUserActions();
    }, [userId]);

    const fetchUserActions = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/user-actions/${userId}`);
            setActions(response.data.actions);
        } catch (error) {
            console.error('Error fetching user actions:', error);
        }
    };

    // Date formatting function
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
    
        // Check if the date is valid
        if (isNaN(date.getTime())) {
            console.error('Invalid date string:', dateString); // Log the invalid date string for debugging
            return 'Invalid date'; // Return a placeholder for invalid dates
        }
    
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = date.getUTCFullYear();
    
        // Get hours and minutes
        let hours = date.getUTCHours(); // Use UTC hours to avoid timezone issues
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12; // Convert to 12-hour format
        hours = hours ? String(hours).padStart(2, '0') : '12'; // The hour '0' should be '12'
    
        return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    };

    return (
        <div className="user-actions__container">
            <h2 className="user-actions__header">User Actions for User ID: {userId}</h2>
            {actions.length > 0 ? (
                <table className="user-actions__table">
                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {actions.map((action, index) => (
                            <tr key={index}>
                                <td className="user-actions__action">{action.action}</td>
                                <td className="user-actions__action">{formatDateTime(action.last_action_timestamp)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="user-actions__no-data">No actions found for this user.</div>
            )}
        </div>
    );
};

export default UserActions;