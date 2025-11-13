import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AllSchedule from './pages/AllSchedule'
import ScheduleMajor from './pages/ScheduleMajor'
import ProtectedRoute from './components/ProtectedRoute'
import RedirectRoute from './components/RedirectRoute'

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={
          <RedirectRoute>
            <Login />
          </RedirectRoute>
        } />

        <Route path='/dashboard' element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path='/dashboard/all' element={
          <ProtectedRoute>
            <AllSchedule />
          </ProtectedRoute>
        } />

        <Route path='/dashboard/major' element={
          <ProtectedRoute>
            <ScheduleMajor />
          </ProtectedRoute>
        } />

        <Route path='/dashboard/major/:MajorID' element={
          <ProtectedRoute>
            <ScheduleMajor />
          </ProtectedRoute>
        } />

      </Routes>
    </>
  )
}

export default App
