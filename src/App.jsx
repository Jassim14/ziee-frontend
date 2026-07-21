import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/customer/Home';
import BusinessDetail from './pages/customer/BusinessDetail';
import Favorites from './pages/customer/Favorites';
import MyReviews from './pages/customer/MyReviews';
import AdminDashboard from './pages/admin/Dashboard';
import ManageCategories from './pages/admin/ManageCategories';
import ApproveBusinesses from './pages/admin/ApproveBusinesses';
import MyBusinesses from './pages/entrepreneur/MyBusinesses';
import CreateBusiness from './pages/entrepreneur/CreateBusiness';
import EditBusiness from './pages/entrepreneur/EditBusiness';
import MyOrganizations from './pages/organization/MyOrganizations';
import CreateOrganization from './pages/organization/CreateOrganization';
import Trainings from './pages/organization/Trainings';
import Challenges from './pages/organization/Challenges';
import Profile from './pages/shared/Profile';
import Notifications from './pages/shared/Notifications';

function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') return <Navigate to="/admin" />;
  if (user?.role === 'ENTREPRENEUR') return <Navigate to="/my-businesses" />;
  if (user?.role === 'ORGANIZATION') return <Navigate to="/my-organizations" />;
  return <Home />;
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Authenticated */}
        <Route path="/" element={<ProtectedRoute><AppLayout><DashboardRouter /></AppLayout></ProtectedRoute>} />

        {/* Customer */}
        <Route path="/business/:id" element={<ProtectedRoute><AppLayout><BusinessDetail /></AppLayout></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><AppLayout><Favorites /></AppLayout></ProtectedRoute>} />
        <Route path="/my-reviews" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><AppLayout><MyReviews /></AppLayout></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={['ADMIN']}><AppLayout><ManageCategories /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/approve" element={<ProtectedRoute allowedRoles={['ADMIN']}><AppLayout><ApproveBusinesses /></AppLayout></ProtectedRoute>} />

        {/* Entrepreneur */}
        <Route path="/my-businesses" element={<ProtectedRoute allowedRoles={['ENTREPRENEUR']}><AppLayout><MyBusinesses /></AppLayout></ProtectedRoute>} />
        <Route path="/business/new" element={<ProtectedRoute allowedRoles={['ENTREPRENEUR']}><AppLayout><CreateBusiness /></AppLayout></ProtectedRoute>} />
        <Route path="/business/:id/edit" element={<ProtectedRoute allowedRoles={['ENTREPRENEUR']}><AppLayout><EditBusiness /></AppLayout></ProtectedRoute>} />

        {/* Organization */}
        <Route path="/my-organizations" element={<ProtectedRoute allowedRoles={['ORGANIZATION']}><AppLayout><MyOrganizations /></AppLayout></ProtectedRoute>} />
        <Route path="/organizations/new" element={<ProtectedRoute allowedRoles={['ORGANIZATION']}><AppLayout><CreateOrganization /></AppLayout></ProtectedRoute>} />
        <Route path="/organizations/:id/edit" element={<ProtectedRoute allowedRoles={['ORGANIZATION']}><AppLayout><CreateOrganization /></AppLayout></ProtectedRoute>} />
        <Route path="/trainings" element={<ProtectedRoute allowedRoles={['ORGANIZATION']}><AppLayout><Trainings /></AppLayout></ProtectedRoute>} />
        <Route path="/challenges" element={<ProtectedRoute allowedRoles={['ORGANIZATION']}><AppLayout><Challenges /></AppLayout></ProtectedRoute>} />

        {/* Shared */}
        <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><AppLayout><Notifications /></AppLayout></ProtectedRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
