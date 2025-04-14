import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { HashRouter, Route, Routes } from 'react-router'
import CounterPage from './CounterPage'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import LayoutDefault from './LayoutDefault'
import HomePage from './HomePage'
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage'
import ForgotPassword from './ForgotPassword'
import ResetPassword from './ResetPassword'
import Settings from './Settings'
import ChangePassword from './ChangePassword'
import AboutUs from './AboutUs'
import ContactUs from './ContactUs'
import ReportLostItem from './ReportLostItem'
import ReportFoundItem from './ReportFoundItem'
import ClaimPage from './ClaimPage'
import AdminClaim from './AdminClaim'
import AdminConsole from './AdminConsole'
import ViewMessages from './ViewMessages'
import NotAdmin from './NotAdmin'
import AdminMatch from './AdminMatch'
import RetrieveForm from './RetrieveForm'
import NotificationDashboard from './NotificationDashboard'
import NotificationDetail from './NotificationDetail'
import { AuthProvider } from './components/AuthContext'
import ItemPage from './ItemPage'
import UserDashboard from './UserDashboard'
import DeleteAndEditByID from './deleteandeditbyID'
import AdminRetrieve from './AdminRetrieve'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <AuthProvider>
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/report-lost-item" element={<ReportLostItem />} />
        <Route path="/report-found-item" element={<ReportFoundItem />} />
        <Route path="/claim" element={<ClaimPage />} />
        <Route path="/view-item" element={<ItemPage />} />
        <Route path="/admin-claim" element={<AdminClaim />} />
        <Route path="/admin-console" element={<AdminConsole />} />
        <Route path="/view-messages" element={<ViewMessages />} />
        <Route path="/not-admin" element={<NotAdmin />} />
        <Route path="/admin-match" element={<AdminMatch />} />
        <Route path="/admin-retrieve" element={<AdminRetrieve />} />
        <Route path="/retrieve-form" element={<RetrieveForm />} />
        <Route path="/notifications" element={<NotificationDashboard />} />
        <Route path="/notification-detail/:id" element={<NotificationDetail />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/edit/:type/:id" element={<DeleteAndEditByID />} />
        <Route path="/admin-retrieve" element={<AdminRetrieve />} />
        
      </Routes>
      </HashRouter>
      </AuthProvider>
    </>
  )
}

export default App
