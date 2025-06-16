import React, { useState, useEffect } from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {useParams} from "react-router-dom";
// ... existing imports ...
import './App.css';
import './SplashScreen.css';
import SplashScreen from './components/SplashScreen';
// ... rest of your imports ...

// Importing your components
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm'; // Dashboard component
import History from './components/History'; // History component
import MainScreen from './components/MainScreen';
import AirPlug from './components/AirPlug';
import AirRing from './components/AirRing';
import AirSnap from './components/AirSnap';
import AddCityForm from './components/AddCityForm'
import CityAutoComplete from './components/CityAutoComplete.js'
import ProgressBar from "./components/ProgressBar";
import QrCode from "./components/WorkOrderInput";
import TrackOrder from './components/WorkOrderDetails'; // Create a component to handle order tracking
import WorkOrderInput from "./components/WorkOrderInput";
import WorkOrderDetails from "./components/WorkOrderDetails";
import InventoryRecommendations from "./components/InventoryRecommendations";
import ChartSelectionPage from "./components/ChartSelectionPage";


import InwardChart from "./components/DailyEntries.js";


import OrdersByUID from "./components/OrdersByUID.js";


import CustomerDetail from "./components/CustomerDetail.js";

import AdminDashboard from './components/AdminDashboard.js';
import UserActions from './components/UserActions.js';

import AirPlugGrindingChart from "./components/AirPlug/AirPlugGrindingChart";
import AirPlugJetFittingChart from "./components/AirPlug/AirPlugJetFittingChart";
import AirPlugMachiningChart from "./components/AirPlug/AirPlugMachiningChart";
import AirPlugDrillingChart from "./components/AirPlug/AirPlugDrillingChart";
import AirPlugInspectionChart from "./components/AirPlug/AirPlugInspectionChart";
import AirPlugSettingRingCuttingChart from "./components/AirPlug/AirPlugSettingRingCuttingChart";
import AirPlugSettingRingLappingChart from "./components/AirPlug/AirPlugSettingRingLappingChart";
import AirPlugSettingRingGrindingChart from "./components/AirPlug/AirPlugSettingRingGrindingChart";
import AirPlugSettingRingInspectionChart from "./components/AirPlug/AirPlugSettingRingInspectionChart";
import AirPlugSettingRingMachiningChart from "./components/AirPlug/AirPlugSettingRingMachiningChart";


import AirRingGrindingChart from "./components/AirRing/AirRingGrindingChart";
import AirRingJetFittingChart from "./components/AirRing/AirRingJetFittingChart";
import AirRingLappingChart from "./components/AirRing/AirRingLappingChart";
import AirRingInspectionChart from "./components/AirRing/AirRingInspectionChart";
import AirRingMachiningChart from "./components/AirRing/AirRingMachiningChart";
import AirRingDrillingChart from "./components/AirRing/AirRingDrillingChart";
import AirRingBoringChart from "./components/AirRing/AirRingBoringChart";
import AirRingSettingPlugSettingDiscMachiningChart from "./components/AirRing/AirRingSettingPlugSettingDiscMachiningChart";
import AirRingSettingPlugSettingDiscGrindingChart from "./components/AirRing/AirRingSettingPlugSettingDiscGrindingChart";
import AirRingSettingPlugSettingDiscLappingChart from "./components/AirRing/AirRingSettingPlugSettingDiscLappingChart";
import AirRingSettingPlugSettingDiscInspectionChart from "./components/AirRing/AirRingSettingPlugSettingDiscInspectionChart";

import AirSnapGrindingChart from "./components/AirSnap/AirSnapGrindingChart";
import AirSnapSettingMasterGrindingChart from "./components/AirSnap/AirSnapSettingMasterGrindingChart";



