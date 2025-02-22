import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { HashRouter, Route, Routes } from 'react-router'
import CounterPage from './CounterPage'
import TestRedirect from './TestRedirect'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <HashRouter>
      <Routes>
        <Route path="/" element={<CounterPage />} />
        <Route path="/test" element={<TestRedirect />} />
      </Routes>
      </HashRouter>
    </>
  )
}

export default App
