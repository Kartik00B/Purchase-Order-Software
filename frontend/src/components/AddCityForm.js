import React, { useState } from 'react';
import axios from 'axios';
import "./AddCityFrom.css";
import { useNavigate } from "react-router-dom";

const AddCityForm = () => {
    const [cityName, setCityName] = useState('');
    const [partyName, setPartyName] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (cityName === '' || partyName === '' || contactNumber === '') {
            setMessage("Please enter all fields (City, Party Name, Contact Number).");
            return;
        }

        axios.post("http://localhost:5000/cities", {
            city: cityName,
            party_name: partyName,
            contact_number: contactNumber
        })
            .then(res => {
                setMessage(res.data.message);
                setCityName('');
                setPartyName('');
                setContactNumber('');
            })
            .catch((error) => {
                setMessage("Error adding city: " + (error.response?.data?.error || "Unknown error"));
            });
    };

    return (
        <div className="city-form-container">
            {/* Back Button at the Top-Left Corner */}
            <button className="c_back-button" onClick={() => navigate(-1)}>⬅ Back</button>

            <div className="form-container">
                <div className="add-city-form">
                    <h2 className="add-city-title">Add New City</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-field">
                            <label className="add-city-label" htmlFor="cityName">City Name</label>
                            <input
                                type="text"
                                id="cityName"
                                value={cityName}
                                onChange={(e) => setCityName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label className="add-city-label" htmlFor="partyName">Party Name</label>
                            <input
                                type="text"
                                id="partyName"
                                value={partyName}
                                onChange={(e) => setPartyName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label className="add-city-label" htmlFor="contactNumber">Contact Number</label>
                            <input
                                type="text"
                                id="contactNumber"
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="submit-btn">Add City</button>
                    </form>

                    {message && (
                        <p className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddCityForm;
