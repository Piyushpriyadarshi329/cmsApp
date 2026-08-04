import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Placeholder from './pages/Placeholder'
import Layout from './components/Layout'
import './App.css'

function App() {
  const [user, setUser] = useState(null)

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login onLogin={setUser} />}
        />
        <Route
          path="/"
          element={user ? <Layout user={user} onLogout={() => setUser(null)} /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Home user={user} />} />
          <Route path="contracts" element={<Placeholder title="Contracts" />} />
          <Route path="tenants" element={<Placeholder title="Tenants" />} />
          <Route path="settings" element={<Placeholder title="Settings" />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
