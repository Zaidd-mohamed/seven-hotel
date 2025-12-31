import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Rooms from "../pages/Rooms";
import RoomDetails from "../pages/RoomDetails";
import Login from "../pages/Login";
import Register from "../pages/Register";

import GuestDashboard from "../pages/GuestDashboard";
import StaffDashboard from "../pages/StaffDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import ProtectedRoute from "./ProtectedRoute";
import MyBookings from "../pages/MyBookings";
import Notifications from "../pages/Notifications";
import GuestRequests from "../pages/GuestRequests";
import StaffRequests from "../pages/StaffRequests";
import ReceptionDashboard from "../pages/ReceptionDashboard";
import HousekeepingDashboard from "../pages/HousekeepingDashboard";
import SeedPhase7 from "../pages/SeedPhase7";
import AdminHome from "../pages/admin/AdminHome";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminHotels from "../pages/admin/AdminHotels";
import AdminAuditLogs from "../pages/admin/AdminAuditLogs";






export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rooms" element={<Rooms />} />
      <Route path="/rooms/:id" element={<RoomDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
        <Route path="/seed-phase7" element={<SeedPhase7 />} />

      {/* Protected dashboards */}
      <Route
        path="/guest/dashboard"
        element={
          <ProtectedRoute allowedRoles={["guest"]}>
            <GuestDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/dashboard"
        element={
          <ProtectedRoute allowedRoles={["receptionist", "housekeeping"]}>
            <StaffDashboard />
          </ProtectedRoute>
        }
      />
      <Route
  path="/guest/notifications"
  element={
    <ProtectedRoute allowedRoles={["guest"]}>
      <Notifications />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminHome />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/users"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminUsers />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/hotels"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminHotels />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/audit-logs"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminAuditLogs />
    </ProtectedRoute>
  }
/>


      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guest/bookings"
        element={
            <ProtectedRoute allowedRoles={["guest"]}>
            <MyBookings />
            </ProtectedRoute>
        }
        />

        <Route
        path="/guest/requests"
        element={
            <ProtectedRoute allowedRoles={["guest"]}>
            <GuestRequests />
            </ProtectedRoute>
        }
        />

        <Route
        path="/staff/requests"
        element={
            <ProtectedRoute allowedRoles={["receptionist", "housekeeping"]}>
            <StaffRequests />
            </ProtectedRoute>
        }
        />
        <Route
            path="/staff/reception/dashboard"
            element={
                <ProtectedRoute allowedRoles={["receptionist"]}>
                <ReceptionDashboard />
                </ProtectedRoute>
            }
            />

            <Route
            path="/staff/housekeeping/dashboard"
            element={
                <ProtectedRoute allowedRoles={["housekeeping"]}>
                <HousekeepingDashboard />
                </ProtectedRoute>
            }
            />


      <Route path="*" element={<Home />} />
    </Routes>
  );
}
