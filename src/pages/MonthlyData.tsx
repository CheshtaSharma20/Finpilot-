import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ChangeEvent, FormEvent } from "react";

interface MonthlyRecord {
  id: number;
  month: string;
  revenue: number;
  expenses: number;
  savings: number;
  loanPayment: number;
  notes: string;
}

function MonthlyData() {
  const navigate = useNavigate();

  const [month, setMonth] = useState("");
  const [revenue, setRevenue] = useState("");
  const [expenses, setExpenses] = useState("");
  const [savings, setSavings] = useState("");
  const [loanPayment, setLoanPayment] = useState("");
  const [notes, setNotes] = useState("");

  const handleSaveData = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Convert entered values into numbers
    const newRecord: MonthlyRecord = {
      id: Date.now(),
      month: month,
      revenue: Number(revenue) || 0,
      expenses: Number(expenses) || 0,
      savings: Number(savings) || 0,
      loanPayment: Number(loanPayment) || 0,
      notes: notes,
    };

    // Get existing monthly data
    const existingDataString = localStorage.getItem(
      "finpilotMonthlyData"
    );

    let existingData: MonthlyRecord[] = [];

    if (existingDataString) {
      try {
        existingData = JSON.parse(existingDataString);
      } catch {
        existingData = [];
      }
    }

    // Check whether this month already exists
    const existingMonthIndex = existingData.findIndex(
      (record) => record.month === newRecord.month
    );

    if (existingMonthIndex !== -1) {
      // UPDATE existing month
      existingData[existingMonthIndex] = {
        ...newRecord,
        id: existingData[existingMonthIndex].id,
      };
    } else {
      // ADD new month
      existingData.push(newRecord);
    }

    // Save updated data
    localStorage.setItem(
      "finpilotMonthlyData",
      JSON.stringify(existingData)
    );

    // Verify that the data was actually saved
    const verifyData = localStorage.getItem(
      "finpilotMonthlyData"
    );

    console.log(
      "FINPILOT MONTHLY DATA SAVED:",
      verifyData
    );

    alert(
      `Monthly data for ${month} saved successfully! 🚀`
    );

    navigate("/dashboard");
  };

  return (
    <div className="dashboard-page">
      <div className="monthly-data-container">
        <div className="monthly-data-card">

          <div className="monthly-data-heading">
            <h1>Monthly Financial Update</h1>

            <p>
              Enter your latest financial numbers so FinPilot
              can track your progress over time.
            </p>
          </div>

          <form
            className="monthly-data-form"
            onSubmit={handleSaveData}
          >

            {/* MONTH */}
            <div className="form-group">
              <label>Month</label>

              <input
                type="month"
                value={month}
                onChange={(
                  e: ChangeEvent<HTMLInputElement>
                ) => setMonth(e.currentTarget.value)}
                required
              />
            </div>

            {/* REVENUE */}
            <div className="form-group">
              <label>Monthly Revenue</label>

              <input
                type="number"
                value={revenue}
                placeholder="Enter monthly revenue"
                onChange={(
                  e: ChangeEvent<HTMLInputElement>
                ) => setRevenue(e.currentTarget.value)}
                min="0"
                required
              />
            </div>

            {/* EXPENSES */}
            <div className="form-group">
              <label>Monthly Expenses</label>

              <input
                type="number"
                value={expenses}
                placeholder="Enter monthly expenses"
                onChange={(
                  e: ChangeEvent<HTMLInputElement>
                ) => setExpenses(e.currentTarget.value)}
                min="0"
                required
              />
            </div>

            {/* SAVINGS */}
            <div className="form-group">
              <label>Monthly Savings</label>

              <input
                type="number"
                value={savings}
                placeholder="Enter monthly savings"
                onChange={(
                  e: ChangeEvent<HTMLInputElement>
                ) => setSavings(e.currentTarget.value)}
                min="0"
                required
              />
            </div>

            {/* LOAN PAYMENT */}
            <div className="form-group">
              <label>Loan Payment</label>

              <input
                type="number"
                value={loanPayment}
                placeholder="Enter loan payment"
                onChange={(
                  e: ChangeEvent<HTMLInputElement>
                ) => setLoanPayment(e.currentTarget.value)}
                min="0"
                required
              />
            </div>

            {/* NOTES */}
            <div className="form-group">
              <label>Notes (Optional)</label>

              <textarea
                value={notes}
                placeholder="Example: Revenue increased because of new customers..."
                onChange={(
                  e: ChangeEvent<HTMLTextAreaElement>
                ) => setNotes(e.currentTarget.value)}
              />
            </div>

            {/* SAVE */}
            <button
              type="submit"
              className="signup-button"
            >
              Save Monthly Data 🚀
            </button>

          </form>

          <button
            type="button"
            className="outline-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>

        </div>
      </div>
    </div>
  );
}

export default MonthlyData;