function App() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Set splash screen time to 3 seconds
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 300); // Set to 3000ms (3 seconds)

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <SplashScreen />;
    }
    
    return (
        <Router>
            <Routes>

                <Route path="/trackOrder/:identifier" element={<TrackOrder/>}/>

<Route path='/AdminDashboard' element={<AdminDashboard/>}/>

<Route path="/user-actions/:userId" element={<UserActions />} /> {/* Add this line */}


                <Route path="/CustomerDetail" element={<CustomerDetail/>}/>

                <Route path="/OrdersByUID" element={<OrdersByUID/>}/>


                <Route path="/" element={<LoginForm/>}/>

                <Route path="/register" element={<RegisterForm/>}/>

                <Route path="/AirPlug" element={<AirPlug/>}/>

                <Route path="/AirRing" element={<AirRing/>}/>

                <Route path="/AirSnap" element={<AirSnap/>}/>

                <Route path="/history" element={<History/>}/>

                <Route path='/MainScreen' element={<MainScreen/>}/>

                <Route path='/AddCityForm' element={<AddCityForm/>}/>

                <Route path='/CityAutoComplete' element={<CityAutoComplete/>}/>

                <Route path='/ProgressBar' element={<ProgressBar/>}/>
                <Route path='/QrCode' element={<QrCode/>}/>
                <Route path="/ProgressBar/:record_sr_no/:party_name" element={<ProgressBarWrapper/>}/>
                <Route path="WorkOrderInput" element={<WorkOrderInput/>}/>
                <Route path="WorkOrderDetails" element={<WorkOrderDetails/>}/>
                <Route path="InventoryRecommendation" element={<InventoryRecommendations/>}/>

                <Route path='/DailyEntries' element={<InwardChart/>}/>
                <Route path="ChartSelectionPage" element={<ChartSelectionPage/>}/>

                <Route path='/AirPlug/AirPlugGrindingChart' element={<AirPlugGrindingChart/>}/>
                <Route path="/AirPlug/AirPlugJetFittingChart" element={<AirPlugJetFittingChart/>}></Route>
                <Route path="/AirPlug/AirPlugMachiningChart" element={<AirPlugMachiningChart/>}></Route>
                <Route path="/AirPlug/AirPlugDrillingChart" element={<AirPlugDrillingChart/>}></Route>
                <Route path="/AirPlug/AirPlugInspectionChart" element={<AirPlugInspectionChart/>}></Route>
                <Route path="/AirPlug/AirPlugSettingRingCuttingChart" element={<AirPlugSettingRingCuttingChart/>}></Route>
                <Route path="/AirPlug/AirPlugSettingRingLappingChart" element={<AirPlugSettingRingLappingChart/>}></Route>
                <Route path="/AirPlug/AirPlugSettingRingGrindingChart" element={<AirPlugSettingRingGrindingChart/>}></Route>
                <Route path="/AirPlug/AirPlugSettingRingInspectionChart" element={<AirPlugSettingRingInspectionChart/>}></Route>
                <Route path="/AirPlug/AirPlugSettingRingMachiningChart" element={<AirPlugSettingRingMachiningChart/>}></Route>


            <Route path='/AirRing/AirRingGrindingChart' element={<AirRingGrindingChart/>}/>
            <Route path="/AirRing/AirRingJetFittingChart" element={<AirRingJetFittingChart/>}></Route>
            <Route path="/AirRing/AirRingLappingChart" element={<AirRingLappingChart/>}></Route>
            <Route path="/AirRing/AirRingInspectionChart" element={<AirRingInspectionChart/>}></Route>
            <Route path="/AirRing/AirRingMachiningChart" element={<AirRingMachiningChart/>}></Route>
            <Route path="/AirRing/AirRingDrillingChart" element={<AirRingDrillingChart/>}></Route>
                <Route path="/AirRing/AirRingBoringChart" element={<AirRingBoringChart/>}></Route>
                <Route path="/AirRing/AirRingSettingPlug&SettingDiscMachiningChart" element={<AirRingSettingPlugSettingDiscMachiningChart/>}></Route>
                <Route path="/AirRing/AirRingSettingPlug&SettingDiscGrindingChart" element={<AirRingSettingPlugSettingDiscGrindingChart/>}></Route>
                <Route path="/AirRing/AirRingSettingPlug&SettingDiscLappingChart" element={<AirRingSettingPlugSettingDiscLappingChart/>}></Route>
                <Route path="/AirRing/AirRingSettingPlug&SettingDiscInspectionChart" element={<AirRingSettingPlugSettingDiscInspectionChart/>}></Route>


                <Route path='/AirSnap/AirSnapGrindingChart' element={<AirSnapGrindingChart/>}/>
                <Route path="/AirSnap/AirSnapSettingMasterGrindingChart" element={<AirSnapSettingMasterGrindingChart/>}></Route>

            </Routes>
        </Router>
    );
}

const ProgressBarWrapper = () => {
    const {record_sr_no, party_name} = useParams();
    return <ProgressBar record_sr_no={record_sr_no} party_name={party_name}/>;
};
export default App;
