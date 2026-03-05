"use client";

import { Dialog, DialogPanel } from "@headlessui/react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import LoanSetupStep from "./LoanSetupStep";

export interface LoanDraft {
  customerId: number;
  amount: number;
  durationDays: number;
}

export default function CreateLoanModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const closeAndReset = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={closeAndReset} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-xl bg-white rounded-2xl p-6 max-h-[90vh] flex flex-col">
           {/* Header */}
      <h2 className="text-lg font-semibold mb-1">Create new loan</h2>
      <p className="text-sm text-slate-500 mb-8">
        Tell us about your customer. It only takes a few minutes.
      </p>
      <div className="overflow-y-auto">
          <LoanSetupStep
            onCancel={closeAndReset}
            onSuccess={() => {
              toast.success("You have just created and disbursed a new loan");
              closeAndReset();
            }}
          />
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
