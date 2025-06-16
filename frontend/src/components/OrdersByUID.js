// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./OrdersByUID.css"; // Import the CSS file
// import { useNavigate } from "react-router-dom";

// const OrdersByUID = () => {
//   const [uid, setUid] = useState("");
//   const [range, setRange] = useState("1month");
//   const [month, setMonth] = useState("");
//   const [year, setYear] = useState("");
//   const [category, setCategory] = useState("all");
//   const [orders, setOrders] = useState([]);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();
//   const [isFirstLoad, setIsFirstLoad] = useState(true);


//   useEffect(() => {
//     const fetchParties = async () => {
//       try {
//         const response = await axios.get("http://localhost:5000/api/parties");
//         setPartyList(response.data);
//       } catch (err) {
//         console.error("Error fetching party list", err);
//       }
//     };
//     fetchParties();
//   }, []);

//   useEffect(() => {
//     if (!isFirstLoad) {
//       fetchOrders();
//     } else {
//       setIsFirstLoad(false);
//     }
//   }, [uid, range, category, month, year]);

//   const fetchOrders = async () => {
//     if (!uid.trim()) {
//       setError("Please enter a UID.");
//       return;
//     }
//     try {
//       setError("");
//       const params = { uid, range, category };
//       if (range === "manual") {
//         params.month = month;
//         params.year = year;
//       }
//       const response = await axios.get("http://localhost:5000/api/orders", { params });
//       setOrders(Array.isArray(response.data) ? response.data : []);
//     } catch (err) {
//       setError(err.response?.data?.error || "Error fetching orders.");
//       setOrders([]);
//     }
//   };

//   const handlePartyChange = (e) => {
//     const partyName = e.target.value;
//     setSelectedParty(partyName);
//     const selected = partyList.find(party => `${party.name} (${party.city})` === partyName);
//     if (selected) setUid(selected.uid);
//   };

//   const groupedOrders = Array.isArray(orders)
//     ? orders.reduce((acc, order) => {
//         if (!acc[order.work_order_no]) {
//           acc[order.work_order_no] = [];
//         }
//         acc[order.work_order_no].push(order);
//         return acc;
//       }, {})
//     : {};

//   return (
//     <div className="order-main-container">
//             <div className="content-container">
//                     <button className="w_back-button" onClick={() => navigate(-1)}>⬅ Back</button>
//                 <div className="form-section">
//                     <div className="order-form-container">
//                         <h2 className="section-title">Purchase Orders</h2>

//                         {/* UID and Category in single row */}
//                         <div className="input-row">
//                             <div className="input-group">
//                             <label htmlFor="uid-input" className="form-label1">
//                                 UID
//                             </label>
//                                 <input
//                                     id="uid-input"
//                                     type="text"
//                                     placeholder="Enter UID"
//                                     value={uid}
//                                     onChange={(e) => setUid(e.target.value)}
//                                     className="input-field"
//                                 />
//                             </div>
                            
//                             <div className="input-group">
//                             <label htmlFor="category-select" className="form-label1">
//                                 Category
//                             </label>
//                                 <select
//                                     id="category-select"
//                                     value={category}
//                                     onChange={(e) => setCategory(e.target.value)}
//                                     className="order-dropdown"
//                                 >
//                                     <option value="all">All Categories</option>
//                                     <option value="Air Plug">Air Plug</option>
//                                     <option value="Air Ring">Air Ring</option>
//                                     <option value="Air Snap">Air Snap</option>
//                                 </select>
//                             </div>
//                         </div>

