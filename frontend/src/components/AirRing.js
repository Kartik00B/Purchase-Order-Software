import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import "./AirRing.css";
import {Link, useNavigate} from "react-router-dom";
import 'font-awesome/css/font-awesome.min.css';
import {QRCodeSVG} from "qrcode.react"; // Import the QRCodeGenerator component
import BASE_URL from "./config"; // Adjust the path as needed

const AirRing = ({entry}) => {
    const [formData, setFormData] = useState({
        record_sr_no: '',
        work_order_no: "",
        party_name: "",
        purchase_order: "",
        date: "",
        city: "",
        units: "",
        sub_sr_no: "",
        qty: "",
        air_ring_ar: "",
        setting_plug_sp: "",
        air_ring_set: "",
        nominal_size: "",
        size_low_tolerance: "",
        size_high_tolerance: "",
        bore_jet_type: "",
        higher_lower: "",
        jet_count: "",
        dispatch_week: "",
        remark: "",
        // calculatedDispatchDate: ''
    });


    const [isEditing, setIsEditing] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);

    const [tolerances, setTolerances] = useState({
        range1: '',
        range2: '',
        l_tolerance: '',
        h_tolerance: '',
    });

    const [dailyData, setDailyData] = useState([]);
    const [filteredData, setFilteredData] = useState([]); // To handle search results
    const [cities, setCities] = useState([]);
    const [cityError, setCityError] = useState("");
    const [searchQuery, setSearchQuery] = useState(""); // State to manage search query
    const [airringUnits, setAirringUnits] = useState([]);
    // const [hole, sethole] = useState([]);
    const navigate = useNavigate();
    const [formErrors, setFormErrors] = useState({}); // State to store form validation errors
    const [partyNames, setPartyNames] = useState([]);

    const [size_low_tolerance, setsize_low_tolerance] = useState('');
    const [size_high_tolerance, setsize_high_tolerance] = useState('');
    // const [shaftData, setShaftData] = useState([]); // Define shaftData state
    const [mmInch, setMmInch] = useState("mm"); // Added state for mm/inch selection
