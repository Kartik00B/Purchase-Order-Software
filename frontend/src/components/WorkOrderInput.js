import React, { useState } from "react";
import './WorkOrderInput.css';
import { useNavigate } from "react-router-dom";


const WorkOrderInput = () => {
    const [selection, setSelection] = useState("uid");
    const [uid, setUid] = useState("");
    const [range, setRange] = useState("1month");
    const [year, setYear] = useState("");
    const [category, setCategory] = useState("all");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const navigate = useNavigate();

    const fetchData = async () => {
        let url = "";
    
        if (selection === "uid" && !uid) {
            setError("Please enter a UID.");
            return;
        }
    
        setLoading(true);
        setError(null);
        setData(null);
    
        if (selection === "uid") {
            url = `http://localhost:5000/api/party-revenue?uid=${uid}&range=${range}`;
        } else {
            url = `http://localhost:5000/api/all-revenue?range=${range}`;
        }
    
        if (range === "custom" && year) {
            url += `&year=${year}`;
        }
    
        try {
            const response = await fetch(url);
            const result = await response.json();
            // console.log(`Fetched Data:`, result);
    
            if (response.ok) {
                if (!result || Object.keys(result).length === 0) {
                    setError("No data found.");
                    setData(null);
                } else {
                    setData(result);
                }
            } else {
                setError(result.error || "Failed to fetch data.");
            }
        } catch (err) {
            setError("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };
    
    const getFormattedRevenue = (amount) => {
        if (!amount) return "₹0";
        return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(amount);
    };
    
    const getUnitPrice = (componentType) => {
        const unitPrices = {
            total_air_plug_ap: 15000,
            total_setting_ring_sr: 10000,
            total_air_ring_ar: 12000,
            total_setting_plug_sp: 10000,
            total_air_snap_as: 18500,
            total_setting_master_sm: 10000,
            total_air_plug_set: 25000,
            total_air_snap_set: 28500,
            total_air_ring_set: 22000 
        };
        return unitPrices[componentType] || 0;
    };
    
    const getFilteredData = () => {
        if (!data) return null;
    
        let filteredSets = {};
        let filteredComponents = {};
        let filteredSales = {};
        let totalRevenue = 0;
        let individualComponents = [];
    
        if (category === "all") {
            filteredSets = data.validSets || {};
            filteredComponents = data.validComponents || {};
            filteredSales = data.salesBreakdown || {};
    
            // ✅ Now includes both set sales and extra components 
            totalRevenue = (data.totalSalesOfComponents || 0);  
    
            individualComponents = Object.entries(filteredComponents).map(([key, value]) => ({
                name: key.replace("total_", "").replace(/_/g, " ").toUpperCase(),
                category: "Component",
                quantity: value,
                totalPrice: filteredSales[key] || 0,
                unitPrice: getUnitPrice(key)
            }));
        } else {
            const categoryKey = `total_${category}`;
    
            if (category.endsWith("_set")) {
                if (data.validSets?.[categoryKey]) {
                    filteredSets[categoryKey] = data.validSets[categoryKey];
                }
                if (data.salesBreakdown?.[categoryKey]) {
                    filteredSales[categoryKey] = data.salesBreakdown[categoryKey];
                    totalRevenue = data.salesBreakdown[categoryKey];
                }
            } else {
                if (data.validComponents?.[categoryKey]) {
                    filteredComponents[categoryKey] = data.validComponents[categoryKey];
    
                    const quantity = data.validComponents[categoryKey] || 0;
                    const unitPrice = getUnitPrice(categoryKey);
                    const totalPrice = data.salesBreakdown?.[categoryKey] || quantity * unitPrice;
    
                    individualComponents = [{
                        name: category.replace(/_/g, " ").toUpperCase(),
                        category: "Component",
                        quantity,
                        totalPrice,
                        unitPrice
                    }];
    
                    totalRevenue = totalPrice;
                }
            }
        }
    
        return { 
            filteredSets, 
            filteredComponents,
            filteredSales, 
            totalRevenue, // ✅ Fixed total revenue to include all sales
            individualComponents 
        };
    };
    

    const filteredData = getFilteredData() || {};
    const { filteredSets, filteredComponents, filteredSales, totalRevenue, individualComponents } = filteredData;

    return (
        <div className="workorder-main-container">
            <div className="workorder-inner-container">
            <button className="airplug-machining-chart-back-button" onClick={() => navigate(-1)}>⬅ Back</button>

                <h2 className="workorder-title">Generated Revenue</h2>
                
                
            
                <div className="workorder-form-container">
                    <div className="workorder-form-grid">
                        {/* Search Option Field */}
                        <div className="workorder-form-field">
                            <label className="workorder-label">Search Option</label>
                            <select 
                                className="workorder-select" 
                                value={selection} 
                                onChange={(e) => setSelection(e.target.value)}
                            >
                                <option value="uid">Search by UID</option>
                                <option value="all">Overall Revenue</option>
                            </select>
                        </div>

                        {/* Party UID Field */}
                        {selection === "uid" && (
                            <div className="workorder-form-field-party">
                                <label className="workorder-label">Party UID

                                <span 
                    className="info-icon" 
                    onClick={() => setShowTooltip(!showTooltip)}
                    style={{ cursor: "pointer", fontSize: "18px", color: "#007bff", position: "relative" }}
                >
                    <img className="i-icon" src="./i.png"/>
                    {/* Tooltip Box */}
                    {showTooltip && (
                        <div 
                            className="tooltip-box" 
                            style={{
                                position: "absolute",
                                top: "40%",
                                left: "120%",
                                transform: "translateY(-40%)",
                                background: "#fff",
                                color: "#333",
                                padding: "8px",
                                borderRadius: "5px",
                                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                                width: "250px",
                                textAlign: "center",
                                zIndex: 10,
                                whiteSpace: "wrap"
                            }}
                        >
                            <p style={{ margin: 0, fontSize: "14px" }}>
    Click on ➝ "Go to UID" ➝ then Click on "Show All Details" ➝ Search for the party to find its UID.
</p>
                        </div>
                    )}
                </span>
                                </label>
                                <input
                                    type="text"
                                    value={uid}
                                    onChange={(e) => setUid(e.target.value.toUpperCase())}
                                    placeholder="Enter UID"
                                    className="workorder-input"
                                />
                            </div>
                        )}

                        {/* Date Range Field */}
                        <div className="workorder-form-field">
                            <label className="workorder-label">Date Range</label>
                            <select 
                                className="workorder-select"
                                value={range} 
                                onChange={(e) => setRange(e.target.value)}
                            >
                                {selection === "uid" ? (
                                    <>
                                        <option value="1month">Last 1 Month</option>
                                        <option value="3months">Last 3 Months</option>
                                        <option value="6months">Last 6 Months</option>
                                        <option value="1year">Last 1 Year</option>
                                        <option value="custom">Custom Year</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="1year">Last 1 Year</option>
                                        <option value="2years">Last 2 Years</option>
                                        <option value="3years">Last 3 Years</option>
                                        <option value="1months">Last 1 Month</option>
                                        <option value="3months">Last 3 Months</option>
                                        <option value="6months">Last 6 Months</option>
                                        <option value="custom">Specific Year</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Custom Year Field */}
                        {range === "custom" && (
                            <div className="workorder-form-field">
                                <label className="workorder-label">Year</label>
                                <input
                                    type="number"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    placeholder="Enter Year (YYYY)"
                                    className="workorder-input"
                                />
                            </div>
                        )}
                        <div className="workorder-form-field">
                            <label className="workorder-label">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="workorder-select"
                                
                            >
                                <option value="all">All</option>
                                <option value="air_plug_ap">Air Plug (AP)</option>
                                <option value="setting_ring_sr">Setting Ring (SR)</option>
                                <option value="air_plug_set">Air Plug Set</option>
                                <option value="air_ring_ar">Air Ring (AR)</option>
                                <option value="setting_plug_sp">Setting Plug (SP)</option>
                                <option value="air_ring_set">Air Ring Set</option>
                                <option value="air_snap_as">Air Snap (AS)</option>
                                <option value="setting_master_sm">Setting Master (SM)</option>
                                <option value="air_snap_set">Air Snap Set</option>
                                </select>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="workorder-submit-container">
                        <button className="workorder-submit-btn" onClick={fetchData}>
                            Fetch Orders
                        </button>
                        <button onClick={() => navigate("/customerdetail")} className="workorder-submit-btn1">
                Go to UID
              </button>
                    </div>
                </div>
                
                {loading && <div className="workorder-loading">Loading data...</div>}
                
                {error && <div className="workorder-error">{error}</div>}
                <br />
                {data?.partyDetails && (
                    <div className="party-details">
                        <p><strong>Party:</strong> {data.partyDetails.party_name}</p>
                        <p><strong>City:</strong> {data.partyDetails.city}</p>
                        <p><strong>UID:</strong> {data.partyDetails.uid}</p>
                    </div>
                )}
                {data && !error && (
                <>
                    <div className="workorder-total-revenue">
                        <span className="workorder-total-revenue-label">Total Revenue</span>
                        <span className="workorder-total-revenue-amount">
                            ₹{getFormattedRevenue(totalRevenue)}
                        </span>
                    </div>

                    <div className="workorder-table-container">
                        <table className="workorder-table">
                            <thead>
                                <tr>
                                    <th>Component Type</th>
                                    <th>Category</th>
                                    <th>Quantity</th>
                                    <th>Unit Price</th>
                                    <th>Total Price</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Display Sets */}
                                {filteredSets && Object.keys(filteredSets).length > 0 && (
                                    Object.entries(filteredSets).map(([key, value]) => (
                                        <tr key={`set-${key}`} className="workorder-table-row-set">
                                            <td>{key.replace('total_', '').replace(/_/g, " ").toUpperCase()}</td>
                                            <td>Set</td>
                                            <td>{value || 0}</td>
                                            <td className="price-cell">
                                                ₹{getFormattedRevenue(getUnitPrice(key))}
                                            </td>
                                            <td className="revenue-cell">
                                                ₹{getFormattedRevenue(filteredSales[key] || 0)}
                                            </td>
                                            <td>
                                                <span className="workorder-status-active">Active</span>
                                            </td>
                                        </tr>
                                    ))
                                )}

                                {/* Display Individual Components */}
                                {individualComponents.map((component, index) => (
                                    <tr key={`component-${index}`} className="workorder-table-row-component">
                                        <td>{component.name}</td>
                                        <td>{component.category}</td>
                                        <td>{component.quantity}</td>
                                        <td className="price-cell">
                                            ₹{getFormattedRevenue(component.unitPrice)}
                                        </td>
                                        <td className="revenue-cell">
                                            ₹{getFormattedRevenue(component.totalPrice)}
                                        </td>
                                        <td>
                                            <span className="workorder-status-active">Active</span>
                                        </td>
                                    </tr>
                                ))}

                                {(!filteredSets || Object.keys(filteredSets).length === 0) && 
                                (!individualComponents || individualComponents.length === 0) && (
                                    <tr>
                                        <td colSpan="6" className="workorder-table-empty">
                                            No components found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
                )}
            </div>
        </div>
    );
};

export default WorkOrderInput;