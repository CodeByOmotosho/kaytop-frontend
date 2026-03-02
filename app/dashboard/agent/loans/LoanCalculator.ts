export function calculateLoan({
  amount,
  interestRate,
  durationDays,
}: {
  amount: number;
  interestRate: number;
  durationDays: number;
}) {
  const interest = (amount * interestRate) / 100;
  const totalRepayment = amount + interest;
  const dailyPayment =
    durationDays > 0 ? totalRepayment / durationDays : 0;

  return {
    interest,
    totalRepayment: Math.round(totalRepayment),
    dailyPayment: Math.round(dailyPayment),
  };
}
