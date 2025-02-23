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

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<TestRedirect />} />
      </Routes>
      </HashRouter>
    </>
  )
}

export default App
