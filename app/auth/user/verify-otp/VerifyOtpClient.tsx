"use client"

import VerifyOtpForm from "@/app/_components/ui/auth/user/VerifyOtpForm";
import { Purpose } from "@/app/types/auth";
import { useSearchParams } from "next/navigation";

export default function VerifyOtpClient() {
    const searchParams = useSearchParams();
  const purposeQuery = searchParams.get("purpose");
  const purpose: Purpose =
    purposeQuery === "password-reset"
      ? Purpose.Password_reset
      : Purpose.Email_verification;

  
  return (
        <div className="bg-white rounded-xl shadow-md p-10 w-full mx-auto max-w-md md:max-w-xl mt-6">
      <h1 className="text-3xl font-medium text-neutral-700">
          {purpose === Purpose.Password_reset ? "Reset Password" : "Verify your email"}
      </h1>
      <p className="text-neutral-700 text-md">
         {purpose === Purpose.Password_reset
          ? "Enter the OTP sent to your email to reset your password"
          : "Please enter the OTP sent to your email for verification"}
      </p>

      <VerifyOtpForm purpose={purpose} />
     
    </div>
  );
}