//                         <div className="order-dropdown-group">
//                         <label htmlFor="date-range" className="form-label1">
//                                 Date Range
//                             <select
//                                 id="date-range"
//                                 value={range}
//                                 onChange={(e) => {
//                                     setRange(e.target.value);
//                                     if (e.target.value !== "manual") {
//                                         setMonth("");
//                                         setYear("");
//                                     }
//                                 }}
//                                 className="order-dropdown"
//                             >
//                                 <option value="1month">Last 1 Month</option>
//                                 <option value="3months">Last 3 Months</option>
//                                 <option value="6months">Last 6 Months</option>
//                                 <option value="1year">Last 1 Year</option>
//                                 <option value="manual">Select Month & Year</option>
//                             </select>
//                                 </label>
//                             {range === "manual" && (
//                                 <>

//                                     <label htmlFor="month-select" className="form-label1">
//                                         Month
//                                     <select
//                                         id="month-select"
//                                         value={month}
//                                         onChange={(e) => setMonth(e.target.value)}
//                                         className="order-dropdown"
//                                     >
//                                         {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
//                                             <option key={m} value={m}>
//                                                 {new Date(0, m - 1).toLocaleString("default", {
//                                                     month: "long",
//                                                 })}
//                                             </option>
//                                         ))}
//                                     </select>
//                                         </label>
//                                     <label htmlFor="year-select" className="form-1 form-label1">
//                                         Year
//                                     <select
//                                         id="year-select"
//                                         value={year}
//                                         onChange={(e) => setYear(e.target.value)}
//                                         className="order-dropdown"
//                                         >
//                                         {Array.from(
//                                             { length: 5 },
//                                             (_, i) => new Date().getFullYear() - i
//                                         ).map((y) => (
//                                             <option key={y} value={y}>
//                                                 {y}
//                                             </option>
//                                         ))}
//                                     </select>
//                                         </label>
//                                 </>
//                             )}
//                         </div>
//                         {error && <p className="error-text">{error}</p>}
                        
//                         <div className="order-button-group">
//                             <button onClick={fetchOrders} className="btn-fetch">
//                                 Fetch Party Orders
//                             </button>
//                             <button onClick={() => navigate("/customerdetail")} className="btn-navigate">
//                                 Go to Customer Details
//                             </button>
//                         </div>


//                     </div>
//                 </div>
//             </div>

            

//       <div className="orders-section">
//               <h3 className="order-title2">Order Summary</h3>
//           <div className="orders-container">
//         {orders.length > 0 ? (
//             <div className="orders-wrapper">
//               <table className="orders-table">
//                 <thead>
//                   <tr>
//                     <th>Work Order</th>
//                     {!category.includes("all") && <th>Sub-SR No.</th>}
//                     <th>Category</th>
//                     <th>No. of Orders</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {Object.entries(groupedOrders).map(
//                     ([workOrderNo, entries], workOrderIndex) => {
//                       const uniqueSubSrNos = [
//                         ...new Set(entries.map((entry) => entry.sub_sr_no)),
//                       ].join(", ");
//                       return (
//                         <tr  key={workOrderIndex}>
//                           <td className="order-work-no">
//                             <strong>{entries[0].work_order_no}</strong>
//                             <br />
//                             <strong>{entries[0].party_name}</strong>
//                             <br />
//                             <strong>{entries[0].city}</strong>
//                           </td>
//                           {!category.includes("all") && (
//                             <td>{uniqueSubSrNos}</td>
//                           )}
//                           <td>
//                             {category.includes("all")
//                               ? "All"
//                               : entries[0].category}
//                           </td>
//                           <td>{entries.length}</td>
//                         </tr>
//                       );
//                     }
//                   )}
//                 </tbody>
//               </table>
//             </div>
//         ) : (
//             <p className="no-orders">No orders found for the given criteria.</p>
//         )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrdersByUID;



