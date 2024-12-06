import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import SellPage from './components/SellPage';
import RentPage from './components/RentPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/sell" element={<SellPage />} />
        <Route path="/rent" element={<RentPage />} />
      </Routes>
    </Router>
  );
}

export default App;
