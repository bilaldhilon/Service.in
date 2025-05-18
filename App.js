import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./App.css"

// Auth
import PrivateRoute from "./components/routing/PrivateRoute"
import AdminRoute from "./components/routing/AdminRoute"
import ProviderRoute from "./components/routing/ProviderRoute"

// Public Pages
import Home from "./pages/Home"
import About from "./pages/About"
import Contact from "./pages/Contact"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import ProviderRegister from "./pages/auth/ProviderRegister"
import ForgotPassword from "./pages/auth/ForgotPassword"
import ResetPassword from "./pages/auth/ResetPassword"
import ServiceList from "./pages/services/ServiceList"
import ServiceDetail from "./pages/services/ServiceDetail"

// Customer Pages
import CustomerDashboard from "./pages/customer/Dashboard"
import CustomerBookings from "./pages/customer/Bookings"
import CustomerProfile from "./pages/customer/Profile"
import BookService from "./pages/customer/BookService"

// Provider Pages
import ProviderDashboard from "./pages/provider/Dashboard"
import ProviderServices from "./pages/provider/Services"
import ProviderBookings from "./pages/provider/Bookings"
import ProviderProfile from "./pages/provider/Profile"
import AddService from "./pages/provider/AddService"

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard"
import AdminProviders from "./pages/admin/Providers"
import AdminCustomers from "./pages/admin/Customers"
import AdminBookings from "./pages/admin/Bookings"
import AdminSettings from "./pages/admin/Settings"

// Auth Context
import { AuthProvider } from "./context/AuthContext"

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<ServiceList />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/provider-register" element={<ProviderRegister />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Customer Routes */}
          <Route
            path="/customer/dashboard"
            element={
              <PrivateRoute>
                <CustomerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/customer/bookings"
            element={
              <PrivateRoute>
                <CustomerBookings />
              </PrivateRoute>
            }
          />
          <Route
            path="/customer/profile"
            element={
              <PrivateRoute>
                <CustomerProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/book/:serviceId"
            element={
              <PrivateRoute>
                <BookService />
              </PrivateRoute>
            }
          />

          {/* Provider Routes */}
          <Route
            path="/provider/dashboard"
            element={
              <ProviderRoute>
                <ProviderDashboard />
              </ProviderRoute>
            }
          />
          <Route
            path="/provider/services"
            element={
              <ProviderRoute>
                <ProviderServices />
              </ProviderRoute>
            }
          />
          <Route
            path="/provider/bookings"
            element={
              <ProviderRoute>
                <ProviderBookings />
              </ProviderRoute>
            }
          />
          <Route
            path="/provider/profile"
            element={
              <ProviderRoute>
                <ProviderProfile />
              </ProviderRoute>
            }
          />
          <Route
            path="/provider/services/add"
            element={
              <ProviderRoute>
                <AddService />
              </ProviderRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/providers"
            element={
              <AdminRoute>
                <AdminProviders />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <AdminRoute>
                <AdminCustomers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <AdminRoute>
                <AdminBookings />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <AdminSettings />
              </AdminRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
