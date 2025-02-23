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
      </Routes>
      </HashRouter>
    </>
  )
}

export default App
