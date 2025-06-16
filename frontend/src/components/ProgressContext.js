import React, { createContext, useState, useContext } from "react";

// Create a Context
const ProgressContext = createContext();

// Create a custom hook to use the context
export const useProgress = () => {
    return useContext(ProgressContext);
};

// Create a Provider component to wrap your app with
export const ProgressProvider = ({ children }) => {
    const [progress, setProgress] = useState({});

    // Function to update the progress for a specific work order
    const updateProgress = (key, updatedStages) => {
        setProgress((prevProgress) => ({
            ...prevProgress,
            [key]: updatedStages,
        }));
    };

    return (
        <ProgressContext.Provider value={{ progress, updateProgress }}>
            {children}
        </ProgressContext.Provider>
    );
};
