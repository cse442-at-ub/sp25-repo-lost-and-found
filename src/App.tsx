import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { HashRouter, Route, Routes } from 'react-router'
import CounterPage from './CounterPage'
import TestRedirect from './TestRedirect'
import MarketingPage from './MarketingPage'
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
import ReportFoundItem from './ReportFoundItem'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/test" element={<TestRedirect />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/ReportFoundItem" element={<ReportFoundItem />} />
      </Routes>
      </HashRouter>
    </>
  )
}

export default App