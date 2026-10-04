import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const handleSignup = (event: React.FormEvent) => {
    event.preventDefault();
    navigate("/profile");
  };

  return (
    <div className="signup-page">

      <div className="app-logo">
        <div className="logo-mark">FP</div>

        <div className="logo-word">
          Fin<span>Pilot</span>
        </div>
      </div>

      <div className="signup-container">

        <div className="signup-heading">
          <h1>Create your account</h1>

          <p>
            Set up your FinPilot account and start
            making smarter financial decisions.
          </p>
        </div>

        <form
          className="signup-form"
          onSubmit={handleSignup}
        >

          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Create a secure password"
              required
            />
          </div>

          <div className="form-group">
            <label>Account Type</label>

            <select defaultValue="" required>
              <option value="" disabled>
                Select your account type
              </option>

              <option value="startup">
                Startup
              </option>

              <option value="business">
                Small Business
              </option>

              <option value="entrepreneur">
                Entrepreneur
              </option>

              <option value="freelancer">
                Freelancer
              </option>
            </select>
          </div>

          <button
            type="submit"
            className="signup-button"
          >
            Continue to Financial Profile →
          </button>

        </form>

        <div className="privacy-note">
          🔐 Your financial information stays private.
          <br />
          No bank credentials are required.
        </div>

      </div>

    </div>
  );
}

export default Signup;