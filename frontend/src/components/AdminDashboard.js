import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css'; // Import admin dashboard specific styles

const AdminDashboard = () => {
    const [usersWithActions, setUsersWithActions] = useState([]);
    const navigate = useNavigate(); // React Router's navigation hook

    useEffect(() => {
        fetchUsersWithActions();
    }, []);

    // Fetch users with actions
    const fetchUsersWithActions = async () => {
        try {
            const response = await axios.get("http://localhost:5000/users-with-actions");
            setUsersWithActions(response.data.users);
        } catch (error) {
            console.error('Error fetching users with actions:', error);
        }
    };

    const handleActionClick = (userId) => {
        navigate(`/user-actions/${userId}`); // Navigate to the detailed actions page
    };


    // Date formatting function
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);

        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return 'Invalid date'; // Return a placeholder for invalid dates
        }

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = date.getFullYear();

        // Get hours and minutes
        let hours = date.getUTCHours(); // Use UTC hours to avoid timezone issues
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12; // Convert to 12-hour format
        hours = hours ? String(hours).padStart(2, '0') : '12'; // The hour '0' should be '12'

        return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    };

    
    return (
        <div className="admin-dashboard__container">
            <h2>Admin Dashboard</h2>

            {/* User session management */}
            <div className="admin-dashboard__section">
                <h3>Manage User Sessions</h3>
                <table className="admin-dashboard__table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Last Login</th>
                            <th>Last Logout</th>
                            <th>Action Count</th>
                            <th>Action Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
    {usersWithActions.map((user) => (
        <tr key={user.id}>
            <td>{user.id}</td>
            <td>{user.username}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>{formatDateTime(user.last_login || 'Invalid date')}</td> {/* Handle undefined */}
            <td>{formatDateTime(user.last_logout || 'Invalid date')}</td> {/* Handle undefined */}
            <td>
                <span 
                    className="action-count" 
                    onClick={() => handleActionClick(user.id)}
                    style={{ cursor: 'pointer', color: 'white', textDecoration: 'underline', fontWeight:'bold', padding:'5px 15px', borderRadius:'15px', border:'2px solid #86f789cf', backgroundColor:'#01d507cf' }}
                >
                    {user.action_count || 0} {/* Display action count */}
                </span>
            </td>
            <td>{formatDateTime(user.last_action_timestamp)}</td>
        </tr>
    ))}
</tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;