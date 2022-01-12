import React from "react"
import "./App.css"
import Header from "./components/Header"
import { Route, Routes } from "react-router-dom"
import LogIn from "./routes/LogIn"
import Domains from "./routes/Domains"
import Register from "./routes/Register"
import LogOut from "./routes/LogOut"

function App() {
  return (
    <div className="container App">
      <Header />
      <Routes>
        <Route path="/" element={<Domains />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<LogOut />} />
      </Routes>
    </div>
  )
}

export default App
