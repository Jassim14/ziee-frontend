import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import MainLayout from './layouts/MainLayout';
import AppLayout from './layouts/AppLayout';
import SharedLayout from './layouts/SharedLayout';
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
        {/* SharedLayout: keeps authenticated users (Entrepreneur/Customer) inside the
            sidebar layout when navigating to Trainings/Challenges etc. */}
        <Route path="/businesses" element={<SharedLayout><Businesses /></SharedLayout>} />
        <Route path="/businesses/:id" element={<SharedLayout><BusinessDetail /></SharedLayout>} />
        <Route path="/categories" element={<SharedLayout><Categories /></SharedLayout>} />
        <Route path="/organizations" element={<SharedLayout><Organizations /></SharedLayout>} />
        <Route path="/organizations/:id" element={<SharedLayout><OrganizationDetail /></SharedLayout>} />
        <Route path="/trainings" element={<SharedLayout><BrowseTrainings /></SharedLayout>} />
        <Route path="/trainings/:id" element={<SharedLayout><TrainingDetail /></SharedLayout>} />
        <Route path="/challenges" element={<SharedLayout><BrowseChallenges /></SharedLayout>} />
        <Route path="/challenges/:id" element={<SharedLayout><ChallengeDetail /></SharedLayout>} />
        <Route path="/about" element={<MainLayout><About /></MainLayout>} />
        <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Authenticated layout: pathless layout route keeps Navbar + Sidebar
            mounted while only the main content (Outlet) changes on navigation */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          {/* Authenticated landing (role-based redirect) */}
          <Route path="/dashboard" element={<DashboardRouter />} />

          {/* Customer */}
          <Route path="/customer-dashboard" element={<ProtectedRoute roles={['CUSTOMER']}><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/my-reviews" element={<ProtectedRoute roles={['CUSTOMER']}><MyReviews /></ProtectedRoute>} />
          <Route path="/my-registrations" element={<ProtectedRoute roles={['CUSTOMER', 'ENTREPRENEUR']}><MyRegistrations /></ProtectedRoute>} />
          <Route path="/my-applications" element={<ProtectedRoute roles={['CUSTOMER', 'ENTREPRENEUR']}><MyApplications /></ProtectedRoute>} />
          <Route path="/my-trainings/:id/register" element={<ProtectedRoute roles={['CUSTOMER']}><TrainingDetail /></ProtectedRoute>} />
          <Route path="/challenges/:id/apply" element={<ProtectedRoute roles={['CUSTOMER']}><ChallengeDetail /></ProtectedRoute>} />
          

          {/* Entrepreneur */}
          <Route path="/my-businesses" element={<ProtectedRoute roles={['ENTREPRENEUR']}><MyBusinesses /></ProtectedRoute>} />
          <Route path="/business/new" element={<ProtectedRoute roles={['ENTREPRENEUR']}><CreateBusiness /></ProtectedRoute>} />
          <Route path="/businesses/:id/edit" element={<ProtectedRoute roles={['ENTREPRENEUR']}><EditBusiness /></ProtectedRoute>} />
          <Route path="/businesses/:id" element={<ProtectedRoute roles={['ENTREPRENEUR']}><BusinessDetail /></ProtectedRoute>} />
          <Route path="/trainings/:id/register" element={<ProtectedRoute roles={['ENTREPRENEUR']}><TrainingDetail /></ProtectedRoute>} />
          <Route path="/challenges/:id/apply" element={<ProtectedRoute roles={['ENTREPRENEUR']}><ChallengeDetail /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><ManageUsers /></ProtectedRoute>} />
          <Route path="/admin/organizations" element={<ProtectedRoute roles={['ADMIN']}><ManageOrganizations /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute roles={['ADMIN']}><ManageCategories /></ProtectedRoute>} />
          <Route path="/admin/approve" element={<ProtectedRoute roles={['ADMIN']}><ApproveBusinesses /></ProtectedRoute>} />
          <Route path="/admin/trainings" element={<ProtectedRoute roles={['ADMIN']}><ManageTrainings /></ProtectedRoute>} />
          <Route path="/admin/challenges" element={<ProtectedRoute roles={['ADMIN']}><ManageChallenges /></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute roles={['ADMIN']}><ManageReviews /></ProtectedRoute>} />

          {/* Organization */}
          <Route path="/my-organizations" element={<ProtectedRoute roles={['ORGANIZATION']}><MyOrganizations /></ProtectedRoute>} />
          <Route path="/organizations/new" element={<ProtectedRoute roles={['ORGANIZATION']}><CreateOrganization /></ProtectedRoute>} />
          <Route path="/organizations/:id/edit" element={<ProtectedRoute roles={['ORGANIZATION']}><CreateOrganization /></ProtectedRoute>} />
          <Route path="/org-trainings" element={<ProtectedRoute roles={['ORGANIZATION']}><Trainings /></ProtectedRoute>} />
          <Route path="/org-trainings/:id/participants" element={<ProtectedRoute roles={['ORGANIZATION']}><TrainingParticipants /></ProtectedRoute>} />
          <Route path="/org-challenges" element={<ProtectedRoute roles={['ORGANIZATION']}><Challenges /></ProtectedRoute>} />
          <Route path="/org-challenges/:id/applications" element={<ProtectedRoute roles={['ORGANIZATION']}><ChallengeApplications /></ProtectedRoute>} />

          {/* Shared */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/notification-preferences" element={<NotificationSettings />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}