import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './ChartSelectionPage.css';
import BASE_URL from './config';

const ChartSelectionPage = () => {
    const [selectedComponent, setSelectedComponent] = useState('');
    const [selectedChart, setSelectedChart] = useState('');
    const navigate = useNavigate();
    const { workOrderRange } = useParams();
    const [chartOptions, setChartOptions] = useState([]);
    const location = useLocation();

    useEffect(() => {
        if (location.state?.selectedComponent) {
            setSelectedComponent(location.state.selectedComponent);
        }
    }, [location]);

    const components = ['Air Plug', 'Air Ring', 'Air Snap'];

    const chartsByComponent = {
        'Air Plug': ['Grinding Chart', 'JetFitting Chart', 'Machining Chart', 'Drilling Chart', 'Inspection Chart', '-------------------//------------------', 'Setting Ring Machining Chart', 'Setting Ring Grinding Chart', 'Setting Ring Lapping Chart', 'Setting Ring Inspection Chart'],
        'Air Ring': ['Grinding Chart', 'JetFitting Chart', 'Lapping Chart', 'Inspection Chart', 'Machining Chart', 'Drilling Chart', 'Boring Chart', '-----------------------------//-----------------------------', 'Setting Plug & Setting Disc Machining Chart', 'Setting Plug & Setting Disc Grinding Chart', 'Setting Plug & Setting Disc Lapping Chart', 'Setting Plug & Setting Disc Inspection Chart'],
        'Air Snap': ['Grinding Chart', 'Setting Master Grinding Chart'],
    };

    const handleComponentChange = (e) => {
        setSelectedComponent(e.target.value);
    };

    const handleChartChange = (e) => {
        const selectedChart = e.target.value;
        if (selectedComponent && selectedChart) {
            const formattedComponent = selectedComponent.replace(/\s/g, '');
            const formattedChart = selectedChart.replace(/\s/g, '');
            navigate(`/${formattedComponent}/${formattedComponent}${formattedChart}`, { state: { selectedComponent } });
        }
    };

    const goBack = () => {
        if (selectedChart) {
            setSelectedChart(''); // Reset chart selection and go back to component selection
        } else if (selectedComponent) {
            setSelectedComponent(''); // Reset component selection and show component dropdown
        } else {
            navigate('/MainScreen');
        }
    };

    useEffect(() => {
        const fetchChartOptions = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/chart-options/${workOrderRange}`);
                const data = await response.json();
                setChartOptions(data);
            } catch (error) {
                console.error('Error fetching chart options:', error);
            }
        };

        fetchChartOptions();
    }, [workOrderRange]);

    return (
        <div className="chart-selection-page">
            <button className="back-button" onClick={goBack}>⬅ Back</button>
            
            {!selectedComponent && (
                <div className="dropdown-container">
                    <h2>Select Component</h2>
                    <select value={selectedComponent} onChange={handleComponentChange} className="dropdown">
                        <option value="">Select Component</option>
                        {components.map((component, index) => (
                            <option key={index} value={component}>{component}</option>
                        ))}
                    </select>
                </div>
            )}

            {selectedComponent && !selectedChart && (
                <div className="dropdown-container">
                    <h2>{selectedComponent} <br /> Select Chart Options</h2>
                    <select onChange={handleChartChange} className="dropdown">
                        <option value="">Select Chart</option>
                        {chartsByComponent[selectedComponent]?.map((chart, index) => (
                            <option key={index} value={chart}>{chart}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

export default ChartSelectionPage;