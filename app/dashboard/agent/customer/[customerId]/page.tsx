"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/app/_components/ui/Button";
import RecordRepaymentModal from "./RecordRepaymentModal";
import AddSavingsModal from "./AddSavingsModal";
import { useParams } from "next/navigation";
import { CustomerService } from "@/app/services/customerService";



interface ActiveLoanCardProps {
  loanId: number;
  amount: number;
  outstanding: number;
  dailyPayment: number;
  interestRate: number;
  dueDate: string;
  progress: number;
  onRecordRepayment: () => void;
  onAddSavings: () => void;
}

interface KpiCardsProps {
  loanAmount: number;
  nextPayment: number;
  nextDate?: string;
  savingsBalance: number;
}



// Sample small Badge component
function StatusBadge({ status }: { status: string }) {
  const base = "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full";
  if (status === "Paid") return <span className={base + " text-emerald-700 bg-emerald-100"}>Paid</span>;
  if (status === "Missed") return <span className={base + " text-red-700 bg-red-100"}>Missed</span>;
  if (status === "Upcoming") return <span className={base + " text-slate-700 bg-slate-100"}>Upcoming</span>;
  return <span className={base + " text-gray-700 bg-gray-100"}>{status}</span>;
}

function mapScheduleStatus(status: string) {
  if (status === "PAID") return "Paid";
  if (status === "MISSED") return "Missed";
  return "Upcoming";
}


// KPI cards
function KpiCards({
  loanAmount,
  nextPayment,
  nextDate,
  savingsBalance,
}: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
        <div>
          <h4 className="text-sm text-slate-500">Loan Repayment</h4>
          <div className="mt-2 text-2xl font-semibold">₦{nextPayment.toLocaleString()}</div>
          <div className="text-xs text-slate-400">Next Payment – {nextDate ? new Date(nextDate).toDateString() : "—"}</div>
        </div>
        <div className="w-24 h-24 flex items-center justify-center rounded-full bg-violet-50">
          {/* Placeholder for donut */}
          <div className="w-12 h-12 rounded-full bg-violet-300" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
        <div>
          <h4 className="text-sm text-slate-500">Savings Account</h4>
          <div className="mt-2 text-2xl font-semibold"> ₦{savingsBalance.toLocaleString()}</div>
          <div className="text-xs text-slate-400">Current balance</div>
        </div>
        <div className="w-24 h-24 flex items-center justify-center rounded-full bg-slate-50">
          <div className="w-12 h-12 rounded-full bg-slate-300" />
        </div>
      </div>
    </div>
  );
}

// ActiveLoan card
function ActiveLoanCard({
  loanId,
  amount,
  outstanding,
  dailyPayment,
  interestRate,
  dueDate,
  progress,
  onRecordRepayment,
  onAddSavings,
}: ActiveLoanCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4">Active Loan</h3>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 text-sm text-slate-600">
        <Info label="Loan ID" value={loanId} />
        <Info label="Amount" value={`₦${amount.toLocaleString()}`} />
        <Info label="Outstanding" value={`₦${outstanding.toLocaleString()}`} />
        <Info label="Daily Payment" value={`₦${dailyPayment.toLocaleString()}`} />
        <Info label="Interest Rate" value={`${interestRate}%`} />
        <Info label="Due Date" value={new Date(dueDate).toDateString()} />
      </div>

      {/* Progress */}
      <div className="mt-6">
        <div className="text-xs text-slate-500 mb-2">Repayment Progress ({progress}% Paid)</div>
        <div className="w-full bg-slate-100 h-2 rounded-full">
          <div className="h-2 rounded-full bg-violet-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button onClick={onRecordRepayment} className="bg-violet-600 text-white">Record Repayment</Button>
        <Button onClick={onAddSavings} className="bg-white border border-slate-200">Add Savings</Button>
        <Link href="/loans/schedule" className="self-center text-sm text-violet-600 hover:underline">View Payment Schedule</Link>
      </div>
    </div>
  );
}

 function Info({ label, value }: { label: string; value: any }) {
   return (
     <div>
       <div className="text-xs text-slate-400">{label}</div>
       <div className="font-medium">{value}</div>
     </div>
   );
 }

