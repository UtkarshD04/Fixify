import React from "react";
import { Routes, Route } from "react-router-dom";
import "./styles/shimmer.css";
import Portal from "./pages/Portal";
import Usersignup from "./pages/Usersignup";
import Userlogin from "./pages/Userlogin";
import DashboardContent from "./pages/DashboardContent";
import ProtectedRoute from "./components/ProtectedRoute";
import ServiceInfo from "./pages/ServiceInfo";
import BookingDetails from "./pages/BookingDetails";
 import ProviderDashboard from "./page/ProviderDashboard";
// import ProviderLayout from "./page/ProviderLayout";
import LiveCity from "./components/LiveCity";
import ChooseAddress from "./components/ChooseAddress";
import BookService from "./components/BookService";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import UtilitySignup from "./page/UtilitySignup";
import UtilityLogin from "./page/UtilityLogin";
import ProviderHome from "./page/ProviderHome";
import ProtectedRouteProvider from "./components/ProtectedRouteProvider";
import ProtectedRouteAdmin from "./components/ProtectedRouteAdmin";
import AboutUs from "./pages/AboutUs";
import Settings from "./pages/Settings";
import ProviderSettings from "./pages/ProviderSettings";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Portal />} />
      <Route path="/portal" element={   <Portal />} />
      <Route path="/signup" element={<Usersignup />} />
      <Route path="/login" element={<Userlogin />} />
      <Route path="/utility-signup" element={<UtilitySignup />} />
      <Route path="/utility-login" element={<UtilityLogin />} />
      <Route
        path="/provider-landing"
        element={
          <ProtectedRouteProvider>
            <ProviderHome />
          </ProtectedRouteProvider>
        }
      />
      {/* <Route path="/provider" element={<ProtectedRouteProvider><ProviderLayout /></ProtectedRouteProvider>} /> */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardContent />
          </ProtectedRoute>
        }
      />
      <Route path="/serviceInfo" element={<ServiceInfo />} />
      <Route path="/booking-details" element={<BookingDetails />} />
      <Route
        path="/provider-board"
        element={<ProtectedRouteProvider><ProviderDashboard /></ProtectedRouteProvider>}
      />
     
      <Route path="/live-city" element={<LiveCity />} />
      <Route path="/choose-address" element={<ChooseAddress />} />
      <Route path="/book-service" element={<BookService />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<ProtectedRouteAdmin><AdminDashboard /></ProtectedRouteAdmin>} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/provider-settings" element={<ProtectedRouteProvider><ProviderSettings /></ProtectedRouteProvider>} />
    </Routes>
  );
};

export default App;
