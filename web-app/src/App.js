import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainNavBar from './components/MainNavBar';
import SecondaryNavBar from './components/SecondaryNavBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Donations from './pages/Donations';
import WildlifeSightings from './pages/WildlifeSightings';
import WildlifeDetails from './pages/WildlifeDetails';
import Tourism from './pages/Tourism';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import './styles/App.css';

function App() {
  return (
    <Router>
      <MainNavBar />
      <SecondaryNavBar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/wildlife-sightings" element={<WildlifeSightings />} />
          <Route path="/wildlife-details/:species" element={<WildlifeDetails />} />
          <Route path="/tourism" element={<Tourism />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
