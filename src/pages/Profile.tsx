import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ProfileData {
  businessName: string;
  revenue: number;
  expenses: number;
  salary: number;
  savings: number;
  loans: number;
  goal: string;
}

function Profile() {
  const navigate = useNavigate();

  const [businessName, setBusinessName] = useState("");
  const [revenue, setRevenue] = useState("");
  const [expenses, setExpenses] = useState("");
  const [salary, setSalary] = useState("");
  const [savings, setSavings] = useState("");
  const [loans, setLoans] = useState("");
  const [goal, setGoal] = useState("");

  const [hasProfile, setHasProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  /* =====================================================
     LOAD SAVED PROFILE
     ===================================================== */

  useEffect(() => {
    const savedProfile = localStorage.getItem("finpilotProfile");

    if (!savedProfile) {
      setHasProfile(false);
      return;
    }

    try {
      const profile: ProfileData = JSON.parse(savedProfile);

      setBusinessName(profile.businessName || "");
      setRevenue(String(profile.revenue ?? ""));
      setExpenses(String(profile.expenses ?? ""));
      setSalary(String(profile.salary ?? ""));
      setSavings(String(profile.savings ?? ""));
      setLoans(String(profile.loans ?? ""));
      setGoal(profile.goal || "");

      setHasProfile(true);
    } catch (error) {
      console.error("Unable to load FinPilot profile:", error);
      setHasProfile(false);
    }
  }, []);

  /* =====================================================
     FORMAT CURRENCY
     ===================================================== */

  const formatCurrency = (value: string | number) => {
    const number = Number(value);

    if (isNaN(number)) {
      return "₹0";
    }

    return `₹${number.toLocaleString("en-IN")}`;
  };

  /* =====================================================
     GOAL NAME
     ===================================================== */

  const getGoalName = () => {
    switch (goal) {
      case "growth":
        return "Grow My Business";

      case "savings":
        return "Increase Savings";

      case "loan":
        return "Manage / Repay Loans";

      case "expansion":
        return "Business Expansion";

      case "emergency":
        return "Build Emergency Funds";

      default:
        return "Financial Growth";
    }
  };

  /* =====================================================
     GOAL DESCRIPTION
     ===================================================== */

  const getGoalDescription = () => {
    switch (goal) {
      case "growth":
        return "Focus on increasing revenue and strengthening business performance.";

      case "savings":
        return "Build stronger savings and improve your financial reserve.";

      case "loan":
        return "Focus on reducing liabilities and maintaining healthy repayments.";

      case "expansion":
        return "Prepare your finances for future business expansion.";

      case "emergency":
        return "Build a reliable emergency fund for unexpected financial needs.";

      default:
        return "Your primary financial objective in FinPilot.";
    }
  };

  /* =====================================================
     SAVE PROFILE
     ===================================================== */

  const handleProfileSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const profileData: ProfileData = {
      businessName,
      revenue: Number(revenue),
      expenses: Number(expenses),
      salary: Number(salary),
      savings: Number(savings),
      loans: Number(loans),
      goal,
    };

    localStorage.setItem(
      "finpilotProfile",
      JSON.stringify(profileData)
    );

    setHasProfile(true);
    setIsEditing(false);

    alert("FinPilot profile updated successfully! 🚀");
  };

  /* =====================================================
     PROFILE CARD
     ===================================================== */

  const FinancialCard = ({
    icon,
    label,
    value,
    className = "",
  }: {
    icon: string;
    label: string;
    value: string;
    className?: string;
  }) => {
    return (
      <div className={`fin-profile-card ${className}`}>
        <div className="fin-profile-card-top">
          <div className="fin-profile-icon">
            {icon}
          </div>

          <span className="fin-profile-label">
            {label}
          </span>
        </div>

        <div className="fin-profile-value">
          {value}
        </div>
      </div>
    );
  };

  /* =====================================================
     SAVED PROFILE VIEW
     ===================================================== */

  if (hasProfile && !isEditing) {
    return (
      <div className="profile-dashboard-page">

        {/* TOP BAR */}

        <div className="profile-topbar">

          <div className="profile-brand">
            Fin<span>Pilot</span> 🚀
          </div>

          <button
            className="profile-edit-button"
            onClick={() => setIsEditing(true)}
          >
            ✏️ Edit Profile
          </button>

        </div>

        {/* MAIN CONTENT */}

        <div className="profile-dashboard-container">

          {/* HEADER */}

          <div className="profile-page-header">

            <div>
              <div className="profile-mini-label">
                FINANCIAL PROFILE
              </div>

              <h1>
                Your FinPilot Profile
              </h1>

              <p>
                Manage your business information and financial
                foundation from one place.
              </p>
            </div>

          </div>

          {/* BUSINESS IDENTITY CARD */}

          <div className="business-identity-card">

            <div className="business-avatar">
              {businessName
                ? businessName.charAt(0).toUpperCase()
                : "F"}
            </div>

            <div className="business-identity-info">

              <span>
                BUSINESS / STARTUP
              </span>

              <h2>
                {businessName || "My Business"}
              </h2>

              <p>
                Your financial profile is connected to your
                FinPilot dashboard.
              </p>

            </div>

            <div className="profile-status">
              <span className="status-dot"></span>
              Profile Active
            </div>

          </div>

          {/* FINANCIAL OVERVIEW */}

          <div className="section-heading">
            <div>
              <h2>Financial Overview</h2>

              <p>
                Your current financial snapshot
              </p>
            </div>
          </div>

          <div className="financial-grid">

            <FinancialCard
              icon="💰"
              label="Monthly Revenue"
              value={formatCurrency(revenue)}
            />

            <FinancialCard
              icon="📉"
              label="Monthly Expenses"
              value={formatCurrency(expenses)}
            />

            <FinancialCard
              icon="💵"
              label="Current Savings"
              value={formatCurrency(savings)}
            />

            <FinancialCard
              icon="👤"
              label="Personal Income"
              value={formatCurrency(salary)}
            />

            <FinancialCard
              icon="💳"
              label="Current Loans"
              value={formatCurrency(loans)}
              className="loan-card"
            />

          </div>

          {/* FINANCIAL GOAL */}

          <div className="goal-section">

            <div className="goal-icon">
              🎯
            </div>

            <div className="goal-content">

              <span>
                PRIMARY FINANCIAL GOAL
              </span>

              <h2>
                {getGoalName()}
              </h2>

              <p>
                {getGoalDescription()}
              </p>

            </div>

            <div className="goal-arrow">
              →
            </div>

          </div>

          {/* PROFILE INFORMATION */}

          <div className="profile-info-strip">

            <div>
              <span>DATA STORAGE</span>
              <strong>Local & Privacy-First</strong>
            </div>

            <div>
              <span>PROFILE STATUS</span>
              <strong>✓ Active</strong>
            </div>

            <div>
              <span>FINPILOT MODE</span>
              <strong>Financial Intelligence</strong>
            </div>

          </div>

          {/* BOTTOM ACTION */}

          <div className="profile-bottom-actions">

            <button
              className="back-dashboard-button"
              onClick={() => navigate("/dashboard")}
            >
              ← Back to Dashboard
            </button>

            <button
              className="secondary-edit-button"
              onClick={() => setIsEditing(true)}
            >
              ✏️ Update Financial Information
            </button>

          </div>

          <div className="profile-privacy">
            🔐 Your financial information is stored locally
            and remains under your control.
          </div>

        </div>
      </div>
    );
  }

  /* =====================================================
     CREATE / EDIT FORM
     ===================================================== */

  return (
    <div className="signup-page">

      <div className="signup-logo">
        Fin<span>Pilot</span> 🚀
      </div>

      <div className="signup-container">

        <div className="signup-heading">

          <h1>
            {isEditing
              ? "Edit Your Financial Profile"
              : "Build Your Financial Profile"}
          </h1>

          <p>
            {isEditing
              ? "Update your financial information and keep your FinPilot profile current."
              : "Tell us a little about your business so FinPilot can understand your financial situation."}
          </p>

        </div>

        <form
          className="signup-form"
          onSubmit={handleProfileSubmit}
        >

          <div className="form-group">
            <label>Business / Startup Name</label>

            <input
              type="text"
              placeholder="Enter your business name"
              value={businessName}
              onChange={(e) =>
                setBusinessName(e.currentTarget.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Monthly Revenue</label>

            <input
              type="number"
              placeholder="₹ Monthly revenue"
              value={revenue}
              onChange={(e) =>
                setRevenue(e.currentTarget.value)
              }
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Monthly Expenses</label>

            <input
              type="number"
              placeholder="₹ Monthly expenses"
              value={expenses}
              onChange={(e) =>
                setExpenses(e.currentTarget.value)
              }
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Monthly Salary / Personal Income</label>

            <input
              type="number"
              placeholder="₹ Monthly salary"
              value={salary}
              onChange={(e) =>
                setSalary(e.currentTarget.value)
              }
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Current Savings / Business Funds</label>

            <input
              type="number"
              placeholder="₹ Current savings"
              value={savings}
              onChange={(e) =>
                setSavings(e.currentTarget.value)
              }
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Current Loans / Liabilities</label>

            <input
              type="number"
              placeholder="₹ Current loans"
              value={loans}
              onChange={(e) =>
                setLoans(e.currentTarget.value)
              }
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Primary Financial Goal</label>

            <select
              value={goal}
              onChange={(e) =>
                setGoal(e.currentTarget.value)
              }
              required
            >
              <option value="" disabled>
                Select your goal
              </option>

              <option value="growth">
                Grow My Business
              </option>

              <option value="savings">
                Increase Savings
              </option>

              <option value="loan">
                Manage / Repay Loans
              </option>

              <option value="expansion">
                Business Expansion
              </option>

              <option value="emergency">
                Build Emergency Funds
              </option>
            </select>
          </div>

          <button
            type="submit"
            className="signup-button"
          >
            {isEditing
              ? "💾 Save Profile Changes"
              : "Create My FinPilot Profile 🚀"}
          </button>

          {isEditing && (
            <button
              type="button"
              className="signup-button"
              onClick={() => setIsEditing(false)}
              style={{
                marginTop: "10px",
                background:
                  "linear-gradient(135deg, #242038, #171426)",
              }}
            >
              Cancel
            </button>
          )}

        </form>

        <div className="privacy-note">
          🔐 Privacy-first financial tracking
          <br />
          You control what information you provide.
        </div>

      </div>

    </div>
  );
}

export default Profile;