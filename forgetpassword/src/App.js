import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import Header from "./Header";
import './App.css';

function App() {
  return (
    <div className="App">
      <Header/>
      <BrowserRouter>
        <Routes>
          <Route path="forgotPassword" element={<ForgotPassword/>}/>
          <Route path="resetPassword" element={<ResetPassword/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
