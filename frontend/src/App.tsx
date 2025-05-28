import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>

      {/* Routing */}
      <Routes>
        <Route path='/' element={<MainLayout />}>

          {/* Main Pages */}
          <Route index element={<Home />} />
          <Route path="*" element={<NotFound />} />

        </Route>
      </Routes>

      {/* ToastifyContainer */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />

    </BrowserRouter>
  )
}

export default App