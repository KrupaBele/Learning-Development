import { Provider } from "react-redux";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./components/admin/Dashboard";
import HRDashboard from "./components/admin/HRDashboard";
import InstructorDashboard from "./components/admin/InstructorDashboard";
import EmployeeDashboard from "./components/employee/EmployeeDashboard";
import TrainingDetails from "./components/training/TrainingDetails";
import OnboardingForm from "./components/OnboardingForm";
import LoginPage from "./components/auth/LoginPage";
import CreateCourse from "./components/course/CreateCourse";
import CourseReview from "./components/course/CourseReview";
import UserManagement from "./components/admin/UserManagement";
import ResetPassword from "./components/auth/ResetPassword";
import store from "./redux/store";
import { ThemeProvider } from "./contexts/ThemeContext";
import Settings from "./components/admin/Setting";
import ProtectedRoute from "./store/ProtectedRoute";
import CompletedCourses from "./components/employee/CompletedCourses";
import PendingCourses from "./components/employee/PendingCourses";
import CreatePresentation from "./components/presentation/CreatePresentation";

function App() {
  const loadUserFromStorage = useAuthStore(
    (state) => state.loadUserFromStorage
  );

  useEffect(() => {
    loadUserFromStorage(); // Load auth state on app mount
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/signup" element={<OnboardingForm />} />

          <Route element={<ProtectedRoute />}>
            {/* Admin routes with ThemeProvider */}
            <Route
              path="/admin"
              element={
                <ThemeProvider>
                  <AdminLayout />
                </ThemeProvider>
              }
            >
              <Route
                index
                element={<Navigate to="/admin/dashboard" replace />}
              />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="settings" element={<Settings />} />
              <Route path="hr" element={<HRDashboard />} />
              <Route path="hr/user-management" element={<UserManagement />} />
              <Route path="employee" element={<EmployeeDashboard />} />
              <Route path="completed-courses" element={<CompletedCourses />} />
              <Route path="pending-courses" element={<PendingCourses />} />
              <Route path="instructor" element={<InstructorDashboard />} />
              <Route path="training/:id" element={<TrainingDetails />} />
              <Route path="courses/create" element={<CreateCourse />} />
              <Route path="courses/edit/:courseId" element={<CreateCourse />} />
              <Route path="course-review/:id" element={<CourseReview />} />
            </Route>

            {/* Other authenticated routes with ThemeProvider */}
            <Route
              path="/"
              element={
                <ThemeProvider>
                  <AdminLayout />
                </ThemeProvider>
              }
            >
              <Route path="hr" element={<HRDashboard />} />
              <Route path="hr/user-management" element={<UserManagement />} />
              <Route path="employee" element={<EmployeeDashboard />} />
              <Route path="/completed-courses" element={<CompletedCourses />} />
              <Route path="/pending-courses" element={<PendingCourses />} />
              <Route path="instructor" element={<InstructorDashboard />} />
              <Route path="training/:id" element={<TrainingDetails />} />
              <Route path="courses/create" element={<CreateCourse />} />
              <Route
                path="presentation/create"
                element={<CreatePresentation />}
              />
              <Route path="courses/edit/:courseId" element={<CreateCourse />} />
              <Route path="course-review/:id" element={<CourseReview />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
