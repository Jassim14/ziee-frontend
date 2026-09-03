import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import MainLayout from './layouts/MainLayout';
import AppLayout from './layouts/AppLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import Home from './pages/public/Home';
import Businesses from './pages/public/Businesses';
import BusinessDetail from './pages/public/BusinessDetail';
import Categories from './pages/public/Categories';
import Organizations from './pages/public/Organizations';
import OrganizationDetail from './pages/public/OrganizationDetail';
import TrainingDetail from './pages/public/TrainingDetail';
import ChallengeDetail from './pages/public/ChallengeDetail';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import AdminDashboard from './pages/admin/Dashboard';
import ManageCategories from './pages/admin/ManageCategories';
import ApproveBusinesses from './pages/admin/ApproveBusinesses';
import ManageUsers from './pages/admin/ManageUsers';
import ManageOrganizations from './pages/admin/ManageOrganizations';
import ManageTrainings from './pages/admin/ManageTrainings';
import ManageChallenges from './pages/admin/ManageChallenges';
import ManageReviews from './pages/admin/ManageReviews';
import EntrepreneurDashboard from './pages/entrepreneur/Dashboard';
import MyBusinesses from './pages/entrepreneur/MyBusinesses';
import CreateBusiness from './pages/entrepreneur/CreateBusiness';
import EditBusiness from './pages/entrepreneur/EditBusiness';
import Favorites from './pages/customer/Favorites';
import MyReviews from './pages/customer/MyReviews';
import MyRegistrations from './pages/customer/MyRegistrations';
import MyApplications from './pages/customer/MyApplications';
import CustomerDashboard from './pages/customer/Dashboard';
import BrowseTrainings from './pages/customer/BrowseTrainings';
import BrowseChallenges from './pages/customer/BrowseChallenges';
import MyOrganizations from './pages/organization/MyOrganizations';
import CreateOrganization from './pages/organization/CreateOrganization';
import Trainings from './pages/organization/Trainings';
import TrainingParticipants from './pages/organization/TrainingParticipants';
import Challenges from './pages/organization/Challenges';
import ChallengeApplications from './pages/organization/ChallengeApplications';
import OrganizationDashboard from './pages/organization/Dashboard';
import Profile from './pages/shared/Profile';
import Notifications from './pages/shared/Notifications';
import NotificationSettings from './pages/shared/NotificationSettings';

function DashboardRouter() {
  const { user } = useAuth();
  switch (user?.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'ENTREPRENEUR':
      return <EntrepreneurDashboard />;
    case 'ORGANIZATION':
      return <OrganizationDashboard />;
    case 'CUSTOMER':
      return <Navigate to="/customer-dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
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
        <Route path="/organizations" element={<MainLayout><Organizations /></MainLayout>} />
        <Route path="/organizations/:id" element={<MainLayout><OrganizationDetail /></MainLayout>} />
        <Route path="/trainings" element={<MainLayout><BrowseTrainings /></MainLayout>} />
        <Route path="/trainings/:id" element={<MainLayout><TrainingDetail /></MainLayout>} />
        <Route path="/challenges" element={<MainLayout><BrowseChallenges /></MainLayout>} />
        <Route path="/challenges/:id" element={<MainLayout><ChallengeDetail /></MainLayout>} />
        <Route path="/about" element={<MainLayout><About /></MainLayout>} />
        <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Authenticated landing (role-based redirect) */}
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardRouter /></AppLayout></ProtectedRoute>} />

        {/* Customer */}
        <Route path="/customer-dashboard" element={<ProtectedRoute roles={['CUSTOMER']}><AppLayout><CustomerDashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><AppLayout><Favorites /></AppLayout></ProtectedRoute>} />
        <Route path="/my-reviews" element={<ProtectedRoute roles={['CUSTOMER']}><AppLayout><MyReviews /></AppLayout></ProtectedRoute>} />
        <Route path="/my-registrations" element={<ProtectedRoute roles={['CUSTOMER', 'ENTREPRENEUR']}><AppLayout><MyRegistrations /></AppLayout></ProtectedRoute>} />
        <Route path="/my-applications" element={<ProtectedRoute roles={['CUSTOMER', 'ENTREPRENEUR']}><AppLayout><MyApplications /></AppLayout></ProtectedRoute>} />

        {/* Entrepreneur */}
        <Route path="/my-businesses" element={<ProtectedRoute roles={['ENTREPRENEUR']}><AppLayout><MyBusinesses /></AppLayout></ProtectedRoute>} />
        <Route path="/business/new" element={<ProtectedRoute roles={['ENTREPRENEUR']}><AppLayout><CreateBusiness /></AppLayout></ProtectedRoute>} />
        <Route path="/businesses/:id/edit" element={<ProtectedRoute roles={['ENTREPRENEUR']}><AppLayout><EditBusiness /></AppLayout></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><AppLayout><ManageUsers /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/organizations" element={<ProtectedRoute roles={['ADMIN']}><AppLayout><ManageOrganizations /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute roles={['ADMIN']}><AppLayout><ManageCategories /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/approve" element={<ProtectedRoute roles={['ADMIN']}><AppLayout><ApproveBusinesses /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/trainings" element={<ProtectedRoute roles={['ADMIN']}><AppLayout><ManageTrainings /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/challenges" element={<ProtectedRoute roles={['ADMIN']}><AppLayout><ManageChallenges /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/reviews" element={<ProtectedRoute roles={['ADMIN']}><AppLayout><ManageReviews /></AppLayout></ProtectedRoute>} />

        {/* Organization */}
        <Route path="/my-organizations" element={<ProtectedRoute roles={['ORGANIZATION']}><AppLayout><MyOrganizations /></AppLayout></ProtectedRoute>} />
        <Route path="/organizations/new" element={<ProtectedRoute roles={['ORGANIZATION']}><AppLayout><CreateOrganization /></AppLayout></ProtectedRoute>} />
        <Route path="/organizations/:id/edit" element={<ProtectedRoute roles={['ORGANIZATION']}><AppLayout><CreateOrganization /></AppLayout></ProtectedRoute>} />
        <Route path="/org-trainings" element={<ProtectedRoute roles={['ORGANIZATION']}><AppLayout><Trainings /></AppLayout></ProtectedRoute>} />
        <Route path="/org-trainings/:id/participants" element={<ProtectedRoute roles={['ORGANIZATION']}><AppLayout><TrainingParticipants /></AppLayout></ProtectedRoute>} />
        <Route path="/org-challenges" element={<ProtectedRoute roles={['ORGANIZATION']}><AppLayout><Challenges /></AppLayout></ProtectedRoute>} />
        <Route path="/org-challenges/:id/applications" element={<ProtectedRoute roles={['ORGANIZATION']}><AppLayout><ChallengeApplications /></AppLayout></ProtectedRoute>} />

        {/* Shared */}
        <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><AppLayout><Notifications /></AppLayout></ProtectedRoute>} />
        <Route path="/notification-preferences" element={<ProtectedRoute><AppLayout><NotificationSettings /></AppLayout></ProtectedRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
