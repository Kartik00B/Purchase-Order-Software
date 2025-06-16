import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import './CityAutoComplete.css'; // Optional: Add some styling

const CityAutoComplete = () => {
  const [cities, setCities] = useState([]); // Store fetched cities
  const [filteredCities, setFilteredCities] = useState([]); // Store filtered cities
  const [inputValue, setInputValue] = useState(''); // Track user input
  const [showOptions, setShowOptions] = useState(false); // Control dropdown visibility
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  // Fetch cities from the backend when the component loads
  useEffect(() => {
    axios.get("http://localhost:5000/api/cities")
      .then(response => {
        setCities(response.data); // Store all cities in state
      })
      .catch(error => {
        console.error('Error fetching cities:', error);
      });
  }, []);

  // Handle input field change and filter cities
  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.length > 0) {
      const matches = cities.filter(city =>
        city.toLowerCase().startsWith(value.toLowerCase())
      );
      setFilteredCities(matches);
      setShowOptions(matches.length > 0);
    } else {
      setShowOptions(false); // Hide options if input is cleared
    }
  };

  // Handle selection of a city from the list
  const handleCitySelect = (city) => {
    setInputValue(city); // Set input value to selected city
    setShowOptions(false); // Hide options list
  };

  return (
    <div className="autocomplete">
      <label htmlFor="city">City:</label>
      <input
        type="text"
        id="city"
        value={inputValue}
        onChange={handleChange}
        onFocus={() => setShowOptions(filteredCities.length > 0)}
      />
      {showOptions && (
        <ul className="options">
          {filteredCities.map((city, index) => (
            <li key={index} onClick={() => handleCitySelect(city)}>
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CityAutoComplete;
