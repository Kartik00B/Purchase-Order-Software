import axios from "axios";
import React, { useEffect, useState } from "react";

export const CityDatalist = () => {
    const [cityList, setCityList] = useState([]);

    useEffect(() => {
        const fetchCityList = async () => {
            try {
                const response = await axios.post("http://localhost:5000/cities");
                setCityList(response.data);
            } catch (error) {
                console.error("Error fetching city list:", error);
            }
        };
        fetchCityList();
    }, []);

    return (
        <datalist id="cityNames">
            {cityList.map((city, index) => (
                <option key={index} value={city.name} />
            ))}
        </datalist>
    );
};
