import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface MonthlyRecord {
  id: number;
  month: string;
  revenue: number;
  expenses: number;
  savings: number;
  loanPayment: number;
  notes: string;
}

function MonthlyHistory() {
  const navigate = useNavigate();

  const [monthlyData, setMonthlyData] = useState<MonthlyRecord[]>([]);

  useEffect(() => {
    loadMonthlyData();
  }, []);

  const loadMonthlyData = () => {
    const savedData = localStorage.getItem(
      "finpilotMonthlyData"
    );

    if (!savedData) {
      setMonthlyData([]);
      return;
    }

    try {
      const parsedData: MonthlyRecord[] =
        JSON.parse(savedData);

      /*
        STEP 1:
        Remove duplicate months.

        If multiple records have the same month,
        keep the record with the largest ID because
        the largest ID represents the latest saved entry.
      */

      const latestByMonth: Record<
        string,
        MonthlyRecord
      > = {};

      parsedData.forEach((record) => {
        const existingRecord =
          latestByMonth[record.month];

        if (
          !existingRecord ||
          Number(record.id) >
            Number(existingRecord.id)
        ) {
          latestByMonth[record.month] = record;
        }
      });

      /*
        STEP 2:
        Convert the object back into an array.
      */

      const cleanedData =
        Object.values(latestByMonth);

      /*
        STEP 3:
        Sort newest month first.

        If two records somehow have the same month,
        the newest ID comes first.
      */

      cleanedData.sort((a, b) => {
        const monthA = new Date(
          `${a.month}-01`
        ).getTime();

        const monthB = new Date(
          `${b.month}-01`
        ).getTime();

        if (monthB !== monthA) {
          return monthB - monthA;
        }

        return (
          Number(b.id) -
          Number(a.id)
        );
      });

      setMonthlyData(cleanedData);

      /*
        IMPORTANT:

        Save the cleaned version back to localStorage.

        This removes the duplicate records permanently
        from the browser's stored FinPilot data.
      */

      localStorage.setItem(
        "finpilotMonthlyData",
        JSON.stringify(cleanedData)
      );

    } catch (error) {
      console.error(
        "Unable to load monthly data:",
        error
      );

      setMonthlyData([]);
    }
  };

  /*
    Convert YYYY-MM into readable format.
    Example:
    2026-09 → September 2026
  */

  const formatMonth = (month: string) => {
    if (!month) {
      return "Unknown Month";
    }

    const date = new Date(
      `${month}-01`
    );

    return date.toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    );
  };

  /*
    Format Indian currency.
  */

  const formatCurrency = (value: number) => {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN"
    )}`;
  };

  /*
    Calculate surplus.
  */

  const calculateSurplus = (
    revenue: number,
    expenses: number
  ) => {
    return (
      Number(revenue || 0) -
      Number(expenses || 0)
    );
  };

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <div className="dashboard-header">

        <div>
          <div className="mini-badge">
            ✦ FINPILOT
          </div>

          <h1>
            Monthly History
          </h1>

          <p>
            Track your financial journey
            month by month.
          </p>
        </div>

        <div className="dashboard-user">
          <span>📊</span>
          Financial Timeline
        </div>

      </div>

      {/* ACTION BUTTONS */}

      <div
        className="dashboard-actions"
        style={{
          marginBottom: "30px",
        }}
      >

        <button
          className="neon-button"
          onClick={() =>
            navigate("/monthly-data")
          }
        >
          <span>＋</span>
          Add / Update Monthly Data
        </button>

        <button
          className="outline-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Back to Dashboard
        </button>

      </div>

      {/* HISTORY */}

      {monthlyData.length === 0 ? (

        <div
          className="dashboard-card"
          style={{
            textAlign: "center",
            padding: "60px 30px",
          }}
        >

          <div
            style={{
              fontSize: "50px",
              marginBottom: "20px",
            }}
          >
            📭
          </div>

          <h2>
            No Monthly Data Yet
          </h2>

          <p
            style={{
              marginTop: "10px",
              opacity: 0.7,
            }}
          >
            Start adding your monthly
            financial data and FinPilot
            will build your financial
            history here.
          </p>

          <button
            className="neon-button"
            style={{
              marginTop: "25px",
            }}
            onClick={() =>
              navigate("/monthly-data")
            }
          >
            Add First Month 🚀
          </button>

        </div>

      ) : (

        <div>

          {/* SUMMARY */}

          <div
            className="dashboard-card"
            style={{
              marginBottom: "25px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >

            <div>

              <div className="section-label">
                📈 FINANCIAL TIMELINE
              </div>

              <h2
                style={{
                  marginTop: "8px",
                }}
              >
                Your Monthly Journey
              </h2>

              <p
                style={{
                  opacity: 0.7,
                  marginTop: "6px",
                }}
              >
                {monthlyData.length} month
                {monthlyData.length !== 1
                  ? "s"
                  : ""}{" "}
                recorded in FinPilot.
              </p>

            </div>

            <div
              style={{
                padding: "15px 22px",
                borderRadius: "16px",
                background:
                  "rgba(255,255,255,0.05)",
                border:
                  "1px solid rgba(255,255,255,0.08)",
              }}
            >

              <span
                style={{
                  display: "block",
                  fontSize: "12px",
                  opacity: 0.6,
                  marginBottom: "5px",
                }}
              >
                LATEST MONTH
              </span>

              <strong>
                {formatMonth(
                  monthlyData[0].month
                )}
              </strong>

            </div>

          </div>

          {/* MONTHLY RECORDS */}

          <div
            style={{
              display: "grid",
              gap: "22px",
            }}
          >

            {monthlyData.map(
              (data, index) => {

                const surplus =
                  calculateSurplus(
                    data.revenue,
                    data.expenses
                  );

                return (

                  <div
                    className="dashboard-card"
                    key={data.id}
                    style={{
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >

                    {/* LATEST BADGE */}

                    {index === 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "20px",
                          right: "20px",
                          padding:
                            "6px 12px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing:
                            "0.5px",
                          background:
                            "rgba(120,255,190,0.12)",
                          border:
                            "1px solid rgba(120,255,190,0.3)",
                        }}
                      >
                        ✦ LATEST
                      </div>
                    )}

                    {/* MONTH TITLE */}

                    <div
                      style={{
                        display: "flex",
                        alignItems:
                          "center",
                        gap: "15px",
                        marginBottom:
                          "25px",
                      }}
                    >

                      <div
                        style={{
                          width: "52px",
                          height: "52px",
                          borderRadius: "15px",
                          display: "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          fontSize: "23px",
                          background:
                            "rgba(140,100,255,0.12)",
                          border:
                            "1px solid rgba(140,100,255,0.25)",
                        }}
                      >
                        📅
                      </div>

                      <div>

                        <div
                          style={{
                            fontSize: "12px",
                            opacity: 0.6,
                            letterSpacing:
                              "1px",
                            textTransform:
                              "uppercase",
                          }}
                        >
                          Monthly Report
                        </div>

                        <h2
                          style={{
                            margin:
                              "4px 0 0",
                          }}
                        >
                          {formatMonth(
                            data.month
                          )}
                        </h2>

                      </div>

                    </div>

                    {/* FINANCIAL NUMBERS */}

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(170px, 1fr))",
                        gap: "14px",
                      }}
                    >

                      {/* REVENUE */}

                      <div
                        style={{
                          padding:
                            "18px",
                          borderRadius:
                            "16px",
                          background:
                            "rgba(80,255,170,0.06)",
                          border:
                            "1px solid rgba(80,255,170,0.12)",
                        }}
                      >

                        <div
                          style={{
                            fontSize:
                              "12px",
                            opacity: 0.65,
                            marginBottom:
                              "8px",
                          }}
                        >
                          💰 REVENUE
                        </div>

                        <strong
                          style={{
                            fontSize:
                              "22px",
                          }}
                        >
                          {formatCurrency(
                            data.revenue
                          )}
                        </strong>

                      </div>

                      {/* EXPENSES */}

                      <div
                        style={{
                          padding:
                            "18px",
                          borderRadius:
                            "16px",
                          background:
                            "rgba(255,90,150,0.06)",
                          border:
                            "1px solid rgba(255,90,150,0.12)",
                        }}
                      >

                        <div
                          style={{
                            fontSize:
                              "12px",
                            opacity: 0.65,
                            marginBottom:
                              "8px",
                          }}
                        >
                          💸 EXPENSES
                        </div>

                        <strong
                          style={{
                            fontSize:
                              "22px",
                          }}
                        >
                          {formatCurrency(
                            data.expenses
                          )}
                        </strong>

                      </div>

                      {/* SAVINGS */}

                      <div
                        style={{
                          padding:
                            "18px",
                          borderRadius:
                            "16px",
                          background:
                            "rgba(255,200,80,0.06)",
                          border:
                            "1px solid rgba(255,200,80,0.12)",
                        }}
                      >

                        <div
                          style={{
                            fontSize:
                              "12px",
                            opacity: 0.65,
                            marginBottom:
                              "8px",
                          }}
                        >
                          🏦 SAVINGS
                        </div>

                        <strong
                          style={{
                            fontSize:
                              "22px",
                          }}
                        >
                          {formatCurrency(
                            data.savings
                          )}
                        </strong>

                      </div>

                      {/* SURPLUS */}

                      <div
                        style={{
                          padding:
                            "18px",
                          borderRadius:
                            "16px",
                          background:
                            surplus >= 0
                              ? "rgba(130,100,255,0.07)"
                              : "rgba(255,80,80,0.07)",
                          border:
                            surplus >= 0
                              ? "1px solid rgba(130,100,255,0.15)"
                              : "1px solid rgba(255,80,80,0.15)",
                        }}
                      >

                        <div
                          style={{
                            fontSize:
                              "12px",
                            opacity: 0.65,
                            marginBottom:
                              "8px",
                          }}
                        >
                          ✦ NET SURPLUS
                        </div>

                        <strong
                          style={{
                            fontSize:
                              "22px",
                          }}
                        >
                          {formatCurrency(
                            surplus
                          )}
                        </strong>

                      </div>

                      {/* LOAN PAYMENT */}

                      <div
                        style={{
                          padding:
                            "18px",
                          borderRadius:
                            "16px",
                          background:
                            "rgba(100,180,255,0.06)",
                          border:
                            "1px solid rgba(100,180,255,0.12)",
                        }}
                      >

                        <div
                          style={{
                            fontSize:
                              "12px",
                            opacity: 0.65,
                            marginBottom:
                              "8px",
                          }}
                        >
                          🏦 LOAN PAYMENT
                        </div>

                        <strong
                          style={{
                            fontSize:
                              "22px",
                          }}
                        >
                          {formatCurrency(
                            data.loanPayment
                          )}
                        </strong>

                      </div>

                    </div>

                    {/* NOTES */}

                    {data.notes &&
                      data.notes.trim() !== "" && (

                        <div
                          style={{
                            marginTop:
                              "20px",
                            padding:
                              "16px 18px",
                            borderRadius:
                              "14px",
                            background:
                              "rgba(255,255,255,0.03)",
                            border:
                              "1px solid rgba(255,255,255,0.07)",
                          }}
                        >

                          <div
                            style={{
                              fontSize:
                                "12px",
                              opacity: 0.6,
                              marginBottom:
                                "6px",
                            }}
                          >
                            📝 NOTES
                          </div>

                          <p
                            style={{
                              margin: 0,
                              lineHeight:
                                "1.6",
                            }}
                          >
                            {data.notes}
                          </p>

                        </div>

                      )}

                    {/* SURPLUS MESSAGE */}

                    <div
                      style={{
                        marginTop: "20px",
                        padding:
                          "13px 16px",
                        borderRadius: "12px",
                        background:
                          surplus >= 0
                            ? "rgba(80,255,170,0.05)"
                            : "rgba(255,80,100,0.05)",
                        border:
                          surplus >= 0
                            ? "1px solid rgba(80,255,170,0.1)"
                            : "1px solid rgba(255,80,100,0.1)",
                      }}
                    >

                      {surplus >= 0 ? (
                        <>
                          <span>
                            ✓
                          </span>{" "}
                          This month generated a
                          positive surplus of{" "}
                          <strong>
                            {formatCurrency(
                              surplus
                            )}
                          </strong>
                          .
                        </>
                      ) : (
                        <>
                          <span>
                            !
                          </span>{" "}
                          Expenses exceeded
                          revenue by{" "}
                          <strong>
                            {formatCurrency(
                              Math.abs(
                                surplus
                              )
                            )}
                          </strong>
                          .
                        </>
                      )}

                    </div>

                  </div>

                );
              }
            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default MonthlyHistory;