// Payment schedule table
function PaymentSchedule({ schedule }: { schedule: any }) {
  if (!schedule?.items?.length) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mt-6 text-center text-slate-500">
        No payment schedule available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h4 className="text-base font-medium mb-4">Payment Schedule</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-slate-500 text-xs uppercase">
            <tr>
              <th className="py-3">Day</th>
              <th className="py-3">Due Date</th>
              <th className="py-3">Amount</th>
              <th className="py-3">Status</th>
              <th className="py-3">Remaining</th>
              <th className="py-3" />
            </tr>
          </thead>
          <tbody>
            {schedule.items.map((item: any) => (
              <tr key={item.day} className="border-t">
                <td className="py-4">Day {item.day}</td>
                <td className="py-4">
                  {new Date(item.dueDate).toDateString()}
                </td>
                <td className="py-4">
                  ₦{Number(item.dueAmount).toLocaleString()}
                </td>
                <td className="py-4">
                  <StatusBadge status={mapScheduleStatus(item.status)} />
                </td>
                <td className="py-4">
                  ₦{Number(item.remainingBalance).toLocaleString()}
                </td>
                <td className="py-4 text-center">
                   <input
          type="checkbox"
          className="h-4 w-4 accent-[#7f56d9] pointer-events-none"
          defaultChecked={item.status === "PAID"}
        />
           </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomerHeader({ user }: { user: any }) {
  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 flex items-center gap-4">
      <img
        src={user.profilePicture || "/avatar.png"}
        alt="Customer"
        className="w-16 h-16 rounded-full object-cover"
      />

      <div>
        <h2 className="text-xl font-semibold">
          {user.firstName} {user.lastName}
        </h2>
        <p className="text-sm text-slate-500">{user.email}</p>
        <p className="text-sm text-slate-500">{user.mobileNumber}</p>
      </div>
    </div>
  );
}


export default function DashboardPage() {
  const { customerId } = useParams();
const id = Number(customerId);
   const [isRepaymentModalOpen, setIsRepaymentModalOpen] = useState(false);
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);

  const [customer, setCustomer] = useState<any>(null);
const [loan, setLoan] = useState<any>(null);
const [schedule, setSchedule] = useState<any>(null);
const [savings, setSavings] = useState<any>(null);

useEffect(() => {
  if (!id) return;

  async function loadData() {
    try {
      const [
        customerRes,
        loansRes,
        savingsRes,
      ] = await Promise.all([
        CustomerService.getBranchCustomerById(id),
        CustomerService.getBranchCustomerLoan(id),
        CustomerService.getCustomerSavingsProgress(id),
      ]);

      setCustomer(customerRes.data);
      setLoan(loansRes.find((l) => l.status === "active") || null);
      setSavings(savingsRes);
    } catch (err) {
      console.error("Failed to load customer data", err);
    }
  }

  loadData();
}, [id]);

useEffect(() => {
  if (!loan?.id) return;

  CustomerService.getLoanPaymentsSchedule({
    loanId: loan.id,
    page: 1,
    limit: 50,
  }).then(setSchedule);
}, [loan]);


if (!loan) {
  return (
    <div className="p-10 text-center text-slate-500">
      Loading customer loan…
    </div>
  );
}


  return (
    <div className="min-h-screen bg-slate-50">

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-3">Customer Details</h1>
          <CustomerHeader user={loan?.user} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-3">
            {/* <KpiCards /> */}
            <KpiCards
            loanAmount={Number(loan?.totalRepayable)}
            nextPayment={Number(loan?.dailyRepayment)}
            nextDate={loan?.dueDate}
            savingsBalance={savings?.currentBalance}
          />


            <div className="mt-6">
              <ActiveLoanCard
            loanId={loan.id}
            amount={Number(loan.amount)}
            outstanding={Number(loan.remainingBalance)}
            dailyPayment={Number(loan.dailyRepayment)}
            interestRate={Number(loan.interestRate)}
            dueDate={loan.dueDate}
            progress={Math.round(
              (Number(loan.amountPaid) / Number(loan.totalRepayable)) * 100
            )}
            onRecordRepayment={() => setIsRepaymentModalOpen(true)}
            onAddSavings={() => setIsSavingsModalOpen(true)}
          />


            </div>
            </div>
            <div className="lg:col-span-2">
            <PaymentSchedule schedule={schedule?.schedule} />
            </div>

        </div>
      </main>

       <RecordRepaymentModal
        isOpen={isRepaymentModalOpen}
        onClose={() => setIsRepaymentModalOpen(false)}
        loanId={loan.id}
        customerId={customer.id}
      />
      <AddSavingsModal
        isOpen={isSavingsModalOpen}
        onClose={() => setIsSavingsModalOpen(false)}
      />
    </div>
  );
}


