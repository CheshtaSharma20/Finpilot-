import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface ProfileData {
  businessName: string;
  revenue: number;
  expenses: number;
  salary: number;
  savings: number;
  loans: number;
  goal: string;
}

interface MonthlyRecord {
  id: number;
  month: string;
  revenue: number;
  expenses: number;
  savings: number;
  loanPayment: number;
  notes: string;
}

interface ChartData {
  month: string;
  revenue: number;
  expenses: number;
  savings: number;
  surplus: number;
}

interface AiMessage {
  id: number;
  role: "assistant" | "user";
  text: string;
}

function Dashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState<ProfileData | null>(null);

  const [monthlyData, setMonthlyData] =
    useState<MonthlyRecord[]>([]);

  const [showAiAssistant, setShowAiAssistant] =
    useState(false);

  const [showEntrepreneurInfo, setShowEntrepreneurInfo] =
    useState(false);

  const [aiInput, setAiInput] =
    useState("");

  const [aiMessages, setAiMessages] =
    useState<AiMessage[]>([
      {
        id: 1,
        role: "assistant",
        text:
          "Hi! I’m FinPilot AI 🤖. I can analyse your latest financial data and explain your financial health, savings, expenses, surplus, goals and trends.",
      },
    ]);

  useEffect(() => {
    const savedProfile =
      localStorage.getItem("finpilotProfile");

    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch {
        setProfile(null);
      }
    }

    const savedMonthlyData =
      localStorage.getItem(
        "finpilotMonthlyData"
      );

    if (savedMonthlyData) {
      try {
        setMonthlyData(
          JSON.parse(savedMonthlyData)
        );
      } catch {
        setMonthlyData([]);
      }
    }
  }, []);

  const formatCurrency = (value: number) =>
    `₹${Math.round(value).toLocaleString("en-IN")}`;

  const buildAiResponse = (
    question: string,
    data: {
      revenue: number;
      expenses: number;
      savings: number;
      surplus: number;
      score: number;
      loans: number;
      goalName: string;
      currentSavings: number;
      revenueTrend: number | null;
      expenseTrend: number | null;
      savingsTrend: number | null;
      surplusTrend: number | null;
      businessName: string;
      monthlyRecords: MonthlyRecord[];
    }
  ) => {
    const originalQuestion = question.trim();
    const q = originalQuestion.toLowerCase().replace(/[?!.]/g, " ");
    const words = q.split(/\s+/).filter(Boolean);

    const has = (...terms: string[]) =>
      terms.some((term) => q.includes(term));

    const money = (value: number) =>
      formatCurrency(Number.isFinite(value) ? value : 0);

    const prettyMonth = (month: string) => {
      if (!month) return "Current month";
      const date = new Date(`${month}-01`);
      if (Number.isNaN(date.getTime())) return month;
      return date.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });
    };

    const records = [...data.monthlyRecords].sort(
      (a, b) =>
        new Date(`${b.month}-01`).getTime() -
        new Date(`${a.month}-01`).getTime()
    );

    const latest = records[0];
    
    const expenseRatio =
      data.revenue > 0 ? data.expenses / data.revenue : 0;

    const savingsRate =
      data.revenue > 0 ? (data.savings / data.revenue) * 100 : 0;

    const surplusRate =
      data.revenue > 0 ? (data.surplus / data.revenue) * 100 : 0;

    const changeText = (
      label: string,
      value: number | null
    ) => {
      if (value === null) return `${label} has no previous-month comparison yet.`;
      return `${label} ${value >= 0 ? "increased" : "decreased"} by ${Math.abs(value)}% compared with the previous recorded month.`;
    };

    /*
      =========================================================
      NATURAL CONVERSATION
      =========================================================
    */

    if (has("hello", "hi", "hey", "good morning", "good afternoon", "good evening")) {
      return `Hi! 👋 I'm your FinPilot AI co-pilot. I already have your latest financial data, so you can ask me something specific like "Why is my score ${data.score}?", "How much am I saving?", "Compare my revenue and expenses", or "What should I improve?"`;
    }

    if (has("thank", "thanks", "thx")) {
      return "You're welcome! 🤖💜 Keep updating your monthly numbers and I'll keep analysing them with you.";
    }

    if (has("who are you", "what are you", "your purpose", "what can you do")) {
      return "I'm FinPilot AI, the financial intelligence assistant inside FinPilot. I analyse the financial information you have entered into the app and turn it into explanations, comparisons, trends and practical suggestions.";
    }

    if (has("what is finpilot", "about finpilot")) {
      return "FinPilot is your financial command center. It tracks monthly revenue, expenses, savings and liabilities, calculates financial health, visualizes trends, monitors goals and provides personalised financial insights.";
    }

    /*
      =========================================================
      MONTH-SPECIFIC QUESTIONS
      =========================================================
    */

    const monthAliases: Record<string, string> = {
      january: "01", jan: "01",
      february: "02", feb: "02",
      march: "03", mar: "03",
      april: "04", apr: "04",
      may: "05",
      june: "06", jun: "06",
      july: "07", jul: "07",
      august: "08", aug: "08",
      september: "09", sep: "09", sept: "09",
      october: "10", oct: "10",
      november: "11", nov: "11",
      december: "12", dec: "12",
    };

    const mentionedMonth = Object.keys(monthAliases).find((month) =>
      q.includes(month)
    );

    if (mentionedMonth) {
      const monthNumber = monthAliases[mentionedMonth];
      const yearMatch = q.match(/\b(20\d{2})\b/);
      const target = yearMatch
        ? `${yearMatch[1]}-${monthNumber}`
        : records.find((record) =>
            record.month.endsWith(`-${monthNumber}`)
          )?.month;

      const monthRecord = target
        ? records.find((record) => record.month === target)
        : undefined;

      if (!monthRecord) {
        return `I couldn't find a recorded entry for ${mentionedMonth}${yearMatch ? ` ${yearMatch[1]}` : ""}. Try another month, or add that month from Monthly Data.`;
      }

      const monthSurplus =
        Number(monthRecord.revenue) - Number(monthRecord.expenses);

      if (has("revenue", "income", "earn")) {
        return `For ${prettyMonth(monthRecord.month)}, your recorded revenue is ${money(Number(monthRecord.revenue))}.`;
      }

      if (has("expense", "spending", "spent")) {
        return `For ${prettyMonth(monthRecord.month)}, your recorded expenses are ${money(Number(monthRecord.expenses))}, which is ${Number(monthRecord.revenue) > 0 ? Math.round((Number(monthRecord.expenses) / Number(monthRecord.revenue)) * 100) : 0}% of that month's revenue.`;
      }

      if (has("saving", "saved")) {
        return `For ${prettyMonth(monthRecord.month)}, you recorded ${money(Number(monthRecord.savings))} in savings.`;
      }

      if (has("surplus", "profit", "left")) {
        return `For ${prettyMonth(monthRecord.month)}, your net surplus was ${money(monthSurplus)} because revenue was ${money(Number(monthRecord.revenue))} and expenses were ${money(Number(monthRecord.expenses))}.`;
      }

      return `For ${prettyMonth(monthRecord.month)}: revenue ${money(Number(monthRecord.revenue))}, expenses ${money(Number(monthRecord.expenses))}, savings ${money(Number(monthRecord.savings))}, loan payment ${money(Number(monthRecord.loanPayment))}, and surplus ${money(monthSurplus)}.`;
    }

    /*
      =========================================================
      DIRECT FINANCIAL QUESTIONS
      =========================================================
    */

    if (has("revenue", "income", "earning", "earnings")) {
      return `Your latest recorded revenue is ${money(data.revenue)}${latest ? ` for ${prettyMonth(latest.month)}` : ""}. ${
        data.revenueTrend === null
          ? "Add another month if you want a month-to-month revenue comparison."
          : changeText("Revenue", data.revenueTrend)
      }`;
    }

    if (has("expense", "expenses", "spending", "spent", "cost")) {
      return `Your latest expenses are ${money(data.expenses)}, which uses about ${Math.round(expenseRatio * 100)}% of your latest revenue of ${money(data.revenue)}. ${
        expenseRatio <= 0.5
          ? "That is a relatively comfortable expense ratio."
          : expenseRatio <= 0.7
          ? "That is manageable, but keeping an eye on your biggest expense categories would help."
          : "That is on the higher side, so reducing avoidable spending could improve your surplus."
      } ${data.expenseTrend === null ? "" : changeText("Your expenses", data.expenseTrend)}`;
    }

    if (has("saving rate", "savings rate", "how much am i saving", "percentage saved")) {
      return `Your latest savings rate is ${Math.round(savingsRate)}% of revenue. You recorded ${money(data.savings)} in monthly savings against ${money(data.revenue)} of revenue. ${
        savingsRate >= 30
          ? "That's a strong savings rate."
          : savingsRate >= 15
          ? "That's a reasonable base, and consistency will make it stronger."
          : "Your savings rate could be improved gradually if your cash flow allows."
      }`;
    }

    if (has("saving", "saved", "savings")) {
      return `You recorded ${money(data.savings)} in your latest month, and your overall savings cushion is ${money(data.currentSavings)}. Your current savings rate is about ${Math.round(savingsRate)}%. ${
        savingsRate >= 30
          ? "You're building a healthy cushion."
          : "A consistent monthly saving target could strengthen your cushion."
      }`;
    }

    if (has("surplus", "profit", "profitability", "left over", "left after")) {
      return `Your latest net surplus is ${money(data.surplus)}. That's ${Math.round(surplusRate)}% of your revenue. ${
        data.surplus > 0
          ? "You are currently earning more than you are spending."
          : data.surplus === 0
          ? "Your revenue and expenses are currently balanced."
          : "Your expenses are currently higher than revenue, so improving cash flow should be a priority."
      }`;
    }

    if (has("loan payment", "monthly loan", "emi", "loan")) {
      const latestLoanPayment = latest
        ? Number(latest.loanPayment) || 0
        : 0;

      if (data.loans <= 0 && latestLoanPayment <= 0) {
        return "Your current profile does not show outstanding liabilities or a latest-month loan payment. That gives you more flexibility to focus on savings and growth.";
      }

      return `Your profile shows liabilities of ${money(data.loans)}${
        latestLoanPayment > 0
          ? `, and your latest recorded loan payment is ${money(latestLoanPayment)}.`
          : "."
      } Keep loan commitments manageable while protecting your savings cushion.`;
    }

    if (has("score", "health", "financial health", "financial score")) {
      return `Your FinPilot financial health score is ${data.score}/100. It is calculated from your surplus, expense ratio, savings cushion and liabilities. Your current surplus is ${money(data.surplus)}, expenses are ${Math.round(expenseRatio * 100)}% of revenue, and your savings cushion is ${money(data.currentSavings)}.`;
    }

    if (has("why", "improve score", "increase score", "better score", "raise score")) {
      const improvements: string[] = [];

      if (data.surplus <= 0) {
        improvements.push("restore a positive monthly surplus");
      } else {
        improvements.push(`protect your ${money(data.surplus)} monthly surplus`);
      }

      if (expenseRatio > 0.7) {
        improvements.push("bring your expense-to-revenue ratio down");
      } else {
        improvements.push("keep your spending below your current revenue level");
      }

      if (savingsRate < 20) {
        improvements.push("increase your savings rate gradually");
      } else {
        improvements.push("maintain your current savings discipline");
      }

      if (data.loans > 0) {
        improvements.push("keep liabilities and loan commitments under control");
      }

      return `To improve your ${data.score}/100 score, I'd focus on: ${improvements.join("; ")}. The biggest priority is ${
        data.surplus <= 0
          ? "getting back to a positive surplus"
          : expenseRatio > 0.7
          ? "controlling high expenses"
          : savingsRate < 20
          ? "building savings"
          : "maintaining your current consistency"
      }.`;
    }

    /*
      =========================================================
      COMPARISONS + TRENDS
      =========================================================
    */

    if (has("compare", "comparison", "versus", "vs", "difference between")) {
      const revenueVsExpense = data.revenue - data.expenses;
      return `Here's the comparison from your latest month: revenue is ${money(data.revenue)}, expenses are ${money(data.expenses)}, so revenue is ${money(Math.abs(revenueVsExpense))} ${
        revenueVsExpense >= 0 ? "higher" : "lower"
      } than expenses. Your savings are ${money(data.savings)}, and your resulting surplus is ${money(data.surplus)}.`;
    }

    if (has("trend", "trends", "growth", "growing", "improving", "improved", "changed")) {
      const trendParts = [
        data.revenueTrend === null
          ? null
          : `revenue ${data.revenueTrend >= 0 ? "rose" : "fell"} ${Math.abs(data.revenueTrend)}%`,
        data.expenseTrend === null
          ? null
          : `expenses ${data.expenseTrend >= 0 ? "rose" : "fell"} ${Math.abs(data.expenseTrend)}%`,
        data.savingsTrend === null
          ? null
          : `savings ${data.savingsTrend >= 0 ? "rose" : "fell"} ${Math.abs(data.savingsTrend)}%`,
        data.surplusTrend === null
          ? null
          : `surplus ${data.surplusTrend >= 0 ? "rose" : "fell"} ${Math.abs(data.surplusTrend)}%`,
      ].filter(Boolean);

      return trendParts.length
        ? `Based on your latest two recorded months, ${trendParts.join(", ")}. ${
            data.surplusTrend !== null && data.surplusTrend >= 0
              ? "Overall, your surplus direction is positive."
              : data.surplusTrend !== null
              ? "The surplus trend needs attention."
              : "Add another month to make the comparison stronger."
          }`
        : "I need at least two recorded months to calculate meaningful trends.";
    }

    if (has("best month", "highest revenue", "most revenue", "maximum revenue")) {
      if (!records.length) return "You haven't recorded monthly data yet.";
      const best = [...records].sort(
        (a, b) => Number(b.revenue) - Number(a.revenue)
      )[0];
      return `Your highest-revenue recorded month is ${prettyMonth(best.month)} with ${money(Number(best.revenue))} in revenue.`;
    }

    if (has("lowest revenue", "least revenue", "worst revenue")) {
      if (!records.length) return "You haven't recorded monthly data yet.";
      const lowest = [...records].sort(
        (a, b) => Number(a.revenue) - Number(b.revenue)
      )[0];
      return `Your lowest-revenue recorded month is ${prettyMonth(lowest.month)} with ${money(Number(lowest.revenue))}.`;
    }

    if (has("highest saving", "best saving", "most saved", "best savings")) {
      if (!records.length) return "You haven't recorded monthly data yet.";
      const best = [...records].sort(
        (a, b) => Number(b.savings) - Number(a.savings)
      )[0];
      return `Your strongest recorded savings month is ${prettyMonth(best.month)}, when you saved ${money(Number(best.savings))}.`;
    }

    /*
      =========================================================
      GOAL + RECOMMENDATIONS
      =========================================================
    */

    if (has("goal", "target", "objective")) {
      return `Your current FinPilot goal is “${data.goalName}”. With a latest surplus of ${money(data.surplus)} and savings of ${money(data.currentSavings)}, the best strategy is to keep a consistent monthly surplus and direct a planned portion toward this goal.`;
    }

    if (
      has(
        "suggest",
        "suggestion",
        "suggestions",
        "advice",
        "recommend",
        "recommendation",
        "what should i",
        "what do i do",
        "next step",
        "help me"
      )
    ) {
      const suggestions: string[] = [];

      if (data.surplus <= 0) {
        suggestions.push("focus first on restoring a positive monthly surplus");
      } else {
        suggestions.push(`protect your ${money(data.surplus)} monthly surplus`);
      }

      if (expenseRatio > 0.7) {
        suggestions.push("review your largest and non-essential expenses");
      } else {
        suggestions.push("continue monitoring expenses against revenue");
      }

      if (savingsRate < 20) {
        suggestions.push("set a realistic monthly savings target");
      } else {
        suggestions.push("maintain your current savings discipline");
      }

      if (data.loans > 0) {
        suggestions.push("keep liabilities manageable while preserving your savings cushion");
      }

      return `Based on your actual FinPilot data, I'd recommend: ${suggestions.map(
        (item, index) => `${index + 1}. ${item}`
      ).join(" ")} Your current financial health score is ${data.score}/100.`;
    }

    if (has("how am i", "am i doing", "financially doing", "overall")) {
      return `Overall, you're currently at ${data.score}/100. Your latest revenue is ${money(data.revenue)}, expenses are ${money(data.expenses)}, savings are ${money(data.savings)}, and surplus is ${money(data.surplus)}. ${
        data.score >= 85
          ? "Your numbers look strong."
          : data.score >= 70
          ? "Your position is good, with room to keep improving."
          : data.score >= 50
          ? "You're on a workable path, but there are areas to strengthen."
          : "Your numbers need attention, especially around cash flow and spending."
      }`;
    }

    /*
      =========================================================
      DATA / PROFILE QUESTIONS
      =========================================================
    */

    if (has("business name", "my business", "my profile", "profile")) {
      return `Your FinPilot profile is set up for “${data.businessName}”. Your current goal is “${data.goalName}”, and your latest recorded revenue is ${money(data.revenue)}.`;
    }

    if (has("latest month", "current month", "this month", "recent month")) {
      return latest
        ? `Your latest recorded month is ${prettyMonth(latest.month)}. Revenue: ${money(Number(latest.revenue))}, expenses: ${money(Number(latest.expenses))}, savings: ${money(Number(latest.savings))}, loan payment: ${money(Number(latest.loanPayment))}, and surplus: ${money(Number(latest.revenue) - Number(latest.expenses))}.`
        : "There isn't a monthly record yet. Add your first month from Monthly Data.";
    }

    if (has("history", "months", "how many months")) {
      return records.length
        ? `You currently have ${records.length} recorded month${records.length === 1 ? "" : "s"}. ${
            records.length >= 2
              ? `Your latest is ${prettyMonth(records[0].month)} and your earliest is ${prettyMonth(records[records.length - 1].month)}.`
              : `Your recorded month is ${prettyMonth(records[0].month)}.`
          }`
        : "You haven't recorded any monthly data yet.";
    }

    /*
      =========================================================
      GENERAL QUESTIONS — avoid the old fixed snapshot.
      =========================================================
    */

    if (words.length <= 3) {
      return `I can help with that. Ask me in a little more detail—for example: “What is my latest revenue?”, “Why is my score low?”, “Compare my revenue and expenses”, “What should I improve?”, or “How much did I save in September?”`;
    }

    return `I understand you're asking about “${originalQuestion}”. I can answer questions about your FinPilot data, including revenue, expenses, savings, surplus, loans, financial health, goals, monthly history and trends. Try asking the question with one of those details and I'll use your actual saved numbers.`;
  };

  if (!profile) {
    return (
      <div className="dashboard-page">
        <div className="empty-dashboard">
          <h1>
            No financial profile found
          </h1>

          <p>
            Please complete your FinPilot
            profile first.
          </p>

          <button
            className="neon-button"
            onClick={() =>
              navigate("/profile")
            }
          >
            Create Profile →
          </button>
        </div>
      </div>
    );
  }

  const profileRevenue =
    Number(profile.revenue) || 0;

  const profileExpenses =
    Number(profile.expenses) || 0;

  const profileSavings =
    Number(profile.savings) || 0;

  const loans =
    Number(profile.loans) || 0;

  /*
    =========================================================
    SORT MONTHLY DATA
    =========================================================

    Newest month comes first.

    If the same month has multiple records,
    the record with the highest ID is used.
  */

  const sortedMonthlyData =
    monthlyData
      .slice()
      .sort((a, b) => {
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

  /*
    =========================================================
    REMOVE DUPLICATE MONTHS
    =========================================================
  */

  const uniqueMonthlyData: MonthlyRecord[] =
    [];

  const usedMonths = new Set<string>();

  sortedMonthlyData.forEach((record) => {
    if (!usedMonths.has(record.month)) {
      usedMonths.add(record.month);
      uniqueMonthlyData.push(record);
    }
  });

  /*
    =========================================================
    LATEST + PREVIOUS MONTH
    =========================================================
  */

  const latestMonth =
    uniqueMonthlyData[0];

  const previousMonth =
    uniqueMonthlyData.find(
      (record) =>
        record.month !==
        latestMonth?.month
    );

  const revenue = latestMonth
    ? Number(latestMonth.revenue) || 0
    : profileRevenue;

  const expenses = latestMonth
    ? Number(latestMonth.expenses) || 0
    : profileExpenses;

  const monthlySavings = latestMonth
    ? Number(latestMonth.savings) || 0
    : 0;

  /*
    Profile savings + latest monthly savings.
  */

  const currentSavings =
    profileSavings + monthlySavings;

  const surplus =
    revenue - expenses;

  /*
    =========================================================
    MONTH-OVER-MONTH TREND
    =========================================================
  */

  const calculateTrend = (
    current: number,
    previous: number | undefined
  ) => {
    if (
      previous === undefined ||
      previous === 0
    ) {
      return null;
    }

    return Math.round(
      ((current - previous) /
        previous) *
        100
    );
  };

  const revenueTrend =
    calculateTrend(
      revenue,
      previousMonth
        ? Number(previousMonth.revenue)
        : undefined
    );

  const expenseTrend =
    calculateTrend(
      expenses,
      previousMonth
        ? Number(previousMonth.expenses)
        : undefined
    );

  const savingsTrend =
    calculateTrend(
      monthlySavings,
      previousMonth
        ? Number(previousMonth.savings)
        : undefined
    );

  const previousSurplus =
    previousMonth
      ? Number(previousMonth.revenue) -
        Number(previousMonth.expenses)
      : undefined;

  const surplusTrend =
    calculateTrend(
      surplus,
      previousSurplus
    );

  /*
    =========================================================
    FINANCIAL HEALTH SCORE
    =========================================================
  */

  let score = 50;

  if (surplus > 0) {
    score += 15;
  } else if (surplus < 0) {
    score -= 15;
  }

  if (revenue > 0) {
    const expenseRatio =
      expenses / revenue;

    if (expenseRatio <= 0.5) {
      score += 15;
    } else if (expenseRatio <= 0.7) {
      score += 10;
    } else if (expenseRatio <= 0.9) {
      score += 3;
    } else {
      score -= 10;
    }
  }

  if (revenue > 0) {
    const savingsRatio =
      currentSavings / revenue;

    if (savingsRatio >= 3) {
      score += 15;
    } else if (savingsRatio >= 1) {
      score += 10;
    } else if (savingsRatio >= 0.5) {
      score += 5;
    }
  }

  if (loans === 0) {
    score += 10;
  } else if (
    revenue > 0 &&
    loans <= revenue * 3
  ) {
    score += 5;
  } else if (
    revenue > 0 &&
    loans > revenue * 6
  ) {
    score -= 10;
  }

  score = Math.min(
    100,
    Math.max(0, score)
  );

  let scoreMessage = "";
  let scoreHeadline = "";

  if (score >= 85) {
    scoreMessage =
      "Excellent financial health";

    scoreHeadline =
      "You're in a strong position! ✨";
  } else if (score >= 70) {
    scoreMessage =
      "Good financial health";

    scoreHeadline =
      "You're doing great! ✨";
  } else if (score >= 50) {
    scoreMessage =
      "Fair financial health";

    scoreHeadline =
      "You're on the right track.";
  } else {
    scoreMessage =
      "Needs improvement";

    scoreHeadline =
      "Let's strengthen your finances.";
  }

  /*
    =========================================================
    FINANCIAL GOAL
    =========================================================
  */

  let goalName = "";

  if (profile.goal === "growth") {
    goalName = "Grow My Business";
  } else if (
    profile.goal === "savings"
  ) {
    goalName = "Increase Savings";
  } else if (
    profile.goal === "loan"
  ) {
    goalName =
      "Manage / Repay Loans";
  } else if (
    profile.goal === "expansion"
  ) {
    goalName = "Business Expansion";
  } else {
    goalName =
      "Build Emergency Funds";
  }

  /*
    =========================================================
    GOAL PROGRESS
    =========================================================
  */

  let goalProgress = 0;

  if (profile.goal === "growth") {
    if (revenue > 0) {
      goalProgress = Math.min(
        100,
        Math.round(
          (surplus / revenue) *
            100 +
            40
        )
      );
    }
  } else if (
    profile.goal === "savings"
  ) {
    if (revenue > 0) {
      goalProgress = Math.min(
        100,
        Math.round(
          (currentSavings /
            revenue) *
            100
        )
      );
    }
  } else if (
    profile.goal === "loan"
  ) {
    if (loans === 0) {
      goalProgress = 100;
    } else if (revenue > 0) {
      goalProgress = Math.max(
        10,
        Math.min(
          100,
          Math.round(
            100 -
              (loans /
                (revenue * 6)) *
                100
          )
        )
      );
    }
  } else if (
    profile.goal === "expansion"
  ) {
    if (revenue > 0) {
      goalProgress = Math.min(
        100,
        Math.round(
          (surplus / revenue) *
            100 +
            35
        )
      );
    }
  } else {
    if (
      revenue > 0 &&
      expenses > 0
    ) {
      goalProgress = Math.min(
        100,
        Math.round(
          (currentSavings /
            (expenses * 3)) *
            100
        )
      );
    }
  }

  goalProgress = Math.max(
    0,
    Math.min(100, goalProgress)
  );

  /*
    =========================================================
    TREND DISPLAY
    =========================================================
  */

  const formatTrend = (
    trend: number | null
  ) => {
    if (trend === null) {
      return "No previous data";
    }

    const arrow =
      trend > 0
        ? "↑"
        : trend < 0
        ? "↓"
        : "→";

    return `${arrow} ${Math.abs(
      trend
    )}%`;
  };

  /*
    =========================================================
    FORMAT MONTH
    =========================================================
  */

  const formatMonth = (
    month: string
  ) => {
    if (!month) {
      return "Current Month";
    }

    const date = new Date(
      `${month}-01`
    );

    return date.toLocaleDateString(
      "en-IN",
      {
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
    =========================================================
    CHART DATA
    =========================================================

    Recharts works better when older months
    appear first on the graph.
  */

  const chartData: ChartData[] =
    uniqueMonthlyData
      .slice()
      .reverse()
      .map((record) => {
        const recordRevenue =
          Number(record.revenue) || 0;

        const recordExpenses =
          Number(record.expenses) || 0;

        const recordSavings =
          Number(record.savings) || 0;

        return {
          month: formatMonth(
            record.month
          ),
          revenue: recordRevenue,
          expenses: recordExpenses,
          savings: recordSavings,
          surplus:
            recordRevenue -
            recordExpenses,
        };
      });

  /*
    =========================================================
    ANALYTICS SUMMARY
    =========================================================
  */

  const analyticsData =
    chartData.length > 0
      ? chartData
      : [
          {
            month: "Current",
            revenue,
            expenses,
            savings: monthlySavings,
            surplus,
          },
        ];

  const averageRevenue = Math.round(
    analyticsData.reduce(
      (total, item) =>
        total + item.revenue,
      0
    ) / analyticsData.length
  );

  const averageExpenses = Math.round(
    analyticsData.reduce(
      (total, item) =>
        total + item.expenses,
      0
    ) / analyticsData.length
  );

  const averageSavings = Math.round(
    analyticsData.reduce(
      (total, item) =>
        total + item.savings,
      0
    ) / analyticsData.length
  );

  const bestSurplus = Math.max(
    ...analyticsData.map(
      (item) => item.surplus
    )
  );

  /*
    =========================================================
    FINANCIAL TREND MESSAGE
    =========================================================
  */

  let trendHeadline =
    "Your financial journey is just getting started.";

  let trendDescription =
    "Keep adding monthly data to unlock stronger trend analysis.";

  if (
    analyticsData.length >= 2
  ) {
    const first =
      analyticsData[0];

    const last =
      analyticsData[
        analyticsData.length - 1
      ];

    if (
      last.revenue >
      first.revenue
    ) {
      trendHeadline =
        "Revenue is moving upward 📈";

      trendDescription =
        "Your latest reported revenue is higher than your earliest recorded month.";
    } else if (
      last.expenses <
      first.expenses
    ) {
      trendHeadline =
        "You're controlling expenses 📉";

      trendDescription =
        "Your latest expenses are lower than your earliest recorded month.";
    } else if (
      last.surplus >
      first.surplus
    ) {
      trendHeadline =
        "Your surplus is improving ✨";

      trendDescription =
        "The amount left after expenses has improved across your recorded months.";
    } else {
      trendHeadline =
        "FinPilot is watching your numbers 👀";

      trendDescription =
        "Keep updating your monthly figures so FinPilot can detect meaningful financial patterns.";
    }
  }

  const submitAiQuestion = (question: string) => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) return;

    const userMessage: AiMessage = {
      id: Date.now(),
      role: "user",
      text: trimmedQuestion,
    };

    const response = buildAiResponse(trimmedQuestion, {
      revenue,
      expenses,
      savings: monthlySavings,
      surplus,
      score,
      loans,
      goalName,
      currentSavings,
      revenueTrend,
      expenseTrend,
      savingsTrend,
      surplusTrend,
      businessName: profile.businessName,
      monthlyRecords: uniqueMonthlyData,
    });

    const assistantMessage: AiMessage = {
      id: Date.now() + 1,
      role: "assistant",
      text: response,
    };

    setAiMessages((messages) => [
      ...messages,
      userMessage,
      assistantMessage,
    ]);

    setAiInput("");
  };

  return (
    <div className="dashboard-shell">

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className="sidebar">

        <div className="brand-area">

          <div
            className="brand-icon"
            title="FinPilot — Financial Intelligence Platform"
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "14px",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #39e6c1 0%, #6c7bff 58%, #26304f 100%)",
              boxShadow: "0 10px 30px rgba(57,230,193,0.16), inset 0 0 18px rgba(255,255,255,0.12)",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                fontSize: "19px",
                fontWeight: 900,
                letterSpacing: "-2px",
                color: "#06100e",
                transform: "translateX(-1px)",
              }}
            >
              FP
            </span>
            <span
              style={{
                position: "absolute",
                width: "28px",
                height: "10px",
                border: "1.5px solid rgba(255,255,255,0.62)",
                borderRadius: "50%",
                transform: "rotate(-28deg)",
                pointerEvents: "none",
              }}
            />
            <span
              style={{
                position: "absolute",
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "#ffffff",
                top: "8px",
                right: "8px",
                boxShadow: "0 0 9px rgba(255,255,255,0.8)",
              }}
            />
          </div>

          <div>

            <div className="brand-name">
              Fin<span>Pilot</span>
            </div>

            <div className="brand-tagline">
              Smarter Money. Bigger Dreams.
            </div>

          </div>

        </div>

        <nav className="sidebar-nav">

          <button
            className="nav-item active"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate("/profile")
            }
          >
            <span>♙</span>
            Profile
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate("/monthly-data")
            }
          >
            <span>▣</span>
            Monthly Data
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate(
                "/monthly-history"
              )
            }
          >
            <span>◴</span>
            Monthly History
          </button>

        </nav>

        <div className="sidebar-divider"></div>

        <div className="sidebar-tip">

          <div className="tip-icon">
            ✦
          </div>

          <h3>
            Small steps today,
            <br />
            big dreams tomorrow ✨
          </h3>

          <p>
            Keep updating your numbers.
            FinPilot will do the thinking.
          </p>

        </div>

        <div className="sidebar-glow"></div>

      </aside>

      {/* =====================================================
          MAIN DASHBOARD
          ===================================================== */}

      <main className="dashboard-main">

        {/* HEADER */}

        <header className="top-header">

          <div className="welcome-section">

            <div className="mini-badge">
              ✦ AI FINANCIAL CO-PILOT
            </div>

            <h1>
              Welcome,{" "}
              <span>
                {profile.businessName}
              </span>{" "}
              👋
            </h1>

            <p>
              Your financial command center
            </p>

          </div>

          <div className="header-right">

            <div className="quote">
              "Better decisions today,
              <br />
              richer tomorrow."
            </div>

            <button
              type="button"
              className="ai-copilot-top-button"
              onClick={() => setShowAiAssistant(true)}
              aria-label="Open FinPilot AI financial co-pilot"
              title="Open FinPilot AI"
              style={{
                cursor: "pointer",
                minWidth: "154px",
                height: "52px",
                padding: "7px 13px",
                borderRadius: "16px",
                border: "1px solid rgba(57,230,193,0.32)",
                background: "linear-gradient(135deg, rgba(57,230,193,0.13), rgba(108,123,255,0.13))",
                color: "#f4f7f8",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textAlign: "left",
                boxShadow: "0 10px 30px rgba(0,0,0,0.18), 0 0 24px rgba(57,230,193,0.05)",
              }}
            >
              <span
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "11px",
                  display: "grid",
                  placeItems: "center",
                  background: "linear-gradient(135deg, #39e6c1, #6c7bff)",
                  color: "#06100e",
                  fontSize: "17px",
                  fontWeight: 900,
                  boxShadow: "0 0 18px rgba(57,230,193,0.18)",
                }}
              >
                ✦
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                <strong style={{ fontSize: "12px", lineHeight: 1.1 }}>FinPilot AI</strong>
                <small style={{ color: "#8de8d4", fontSize: "9px", fontWeight: 700 }}>Ask your co-pilot →</small>
              </span>
            </button>

            <button
              type="button"
              className="profile-badge"
              onClick={() => setShowEntrepreneurInfo(true)}
              aria-label="Open entrepreneur profile explanation"
              title="About your entrepreneur profile"
              style={{ cursor: "pointer" }}
            >
              <span>♙</span>
              Entrepreneur
              <span style={{ fontSize: "10px", opacity: 0.65 }}>↗</span>
            </button>

            <button
              type="button"
              className="avatar"
              onClick={() => navigate("/profile")}
              aria-label="Open my profile"
              title="Open my profile"
              style={{ cursor: "pointer" }}
            >
              👤
            </button>

          </div>

        </header>

        {/* ACTION BUTTONS */}

        <div className="dashboard-actions">

          <button
            className="neon-button"
            onClick={() =>
              navigate(
                "/monthly-data"
              )
            }
          >
            <span>＋</span>
            Update Monthly Data
          </button>

          <button
            className="outline-button"
            onClick={() =>
              navigate(
                "/monthly-history"
              )
            }
          >
            <span>▥</span>
            View Monthly History
          </button>

        </div>

        {/* =====================================================
            HEALTH CARD
            ===================================================== */}

        <section className="health-card">

          <div className="health-left">

            <div className="section-label">
              🛡 Financial Health Score
            </div>

            <div className="score-number">
              {score}
              <span>/100</span>
            </div>

            <div className="health-status">
              ⭐ {scoreMessage}
            </div>

          </div>

          <div className="health-message">

            <h3>
              {scoreHeadline}
            </h3>

            <p>
              Your score is based on
              your revenue, spending,
              savings, surplus and
              liabilities.
            </p>

          </div>

          <div className="score-ring">

            <div className="score-ring-inner">
              <strong>
                {score}
              </strong>
            </div>

          </div>

        </section>

        {/* =====================================================
            STATS
            ===================================================== */}

        <section className="stats-grid">

          {/* REVENUE */}

          <div className="neon-stat">

            <div className="stat-top">

              <div className="stat-icon green">
                ₹
              </div>

              <span className="stat-title">
                Monthly Revenue
              </span>

            </div>

            <h2>
              ₹
              {revenue.toLocaleString(
                "en-IN"
              )}
            </h2>

            <p>
              Latest reported revenue
            </p>

            <div className="stat-bottom">

              <span className="trend positive">
                {formatTrend(
                  revenueTrend
                )}
              </span>

              <div className="mini-chart green-chart">
                ╱╲╱╲╱╱
              </div>

            </div>

          </div>

          {/* EXPENSES */}

          <div className="neon-stat">

            <div className="stat-top">

              <div className="stat-icon pink">
                ₹
              </div>

              <span className="stat-title">
                Monthly Expenses
              </span>

            </div>

            <h2>
              ₹
              {expenses.toLocaleString(
                "en-IN"
              )}
            </h2>

            <p>
              Latest reported spending
            </p>

            <div className="stat-bottom">

              <span className="trend positive">
                {formatTrend(
                  expenseTrend
                )}
              </span>

              <div className="mini-chart pink-chart">
                ╱╲╱╲╱╱
              </div>

            </div>

          </div>

          {/* SURPLUS */}

          <div className="neon-stat">

            <div className="stat-top">

              <div className="stat-icon purple">
                ✦
              </div>

              <span className="stat-title">
                Net Surplus
              </span>

            </div>

            <h2>
              ₹
              {surplus.toLocaleString(
                "en-IN"
              )}
            </h2>

            <p>
              Revenue − Expenses
            </p>

            <div className="stat-bottom">

              <span
                className={
                  surplus >= 0
                    ? "trend positive"
                    : "trend negative"
                }
              >
                {formatTrend(
                  surplusTrend
                )}
              </span>

              <div className="mini-chart purple-chart">
                ╱╲╱╲╱╱
              </div>

            </div>

          </div>

          {/* SAVINGS */}

          <div className="neon-stat">

            <div className="stat-top">

              <div className="stat-icon gold">
                ₹
              </div>

              <span className="stat-title">
                Current Savings
              </span>

            </div>

            <h2>
              ₹
              {currentSavings.toLocaleString(
                "en-IN"
              )}
            </h2>

            <p>
              Available financial cushion
            </p>

            <div className="stat-bottom">

              <span className="trend positive">
                {formatTrend(
                  savingsTrend
                )}
              </span>

              <div className="mini-chart gold-chart">
                ╱╲╱╲╱╱
              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            NEW — FINANCIAL ANALYTICS
            ===================================================== */}

        <section
          className="dark-card"
          style={{
            marginBottom: "21px",
            padding: "26px",
          }}
        >

          <div className="card-heading">

            <div>

              <div className="section-label">
                📊 FINANCIAL ANALYTICS
              </div>

              <h2
                style={{
                  marginTop: "7px",
                }}
              >
                Your Money, Visualized
              </h2>

            </div>

            <span className="glow-dot"></span>

          </div>

          <p
            style={{
              color: "#817b90",
              fontSize: "12px",
              marginBottom: "25px",
            }}
          >
            Track how your revenue,
            expenses, savings and
            surplus are changing over
            time.
          </p>

          {/* ANALYTICS MINI CARDS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, minmax(0, 1fr))",
              gap: "12px",
              marginBottom: "28px",
            }}
          >

            <div
              style={{
                padding: "15px",
                borderRadius: "14px",
                background:
                  "rgba(99,230,190,0.05)",
                border:
                  "1px solid rgba(99,230,190,0.10)",
              }}
            >

              <span
                style={{
                  display: "block",
                  color: "#777184",
                  fontSize: "9px",
                  marginBottom: "7px",
                  fontWeight: 700,
                }}
              >
                AVG. REVENUE
              </span>

              <strong
                style={{
                  fontSize: "17px",
                }}
              >
                ₹
                {averageRevenue.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            <div
              style={{
                padding: "15px",
                borderRadius: "14px",
                background:
                  "rgba(255,114,198,0.05)",
                border:
                  "1px solid rgba(255,114,198,0.10)",
              }}
            >

              <span
                style={{
                  display: "block",
                  color: "#777184",
                  fontSize: "9px",
                  marginBottom: "7px",
                  fontWeight: 700,
                }}
              >
                AVG. EXPENSES
              </span>

              <strong
                style={{
                  fontSize: "17px",
                }}
              >
                ₹
                {averageExpenses.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            <div
              style={{
                padding: "15px",
                borderRadius: "14px",
                background:
                  "rgba(255,209,102,0.05)",
                border:
                  "1px solid rgba(255,209,102,0.10)",
              }}
            >

              <span
                style={{
                  display: "block",
                  color: "#777184",
                  fontSize: "9px",
                  marginBottom: "7px",
                  fontWeight: 700,
                }}
              >
                AVG. SAVINGS
              </span>

              <strong
                style={{
                  fontSize: "17px",
                }}
              >
                ₹
                {averageSavings.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            <div
              style={{
                padding: "15px",
                borderRadius: "14px",
                background:
                  "rgba(155,108,255,0.05)",
                border:
                  "1px solid rgba(155,108,255,0.10)",
              }}
            >

              <span
                style={{
                  display: "block",
                  color: "#777184",
                  fontSize: "9px",
                  marginBottom: "7px",
                  fontWeight: 700,
                }}
              >
                BEST SURPLUS
              </span>

              <strong
                style={{
                  fontSize: "17px",
                }}
              >
                ₹
                {bestSurplus.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

          </div>

          {/* REVENUE VS EXPENSES */}

          <div
            style={{
              width: "100%",
              height: "330px",
              marginBottom: "35px",
            }}
          >

            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#c8c2d5",
                marginBottom: "15px",
              }}
            >
              Revenue vs Expenses
            </div>

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={analyticsData}
                margin={{
                  top: 5,
                  right: 15,
                  left: 5,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                />

                <XAxis
                  dataKey="month"
                  stroke="#777184"
                  tick={{
                    fill: "#777184",
                    fontSize: 10,
                  }}
                />

                <YAxis
                  stroke="#777184"
                  tick={{
                    fill: "#777184",
                    fontSize: 10,
                  }}
                  tickFormatter={(value) =>
                    `₹${Number(
                      value
                    ).toLocaleString(
                      "en-IN"
                    )}`
                  }
                />

                <Tooltip
                  contentStyle={{
                    background:
                      "#121020",
                    border:
                      "1px solid rgba(155,108,255,0.25)",
                    borderRadius:
                      "12px",
                    color: "#ffffff",
                  }}
                  formatter={(
                    value,
                    name
                  ) => [
                    `₹${Number(
                      value
                    ).toLocaleString(
                      "en-IN"
                    )}`,
                    String(name),
                  ]}
                />

                <Legend
                  wrapperStyle={{
                    fontSize: "11px",
                    paddingTop: "10px",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#63e6be"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#ff72c6"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

          {/* SAVINGS VS SURPLUS */}

          <div
            style={{
              width: "100%",
              height: "330px",
              marginBottom: "25px",
            }}
          >

            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#c8c2d5",
                marginBottom: "15px",
              }}
            >
              Savings & Surplus Trend
            </div>

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={analyticsData}
                margin={{
                  top: 5,
                  right: 15,
                  left: 5,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                />

                <XAxis
                  dataKey="month"
                  stroke="#777184"
                  tick={{
                    fill: "#777184",
                    fontSize: 10,
                  }}
                />

                <YAxis
                  stroke="#777184"
                  tick={{
                    fill: "#777184",
                    fontSize: 10,
                  }}
                  tickFormatter={(value) =>
                    `₹${Number(
                      value
                    ).toLocaleString(
                      "en-IN"
                    )}`
                  }
                />

                <Tooltip
                  contentStyle={{
                    background:
                      "#121020",
                    border:
                      "1px solid rgba(155,108,255,0.25)",
                    borderRadius:
                      "12px",
                    color: "#ffffff",
                  }}
                  formatter={(
                    value,
                    name
                  ) => [
                    `₹${Number(
                      value
                    ).toLocaleString(
                      "en-IN"
                    )}`,
                    String(name),
                  ]}
                />

                <Legend
                  wrapperStyle={{
                    fontSize: "11px",
                    paddingTop: "10px",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="savings"
                  name="Savings"
                  stroke="#ffd166"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="surplus"
                  name="Surplus"
                  stroke="#9b6cff"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

          {/* TREND INSIGHT */}

          <div
            style={{
              padding: "18px",
              borderRadius: "15px",
              background:
                "linear-gradient(135deg, rgba(155,108,255,0.08), rgba(255,114,198,0.04))",
              border:
                "1px solid rgba(155,108,255,0.14)",
            }}
          >

            <div
              style={{
                fontSize: "11px",
                color: "#bda5ff",
                fontWeight: 800,
                letterSpacing: "0.5px",
                marginBottom: "7px",
              }}
            >
              ✦ FINPILOT TREND DETECTION
            </div>

            <h3
              style={{
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize: "16px",
                marginBottom: "5px",
              }}
            >
              {trendHeadline}
            </h3>

            <p
              style={{
                color: "#817b90",
                fontSize: "11px",
                lineHeight: 1.6,
              }}
            >
              {trendDescription}
            </p>

          </div>

        </section>

        {/* =====================================================
            LOWER GRID
            ===================================================== */}

        <section className="lower-grid">

          {/* GOAL */}

          <div className="dark-card goal-card">

            <div className="card-heading">

              <h2>
                🎯 Your Financial Goal
              </h2>

              <span className="glow-dot"></span>

            </div>

            <h3>
              {goalName} 🚀
            </h3>

            <p>
              FinPilot is tracking your
              progress toward this goal.
            </p>

            <div className="goal-progress">

              <div className="goal-progress-bar">

                <div
                  className="goal-progress-fill"
                  style={{
                    width: `${goalProgress}%`,
                  }}
                ></div>

              </div>

              <span>
                {goalProgress}% completed
              </span>

            </div>

            <button
              className="small-glow-button"
              onClick={() =>
                navigate("/profile")
              }
            >
              ✎ Edit Goal
            </button>

            <div className="goal-decoration">
              ↗
              <span>◉</span>
            </div>

          </div>

          {/* INSIGHTS */}

          <div className="dark-card insight-card">

            <div className="card-heading">

              <h2>
                🧠 Why is my score{" "}
                {score}/100?
              </h2>

            </div>

            <div className="insight-list">

              {surplus > 0 && (
                <div className="dark-insight">

                  <span>✓</span>

                  Your business generated a
                  positive monthly surplus of ₹
                  {surplus.toLocaleString(
                    "en-IN"
                  )}
                  .

                </div>
              )}

              {revenue > 0 &&
                expenses / revenue >
                  0.7 && (
                  <div className="dark-insight warning">

                    <span>!</span>

                    Your expenses are using
                    more than 70% of your
                    revenue. Review major
                    spending areas.

                  </div>
                )}

              {revenue > 0 &&
                expenses / revenue <=
                  0.7 && (
                  <div className="dark-insight">

                    <span>✓</span>

                    Your expenses are currently
                    within a manageable range
                    compared with revenue.

                  </div>
                )}

              {currentSavings >=
                revenue &&
                revenue > 0 && (
                  <div className="dark-insight">

                    <span>✓</span>

                    Your savings are at least
                    equal to one month of
                    revenue, giving you a useful
                    cushion.

                  </div>
                )}

              {currentSavings <
                revenue &&
                revenue > 0 && (
                  <div className="dark-insight">

                    <span>✦</span>

                    Consider building a
                    stronger savings cushion
                    for future business needs.

                  </div>
                )}

              {loans === 0 && (
                <div className="dark-insight">

                  <span>✓</span>

                  No current liabilities have
                  been reported.

                </div>
              )}

              {loans >
                revenue * 3 &&
                revenue > 0 && (
                  <div className="dark-insight warning">

                    <span>!</span>

                    Your reported liabilities
                    are relatively high compared
                    with monthly revenue.

                  </div>
                )}

              {surplus <= 0 && (
                <div className="dark-insight warning">

                  <span>!</span>

                  Your expenses are equal to or
                  higher than your revenue.
                  Focus on improving your
                  monthly surplus.

                </div>
              )}

            </div>

            <button
              className="ai-neon-button"
              onClick={() => setShowAiAssistant(true)}
            >
              ✦ Ask FinPilot AI →
            </button>

            <div className="smart-text">
              Smart insights
              <br />
              for a brighter future ✨
            </div>

          </div>

        </section>

        {/* =====================================================
            MONTHLY SNAPSHOT
            ===================================================== */}

        <section className="summary-card">

          <div>

            <div className="summary-label">
              📅 MONTHLY SNAPSHOT
            </div>

            <h2>
              Your financial story this
              month
            </h2>

            <p>

              <strong>
                {profile.businessName}
              </strong>{" "}

              {latestMonth
                ? `reported ${formatMonth(
                    latestMonth.month
                  )} revenue of ₹${revenue.toLocaleString(
                    "en-IN"
                  )} and expenses of ₹${expenses.toLocaleString(
                    "en-IN"
                  )}.`
                : `has a monthly revenue of ₹${revenue.toLocaleString(
                    "en-IN"
                  )} and expenses of ₹${expenses.toLocaleString(
                    "en-IN"
                  )}.`}

            </p>

          </div>

          <div className="summary-number">

            <span>
              NET SURPLUS
            </span>

            <strong>
              ₹
              {surplus.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

        </section>

      </main>

      {/* =====================================================
          FINPILOT AI ASSISTANT
          ===================================================== */}

      {showEntrepreneurInfo && (
        <div
          onClick={() => setShowEntrepreneurInfo(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(3,7,11,0.72)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(520px, 100%)",
              borderRadius: "26px",
              border: "1px solid rgba(57,230,193,0.20)",
              background: "linear-gradient(145deg, #0d171d, #080e14)",
              boxShadow: "0 30px 100px rgba(0,0,0,0.55), 0 0 50px rgba(57,230,193,0.05)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "25px",
                background: "linear-gradient(135deg, rgba(57,230,193,0.11), rgba(108,123,255,0.10))",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "16px",
                    display: "grid",
                    placeItems: "center",
                    background: "linear-gradient(135deg, #39e6c1, #6c7bff)",
                    color: "#06100e",
                    fontSize: "23px",
                    fontWeight: 900,
                  }}
                >
                  ♙
                </div>
                <div>
                  <div style={{ color: "#39e6c1", fontSize: "9px", fontWeight: 800, letterSpacing: "1.5px" }}>YOUR FINPILOT ROLE</div>
                  <h2 style={{ margin: "5px 0 0", color: "#f4f7f8", fontSize: "23px" }}>Entrepreneur Profile</h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEntrepreneurInfo(false)}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontSize: "17px",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              <p style={{ color: "#a9b7be", lineHeight: 1.7, fontSize: "13px", marginTop: 0 }}>
                FinPilot identifies your account as an <strong style={{ color: "#e9f7f4" }}>Entrepreneur</strong> because your profile is focused on managing business revenue, expenses, savings, liabilities and a financial growth goal.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "10px",
                  marginTop: "18px",
                }}
              >
                {[
                  ["Business", profile.businessName],
                  ["Goal", goalName],
                  ["Revenue", formatCurrency(revenue)],
                  ["Current Savings", formatCurrency(currentSavings)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      padding: "14px",
                      borderRadius: "15px",
                      background: "rgba(255,255,255,0.035)",
                      border: "1px solid rgba(150,180,190,0.09)",
                    }}
                  >
                    <div style={{ color: "#71808a", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>{label}</div>
                    <strong style={{ color: "#eaf4f4", fontSize: "12px" }}>{value}</strong>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowEntrepreneurInfo(false);
                  navigate("/profile");
                }}
                style={{
                  width: "100%",
                  marginTop: "18px",
                  padding: "13px",
                  border: "none",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #39e6c1, #6c7bff)",
                  color: "#06100e",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                View / Edit My Full Profile →
              </button>
            </div>
          </div>
        </div>
      )}

      {showAiAssistant && (
        <div
          onClick={() => setShowAiAssistant(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(4,3,12,0.72)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "24px",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(430px, 100%)",
              height: "min(720px, calc(100vh - 48px))",
              borderRadius: "24px",
              border: "1px solid rgba(155,108,255,0.32)",
              background:
                "linear-gradient(145deg, rgba(19,16,37,0.98), rgba(9,8,20,0.98))",
              boxShadow:
                "0 25px 90px rgba(80,35,180,0.32)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "20px",
                borderBottom:
                  "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background:
                  "linear-gradient(135deg, rgba(155,108,255,0.16), rgba(255,114,198,0.08))",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#bda5ff",
                    fontSize: "10px",
                    fontWeight: 800,
                    letterSpacing: "1px",
                    marginBottom: "5px",
                  }}
                >
                  ✦ FINPILOT INTELLIGENCE
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "21px",
                    fontFamily:
                      '"Space Grotesk", sans-serif',
                  }}
                >
                  AI Financial Co-Pilot 🤖
                </h2>
                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#858092",
                    fontSize: "11px",
                  }}
                >
                  Personalised analysis from your FinPilot data
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAiAssistant(false)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border:
                    "1px solid rgba(255,255,255,0.10)",
                  background:
                    "rgba(255,255,255,0.05)",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                padding: "12px 16px",
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "8px",
                borderBottom:
                  "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {[
                "How am I doing?",
                "Analyse my savings",
                "Explain my score",
                "Give me suggestions",
              ].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => submitAiQuestion(prompt)}
                  style={{
                    padding: "9px 8px",
                    borderRadius: "10px",
                    border:
                      "1px solid rgba(155,108,255,0.16)",
                    background:
                      "rgba(155,108,255,0.06)",
                    color: "#cfc7df",
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {aiMessages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    alignSelf:
                      message.role === "user"
                        ? "flex-end"
                        : "flex-start",
                    maxWidth: "88%",
                    padding: "12px 14px",
                    borderRadius:
                      message.role === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    background:
                      message.role === "user"
                        ? "linear-gradient(135deg, #7048ff, #d55fc1)"
                        : "rgba(255,255,255,0.055)",
                    border:
                      message.role === "assistant"
                        ? "1px solid rgba(255,255,255,0.08)"
                        : "none",
                    color: "#f4f0fa",
                    fontSize: "12px",
                    lineHeight: 1.65,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {message.role === "assistant" && (
                    <div
                      style={{
                        color: "#bda5ff",
                        fontSize: "9px",
                        fontWeight: 800,
                        marginBottom: "5px",
                      }}
                    >
                      FINPILOT AI
                    </div>
                  )}
                  {message.text}
                </div>
              ))}
            </div>

            <form
              id="finpilot-ai-form"
              onSubmit={(event) => {
                event.preventDefault();
                submitAiQuestion(aiInput);
              }}
              style={{
                padding: "14px",
                borderTop:
                  "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                gap: "8px",
                background:
                  "rgba(5,4,13,0.65)",
              }}
            >
              <input
                value={aiInput}
                onChange={(event) =>
                  setAiInput(event.currentTarget.value)
                }
                placeholder="Ask about your finances..."
                style={{
                  flex: 1,
                  minWidth: 0,
                  borderRadius: "13px",
                  border:
                    "1px solid rgba(155,108,255,0.20)",
                  background:
                    "rgba(255,255,255,0.045)",
                  color: "#ffffff",
                  padding: "12px 13px",
                  outline: "none",
                  fontSize: "12px",
                }}
              />

              <button
                type="submit"
                style={{
                  width: "44px",
                  border: "none",
                  borderRadius: "13px",
                  background:
                    "linear-gradient(135deg, #7048ff, #d55fc1)",
                  color: "#ffffff",
                  fontSize: "17px",
                  cursor: "pointer",
                }}
              >
                ➤
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
