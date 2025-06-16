import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2"; // Import Line chart
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels"; // Import the plugin
import "./InventoryRecommendation.css";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
);

const InventoryRecommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(true);
    const [errorRecommendations, setErrorRecommendations] = useState(null);
    const [selectedOption, setSelectedOption] = useState("Last 12 Months"); // Default option

    // Fetch recommendations data
    const fetchRecommendations = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/recommendations");
            if (!response.ok) throw new Error("Failed to fetch recommendations");
            const data = await response.json();
            console.log("Recommendations Data:", data); // Log fetched data
            setRecommendations(data || []);
        } catch (err) {
            setErrorRecommendations(err.message);
        } finally {
            setLoadingRecommendations(false);
        }
    };

    // Fetch recommendations on component mount
    useEffect(() => {
        fetchRecommendations();
    }, []);

    // Filter recommendations based on the selected option
    const getFilteredRecommendations = () => {
        const currentDate = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(currentDate.getMonth() + 1); // Get the next month

        let filteredData = [];

        switch (selectedOption) {
            case "Last Month": {
                const lastMonth = new Date();
                lastMonth.setMonth(currentDate.getMonth() - 1); // Get the last month

                filteredData = recommendations.filter((item) => {
                    const itemDate = new Date(item.month);
                    return (
                        itemDate.getFullYear() === lastMonth.getFullYear() &&
                        itemDate.getMonth() === lastMonth.getMonth()
                    );
                });
                break;
            }

            case "Last 3 Months": {
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(currentDate.getMonth() - 3); // 3 months ago

                filteredData = recommendations.filter((item) => {
                    const itemDate = new Date(item.month);
                    return itemDate >= threeMonthsAgo && itemDate < nextMonth;
                });
                break;
            }

            case "Last 6 Months": {
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(currentDate.getMonth() - 6); // 6 months ago

                filteredData = recommendations.filter((item) => {
                    const itemDate = new Date(item.month);
                    return itemDate >= sixMonthsAgo && itemDate < nextMonth;
                });
                break;
            }

            case "Last 12 Months": {
                const twelveMonthsAgo = new Date();
                twelveMonthsAgo.setMonth(currentDate.getMonth() - 12); // 12 months ago

                filteredData = recommendations.filter((item) => {
                    const itemDate = new Date(item.month);
                    return itemDate >= twelveMonthsAgo && itemDate < nextMonth;
                });
                break;
            }

            case "Next Month Prediction": {
                filteredData = recommendations.filter((item) =>
                    item.hasOwnProperty("next_month_prediction_air_plug")
                );
                break;
            }

            default:
                filteredData = [];
        }

        // Sort the table data by month in descending order (most recent first)
        const sortedForTable = [...filteredData].sort((a, b) => new Date(b.month) - new Date(a.month));

        // Sort the graph data by month in ascending order (oldest to newest)
        const sortedForGraph = [...filteredData].sort((a, b) => new Date(a.month) - new Date(b.month));

        return { sortedForTable, sortedForGraph };
    };

    const { sortedForTable, sortedForGraph } = getFilteredRecommendations();

    // Handle option change
    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    return (
        <div className="dashboard-container">
            <section className="recommendations-section">
                <h1 className="Inventory-title">Inventory Recommendation Dashboard</h1>

                {/* Option Selector */}
                <div className="option-selector">
                    <label className="data-range-select" htmlFor="option-select">Select Data Range: </label>
                    <select id="option-select" value={selectedOption} onChange={handleOptionChange}>
                        <option selected="selected" value="Last Month">Last Month</option>
                        <option value="Last 3 Months">Last 3 Months</option>
                        <option value="Last 6 Months">Last 6 Months</option>
                        <option value="Last 12 Months">Last 12 Months</option>
                        <option value="Next Month Prediction">Next Month Prediction</option>
                    </select>
                </div>

                {/*<h2>Inventory Recommendations</h2>*/}
                {loadingRecommendations ? (
                    <p>Loading recommendations...</p>
                ) : errorRecommendations ? (
                    <p style={{ color: "red" }}>{errorRecommendations}</p>
                ) : sortedForTable.length > 0 ? (
                    <div>
                        <h3 className="Inventory-title-2">
                            Inventory Data of {selectedOption}
                        </h3>
                        <div className="Inventory-container">
                            <table className="recommendations-table">
                                <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Required Air Plug AP</th>
                                    <th>Predicted Air Plug AP</th>
                                    <th>Required Setting Ring SR</th>
                                    <th>Predicted Setting Ring SR</th>
                                    <th>Prediction for Next Month</th>
                                    <th>Air Plug AP Trend</th>
                                    <th>Setting Ring SR Trend</th>
                                </tr>
                                </thead>
                                <tbody>
                                {sortedForTable.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item?.month || "N/A"}</td>
                                        <td>{item?.required_air_plug_ap || "N/A"}</td>
                                        <td>{item?.predicted_air_plug_ap || "N/A"}</td>
                                        <td>{item?.required_setting_ring_sr || "N/A"}</td>
                                        <td>{item?.predicted_setting_ring_sr || "N/A"}</td>
                                        <td>{item?.next_month_prediction_air_plug || "N/A"}</td>
                                        <td>{item?.trend_air_plug_ap || "N/A"}</td>
                                        <td>{item?.trend_setting_ring_sr || "N/A"}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <p>No data available for the selected option.</p>
                )}

                {/* Line Chart */}
                {sortedForGraph.length > 0 && (
                    <Line
                        className="analytics-chart"
                        data={{
                            labels: sortedForGraph.map((item) => item?.month || ""),
                            datasets: [
                                {
                                    label: "Air Plug AP",
                                    data: sortedForGraph.map(
                                        (item) => item?.required_air_plug_ap || item?.next_month_prediction_air_plug || 0
                                    ),
                                    borderColor: "rgba(75, 192, 192, 1)",
                                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                                    borderWidth: 3,
                                    tension: 0.3, // Slightly lower tension for smoother curves
                                    fill: false,
                                    pointRadius: 10, // Increased point size
                                    pointBackgroundColor: "rgba(75, 192, 192, 1)",
                                    pointBorderWidth: 4,
                                    pointHoverRadius: 35, // Increased hover size for better visibility
                                    pointHoverBackgroundColor: "rgba(75, 192, 192, 0.8)", // Different hover color for distinction
                                    datalabels: {
                                        color: 'black',
                                        font: {
                                            size: 20,
                                            weight: 'bold',
                                            family: 'Arial',
                                        },
                                    },
                                },
                                {
                                    label: "Setting Ring SR",
                                    data: sortedForGraph.map(
                                        (item) => item?.required_setting_ring_sr || item?.next_month_prediction_setting_ring || 0
                                    ),
                                    borderColor: "rgb(89,10,248)",
                                    backgroundColor: "rgba(153, 102, 255, 0.2)",
                                    borderWidth: 3,
                                    tension: 0.3, // Slightly lower tension for smoother curves
                                    fill: false,
                                    pointRadius: 10, // Increased point size
                                    pointBackgroundColor: "rgb(89,10,248)",
                                    pointBorderWidth: 4,
                                    pointHoverRadius: 35, // Increased hover size for better visibility
                                    pointHoverBackgroundColor: "rgba(89,10,248, 0.8)", // Different hover color for distinction
                                    datalabels: {
                                        color: 'black',
                                        font: {
                                            size: 20,
                                            weight: 'bold',
                                            family: 'Arial',
                                        },
                                    },
                                },
                            ],
                        }}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: "bottom",  // Move the legend to the bottom
                                    labels: {
                                        font: {
                                            size: 20,
                                            weight: "bold",
                                            family: "Arial",
                                            color: "white",
                                        },
                                        padding: 20,  // Add padding between legend items
                                    },
                                },
                                datalabels: {
                                    display: true,
                                    align: "top",
                                    formatter: (value) => value.toFixed(1),
                                },
                            },
                            scales: {
                                x: {
                                    grid: {
                                        display: false,
                                    },
                                    ticks: {
                                        font: {
                                            size: 20,
                                            weight: "bold",
                                            family: "Arial",
                                            color: "white",
                                        },
                                    },
                                    padding: 20,
                                    offset: true, // Offset to prevent clumping
                                },
                                y: {
                                    grid: { display: true },
                                    ticks: {
                                        font: {
                                            size: 20,
                                            weight: "bold",
                                            family: 'Arial',
                                            color: "white",
                                        },
                                    },
                                },
                            },
                            layout: {
                                padding: {
                                    bottom: 50, // Add padding below the chart for spacing
                                },
                            },
                        }}


                    />
                )}
            </section>
        </div>
    );
};

export default InventoryRecommendations;
