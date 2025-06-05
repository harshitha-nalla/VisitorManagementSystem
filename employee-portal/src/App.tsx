import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import VisitorPreBookingForm from './components/VisitorPreBooking/VisitorPreBookingForm';
import Login from './components/Auth/Login';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/pre-approval"
          element={
            <ProtectedRoute>
              <VisitorPreBookingForm />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
