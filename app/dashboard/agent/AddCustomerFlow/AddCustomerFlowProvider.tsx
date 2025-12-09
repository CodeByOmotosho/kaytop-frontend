// "use client";

// import { createContext, useContext, useState } from "react";

// const FlowContext = createContext<any>(null);

// export function AddCustomerFlowProvider({ children }: { children: React.ReactNode }) {
//   const [open, setOpen] = useState(false);
//   const [step, setStep] = useState(1);

//   const start = () => {
//     setOpen(true);
//     setStep(1);
//   };

//   const close = () => {
//     setOpen(false);
//     setStep(1);
//   };

//   const next = () => setStep((s) => s + 1);
//   const back = () => setStep((s) => s - 1);

//   return (
//     <FlowContext.Provider value={{ open, step, start, close, next, back }}>
//       {children}
//     </FlowContext.Provider>
//   );
// }

// export function useCustomerFlow() {
//   return useContext(FlowContext);
// }


"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

// ----------------------
// Types
// ----------------------
interface CustomerData {
  firstName: string;
  lastName: string;
  dob: string;
  phone: string;
  email: string;
  address: string;
  state: string;
  lga: string;
  idCardFile?: File | null;
  selfieFile?: File | null;
}

interface FlowContextType {
  open: boolean;
  step: number;

  data: CustomerData;

  start: () => void;
  close: () => void;

  nextStep: () => void;
  prevStep: () => void;

  updateField: (field: string, value: string) => void;

  captureIDFile: (file: File) => void;
  captureSelfieFile: (file: File) => void;

  submitCustomer: () => void;
}

const FlowContext = createContext<FlowContextType | null>(null);

// ----------------------
// Provider
// ----------------------
export function AddCustomerFlowProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<number>(1);

  const [data, setData] = useState<CustomerData>({
    firstName: "",
    lastName: "",
    dob: "",
    phone: "",
    email: "",
    address: "",
    state: "",
    lga: "",
    idCardFile: null,
    selfieFile: null,
  });

  // Start flow
  const start = () => {
    setOpen(true);
    setStep(1);
  };

  // Close flow
  const close = () => {
    setOpen(false);
    setStep(1);

    // Optional: reset form
    setData({
      firstName: "",
      lastName: "",
      dob: "",
      phone: "",
      email: "",
      address: "",
      state: "",
      lga: "",
      idCardFile: null,
      selfieFile: null,
    });
  };

  // Navigation
  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  // Update each text field
  const updateField = (field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Capture ID image
  const captureIDFile = (file: File) => {
    setData((prev) => ({ ...prev, idCardFile: file }));
  };

  // Capture selfie
  const captureSelfieFile = (file: File) => {
    setData((prev) => ({ ...prev, selfieFile: file }));
  };

  // Submit final step
  const submitCustomer = () => {
    console.log("Submitting customer data →", data);

    // TODO → send to backend API

    close(); // close modal after submit
  };

  return (
    <FlowContext.Provider
      value={{
        open,
        step,
        data,

        start,
        close,

        nextStep,
        prevStep,

        updateField,

        captureIDFile,
        captureSelfieFile,

        submitCustomer,
      }}
    >
      {children}
    </FlowContext.Provider>
  );
}

// ----------------------
// Hook
// ----------------------
export function useCustomerFlow() {
  const ctx = useContext(FlowContext);
  if (!ctx) {
    throw new Error(
      "useCustomerFlow must be used inside AddCustomerFlowProvider"
    );
  }
  return ctx;
}
