"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/app/_components/ui/Button";
import { LoanService } from "@/app/services/loanService";
import { SavingsService } from "@/app/services/savingsService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  loanId: number;
  customerId: number;
}

type Method = "cash" | "savings";
type Step =
  | "method"
  | "amount"
  | "summary"
  | "success"
  | "request-success";

const NEXT_PAYMENT = 15350;
const FULL_PAYMENT = 66950;

export default function RecordRepaymentModal({ isOpen, onClose, loanId,
  customerId, }: Props) {
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<Method>("cash");
  const [amount, setAmount] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(2);
  const showHeader = step !== "success" && step !== "request-success";
  const [proof, setProof] = useState<File | null>(null);



  /** Redirect countdown */
  useEffect(() => {
    if (step === "success") {
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c === 1) {
            handleClose();
            return 2;
          }
          return c - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step]);

  function handleClose() {
    setStep("method");
    setAmount(null);
    setMethod("cash");
    setCountdown(2);
    onClose();
  }

  async function handleRecordRepayment() {
  if (!amount || !loanId) return;

  try {
    const formData = new FormData();
    formData.append("amount", amount.toString());
    formData.append("paymentDate", new Date().toISOString());
    if (proof) formData.append("proof", proof);

    await LoanService.recordRepayment(loanId, formData);

    // Show success
    setStep("success");
  } catch (err) {
    console.error("Failed to record repayment", err);
    alert("Failed to record repayment. Try again.");
  }
}

async function handleUseSavings() {
  if (!amount || !customerId || !loanId) return;

  try {
    await SavingsService.useForLoanCoverage(customerId, { loanId, amount });
    setStep("request-success");
  } catch (err) {
    console.error("Failed to use savings for loan", err);
    alert("Failed to use savings. Try again.");
  }
}



  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-md rounded-xl bg-white shadow-lg relative"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
         
         {/* CLOSE BUTTON – always positioned, independent */}
            <button
            onClick={handleClose}
            className="absolute right-4 top-1 z-10 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label="Close modal"
            >
            ✕
            </button>


          {/* HEADER */}
{showHeader && (
  <div className="relative border-b px-6 py-4 mt-2">
    {/* HEADER CONTENT */}
    <div className={step === "summary" ? "text-center" : ""}>
      <h2 className="text-base font-semibold">
        {step === "summary" && "Transaction detail"}
        {(step === "method" || step === "amount") && "Record loan repayment"}
      </h2>

      {(step === "method" || step === "amount") && (
        <p className="mt-1 text-xs text-slate-500">
          How much are you repaying now?
        </p>
      )}

      {step === "summary" && (
        <p className="mt-1 text-xs text-slate-500">
          You are about to make a loan repayment of{" "}
          <span className="font-medium text-slate-700">
            ₦{amount?.toLocaleString()}
          </span>
        </p>
      )}
    </div>
  </div>
)}


          {/* BODY */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* STEP 1 – METHOD */}
              {/* {step === "method" && (
                <motion.div key="method" {...anim}>
                  <div className="space-y-3">
                    {["cash", "savings"].map((m) => (
                      <div
                        key={m}
                        onClick={() => {
                          setMethod(m as Method);
                          setStep("amount");
                        }}
                        className="cursor-pointer rounded-lg border p-4 hover:border-violet-500"
                      >
                        <p className="font-medium capitalize">
                          Pay with {m}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )} */}
              {step === "method" && (
  <motion.div key="method" {...anim}>
    <div className="flex gap-4">
      {/* PAY WITH CASH */}
      <div
        onClick={() => {
          setMethod("cash");
          setStep("amount");
        }}
        className="flex-1 cursor-pointer rounded-xl border p-4 hover:border-violet-500 hover:bg-violet-50 transition"
      >
        <p className="text-sm font-medium">Pay with cash</p>
        <p className="mt-2 text-lg font-semibold">₦15,000</p>
      </div>

      {/* PAY WITH SAVINGS */}
      <div
        onClick={() => {
          setMethod("savings");
          setStep("amount");
        }}
        className="flex-1 cursor-pointer rounded-xl border p-4 hover:border-violet-500 hover:bg-violet-50 transition"
      >
        <p className="text-sm font-medium">Pay with savings</p>
        <p className="mt-2 text-lg font-semibold">₦15,000</p>
      </div>
    </div>
  </motion.div>
)}


              {/* STEP 2 – AMOUNT */}
              {step === "amount" && (
                <motion.div key="amount" {...anim}>
                  {method === "savings" && (
                    <div className="mb-4 rounded-lg bg-violet-50 p-4">
                      <p className="text-xs text-slate-500">Wallet balance</p>
                      <p className="text-lg font-semibold">₦42,100</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <AmountCard
                      label="Next repayment"
                      value={NEXT_PAYMENT}
                      selected={amount === NEXT_PAYMENT}
                      onClick={() => setAmount(NEXT_PAYMENT)}
                    />
                    <AmountCard
                      label="Full repayment"
                      value={FULL_PAYMENT}
                      selected={amount === FULL_PAYMENT}
                      onClick={() => setAmount(FULL_PAYMENT)}
                    />
                  </div>

                  <input
                    type="number"
                    placeholder="Enter a specific amount"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />

                  <p className="mt-1 text-right text-xs text-violet-600">
                    Min. 30,000 – Max. 70,000
                  </p>

                  {method === "cash" && (
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setProof(e.target.files?.[0] || null)}
                      className="mt-3"
                    />
                  )}


                  <div className="mt-6 flex gap-3">
                    <Button className="w-full bg-white border" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button
                      className="w-full bg-violet-600 text-white"
                      disabled={!amount}
                      onClick={() =>
                      method === "cash" ? setStep("summary") : handleUseSavings()
                    }
                    >
                      {method === "cash" ? "Record Repayment" : "Make Request"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 – SUMMARY (CASH ONLY) */}
              {step === "summary" && (
                <motion.div key="summary" {...anim}>
                  <DetailRow label="Amount" value={`₦${amount}`} />
                  <DetailRow label="Service fee" value="₦0.00" />
                  <DetailRow label="Late repayment fee" value="₦0.00" border />
                  <DetailRow label="Total" value={`₦${amount}`} bold border />

                  <Button
                    className="mt-6 w-full bg-violet-600 text-white"
                    // onClick={() => setStep("success")}
                    onClick={handleRecordRepayment}
                  >
                    Record Repayment
                  </Button>
                </motion.div>
              )}

              {/* SUCCESS – CASH */}
              {step === "success" && (
                <motion.div key="success" {...anim} className="flex flex-col items-center justify-center py-8 text-center">
                  <SuccessIcon />
                  <h3 className="mt-4 font-semibold">Record successful</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Your loan has been repaid. Keep up the good work to get access
                    to better options.
                  </p>
                  <p className="mt-4 text-xs text-slate-400">
                    Redirecting in 0:0{countdown}
                  </p>
                </motion.div>
              )}

              {/* SUCCESS – SAVINGS */}
              {step === "request-success" && (
                <motion.div key="request" {...anim} className="flex flex-col items-center justify-center py-8 text-center">
                  <SuccessIcon />
                  <h3 className="mt-4 font-semibold">Request Sent</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Your loan has been repaid. Keep up the good work to get access
                    to better options.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------- Helpers ---------- */

const anim = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2 },
};

function AmountCard({ label, value, selected, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border p-3 text-sm ${
        selected ? "border-violet-600 bg-violet-50" : ""
      }`}
    >
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold">₦{value}</p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  bold,
  border,
}: {
  label: string;
  value: string;
  bold?: boolean;
  border?: boolean;
}) {
  return (
    <div
      className={`flex justify-between py-3 text-sm ${
        border ? "border-b" : ""
      }`}
    >
      <span className="text-slate-500">{label}</span>
      <span className={bold ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}


function SuccessIcon() {
  return (
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-xl text-violet-600">
      ✓
    </div>
  );
}
