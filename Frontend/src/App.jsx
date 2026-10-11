
import { BrowserRouter, Route, Routes } from "react-router-dom";

import RequireAdmin from "./components/auth/RequireAdmin";

import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import PatientLayout from "./layouts/PatientLayout";
import DoctorLayout from "./layouts/DoctorLayout";

// Public pages
import Home from "./pages/public/Home";
import Doctors from "./pages/public/Doctors";
import DoctorDetails from "./pages/public/DoctorDetails";
import Specialties from "./pages/public/Specialties";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import NotFound from "./pages/public/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminDoctors from "./pages/admin/Doctors";
import AdminPatients from "./pages/admin/Patients";
import AdminSpecialties from "./pages/admin/Specialties";
import AdminDoctorSchedules from "./pages/admin/DoctorSchedules";
import AdminAppointments from "./pages/admin/Appointments";
import AdminPainAreas from "./pages/admin/PainAreas";
import AdminUsers from "./pages/admin/Users";

// Patient pages
import PatientDashboard from "./pages/patient/Dashboard";
import PatientAppointments from "./pages/patient/Appointments";
import PatientBookAppointment from "./pages/patient/BookAppointment";
import PatientDoctors from "./pages/patient/Doctors";
import PatientMedicalHistory from "./pages/patient/MedicalHistory";
import PatientNotifications from "./pages/patient/Notifications";
import PatientPainAssessment from "./pages/patient/PainAssessment";
import PatientPrescriptions from "./pages/patient/Prescriptions";
import PatientProfile from "./pages/patient/Profile";

// Doctor pages
import DoctorDashboard from "./pages/doctor/Dashboard";
import DoctorAppointments from "./pages/doctor/Appointments";
import DoctorPatients from "./pages/doctor/Patients";
import DoctorPatientDetails from "./pages/doctor/PatientDetails";
import DoctorProfile from "./pages/doctor/Profile";
import DoctorDetailsPage from "./pages/doctor/DoctorDetails";
import DoctorMedicalRecords from "./pages/doctor/MedicalRecords";
import DoctorPainAssessments from "./pages/doctor/PainAssessments";
import DoctorPrescriptions from "./pages/doctor/Prescriptions";
import DoctorSchedule from "./pages/doctor/Schedule";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC PAGES */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:id" element={<DoctorDetails />} />
          <Route path="/specialties" element={<Specialties />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* ADMIN PAGES */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="specialties" element={<AdminSpecialties />} />
          <Route
            path="doctor-schedules"
            element={<AdminDoctorSchedules />}
          />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="pain-areas" element={<AdminPainAreas />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* DOCTOR PAGES */}
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<DoctorDashboard />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route
            path="patients/:id"
            element={<DoctorPatientDetails />}
          />
          <Route path="profile" element={<DoctorProfile />} />
          <Route path="details" element={<DoctorDetailsPage />} />
          <Route
            path="medical-records"
            element={<DoctorMedicalRecords />}
          />
          <Route
            path="pain-assessments"
            element={<DoctorPainAssessments />}
          />
          <Route
            path="prescriptions"
            element={<DoctorPrescriptions />}
          />
          <Route path="schedule" element={<DoctorSchedule />} />
        </Route>

        {/* PATIENT PAGES */}
        <Route path="/patient" element={<PatientLayout />}>
          <Route index element={<PatientDashboard />} />
          <Route path="appointments" element={<PatientAppointments />} />
          <Route
            path="book-appointment"
            element={<PatientBookAppointment />}
          />
          <Route path="doctors" element={<PatientDoctors />} />
          <Route
            path="medical-history"
            element={<PatientMedicalHistory />}
          />
          <Route
            path="notifications"
            element={<PatientNotifications />}
          />
          <Route
            path="pain-assessment"
            element={<PatientPainAssessment />}
          />
          <Route
            path="prescriptions"
            element={<PatientPrescriptions />}
          />
          <Route path="profile" element={<PatientProfile />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
