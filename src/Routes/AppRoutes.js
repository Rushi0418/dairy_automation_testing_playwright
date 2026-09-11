import { Route, Routes } from "react-router-dom";
import Login from "../Authentication/Login/Login";
import AdminLayout from "../Components/Adminlayout/AdminLayout";
import Dashboard from "../Pages/Dashboard/Dashboard";
import Collection from "../Pages/Collection/Collection";
import Processing from "../Pages/Processing/Processing";
import Vendor from "../Pages/Vendors/Vendors";
import Vehicle from "../Pages/Vehicles/Vehicles";
import Shipment from "../Pages/Shipments/Shipments";
import Users from "../Pages/Users/Users";
import Reports from "../Pages/Reports/Reports";
import Sales from "../Pages/SalesManagement/Sales";
import { toast, ToastContainer } from 'react-toastify';
import ProtectedRoute from "./ProtectedRoute";
import Transporter from "../Pages/Transporter/Transporter";
import TankerTrack from "../Pages/TankerTrack/TakerTrack";
import Config from "../Pages/Config/Config";

const AppRoutes = () => {
    return (
        <>
            <Routes>
                <Route path='/' element={<Login />} />
                <Route element={<ProtectedRoute />}>
                    <Route element={<AdminLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/collection" element={<Collection />} />
                        <Route path="/processing" element={<Processing />} />
                        <Route path="/partners" element={<Vendor />} />
                        <Route path="/vehicle" element={<Vehicle />} />
                        <Route path="/shipment" element={<Shipment />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/sales" element={<Sales />} />
                        <Route path="/transporter" element={<Transporter />} />
                        <Route path="/track-tanker" element={<TankerTrack />} />
                        <Route path="/configs" element={<Config />} />
                    </Route>
                </Route>
            </Routes>
            <ToastContainer />
        </>
    )
}

export default AppRoutes;