import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import AppLayout from './layouts/AppLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/public/Home';
import Businesses from './pages/public/Businesses';
import BusinessDetail from './pages/public/BusinessDetail';
import Categories from './pages/public/Categories';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import AdminDashboard from './pages/admin/Dashboard';
import ManageCategories from './pages/admin/ManageCategories';
import ApproveBusinesses from './pages/admin/ApproveBusinesses';
import EntrepreneurDashboard from './pages/entrepreneur/Dashboard';
import MyBusinesses from './pages/entrepreneur/MyBusinesses';
import CreateBusiness from './pages/entrepreneur/CreateBusiness';
import EditBusiness from './pages/entrepreneur/EditBusiness';
import Favorites from './pages/customer/Favorites';
import MyReviews from './pages/customer/MyReviews';
import MyOrganizations from './pages/organization/MyOrganizations';
import CreateOrganization from './pages/organization/CreateOrganization';
import Trainings from './pages/organization/Trainings';
import Challenges from './pages/organization/Challenges';
import Profile from './pages/shared/Profile';
import Notifications from './pages/shared/Notifications';

function DashboardRouter() {
  const { user } = useAuth();
  switch (user?.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'ENTREPRENEUR':
      return <EntrepreneurDashboard />;
    case 'ORGANIZATION':
      return <MyOrganizations />;
    default:
      return <Navigate to="/businesses" replace />;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/businesses" element={<MainLayout><Businesses /></MainLayout>} />
        <Route path="/businesses/:id" element={<MainLayout><BusinessDetail /></MainLayout>} />
        <Route path="/categories" element={<MainLayout><Categories /></MainLayout>} />
        <Route path="/about" element={<MainLayout><About /></MainLayout>} />
        <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Authenticated landing (role-based redirect) */}
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardRouter /></AppLayout></ProtectedRoute>} />

        {/* Customer */}
        <Route path="/favorites" element={<ProtectedRoute roles={['CUSTOMER']}><AppLayout><Favorites /></AppLayout></ProtectedRoute>} />
        <Route path="/my-reviews" element={<ProtectedRoute roles={['CUSTOMER']}><AppLayout><MyReviews /></AppLayout></ProtectedRoute>} />

        {/* Entrepreneur */}
        <Route path="/my-businesses" element={<ProtectedRoute roles={['ENTREPRENEUR']}><AppLayout><MyBusinesses /></AppLayout></ProtectedRoute>} />
        <Route path="/business/new" element={<ProtectedRoute roles={['ENTREPRENEUR']}><AppLayout><CreateBusiness /></AppLayout></ProtectedRoute>} />
        <Route path="/businesses/:id/edit" element={<ProtectedRoute roles={['ENTREPRENEUR']}><AppLayout><EditBusiness /></AppLayout></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute roles={['ADMIN']}><AppLayout><ManageCategories /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/approve" element={<ProtectedRoute roles={['ADMIN']}><AppLayout><ApproveBusinesses /></AppLayout></ProtectedRoute>} />

        {/* Organization */}
        <Route path="/my-organizations" element={<ProtectedRoute roles={['ORGANIZATION']}><AppLayout><MyOrganizations /></AppLayout></ProtectedRoute>} />
        <Route path="/organizations/new" element={<ProtectedRoute roles={['ORGANIZATION']}><AppLayout><CreateOrganization /></AppLayout></ProtectedRoute>} />
        <Route path="/organizations/:id/edit" element={<ProtectedRoute roles={['ORGANIZATION']}><AppLayout><CreateOrganization /></AppLayout></ProtectedRoute>} />
        <Route path="/trainings" element={<ProtectedRoute roles={['ORGANIZATION']}><AppLayout><Trainings /></AppLayout></ProtectedRoute>} />
        <Route path="/challenges" element={<ProtectedRoute roles={['ORGANIZATION']}><AppLayout><Challenges /></AppLayout></ProtectedRoute>} />

        {/* Shared */}
        <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><AppLayout><Notifications /></AppLayout></ProtectedRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
