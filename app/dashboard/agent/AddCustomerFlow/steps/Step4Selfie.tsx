// "use client";
// import React, { useRef, useState } from "react";

// export default function Step4Selfie({
//   onNext,
//   onBack,
//   onCapture,
// }: {
//   onNext: () => void;
//   onBack: () => void;
//   onCapture: (file: File) => void;
// }) {
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const [preview, setPreview] = useState<string | null>(null);

//   React.useEffect(() => {
//     navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
//       if (videoRef.current) videoRef.current.srcObject = stream;
//     });
//   }, []);

//   const handleCapture = () => {
//     const video = videoRef.current!;
//     const canvas = document.createElement("canvas");
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;

//     const ctx = canvas.getContext("2d")!;
//     ctx.drawImage(video, 0, 0);

//     canvas.toBlob((blob) => {
//       if (!blob) return;

//       const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
//       onCapture(file);
//       setPreview(URL.createObjectURL(file));
//     });
//   };

//   return (
//     <div>
//       <h2 className="text-xl font-semibold">Selfie Verification</h2>
//       <p className="text-sm text-slate-500 mt-1">
//         Center your face in the frame and take a clear selfie.
//       </p>

//       <div className="mt-6 rounded-xl overflow-hidden border">
//         {preview ? (
//           <img src={preview} className="w-full h-64 object-cover" />
//         ) : (
//           <video ref={videoRef} autoPlay className="w-full h-64 object-cover" />
//         )}
//       </div>

//       <div className="mt-6 flex justify-between">
//         <button onClick={onBack} className="px-4 py-2 border rounded-md">
//           Back
//         </button>

//         <button
//           onClick={preview ? onNext : handleCapture}
//           className="px-4 py-2 rounded-md bg-purple-600 text-white"
//         >
//           {preview ? "Continue" : "Take Selfie"}
//         </button>
//       </div>
//     </div>
//   );
// }


"use client";

import React, { useRef, useState } from "react";
import { Camera } from "lucide-react";
import Button from "@/app/_components/ui/Button";

export default function Step4Selfie({
  onNext,
  onBack,
  onCapture,
}: {
  onNext: () => void;
  onBack: () => void;
  onCapture: (file: File) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  React.useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) videoRef.current.srcObject = stream;
    });
  }, []);

  const handleCapture = () => {
    const video = videoRef.current!;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      onCapture(file);
      setPreview(URL.createObjectURL(file));
    });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <h2 className="text-[17px] font-semibold">Verify Your ID</h2>
      <p className="text-[13px] text-slate-500 mt-1">
        Tell us about your customer. It only takes a few minutes.
      </p>

      <div className="flex gap-6 mt-6">
        {/* LEFT SIDE — Instructions */}
        <div className="w-[55%]">
          <p className="text-[13px] font-semibold mb-3">Valid Government ID</p>

          <ul className="text-[12px] text-slate-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 text-lg">•</span> 
              Make sure your environment is well lit.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 text-lg">•</span>
              Center your photo ID in the frame above.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 text-lg">•</span>
              Click the button below when you are ready.
            </li>
          </ul>
        </div>

        {/* RIGHT — CAMERA BOX */}
        <div className="w-[45%] relative">
          <div className="relative rounded-xl overflow-hidden border">
            {preview ? (
              <img src={preview} className="w-full h-64 object-cover" />
            ) : (
              <video ref={videoRef} autoPlay className="w-full h-64 object-cover" />
            )}

            {/* Red corner markers */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top Left */}
              <div className="absolute top-2 left-2 w-8 h-2 bg-red-500 rounded"></div>
              <div className="absolute top-2 left-2 w-2 h-8 bg-red-500 rounded"></div>

              {/* Top Right */}
              <div className="absolute top-2 right-2 w-8 h-2 bg-red-500 rounded"></div>
              <div className="absolute top-2 right-2 w-2 h-8 bg-red-500 rounded"></div>

              {/* Bottom Left */}
              <div className="absolute bottom-2 left-2 w-8 h-2 bg-red-500 rounded"></div>
              <div className="absolute bottom-2 left-2 w-2 h-8 bg-red-500 rounded"></div>

              {/* Bottom Right */}
              <div className="absolute bottom-2 right-2 w-8 h-2 bg-red-500 rounded"></div>
              <div className="absolute bottom-2 right-2 w-2 h-8 bg-red-500 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-6 gap-3">
        <Button
          onClick={onBack}
          variant="secondary"
          className="w-full py-2 border rounded-lg text-[14px] bg-gray-200"
        >
          Cancel
        </Button>

        <Button
        variant="tertiary"
          onClick={preview ? onNext : handleCapture}
          className="w-full py-2  text-white rounded-lg text-[14px] "
        >
          {preview ? "Continue" : "Take Selfie"}
        </Button>
      </div>
    </div>
  );
}
