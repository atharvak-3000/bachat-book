import { MeetingContribution, Loan } from "@prisma/client";

/**
 * Calculates meeting totals for the summary panel.
 * All financial values are in paise (Int).
 */
export function calcMeetingTotals(
  contributions: any[] = [],
  loansIssued: any = [],
  expenses: any = [],
  openingCash: number = 0,
  openingBank: number = 0
) {
  // Resilience for older callers passing 0 instead of []
  const conts = Array.isArray(contributions) ? contributions : [];
  const loans = Array.isArray(loansIssued) ? loansIssued : [];
  const exps = Array.isArray(expenses) ? expenses : [];

  let cashReceipts = 0;
  let bankReceipts = 0;
  let cashPayments = 0;
  let bankPayments = 0;

  conts.forEach(c => {
    const total = (c.savingsAmount || 0) + (c.loanRepayment || 0) + (c.interestPaid || 0) + (c.penaltyPaid || 0);
    if (c.source === "BANK") bankReceipts += total;
    else cashReceipts += total;
  });

  loans.forEach(l => {
    if (l.source === "BANK") bankPayments += l.loanAmount || 0;
    else cashPayments += l.loanAmount || 0;
  });

  exps.forEach(e => {
    if (e.source === "BANK") bankPayments += e.amount || 0;
    else cashPayments += e.amount || 0;
  });

  const totalReceipts = cashReceipts + bankReceipts;
  const totalPayments = cashPayments + bankPayments;

  return {
    openingCash,
    openingBank,
    cashReceipts,
    bankReceipts,
    cashPayments,
    bankPayments,
    closingCash: openingCash + cashReceipts - cashPayments,
    closingBank: openingBank + bankReceipts - bankPayments,
    totalReceipts,
    totalPayments,
    totalClosing: (openingCash + cashReceipts - cashPayments) + (openingBank + bankReceipts - bankPayments),
    // Compatibility fields for old UI
    totalSavings: conts.reduce((acc, c) => acc + (c.savingsAmount || 0), 0),
    closingBalance: (openingCash + cashReceipts - cashPayments) + (openingBank + bankReceipts - bankPayments),
  };
}

/**
 * Calculates statistics for a single member based on their history.
 */
export function calcMemberStats(
  allContributions: MeetingContribution[],
  allLoans: Loan[]
) {
  const totalSavings = allContributions.reduce((acc, c) => acc + c.savingsAmount, 0);
  const outstandingLoan = allLoans.reduce(
    (acc, loan) => (loan.status === "ACTIVE" ? acc + loan.outstandingAmount : acc),
    0
  );
  const totalInterestPaid = allContributions.reduce((acc, c) => acc + c.interestPaid, 0);
  const netPosition = totalSavings - outstandingLoan;

  return {
    totalSavings,
    outstandingLoan,
    totalInterestPaid,
    netPosition,
  };
}

/**
 * Calculates simple monthly interest on a loan balance.
 */
export function calcMonthlyInterest(outstandingPaise: number, annualRatePercent: number): number {
  const monthlyRate = annualRatePercent / 12 / 100;
  return Math.round(outstandingPaise * monthlyRate);
}

/**
 * Formats paise into Indian Rupee string format.
 */
export function formatRupees(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}
