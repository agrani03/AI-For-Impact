import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import InterviewPage from './pages/InterviewPage'
import RepoAuditorPage from './pages/RepoAuditorPage'
import ResumePage from './pages/ResumePage'
import JobScamPage from './pages/JobScamPage'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/repo" element={<RepoAuditorPage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/jobs" element={<JobScamPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
