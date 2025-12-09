// "use client";

// import { useCustomerFlow } from "./AddCustomerFlowProvider";
// import FlowModal from "./FlowModal";

// import Step1Personal from "./steps/Step1Personal";
// import Step2Contact from "./steps/Step2Contact";
// import Step3UploadID from "./steps/Step3UploadID";
// import Step4Selfie from "./steps/Step4Selfie";
// import Step5Review from "./steps/Step5Review";

// export default function AddCustomerFlowModal() {
//   const { step } = useCustomerFlow();

//   const steps = {
//     1: <Step1Personal />,
//     2: <Step2Contact />,
//     3: <Step3UploadID />,
//     4: <Step4Selfie />,
//     5: <Step5Review />,
//   };

//   return <FlowModal>{steps[step]}</FlowModal>;
// }


"use client";

import { JSX } from "react";
import { useCustomerFlow } from "./AddCustomerFlowProvider";
import FlowModal from "./FlowModal";

import Step1Personal from "./steps/Step1Personal";
import Step2Contact from "./steps/Step2Contact";
import Step3UploadID from "./steps/Step3UploadID";
import Step4Selfie from "./steps/Step4Selfie";
import Step5Review from "./steps/Step5Review";

export default function AddCustomerFlowModal() {
  const {
    step,
    data,
    updateField,
    nextStep,
    prevStep,
    submitCustomer,
    captureIDFile,
    captureSelfieFile,
  } = useCustomerFlow();

  const steps: Record<number, JSX.Element> = {
    1: (
      <Step1Personal
        data={data}
        onChange={updateField}
        onNext={nextStep}
      />
    ),

    2: (
      <Step2Contact
        data={data}
        onChange={updateField}
        onNext={nextStep}
        onBack={prevStep}
      />
    ),

    3: (
      <Step3UploadID
        onNext={nextStep}
        onBack={prevStep}
        onCapture={captureIDFile}
      />
    ),

    4: (
      <Step4Selfie
        onNext={nextStep}
        onBack={prevStep}
        onCapture={captureSelfieFile}
      />
    ),

    5: (
      <Step5Review
        data={data}
        onSubmit={submitCustomer}
        onBack={prevStep}
      />
    ),
  };

  return <FlowModal>{steps[step]}</FlowModal>;
}