import React, {useRef, useState, useEffect } from "react";
import axios from "axios";
import "./OrdersByUID.css";
import { useNavigate } from "react-router-dom";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const OrdersByUID = () => {
  const [uid, setUid] = useState("");
  const [range, setRange] = useState("1month");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState("all");
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [graphData, setGraphData] = useState([]);
  const [showGraph, setShowGraph] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const graphRef = useRef(null);
  const insightsRef = useRef(null);
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("workOrder"); // 'all' or 'workOrder'
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (uid) {
      fetchOrders();
    }
  }, [uid, range, category, month, year]);

  const fetchOrders = async () => {
    if (!uid.trim()) {
      setError("Please enter a UID.");
      return;
    }
    try {
      setError("");
      const params = { uid, range, category };
      if (range === "manual") {
        params.month = month;
        params.year = year;
      }
      const response = await axios.get("http://localhost:5000/api/orders", { params });
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.error || "Error fetching orders.");
      setOrders([]);
    }
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const fetchGraphData = async () => {
    if (!uid.trim()) {
      setError("Please enter a UID.");
      return;
    }

    try {
      setError("");
      const params = { uid, range, category };
      if (range === "manual") {
        params.month = month;
        params.year = year;
      }

      const response = await axios.get("http://localhost:5000/api/orders", { params });

      if (!Array.isArray(response.data) || response.data.length === 0) {
        setError("No data found for the given UID and date range.");
        setGraphData([]);
        setShowGraph(false);
        return;
      }

      const categoryColors = { "Air Plug": "#8884d8", "Air Ring": "#82ca9d", "Air Snap": "#ffc658" };
      const groupedData = {};

      response.data.forEach((order) => {
        if (!order.date) return;

        const orderMonth = new Date(order.date).getMonth();
        const monthName = monthNames[orderMonth];

        if (!groupedData[monthName]) {
          groupedData[monthName] = { month: monthName, "Air Plug": 0, "Air Ring": 0, "Air Snap": 0 };
        }

        if (category === "all") {
          if (categoryColors[order.category]) {
            groupedData[monthName][order.category]++;
          }
        } else if (order.category === category) {
          groupedData[monthName][order.category]++;
        }
      });

      const formattedData = Object.values(groupedData);

      setGraphData(formattedData);
      setShowGraph(formattedData.length > 0);
    } catch (err) {
      setError(err.response?.data?.error || "Error fetching graph data.");
      setGraphData([]);
      setShowGraph(false);
    }
  };
  
  const chartData = {
    labels: graphData.map(item => item.month),
    datasets: category === 'all' ? [
      {
        label: 'Air Plug',
        data: graphData.map(item => item['Air Plug']),
        backgroundColor: '#8884d8',
        barPercentage: 0.2, // Adjust bar width
      },
      {
        label: 'Air Ring',
        data: graphData.map(item => item['Air Ring']),
        backgroundColor: '#82ca9d',
        barPercentage: 0.2,
      },
      {
        label: 'Air Snap',
        data: graphData.map(item => item['Air Snap']),
        backgroundColor: '#ffc658',
        barPercentage: 0.2,
      }
    ] : [
      {
        label: category,
        data: graphData.map(item => item[category]),
        backgroundColor: category === 'Air Plug' ? '#8884d8' : 
                        category === 'Air Ring' ? '#82ca9d' : 
                        category === 'Air Snap' ? '#ffc658': '#ffc658',
      }
    ]
  };
  
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                font: {
                    size: 16,
                    weight: 'bold',
                    color: '#000'
                }
            }
        },
        title: {
            display: true,
            text: 'Order Trends',
            font: {
                size: 20,
                weight: 'bold',
                color: '#000'
            }
        },
        tooltip: {
            enabled: true, // Keep tooltips enabled for hover information
        },
        // Disable data labels
        datalabels: {
            display: false // Set to false to hide data labels inside the bars
        }
    },
    scales: {
        x: {
            stacked: category === 'all',
            title: {
                display: true,
                text: 'Months',
                font: {
                    size: 16,
                    weight: 'bold',
                    color: '#000'
                }
            },
            ticks: {
                font: {
                    size: 14,
                    weight: 'bold',
                    color: '#000'
                }
            }
        },
        y: {
            stacked: category === 'all',
            title: {
                display: true,
                text: 'Number of Orders',
                font: {
                    size: 16,
                    weight: 'bold',
                    color: '#000'
                }
            },
            ticks: {
                font: {
                    size: 14,
                    weight: 'bold',
                    color: '#000'
                },
                beginAtZero: true,
                precision: 0
            }
        }
    },
    layout: {
        padding: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
        }
    }
};

  const processGraphData = (entries) => {
    const groupedData = {};
    
    entries.forEach((order) => {
      if (!order.date) return;
      const orderMonth = new Date(order.date).getMonth();
      const monthName = monthNames[orderMonth];

      if (!groupedData[monthName]) {
        groupedData[monthName] = { 
          month: monthName, 
          "Air Plug": 0, 
          "Air Ring": 0, 
          "Air Snap": 0 
        };
      }

      if (category === "all") {
        if (groupedData[monthName][order.category] !== undefined) {
          groupedData[monthName][order.category]++;
        }
      } else if (order.category === category) {
        groupedData[monthName][order.category]++;
      }
    });

    return Object.values(groupedData);
  };

  // Add new function to analyze customer patterns
  const analyzeCustomerPatterns = (orders) => {
    if (!orders.length) return null;

    const patterns = {
      totalOrders: orders.length,
      categories: {},
      monthlyPattern: {},
      consistency: 0,
      mostFrequentCategory: '',
      averageOrdersPerMonth: 0,
      lastOrderDate: null,
      firstOrderDate: null
    };

    // Calculate category distribution
    orders.forEach(order => {
      patterns.categories[order.category] = (patterns.categories[order.category] || 0) + 1;
      
      // Track dates
      const orderDate = new Date(order.date);
      if (!patterns.lastOrderDate || orderDate > patterns.lastOrderDate) {
        patterns.lastOrderDate = orderDate;
      }
      if (!patterns.firstOrderDate || orderDate < patterns.firstOrderDate) {
        patterns.firstOrderDate = orderDate;
      }
    });

    // Find most frequent category
    patterns.mostFrequentCategory = Object.entries(patterns.categories)
      .sort((a, b) => b[1] - a[1])[0][0];

    // Calculate monthly pattern
    const monthsDiff = (patterns.lastOrderDate - patterns.firstOrderDate) / (1000 * 60 * 60 * 24 * 30);
    patterns.averageOrdersPerMonth = monthsDiff > 0 ? patterns.totalOrders / monthsDiff : patterns.totalOrders;

    // Calculate consistency (orders per month)
    const monthlyOrders = {};
    orders.forEach(order => {
      const month = new Date(order.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyOrders[month] = (monthlyOrders[month] || 0) + 1;
    });

    const averageMonthlyOrders = Object.values(monthlyOrders).reduce((a, b) => a + b, 0) / Object.keys(monthlyOrders).length;
    patterns.consistency = averageMonthlyOrders;

    return patterns;
  };

  const groupedOrders = Array.isArray(orders) ? orders.reduce((acc, order) => {
    if (viewMode === "workOrder") {
        if (!acc[order.work_order_no]) {
          acc[order.work_order_no] = [];
        }
        acc[order.work_order_no].push(order);
    } else {
      const key = `${order.party_name}|${order.city}`;
      if (!acc[key]) {
        acc[key] = {
          party_name: order.party_name,
          city: order.city,
          count: 0,
          sub_sr_nos: new Set()
        };
      }
      acc[key].count++;
      if (order.sub_sr_no) acc[key].sub_sr_nos.add(order.sub_sr_no);
    }
        return acc;
  }, {}) : {};

  const scrollToGraph = () => {
    graphRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToInsights = () => {
    insightsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="order-main-container">
      <div className="content-container">
        <button className="w_back-button" onClick={() => navigate(-1)}>⬅ Back</button>
        <div className="form-section">
          <div className="order-form-container">
            <h2 className="section-title">Purchase Orders</h2>

            {/* UID and Category in single row */}
            <div className="input-row">
              <div className="input-group">
                <label htmlFor="uid-input" className="form-label1" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  UID
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
    Click on ➝ "Go to UID Details" ➝ then Click on "Show All Details" ➝ Search for the party to find its UID.
</p>
                        </div>
                    )}
                </span>
                </label>

                <input
                  id="uid-input"
                  type="text"
                  placeholder="Enter UID"
                  value={uid}
                  onChange={(e) => setUid(e.target.value.toUpperCase())}
                  className="input-field"
                />
              </div>
              
              <div className="input-group">
                <label htmlFor="category-select" className="form-label1">
                  Category
                </label>
                <select
                  id="category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="order-dropdown"
                >
                  <option value="all">All Categories</option>
                  <option value="Air Plug">Air Plug</option>
                  <option value="Air Ring">Air Ring</option>
                  <option value="Air Snap">Air Snap</option>
                </select>
              </div>

              <div className="input-group">
              <label htmlFor="view-mode-select" className="form-label1">
                View Mode
              </label>
              <select
                id="view-mode-select"
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="order-dropdown"
              >
                <option value="workOrder">Work Order Wise</option>
                <option value="all">All Data</option>
                </select>
              </div>
            </div>


            <div className="order-dropdown-group">
              <label htmlFor="date-range" className="form-label1">
                Date Range
                <select
                  id="date-range"
                  value={range}
                  onChange={(e) => {
                    setRange(e.target.value);
                    if (e.target.value !== "manual") {
                      setMonth("");
                      setYear("");
                    }
                  }}
                  className="order-dropdown"
                >
                  <option value="1month">Last 1 Month</option>
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last 1 Year</option>
                  <option value="manual">Select Month & Year</option>
                </select>
              </label>
              {range === "manual" && (
                <>
                  <label htmlFor="month-select" className="form-label1">
                    Month
                    <select
                      id="month-select"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="order-dropdown"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {new Date(0, m - 1).toLocaleString("default", {
                            month: "long",
                          })}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label htmlFor="year-select" className="form-1 form-label1">
                    Year
                    <select
                      id="year-select"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="order-dropdown"
                    >
                      {Array.from(
                        { length: 5 },
                        (_, i) => new Date().getFullYear() - i
                      ).map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}
            </div>
            {error && <p className="error-text">{error}</p>}
            
            <div className="order-button-group">
              <button onClick={fetchOrders} className="btn-fetch">
                Fetch Party Orders
              </button>
              {/* <button onClick={fetchGraphData} className="btn-graph">
                View Graph
              </button> */}
              <button onClick={() => navigate("/customerdetail")} className="btn-navigate">
                Go to UID Details
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="orders-section">
        <h3 className="order-title2">Order Summary</h3>
        <div className="orders-container" style={{ 
          maxHeight: '500px',
          overflowY: 'auto',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderRadius: '8px'
        }}>
          {orders.length > 0 ? (
            <div className="orders-wrapper">
              <table className="orders-table" style={{ width: '100%' }}>
                <thead style={{ 
                  position: 'sticky', 
                  top: 0, 
                  backgroundColor: '#f8f9fa',
                  zIndex: 1
                }}>
                  <tr>
                    <th>{viewMode === "workOrder" ? "Work Order" : "Party Name"}</th>
                    {!category.includes("all") && <th>Sub-SR No.</th>}
                    {viewMode === "workOrder" && <th>Category</th>}
                    <th>No. of Orders</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedOrders).map(([key, entries], index) => {
                    if (viewMode === "workOrder") {
                      return (
                        <tr key={index}>
                          <td className="order-work-no">
                            <strong>{entries[0].work_order_no}</strong>
                            <br />
                            <strong>{entries[0].party_name}</strong>
                            <br />
                            <strong>{entries[0].city}</strong>
                          </td>
                          {!category.includes("all") && <td>{[...new Set(entries.map(entry => entry.sub_sr_no))].join(", ")}</td>}
                          <td>
                            {category === "all" 
                              ? entries[0].category 
                              : category}
                          </td>
                          <td>{entries.length}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ 
                              display: 'flex', 
                              gap: '10px',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}>
                              <button 
                                onClick={() => {
                                  const dataToShow = viewMode === "workOrder" 
                                    ? entries 
                                    : orders.filter(order => 
                                        order.party_name === entries.party_name && 
                                        order.city === entries.city
                                      );
                                  
                                  const formattedData = processGraphData(dataToShow);
                                  setGraphData(formattedData);
                                  setShowGraph(formattedData.length > 0);
                                  setTimeout(scrollToGraph, 100);
                                }}
                                className="btn-graph"
                                style={{
                                  padding: '8px 15px',
                                  backgroundColor: 'green',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.3s',
                                  minWidth: '100px'
                                }}
                              >
                                View Graph
                              </button>
                              <button 
                                onClick={() => {
                                  setShowInsights(true);
                                  setTimeout(scrollToInsights, 100);
                                }}
                                className="btn-insights"
                                style={{
                                  padding: '8px 15px',
                                  backgroundColor: 'blue',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.3s',
                                  minWidth: '100px'
                                }}
                              >
                                View Insights
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    } else {
                      return (
                        <tr key={index}>
                          <td className="order-work-no">
                            <strong>{entries.party_name}</strong>
                            <br />
                            <strong>{entries.city}</strong>
                          </td>
                          {!category.includes("all") && <td>{[...entries.sub_sr_nos].join(", ")}</td>}
                          <td>{entries.count}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button 
                              onClick={() => {
                                const dataToShow = viewMode === "workOrder" 
                                  ? entries 
                                  : orders.filter(order => 
                                      order.party_name === entries.party_name && 
                                      order.city === entries.city
                                    );
                                
                                const formattedData = processGraphData(dataToShow);
                                setGraphData(formattedData);
                                setShowGraph(formattedData.length > 0);
                              }}
                              className="btn-graph"
                            >
                              View Graph
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-orders">No orders found for the given criteria.</p>
          )}
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: '20px'
        }}>
          <button 
            onClick={() => {
              setShowInsights(true);
              setTimeout(scrollToInsights, 100);
            }}
            style={{
              padding: '12px 25px',
              backgroundColor: 'blue',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '1.1em',
              fontWeight: '600',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              ':hover': {
                backgroundColor: '#1976D2',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
              }
            }}
          >
            View Customer Insights
          </button>
        </div>
      </div>

      <div ref={graphRef} className="graph-container" style={{ 
        margin: '40px 0',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
      }}>
        <h3 style={{ 
          color: '#333',
          marginBottom: '20px',
          paddingBottom: '10px',
          fontSize: '40px'

        }}>Purchase Graph</h3>
        {showGraph && (
          <div style={{  
            height: '500px',
            margin: '20px 0',
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <Bar data={chartData} options={options} />
          </div>
        )}
      </div>

      {orders.length > 0 && (
        <div ref={insightsRef} className="customer-insights" style={{
          margin: '40px 0',
          padding: '30px',
          background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
          borderRadius: '12px',
        }}>
          <h3 style={{ 
            color: '#333',
            marginBottom: '20px',
            paddingBottom: '10px',
            borderBottom: '2px solidrgb(10, 10, 10)',
            fontSize: '40px', 
            textAlign:'center'
          }}>Customer Insights</h3>
          {(() => {
            const patterns = analyzeCustomerPatterns(orders);
            if (!patterns) return null;

            const customerType = patterns.averageOrdersPerMonth > 2 ? 'Frequent' : 
                               patterns.averageOrdersPerMonth > 0.5 ? 'Regular' : 'Occasional';

            return (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '25px',
                marginTop: '20px'
              }}>
                <div className="insight-card" style={{
                  padding: '25px',
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  border: '1px solid #e0e0e0',
                  ':hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                    borderColor: '#4CAF50'
                  }
                }}>
                  <h4 style={{ 
                    color: 'var(--primary-color)',
                    marginBottom: '20px',
                    fontSize: '1.3em',
                    fontWeight: '600',
                    paddingBottom: '10px',
                    borderBottom: '2px solid rgb(15, 14, 14)'
                  }}>Ordering Pattern</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0'
                    }}>
                      <span style={{ color: 'var(--primary-color)', fontSize: '1.05em' }}>Customer Type</span>
                      <strong style={{ color: '#2196F3', fontSize: '1.1em' }}>{customerType}</strong>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0'
                    }}>
                      <span style={{ color: 'var(--primary-color)', fontSize: '1.05em' }}>Average Orders/Month</span>
                      <strong style={{ color: '#2196F3', fontSize: '1.1em' }}>{patterns.averageOrdersPerMonth.toFixed(1)}</strong>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0'
                    }}>
                      <span style={{ color: 'var(--primary-color)', fontSize: '1.05em' }}>Total Orders</span>
                      <strong style={{ color: '#2196F3', fontSize: '1.1em' }}>{patterns.totalOrders}</strong>
                    </div>
                  </div>
                </div>

                <div className="insight-card" style={{
                  padding: '25px',
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  border: '1px solid #e0e0e0',
                  ':hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                    borderColor: '#4CAF50'
                  }
                }}>
                  <h4 style={{ 
                    color: 'var(--primary-color)',
                    marginBottom: '20px',
                    fontSize: '1.3em',
                    fontWeight: '600',
                    paddingBottom: '10px',
                    borderBottom: '2px solid rgb(15, 14, 14)'
                  }}>Category Preference</h4>
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      marginBottom: '15px'
                    }}>
                      <span style={{ color: 'var(--primary-color)', fontSize: '1.05em' }}>Most Ordered</span>
                      <strong style={{ color: '#2196F3', fontSize: '1.1em' }}>{patterns.mostFrequentCategory}</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {Object.entries(patterns.categories).map(([category, count]) => (
                      <div key={category} style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 0',
                        borderBottom: '1px solid #f0f0f0'
                      }}>
                        <span style={{ color: 'var(--primary-color)', fontSize: '1.05em' }}>{category}</span>
                        <div style={{ 
                          backgroundColor: '#e3f2fd',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          color: '#2196F3',
                          fontWeight: '600'
                        }}>
                          {count} orders
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="insight-card" style={{
                  padding: '25px',
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  border: '1px solid #e0e0e0',
                  ':hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                    borderColor: '#4CAF50'
                  }
                }}>
                  <h4 style={{ 
                    color: 'var(--primary-color)',
                    marginBottom: '20px',
                    fontSize: '1.3em',
                    fontWeight: '600',
                    paddingBottom: '10px',
                    borderBottom: '2px solid rgb(15, 14, 14)'
                  }}>Order History</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      color:'var(--primary-color)'
                    }}>
                      <span style={{ color: 'var(--primary-color)', fontSize: '1.05em' }}>First Order</span>
                      <strong style={{ color: '#2196F3', fontSize: '1.1em' }}>{patterns.firstOrderDate.toLocaleDateString()}</strong>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0'
                    }}>
                      <span style={{ color: 'var(--primary-color)', fontSize: '1.05em' }}>Last Order</span>
                      <strong style={{ color: '#2196F3', fontSize: '1.1em' }}>{patterns.lastOrderDate.toLocaleDateString()}</strong>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0'
                    }}>
                      <span style={{ color: 'var(--primary-color)', fontSize: '1.05em' }}>Consistency</span>
                      <strong style={{ color: '#2196F3', fontSize: '1.1em' }}>{patterns.consistency.toFixed(1)} orders/month</strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default OrdersByUID;
