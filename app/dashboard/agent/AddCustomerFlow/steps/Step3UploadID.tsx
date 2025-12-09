

// "use client";

// interface Step3UploadIDProps {
//   onNext: () => void;
//   onBack: () => void;
//   onCapture: (file: File) => void;
// }

// export default function Step3UploadID({
//   onNext,
//   onBack,
//   onCapture,
// }: Step3UploadIDProps) {
//   const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       onCapture(e.target.files[0]);
//     }
//   };

//   return (
//     <div>
//       <h2 className="text-xl font-semibold mb-4">Upload ID Card</h2>

//       <div className="border rounded-xl p-6 text-center mb-6 bg-slate-50">
//         <p className="font-medium mb-2">Capture or Upload a Valid ID</p>
//         <p className="text-sm text-slate-600 mb-4">
//           Driver’s License, NIN Slip, Voter’s Card, etc.
//         </p>

//         <label className="cursor-pointer block border border-dashed rounded-lg p-4 bg-white">
//           <p className="text-sm text-slate-600">Click to upload</p>
//           <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
//         </label>
//       </div>

//       <div className="flex justify-between">
//         <button onClick={onBack} className="btn-secondary px-6 py-3 rounded-md">
//           Back
//         </button>

//         <button onClick={onNext} className="btn-primary px-6 py-3 rounded-md">
//           Continue
//         </button>
//       </div>
//     </div>
//   );
// }


"use client";

import { useRef } from "react";
import { UploadCloud } from "lucide-react";
import Button from "@/app/_components/ui/Button";

interface Step3UploadIDProps {
  onNext: () => void;
  onBack: () => void;
  onCapture: (file: File) => void;
}

export default function Step3UploadID({
  onNext,
  onBack,
  onCapture,
}: Step3UploadIDProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onCapture(e.target.files[0]);
      onNext();
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <h2 className="text-[17px] font-semibold">Verify Your ID</h2>
      <p className="text-[13px] text-slate-500 mt-1">
        Kindly provide a valid government photo ID to verify your identity
      </p>

      {/* Upload box */}
      <div className="mt-6 bg-white rounded-xl border p-5">
        <p className="text-[13px] font-semibold mb-3">Valid Government ID</p>

        <div className="flex items-center gap-3">
          {/* Icon Circle */}
          <div className="w-10 h-10 rounded-full border flex items-center justify-center">
            <UploadCloud className="w-5 h-5 text-slate-500" />
          </div>

          {/* Upload area */}
          <label className="flex-1 cursor-pointer border border-dashed rounded-md p-4 bg-[#F9FAFB] hover:bg-slate-50 transition">
            <p className="text-[13px] font-medium text-slate-700">
              Click to Capture
              <span className="text-slate-500"> or drag and drop</span>
            </p>
            <p className="text-[11px] text-slate-400">
              SVG, PNG, JPG or GIF (max. 800×400px)
            </p>

            <input
              type="file"
              ref={inputRef}
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-6 gap-3">
        <Button
        variant="secondary"
          onClick={onBack}
          className="w-full py-2 border rounded-lg text-[14px] bg-gray-200"
        >
          Cancel
        </Button>

        <Button
        variant="tertiary"
          onClick={onNext}
          className="w-full py-2  text-white rounded-lg text-[14px] "
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

