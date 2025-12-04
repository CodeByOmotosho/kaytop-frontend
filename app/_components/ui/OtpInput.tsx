"use client";
import { useRef, useState } from "react";
interface OtpInputProps {
  length?: number;
  onComplete: (value: string) => void;
}

const OtpInput = ({ length = 6, onComplete }: OtpInputProps) => {
  const inputRef = useRef<(HTMLInputElement | null)[]>([]);
  const [OTP, setOTP] = useState<string[]>(Array(length).fill(""));

  const handleTextChange = (input: string, index: number) => {
    const newPin = [...OTP];
    newPin[index] = input;
    setOTP(newPin);

    if (input.length === 1 && index < length - 1) {
      inputRef.current[index + 1]?.focus();
    }

    if (input.length === 0 && index > 0) {
      inputRef.current[index - 1]?.focus();
    }

    if (newPin.every((digit) => digit !== "")) {
      onComplete(newPin.join(""));
    }
  };

  return (
    <div className={`grid grid-cols-6 gap-5`}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          value={OTP[index]}
          onChange={(e) => handleTextChange(e.target.value, index)}
          ref={(ref) => {
            inputRef.current[index] = ref;
          }}
          className="mx-auto my-2 text-lg font-semibold text-center transition-all duration-200 ease-in-out border border-gray-300 rounded-lg w-14 h-14 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-brand-purple hover:border-brand-purple"
        />
      ))}
    </div>
  );
};

export default OtpInput;
