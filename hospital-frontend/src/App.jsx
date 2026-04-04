// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";

// Admin pages
import AdminDashboard from "./pages/admin/admindashboard";
import Doctors from "./pages/admin/doctors";
import Patients from "./pages/admin/patients";
import Hospitals from "./pages/admin/hospitals";
import Appointments from "./pages/admin/appointments";
import Bills from "./pages/admin/bills";
import LabReports from "./pages/admin/labreports";
import UserManagement from "./pages/admin/usermanagement";
import AdminProfile from "./pages/admin/adminprofile";

// Doctor pages
import DoctorDashboard from "./pages/doctor/doctordashboard";
import DocAppointments from "./pages/doctor/docappointments";
import PendingLabReports from "./pages/doctor/pendinglabreports";
import DoctorProfile from "./pages/doctor/doctorprofile";
import Reschedule from "./pages/doctor/reschedule";
import ViewAppointment from "./pages/doctor/viewappointment";
import Report from "./pages/doctor/report";

// Patient pages
import PatientDashboard from "./pages/patient/patientdashboard";
import Appointment from "./pages/patient/appointment";
import Billing from "./pages/patient/billing";
import MyAppointments from "./pages/patient/myappointment";
import MyLabReports from "./pages/patient/mylabreports";
import MyPrescriptions from "./pages/patient/myprescription";
import PatientProfile from "./pages/patient/patientprofile";
import ReportDetails from "./pages/patient/reportdetails";
import PrescriptionDetails from "./pages/patient/prescriptiondetails";
import PatientReschedule from "./pages/patient/reschedule"; // ✅ ADDED

// Receptionist pages
import Generatebill from "./pages/receptionist/generatebill";
import PatientRecords from "./pages/receptionist/patientrecords";
import LabReportManagement from "./pages/receptionist/labreportsupdate";
import DoctorAvailability from "./pages/receptionist/doctoravailability";
import ReceptionistDashboard from "./pages/receptionist/receptionistdashboard";
import LabReportView from "./pages/receptionist/labreportview";
import BillView from "./pages/receptionist/billview";

// Public pages
import Login from "./pages/login";
import Index from "./pages/index";

// Chatbot component
import Chatbot from "./components/chatbot";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/" element={<Index />} />

        {/* Admin routes */}
        <Route path="/admin/admindashboard" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/doctors" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Doctors />
          </ProtectedRoute>
        } />
        <Route path="/admin/patients" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Patients />
          </ProtectedRoute>
        } />
        <Route path="/admin/hospitals" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Hospitals />
          </ProtectedRoute>
        } />
        <Route path="/admin/appointments" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Appointments />
          </ProtectedRoute>
        } />
        <Route path="/admin/bills" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Bills />
          </ProtectedRoute>
        } />
        <Route path="/admin/labreports" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <LabReports />
          </ProtectedRoute>
        } />
        <Route path="/admin/usermanagement" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/adminprofile" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminProfile />
          </ProtectedRoute>
        } />

        {/* Doctor routes */}
        <Route path="/doctor/doctordashboard" element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <DoctorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/doctor/docappointments" element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <DocAppointments />
          </ProtectedRoute>
        } />
        <Route path="/doctor/pendinglabreports" element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <PendingLabReports />
          </ProtectedRoute>
        } />
        <Route path="/doctor/doctorprofile" element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <DoctorProfile />
          </ProtectedRoute>
        } />
        <Route path="/doctor/reschedule/:id" element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <Reschedule />
          </ProtectedRoute>
        } />
        <Route path="/doctor/viewappointment/:id" element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <ViewAppointment />
          </ProtectedRoute>
        } />
        <Route path="/doctor/report/:id" element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <Report />
          </ProtectedRoute>
        } />

        {/* Patient routes */}
        <Route path="/patient/patientdashboard" element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <PatientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/patient/patientprofile" element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <PatientProfile />
          </ProtectedRoute>
        } />
        <Route path="/patient/appointment" element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <Appointment />
          </ProtectedRoute>
        } />
        <Route path="/patient/billing" element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <Billing />
          </ProtectedRoute>
        } />
        <Route path="/patient/myappointment" element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <MyAppointments />
          </ProtectedRoute>
        } />
        <Route path="/patient/mylabreports" element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <MyLabReports />
          </ProtectedRoute>
        } />
        <Route path="/patient/myprescription" element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <MyPrescriptions />
          </ProtectedRoute>
        } />
        <Route path="/patient/reportdetails" element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <ReportDetails />
          </ProtectedRoute>
        } />
        <Route path="/patient/prescriptiondetails" element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <PrescriptionDetails />
          </ProtectedRoute>
        } />
        {/* ✅ ADDED: Patient reschedule route */}
        <Route path="/patient/reschedule/:id" element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <PatientReschedule />
          </ProtectedRoute>
        } />

        {/* Receptionist routes */}
        <Route path="/receptionist/generatebill" element={
          <ProtectedRoute allowedRoles={["receptionist"]}>
            <Generatebill />
          </ProtectedRoute>
        } />
        <Route path="/receptionist/patientrecords" element={
          <ProtectedRoute allowedRoles={["receptionist"]}>
            <PatientRecords />
          </ProtectedRoute>
        } />
        <Route path="/receptionist/labreportsupdate" element={
          <ProtectedRoute allowedRoles={["receptionist"]}>
            <LabReportManagement />
          </ProtectedRoute>
        } />
        <Route path="/receptionist/doctoravailability" element={
          <ProtectedRoute allowedRoles={["receptionist"]}>
            <DoctorAvailability />
          </ProtectedRoute>
        } />
        <Route path="/receptionist/dashboard" element={
          <ProtectedRoute allowedRoles={["receptionist"]}>
            <ReceptionistDashboard />
          </ProtectedRoute>
        } />
        <Route path="/receptionist/labreportview" element={
          <ProtectedRoute allowedRoles={["receptionist"]}>
            <LabReportView />
          </ProtectedRoute>
        } />
        <Route path="/receptionist/billview" element={
          <ProtectedRoute allowedRoles={["receptionist"]}>
            <BillView />
          </ProtectedRoute>
        } />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <Chatbot />
    </BrowserRouter>
  );
}

export default App;