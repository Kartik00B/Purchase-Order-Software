import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CustomerDetail.css";
import { useNavigate } from "react-router-dom";

const CustomerDetail = () => {
    const [cities, setCities] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [formData, setFormData] = useState({
        party_name: "",
        city: "",
        contact_no: "",
        email: "",
        address: "",
        other: "",
    });
    const [editId, setEditId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchCities();
    }, []);

    const fetchCities = () => {
        axios
            .get("http://localhost:5000/api/city")
            .then((response) => setCities(response.data))
            .catch((error) => console.error("Error fetching data:", error));
    };

    const filteredCustomers = cities.filter(customer =>
        customer.party_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.uid && customer.uid.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const generateUID = (partyName, city) => {
        const partyInitials = partyName.slice(0, 2).toUpperCase();
        const cityInitials = city.slice(0, 2).toUpperCase();
        const randomNum = Math.floor(10 + Math.random() * 90);
        return `${partyInitials}${randomNum}${cityInitials}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let uid = editId || generateUID(formData.party_name, formData.city);
            const newCustomer = { uid, ...formData };
    
            // Check for duplicates only when adding a new customer
            if (!editId) {
                const response = await axios.get(`http://localhost:5000/api/cities/check`, {
                    params: {
                        party_name: formData.party_name,
                        city: formData.city,
                        contact_no: formData.contact_no,
                        email: formData.email,
                    },
                });
    
                if (response.data.exists) {
                    alert(response.data.message);
                    return;
                }
    
                await axios.post("http://localhost:5000/api/cities", newCustomer);
                alert("Customer added!");
            } else {
                await axios.put(`http://localhost:5000/api/cities/${editId}`, newCustomer);
                alert("Customer updated!");
            }
    
            fetchCities();
            setFormData({
                party_name: "",
                city: "",
                contact_no: "",
                email: "",
                address: "",
                other: "",
            });
            setEditId(null);
        } catch (error) {
            console.error("Error handling customer:", error);
            alert("An error occurred. Please try again.");
        }
    };

    const handleEdit = (customer) => {
        setEditId(customer.id);
        setFormData({
            party_name: customer.party_name,
            city: customer.city,
            contact_no: customer.contact_no,
            email: customer.email,
            address: customer.address,
            other: customer.other,
        });
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this customer?")) {
            axios
                .delete(`http://localhost:5000/api/cities/${id}`)
                .then(() => {
                    alert("Customer deleted!");
                    fetchCities();
                })
                .catch((error) => console.error("Error deleting customer:", error));
        }
    };


    const handleCheckEmailOrders = (email, service) => {
        if (!email) {
            alert("No email available for this customer.");
            return;
        }

        const encodedEmail = encodeURIComponent(email);
        if (service === "gmail") {
            window.open(`https://mail.google.com/mail/u/0/#search/from:${encodedEmail}`, "_blank");
        } else if (service === "outlook") {
            window.open(`https://outlook.live.com/mail/0/search/id/AQAAAAAAAQAAAAA%3D?q=${encodedEmail}`, "_blank");
        }
    };



    return (
        <div className="customer-management">
            <div className="customer-management-container">
                <button className="back-button" onClick={() => navigate(-1)}>⬅ Back</button>
                <h2 className="section-title">Customer Management</h2>


                <form className="customer-form" onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Party Name</label>
                            <input
                                className="form-input"
                                type="text"
                                name="party_name"
                                value={formData.party_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>City</label>
                            <input
                                className="form-input"
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Contact No</label>
                            <input
                                className="form-input"
                                type="text"
                                name="contact_no"
                                value={formData.contact_no}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                className="form-input"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <input
                                className="form-input"
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Other</label>
                            <input
                                className="form-input"
                                type="text"
                                name="other"
                                value={formData.other}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <button type="submit" className="submit-btn">
                        {editId ? "Update Customer" : "Add Customer"}
                    </button>
                </form>

                <h3>Party Details</h3>
                <button className="refresh-btn" onClick={() => setShowTable(!showTable)}>
                    {showTable ? "Hide Details" : "Show All Details"}
                </button>

                {showTable && (
                    <div className="table-container">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search by Party Name or UID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="order-search-input"
                            />
                            {/* <i className="fa fa-search search-icon"></i> */}
                        </div>
                        <table className="customer-table">
                            <thead>
                                <tr>
                                    <th className="uid">UID</th>
                                    <th>Party Name</th>
                                    <th>City</th>
                                    <th className="contact">Contact No</th>
                                    <th>Email</th>
                                    <th>Address</th>
                                    <th>Other</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.length > 0 ? (
                                    filteredCustomers.map((customer) => (
                                        <tr key={customer.id}>
                                            <td className="uid">{customer.uid}</td>
                                            <td>{customer.party_name}</td>
                                            <td>{customer.city}</td>
                                            <td className="contact">{customer.contact_no}</td>
                                            <td>{customer.email}</td>
                                            <td>{customer.address}</td>
                                            {/* <td>{customer.other}</td> */}
                                            <td>
                                                {customer.email ? (
                                                    <button className="email-check-btn" onClick={() => handleCheckEmailOrders(customer.email, "gmail")}>
                                                        <img
                                                            src="./pngwing.com.png"
                                                            alt="Gmail Icon"
                                                            className="email-icon"
                                                        />
                                                        <span>Check Gmail for Orders</span>
                                                    </button>
                                                ) : (
                                                    "N/A"
                                                )}
                                            </td>



                                            <td>
                                                <button className="edit-btn" onClick={() => handleEdit(customer)}>
                                                    Edit
                                                </button>
                                                <button className="delete-btn" onClick={() => handleDelete(customer.id)}>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8">No matching customers found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDetail;