import "./app.css";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import MonthlyData from "./pages/MonthlyData";
import MonthlyHistory from "./pages/MonthlyHistory";

function GlobalNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  // Keep the signup screen clean. Navigation is shown on all FinPilot pages.
  if (location.pathname === "/") {
    return null;
  }

  const canGoBack = window.history.length > 1;

  const goBack = () => {
    if (canGoBack) {
      navigate(-1);
    } else if (location.pathname !== "/dashboard") {
      navigate("/dashboard");
    }
  };

  const goForward = () => {
    navigate(1);
  };

  const goDashboard = () => {
    if (location.pathname !== "/dashboard") {
      navigate("/dashboard");
    }
  };

  return (
    <nav className="global-navigation" aria-label="FinPilot navigation">
      <button
        type="button"
        className="global-nav-button"
        onClick={goBack}
        title="Go back"
        aria-label="Go back"
      >
        <span className="nav-arrow">←</span>
        <span className="nav-label">Back</span>
      </button>

      <button
        type="button"
        className="global-nav-button"
        onClick={goForward}
        title="Go forward"
        aria-label="Go forward"
      >
        <span className="nav-label">Forward</span>
        <span className="nav-arrow">→</span>
      </button>

      <span className="global-nav-divider" aria-hidden="true" />

      <button
        type="button"
        className="global-nav-button dashboard"
        onClick={goDashboard}
        title="Return to Dashboard"
        aria-label="Return to Dashboard"
      >
        <span className="nav-home" aria-hidden="true">⌂</span>
        <span className="nav-label">Dashboard</span>
      </button>
    </nav>
  );
}

function App() {
return (
  <BrowserRouter>
    <GlobalNavigation />

    <main className="finpilot-page-content">
      <Routes>
        {/* Signup */}
        <Route path="/" element={<Signup />} />

        {/* Financial Profile */}
        <Route path="/profile" element={<Profile />} />

        {/* Main Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Add Monthly Financial Data */}
        <Route path="/monthly-data" element={<MonthlyData />} />

        {/* Monthly Financial History */}
        <Route path="/monthly-history" element={<MonthlyHistory />} />
      </Routes>
    </main>
  </BrowserRouter>
);
}

export default App;