// Track if the user has manually edited values
    const [userEdited, setUserEdited] = useState({low: false, high: false});


    const [error, setError] = useState('');
    // const [partyNamesError,setPartyNamesError] = useState("");

    const [airPlugData, setAirRingData] = useState([]);

    const [tempRecordSrNo, setTempRecordSrNo] = useState(''); // Temporary state for record_sr_no
    const [fetchTimeout, setFetchTimeout] = useState(null);
    
    const fetchDailyData = async () => {
        try {
            const response = await axios.get("http://localhost:5000/airring-history");
            setDailyData(response.data.data);
            setFilteredData(response.data.data); // Set filtered data initially
        } catch (error) {
            console.error("Error fetching daily data:", error);
        }
    };

    useEffect(() => {
        axios
            .get("http://localhost:5000/api/cities")
            .then((response) => setCities(response.data))
            .catch((error) => console.error("Error fetching cities:", error));
        fetchDailyData();
    }, []);


    useEffect(() => {
        axios
            .get("http://localhost:5000/api/party-names")
            .then((response) => setPartyNames(response.data))
            .catch((error) => console.error("Error fetching party Name:", error));
        fetchDailyData();
    }, []);


    useEffect(() => {
        axios
            .get("http://localhost:5000/airringunits")
            .then((response) => setAirringUnits(response.data))
            .catch((error) => console.error("Error fetching Units:", error));
        fetchDailyData();
    }, []);


    useEffect(() => {
        if (formData.nominal_size && formData.l_size && formData.value_size) {
            fetchTolerances();
        }
    }, [formData.nominal_size, formData.l_size, formData.value_size]);

    const fetchTolerances = async () => {
        try {
            const response = await axios.get("http://localhost:5000/get-airring-tolerances", {
                params: {
                    nominal_size: formData.nominal_size,
                    l_size: formData.l_size,
                    value_size: formData.value_size
                }
            });
    
            // Set the tolerances state correctly
            setTolerances({
                range1: response.data.range1,
                range2: response.data.range2,
                l_tolerance: response.data.l_tolerance,
                h_tolerance: response.data.h_tolerance,
            });
    
            // Update formData with new tolerance values
            setFormData(prevData => ({
                ...prevData,
                size_low_tolerance: response.data.l_tolerance.toString(), // Ensure this is a string
                size_high_tolerance: response.data.h_tolerance.toString(), // Ensure this is a string
            }));
    
            // console.log(response.data);
            setError('');
        } catch (error) {
            console.error("Error fetching tolerances:", error.response?.data || error.message);
        }
    };

    const handleUnitChange = (e) => {
        setMmInch(e.target.value);
    };

    const handleFocus = () => {
        // Fetch tolerances only when the low or high tolerance field is focused
        if (formData.nominal_size && formData.l_size && formData.value_size) {
            fetchTolerances(formData.nominal_size, formData.l_size, formData.value_size);
        }
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});

        if (name === "city") {
            if (cities.includes(value)) {
                setCityError("");
            } else {
                setCityError("City name does not exist or is not in the database");
            }
        }

        if (name === "party_name") {
            if (partyNames.includes(value)) {
                setCityError("");
            } else {
                setCityError("party name does not exist or is not in the database");
            }
        }

        if (name === "runits")
            if (airringUnits.includes(value)) {

            } else {
                // console.log('Error fetching the Air Plug Units');
            }
           
           
        if (name === "record_sr_no") {
            setTempRecordSrNo(value); // Update temporary state
        } else {
            setFormData({ ...formData, [name]: value });
        }


            // Fetch data if record_sr_no is changed
        if (name === "record_sr_no") {
            fetchEntryData(value); // Fetch data based on the entered record_sr_no
        }

        if (name === 'record_sr_no') {
            setRecordSrNo(value);
        }
      

        // Automatically fetch tolerances when any input changes
        if (formData.nominal_size && formData.l_size && formData.value_size) {
            fetchTolerances();
        }

        if (name === "nominal_size" || name === "value_size" || name === "l_size") {
            // If the unit is in inches, convert the values to mm
            let updatedValue = value;
            if (mmInch === "Inch") {
                updatedValue = (parseFloat(value) * 25.4).toFixed(2); // Convert to mm
            }
            setFormData((prev) => ({
                ...prev,
                [name]: updatedValue
            }));
        } else if (name === "size_low_tolerance") {
            setsize_low_tolerance(value);
            setUserEdited((prev) => ({...prev, low: true})); // Mark as manually edited
        } else if (name === "size_high_tolerance") {
            setsize_high_tolerance(value);
            setUserEdited((prev) => ({...prev, high: true})); // Mark as manually edited

        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    

        if (name === "air_ring_set" && value !== "") {
            const setValue = parseInt(value);
            setFormData({
                ...formData,
                [name]: `${value} (AR SET)`, // Store in the correct format
                air_ring_ar: setValue,
                setting_plug_sp: setValue * 2,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const validateForm = () => {
        const errors = {};
        let isValid = true;


        // Fields to exclude from validation
        const excludedFields = ["higher_lower", "remark", "l_size", "value_size", "air_ring_set"];

        // console.log("Form Data:", formData);

        // Check for empty fields
        for (const field in formData) {
            if (!formData[field] && !excludedFields.includes(field)) {
                errors[field] = "*";
                isValid = false;
            }
        }


        console.log("Validation Errors:", errors);


        setFormErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check if the date is valid
        if (!formData.date) {
            alert("Please select a valid date.");
            return;
        }
    
        const dateObj = new Date(formData.date);
        if (isNaN(dateObj.getTime())) {
            alert("Invalid date format. Please enter a valid date.");
            return;
        }
    
        const formattedDate = dateObj.toISOString().split('T')[0]; // Outputs "2025-05-19"
    
        console.log("Original Date:", formData.date);
        console.log("Formatted Date:", formattedDate);
        
        if (cityError) {
            console.log("City error detected, aborting submission.");
            return;
        }
        
        if (validateForm()) {
            try {
                const submissionData = {
                    ...formData,
                    date: formattedDate,
                    record_sr_no: Number(formData.record_sr_no), // Keep the current record number for now
                    air_ring_ar: Number(formData.air_ring_ar),
                    qty: Number(formData.qty) || 0,
                    sub_sr_no: Number(formData.sub_sr_no) || 0,
                    value_size: Number(formData.value_size) || 0,
                    setting_plug_sp: Number(formData.setting_plug_sp),
                    nominal_size: parseFloat(formData.nominal_size),
                    size_high_tolerance: parseFloat(formData.size_high_tolerance),
                    size_low_tolerance: parseFloat(formData.size_low_tolerance),
                    higher_lower: formData.higher_lower || null,
                    work_order_no: formData.work_order_no || "",
                    party_name: formData.party_name || "",
                    purchase_order: formData.purchase_order || "",
                    city: formData.city || "",
                    units: formData.units || "",
                    jet_count: formData.jet_count || "",
                    dispatch_week: formData.dispatch_week || "",
                    remark: formData.remark || "",
                };
    
                console.log("Submission Data:", submissionData);
            
                // Check if we are editing an existing entry or creating a new one
                if (isEditing && editingEntry && editingEntry.record_sr_no === formData.record_sr_no) {
                    await axios.put(`http://localhost:5000/airring-entry/${submissionData.record_sr_no}`, submissionData);
                    alert("Entry updated successfully!");
                } else {
                    await axios.post("http://localhost:5000/air_ring-entry", submissionData);
                    alert("Entry successfully added to Air Ring table!");
                }
    
                await new Promise(resolve => setTimeout(resolve, 100)); // 0.5s delay
    
                // Fetch new record_sr_no for next entry
                const nextSrNoResponse = await axios.get("http://localhost:5000/next-record-sr-no");
                const nextSrNo = nextSrNoResponse.data.record_sr_no.toString();
                setRecordSrNo(nextSrNo);
    
                // Reset form and refill with the last submission data
                setFormData({
                    record_sr_no: nextSrNo, // Set the new record number
                    work_order_no: formData.work_order_no || "", // Retain previous values
                    party_name: formData.party_name || "",
                    purchase_order: formData.purchase_order || "",
                    date: "", // Reset date
                    city: formData.city || "",
                    units: formData.units || "",
                    sub_sr_no: formData.sub_sr_no || 0, // Retain previous values
                    qty: formData.qty || 0, // Retain previous values
                    air_ring_ar: formData.air_ring_ar || 0, // Retain previous values
                    setting_plug_sp: formData.setting_plug_sp || 0, // Retain previous values
                    air_ring_set: formData.air_ring_set || "", // Retain previous values
                    nominal_size: formData.nominal_size || 0, // Retain previous values
                    l_size: formData.l_size || "", // Retain previous values
                    value_size: formData.value_size || 0, // Retain previous values
                    size_low_tolerance: formData.size_low_tolerance || 0, // Retain previous values
                    size_high_tolerance: formData.size_high_tolerance || 0, // Retain previous values
                    bore_jet_type: formData.bore_jet_type || "", // Retain previous values
                    higher_lower: formData.higher_lower || "", // Retain previous values
                    jet_count: formData.jet_count || "", // Retain previous values
                    dispatch_week: formData.dispatch_week || "", // Retain previous values
                    remark: formData.remark || "", // Retain previous values
                });
    
                // Optionally, you can fetch daily data after submission
                fetchDailyData();
            } catch (error) {
                console.error("Error adding data:", error.response?.data || error.message);
                alert("Error: " + (error.response?.data?.error || error.message));
            }
        } else {
            console.log("Validation failed. Form is invalid.");
        }
    };


    const handleDelete = async (record_sr_no) => {
        if (window.confirm("Are you sure you want to delete this entry? It will be removed from both Air Ring and Purchase Orders tables.")) {
            try {
                const response = await axios.delete(`http://localhost:5000/airring-entry/${record_sr_no}`);
                if (response.data.success) {
                    alert("Entry deleted successfully from both tables!");
                    fetchDailyData();
                } else {
                    alert("Failed to delete entry");
                }
            } catch (error) {
                console.error("Error deleting entry:", error);
                alert("Error: " + (error.response?.data?.error || error.message));
            }
        }
    };


     // Add this function above the existing handleDelete
     const handleDeleteAll = async () => {
        if (window.confirm("Are you sure you want to delete ALL Air Snap entries?")) {
            try {
                const response = await axios.delete("http://localhost:5000/delete-all-airring-entries");
    
                if (response.data.message.includes("No records found")) {
                    alert("No entries found to delete.");
                } else {
                    setAirRingData([]);  // Clear state
                    fetchDailyData();    // Fetch updated data
                    alert(response.data.message);
                }
    
            } catch (error) {
                console.error("Error deleting all entries:", error);
                alert("Failed to delete all entries");
            }
        }
    };

    const printRef = useRef();

    // Filter daily data based on search query
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        if (query === "") {
            setFilteredData(dailyData);
        } else {
            setFilteredData(
                dailyData.filter((entry) =>
                    Object.values(entry).some((val) =>
                        String(val).toLowerCase().includes(query)
                    )
                )
            );
        }
    };



    const [recordSrNo, setRecordSrNo] = useState('');


    // Update the useEffect for fetching initial record_sr_no
    useEffect(() => {
        const fetchNextRecordSrNo = async () => {
            try {
                const response = await axios.get("http://localhost:5000/next-record-sr-no");
                const nextSrNo = response.data.record_sr_no.toString();
                setRecordSrNo(nextSrNo);
                // Also update formData
                setFormData(prev => ({
                    ...prev,
                    record_sr_no: nextSrNo
                }));
                // console.log("Initial record_sr_no set to:", nextSrNo); // Debug log
            } catch (error) {
                console.error("Error fetching next record_sr_no:", error);
            }
        };

        fetchNextRecordSrNo();
    }, []);
    

    useEffect(() => {
        // Clear the previous timeout if it exists
        if (fetchTimeout) {
            clearTimeout(fetchTimeout);
        }

        // Set a new timeout to fetch data after 500ms
        const timeout = setTimeout(() => {
            if (tempRecordSrNo) {
                fetchEntryData(tempRecordSrNo);
            }
        }, 500); // Adjust the delay as needed

        setFetchTimeout(timeout);

        // Cleanup function to clear the timeout on component unmount or when tempRecordSrNo changes
        return () => clearTimeout(timeout);
    }, [tempRecordSrNo]);
    
// New function to fetch entry data based on record_sr_no
const fetchEntryData = async (recordSrNo) => {
    try {
        // const response = await axios.get(`http://localhost:5000/airring-entry/${recordSrNo}`);
        if (response.data) {
            const entry = response.data; // Assuming the response contains the entry data
            const formattedDate = entry.date.split("T")[0];

            setFormData({
                record_sr_no: entry.record_sr_no,
                work_order_no: entry.work_order_no,
                party_name: entry.party_name,
                purchase_order: entry.purchase_order,
                date: formattedDate,
                city: entry.city,
                units: entry.units,
                sub_sr_no: entry.sub_sr_no,
                qty: entry.qty,
                air_ring_ar: entry.air_ring_ar,
                setting_plug_sp: entry.setting_plug_sp,
                air_ring_set: entry.air_ring_set,
                nominal_size: entry.nominal_size,
                l_size: entry.l_size,
                value_size: entry.value_size,
                size_low_tolerance: entry.size_low_tolerance,
                size_high_tolerance: entry.size_high_tolerance,
                bore_jet_type: entry.bore_jet_type,
                higher_lower: entry.higher_lower,
                jet_count: entry.jet_count,
                dispatch_week: entry.dispatch_week,
                remark: entry.remark,
            });
            setIsEditing(true); // Set editing mode
        }
    } catch (error) {
        console.error("Error fetching entry data:", error);
        // alert("Entry not found. Please check the Record Sr No.");
    }
};

    const handleEdit = (entry) => {
        const formattedDate = entry.date.split("T")[0];
    
        setFormData({
            record_sr_no: entry.record_sr_no,
            work_order_no: entry.work_order_no,
            party_name: entry.party_name,
            purchase_order: entry.purchase_order,
            date: formattedDate,
            city: entry.city,
            units: entry.units,
            sub_sr_no: entry.sub_sr_no,
            qty: entry.qty,
            air_ring_ar: entry.air_ring_ar,
            setting_plug_sp: entry.setting_plug_sp,
            air_ring_set: entry.air_ring_set,
            nominal_size: entry.nominal_size,
            l_size: entry.l_size,
            value_size: entry.value_size,
            size_low_tolerance: entry.size_low_tolerance,
            size_high_tolerance: entry.size_high_tolerance,
            bore_jet_type: entry.bore_jet_type,
            higher_lower: entry.higher_lower,
            jet_count: entry.jet_count,
            dispatch_week: entry.dispatch_week,
            remark: entry.remark,
        });
    
        setIsEditing(true);
        setEditingEntry(entry); // If you use this for extra tracking
    };

    return (
        <div className="air_ring__container">
            <div className="air_ring__form-container">
            <button className="airplug-back-button"
                onClick={() => window.history.back()}
            >
                ← Back
            </button>
                <h2>Air Ring</h2>
                <h3>Daily Inward Register</h3>
                <div className="air_ring-form">
                    <form className="air_ring__form" onSubmit={handleSubmit}>
                        <div className="form-style1">
                        <label className="air_snap_label">
                            Record Sr No:
                            <br/>
                            <input
                                type="text"
                                name="record_sr_no"
                                value={formData.record_sr_no} // Use recordSrNo directly
                                // readOnly
                                onChange={handleInputChange}
                                className="air_snap_input"
                                style={{
                                    color: 'black',
                                    fontWeight: 'bold',
                                    backgroundColor: '#f0f0f0'
                                }}
                            />
                        </label>
                            <label className="air_ring_label workorder">
                                Work Order No:
                                {formErrors.work_order_no && (
                                    <span className="error-message">{formErrors.work_order_no}</span>
                                )}
                                <br/>

                                <input
                                    type="text"
                                    name="work_order_no"
                                    value={formData.work_order_no}
                                    onChange={handleInputChange}
                                    required
                                    className="air_ring_input"
                                    style={{color: 'black', fontWeight: 'bold'}}

                                />

                            </label>

                            <label className="air_ring_labelp partyname">
                                Party Name:
                                {formErrors.party_name && (
                                    <span className="error-message">{formErrors.party_name}</span>
                                )}
                                <br/>
                                <select
                                    type="text"
                                    name="party_name"
                                    value={formData.party_name}
                                    onChange={handleInputChange}
                                    required
                                    className="air_ring_input"
                                    style={{color: 'black', fontWeight: 'bold'}}

                                >
                                    <option className="air_ring_input" value=""></option>
                                    {partyNames.map((party_name, index) => (
                                        <option key={index} value={party_name}>
                                            {party_name}
                                        </option>
                                    ))}
                                </select>
                                {/*{cityError && <p className="error-message">{cityError}</p>}{" "}*/}

                            </label>

                            <label className="air_ring_label">
                                Purchase Order:
                                {formErrors.purchase_order && (
                                    <span className="error-message">{formErrors.purchase_order}</span>
                                )}
                                <br/>
                                <input
                                    type="text"
                                    name="purchase_order"
                                    value={formData.purchase_order}
                                    onChange={handleInputChange}
                                    required
                                    className="air_ring_input"
                                    style={{color: 'black', fontWeight: 'bold'}}

                                />
                            </label>
                        </div>


                        <br/>


                        <div className="form-style2">
                            <label className="air_ring_label">
                                Date:
                                {formErrors.date && (
                                    <span className="error-message">{formErrors.date}</span>
                                )}
                                <br/>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    required
                                    className="air_ring_input"
                                    style={{color: 'black', fontWeight: 'bold'}}

                                />
                            </label>
                            {/* City Input with Datalist */}
                            <label className="air_ring_label1">
                                City:
                                {formErrors.city && (
                                    <span className="error-message">{formErrors.city}</span>
                                )}
                                <br/>
                                <select
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="air_ring_input"
                                    autoComplete="on"
                                    required
                                    style={{color: 'black', fontWeight: 'bold'}}

                                >
                                    <option className="air_ring_input" value=""></option>
                                    {cities.map((city, index) => (
                                        <option key={index} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </select>
                                {/*{cityError && <p className="error-message">{cityError}</p>}{" "}*/}
                                {/* Error message */}
                            </label>
                        </div>
                        <br/>


                        <div className="form-style3">
                            <label className="air_ring_label1 units">
                                Units:
                                {formErrors.runits && (
                                    <span className="error-message">{formErrors.runits}</span>
                                )}
                                <br/>
                                <select
                                    name="units"
                                    value={formData.units}
                                    onChange={handleInputChange}
                                    className="air_ring_input"
                                    required
                                    style={{color: 'black', fontWeight: 'bold'}}
                                >
                                    <option className="air_ring_input" value="">-- Select the Units --</option>
                                    {airringUnits.map((runits, index) => (
                                        <option key={index} value={runits}>
                                            {runits}
                                        </option>
                                    ))}
                                </select>
                                {/*{cityError && <p className="error-message">{cityError}</p>}{" "}*/}
                            </label>
                        </div>
                        <hr className="hr-line"/>
                        <div className="form-style4">
                            <label className="air_ring_label">
                                Sub Sr No:
                                {formErrors.sub_sr_no && (
                                    <span className="error-message">{formErrors.sub_sr_no}</span>
                                )}
                                <br/>
                                <input
                                    type="text"
                                    name="sub_sr_no"
                                    value={formData.sub_sr_no}
                                    onChange={handleInputChange}
                                    required
                                    className="air_ring_input"
                                />
                            </label>


                            <label className="air_ring_label">
                                Qty.
                                {formErrors.qty && (
                                    <span className="error-message">{formErrors.qty}</span>
                                )}
                                <br/>
                                <input
                                    type="text"
                                    name="qty"
                                    value={formData.qty}
                                    onChange={handleInputChange}
                                    required
                                    className="air_ring_input"
                                />
                            </label>
                        </div>


                        <div className="formstyle5">
                            <div className="form-style5">
                                <label className="air_ring_label">
                                    Air Ring:
                                    {formErrors.air_ring_ar && (
                                        <span className="error-message">{formErrors.air_ring_ar}</span>
                                    )}
                                    <br/>
                                    <input
                                        type="text"
                                        name="air_ring_ar"
                                        value={formData.air_ring_ar}
                                        onChange={handleInputChange}
                                        className="air_ring_input"
                                        required
                                        style={{color: 'black', fontWeight: 'bold'}}

                                    ></input>
                                </label>
                                <label className="air_ring_label">
                                    Setting Plug:
                                    {formErrors.setting_plug_sp && (
                                        <span className="error-message">{formErrors.setting_plug_sp}</span>
                                    )}
                                    <br/>
                                    <input
                                        type="text"
                                        name="setting_plug_sp"
                                        value={formData.setting_plug_sp}
                                        onChange={handleInputChange}
                                        className="air_ring_input"
                                        required
                                        style={{color: 'black', fontWeight: 'bold'}}

                                    ></input>
                                </label>
                                <label className="air_ring_label">
    Air Ring Set:
    {formErrors.air_ring_set && (
        <span className="error-message">{formErrors.air_ring_set}</span>
    )}
    <br/>
    <input
        className="air_ring_input"
        type="text"
        name="air_ring_set"
        style={{color: 'black', fontWeight: 'bold'}}
        value={(formData.air_ring_set || "").replace(" (AR SET)", "")} // Show only numeric value for editing
        onChange={(e) => {
            const value = e.target.value;
            const numericValue = parseInt(value, 10); // Convert to integer

            // Update the state with only the numeric part
            setFormData((prevData) => ({
                ...prevData,
                air_ring_set: value ? `${value} (AR SET)` : "", // Append "(AP SET)" when user types
                air_ring_ar: numericValue || 0, // Set air_plug_ap to the numeric value or 0 if invalid
                setting_plug_sp: (numericValue || 0) * 2, // Set setting_ring_sr to double the air_plug_set value
            }));
        }}
    />
</label>
                            </div>


                            <div className="form-style6">
                                <div className="formstyle6">
                                    <label className="air_ring_label nominal">
                                        Nominal Size: (in {mmInch})
                                        {formErrors.nominal_size && (
                                            <span className="error-message">{formErrors.nominal_size}</span>
                                        )}
                                        <br/>
                                        <input
                                            type="number"
                                            name="nominal_size"
                                            value={formData.nominal_size}
                                            onChange={handleInputChange}
                                            required
                                            className="air_ring_input"
                                            style={{color: 'black', fontWeight: 'bold'}}

                                        />
                                    </label>
                                    <label className="air_ring_label" style={{marginTop: "27px", marginLeft: "-8px"}}>
                                        <select
                                            type="text"
                                            name="mmToInch"
                                            value={mmInch}
                                            onChange={handleUnitChange}
                                            required
                                            className="air_ring_input"
                                            autoComplete="on"
                                        
                                            style={{color: 'black', fontWeight: 'bold'}}

                                        >
                                            {/* <option disabled value=""></option> */}
                                            <option value="mm">mm</option>
                                            <option value="inch">inch</option>
                                        </select>
                                    </label>
                                </div>


                                <div className="form-labelsize">
                                    <label className="air_ring_label slabel" style={{marginTop: "-10px"}}>
                                        Size in labels:
                                        <br/>
                                        <input
                                            type="text"
                                            name="l_size"
                                            value={formData.l_size || ''}
                                            onChange={(e) => {
                                                const upperCaseValue = e.target.value.toUpperCase(); // Convert to uppercase
                                                setFormData({
                                                    ...formData,
                                                    l_size: upperCaseValue
                                                });
                                            }}
                                            style={{color: 'black', fontWeight: 'bold'}}
                                        />
                                    </label>


                                    <label className="air_ring_label vlabel" style={{marginTop: "20px"}}>

                                    <input
                                            type="number"
                                            name="value_size"
                                            value={formData.value_size || ''}
                                            onChange={handleInputChange}
                                            style={{color: 'black', fontWeight: 'bold'}}


                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="formstyle9">
                                {/* Low Tolerance Input (Editable) */}
                                <label className="air_ring_label">
                                    Low Tolerance:
                                    <br/>
                                    <input
                                        type="number"
                                        name="size_low_tolerance"
                                        value={formData.size_low_tolerance}
                                        onChange={handleInputChange}
                                        onFocus={handleFocus}
                                        className="air_ring_input"
                                        placeholder="Enter Low Tolerance"
                                        style={{color: 'black', fontWeight: 'bold'}}

                                    />
                                </label>

                                {/* High Tolerance Input (Editable) */}
                                <label className="air_ring_label">
                                    High Tolerance:
                                    <br/>
                                    <input
                                        type="number"
                                        name="size_high_tolerance"
                                        value={formData.size_high_tolerance}
                                        onChange={handleInputChange}
                                        onFocus={handleFocus}
                                        className="air_ring_input"
                                        placeholder="Enter High Tolerance"
                                        style={{color: 'black', fontWeight: 'bold'}}

                                    />
                                </label>
                            </div>

                        </div>


                        <div className="form-style7">
                            <label className="air_ring_label1">
                                Jet Type:
                                {formErrors.bore_jet_type && (
                                    <span className="error-message">{formErrors.bore_jet_type}</span>
                                )}
                                <br/>
                                <select
                                    type="text"
                                    name="bore_jet_type"
                                    value={formData.bore_jet_type}
                                    onChange={handleInputChange}
                                    required
                                    className="air_ring_input"
                                    autoComplete="on"
                                    style={{color: 'black', fontWeight: 'bold'}}
                                >
                                    {/*<option disabled value=""></option>*/}
                                    <option value="CJ">CJ</option>
                                    <option value="MJ">MJ</option>
                                </select>
                            </label>

                            <label className="air_ring_label1">
                                Higher/Lower:
                                {/*{formErrors.higher_lower && (*/}
                                {/*    <span className="error-message">{formErrors.higher_lower}</span>*/}
                                {/*)}*/}
                                <br/>
                                <select
                                    type="text"
                                    name="higher_lower"
                                    value={formData.higher_lower}
                                    onChange={handleInputChange}
                                    required
                                    className="air_ring_input"
                                    autoComplete="on"
                                    style={{color: 'black', fontWeight: 'bold'}}
                                >
                                    <option disabled value=""></option>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </label>
                            <label className="air_ring_label1">
                                Dispatch week:
                                {formErrors.dispatch_week && (
                                    <span className="error-message">{formErrors.dispatch_week}</span>
                                )}
                                <br/>

                                <select
                                    type="text"
                                    name="dispatch_week"
                                    value={formData.dispatch_week}
                                    onChange={handleInputChange}
                                    required
                                    className="air_ring_input"
                                    autoComplete="on"
                                    style={{color: 'black', fontWeight: 'bold'}}
                                >
                                    {/*<option disabled value=""></option>*/}
                                    <option
                                        value="1 Week">1-Week
                                    </option>
                                    <option value="2 Week">2-Weeks</option>
                                    <option value="3 Week">3-Weeks</option>
                                    <option selected value="4 Week">4-Weeks</option>
                                </select>
                            </label>

                            <label className="air_ring_label1">
                                Jet Count:
                                {formErrors.jet_count && (
                                    <span className="error-message">{formErrors.jet_count}</span>
                                )}
                                <br/>
                                <select
                                    type="text"
                                    name="jet_count"
                                    value={formData.jet_count}
                                    onChange={handleInputChange}
                                    required
                                    className="air_ring_input"
                                    autoComplete="on"
                                    style={{color: 'black', fontWeight: 'bold'}}
                                >
                                    <option disabled value="">--Select Jet Option</option>
                                    <option value="2-JET">2 Jet</option>
                                    <option value="3-JET">3 Jet</option>
                                    <option value="4-JET">4 Jet</option>
                                    <option value="6-JET">6 Jet</option>

                                </select>
                            </label>

                            <label className="air_ring_label">
                                Remark:
                                <textarea className="air_ring_input" cols={30} rows={4} type="text"
                                          name="remark"
                                          value={formData.remark}
                                          onChange={handleInputChange}
                                          required
                                          style={{color: 'black', fontWeight: 'bold'}}


                                          autoComplete="on"></textarea>

                            </label>
                        </div>

                    </form>
                </div>
                <div className="air_ring__tab-navigation">
                    <button type="submit" onClick={handleSubmit} className="air_ring_button">
                        Submit
                    </button>
                    <Link to="/history" className="air_ring__tab">
                        History
                    </Link>
                </div>
            </div>

            <div className="air_ring__data-container">
                <h3>Today's Entries</h3>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search by Work Order No, Date, or Party Name"
                        value={searchQuery}
                        onChange={handleSearch}
                        className="search-input"
                        autoComplete="on"
                    />
                    <i className="fa fa-search search-icon"></i>
                    {/*<img src="./public/lope.png" alt="vnm" />*/}
                </div>
                

                <div className="airring_table-container" ref={printRef}>
                    <table className="air_ring__table">
                        <thead className="air_ring_head">
                        <tr>
                            <th>Work Order NO & DATE <br/>
                                PARTY NAME
                            </th>
                            <th>NOMINAL SIZE</th>
                            {/*<th>City</th>*/}
                            {/*<th>Units</th>*/}
                            <th>Jet Count</th>
                            <th>Bore/JET Type</th>
                            <th>Higher/Lower</th>
                            <th>Sub Sr No</th>
                            <th>Qty.</th>
                            <th>Set</th>
                            {/*<th>Dispatch week</th>*/}
                            <th>Remark</th>
                            <th>QR Codes</th>
                            <th>Action</th>

                        </tr>
                        </thead>
                        <tbody>
                        {filteredData.map((entry, index) => {
                            // const qrData = generateQRCodeData(entry);
                            // let subSrNo = 1;

                            // Tolerance Check Logic
                            const size_low_tolerance = parseFloat(entry.size_low_tolerance);
                            const size_high_tolerance = parseFloat(entry.size_high_tolerance);
                            let errorMessage = '';

                            const handleQRCodeClick = () => {
                                // Construct the dynamic URL
                                const url = `/ProgressBar/${entry.record_sr_no}/${entry.party_name}`;

                                // Navigate to the constructed URL
                                navigate(url);
                            };

                            return (
                                <tr key={entry.record_sr_no}>
                                    {/* Displaying work order number and date */}
                                    <td>
                                        <strong className="table-style">
                                            <span className="work-order-no">{entry.work_order_no}</span>
                                            <span className="date">{entry.formatted_date}</span>
                                        </strong>
                                        <br/>
                                        <span className="airring_party-name">{entry.party_name}</span>
                                        <br/>
                                        <span className="airring_party-name">{entry.city}</span>
                                    </td>

                                    <td>
                                        <strong>SIZE: {entry.nominal_size}</strong>
                                        <strong className="label_size">
    {entry.label_size && entry.label_size !== 'undefinedundefined' ? `${entry.label_size}` : ''}
</strong>                                        
                                        <br/>
                                        {
                                            // Show the error message or valid tolerance values
                                            errorMessage ? (
                                                <div>
                                                    <strong style={{color: 'red'}}>{errorMessage}</strong>
                                                </div>
                                            ) : (
                                                <strong>
                                                    TOL: {size_low_tolerance} / {size_high_tolerance}
                                                </strong>
                                            )
                                        }
                                        <br/>
                                        <strong>UNIT: {entry.units}</strong>
                                    </td>

                                    <td>{entry.jet_count}</td>
                                    <td>{entry.bore_jet_type}</td>
                                    {/* Assign and increment sub serial number */}
                                    <td>{entry.higher_lower}</td>
                                    <td>{entry.sub_sr_no}</td>
                                    <td>{entry.qty}</td>
                                    <td>{entry.air_ring_set}</td>
                                    {/*<td>{entry.dispatch_date}</td>*/}

                                    <td>{entry.remark}</td>
                                    <td className="qr-code" onClick={handleQRCodeClick} style={{cursor: "pointer"}}>
                                        <QRCodeSVG
                                            value={`${BASE_URL}:3000/ProgressBar/${entry.record_sr_no}/${entry.party_name}`}
                                            size={60}
                                            level="H"
                                        />
                                    </td>
                                    <td>
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEdit(entry)}
                                    >
                                        Edit
                                    </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(entry.record_sr_no)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
                {/* <button 
  onClick={handleUpdateMainTable}
  className="update-btn"
  disabled={updateCount === 0}
  style={{
    fontSize:'18px',
    fontWeight:'600',
    backgroundColor: '#17ab2a',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    cursor: updateCount > 0 ? 'pointer' : 'not-allowed',
    opacity: updateCount > 0 ? 1 : 0.6
  }}
>
  Update Entries ({updateCount} pending)
</button> */}

                    <button 
    onClick={handleDeleteAll}
    className="delete-all-btn"
    style={{
      fontSize:'18px',
      fontWeight:'600',
      marginLeft: '10px',
      backgroundColor: '#ed050e',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer'
    }}
  >
    Delete All Data
  </button>
            </div>
        </div>
    );
};

export default AirRing;