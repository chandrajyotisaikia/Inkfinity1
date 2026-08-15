import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Storefront from './components/Storefront.jsx'
import ConsentForm from './components/ConsentForm.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Storefront />} />
        <Route path="/waiver" element={<ConsentForm />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
