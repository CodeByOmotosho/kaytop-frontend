"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Button from "../../../_components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../_components/ui/Select";
import { Label } from "../../../_components/ui/label";
import { Input } from "@/components/ui/input";




export default function RegisterPage() {

  return (
    <div className="bg-white rounded-xl shadow-md p-10 w-full mx-auto max-w-md md:max-w-2xl mt-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <img src="/logo.png" className="h-7" alt="logo" />
          <span className="font-semibold text-primary">Kaytop MI</span>
        </div>

        <Link href="/auth/agent/login" className="text-sm text-secondary hover:underline">
          Already have an account? <span className="font-semibold">Sign in</span>
        </Link>
      </div>

      <h2 className="text-3xl font-bold text-primary mb-2">Welcome</h2>
      <p className="text-sm text-gray-600 mb-8">
        Sign in to your account to continue
      </p>

      {/* NAME FIELDS */}
<div className="grid grid-cols-2 gap-4 mb-4">
  <div className="flex flex-col gap-1">
    <Label className="font-normal text-base text-muted-foreground" htmlFor="firstName">First Name</Label>
    <Input id="firstName" placeholder="Enter First Name" />
  </div>

  <div className="flex flex-col gap-1">
    <Label className="font-normal text-base text-muted-foreground" htmlFor="lastName">Last Name</Label>
    <Input id="lastName" placeholder="Enter Last Name" />
  </div>
</div>

{/* DOB + PHONE */}
<div className="grid grid-cols-2 gap-4 mb-4">
  <div className="flex flex-col gap-1">
    <Label className="font-normal text-base text-muted-foreground" htmlFor="dob">Date of Birth</Label>
    <Input id="dob" type="date" />
  </div>

  <div className="flex flex-col gap-1">
    <Label className="font-normal text-base text-muted-foreground" htmlFor="phone">Phone Number</Label>
    <Input id="phone" type="tel" placeholder="e.g. 08012345678" />
  </div>
</div>


      <div className="grid grid-cols-2 gap-4 mb-4">
  {/* BRANCH */}
  <div className="flex flex-col gap-1">
    <Label className="font-normal text-base text-muted-foreground" htmlFor="branch">Branch</Label>
    <Select>
      <SelectTrigger id="branch">
        <SelectValue placeholder="Select Branch" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="lagos">Lagos</SelectItem>
        <SelectItem value="abuja">Abuja</SelectItem>
        <SelectItem value="ibadan">Ibadan</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* STATE */}
  <div className="flex flex-col gap-1">
    <Label className="font-normal text-base text-muted-foreground" htmlFor="state">State</Label>
    <Select>
      <SelectTrigger id="state">
        <SelectValue placeholder="Select State" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="lagos">Lagos</SelectItem>
        <SelectItem value="abuja">Abuja</SelectItem>
        <SelectItem value="ibadan">Ibadan</SelectItem>
        <SelectItem value="oyo">Oyo</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>


      {/* SUBMIT */}
      <Link href="/auth/agent/register/password" className="block">
            <Button variant="tertiary" fullWidth size="lg">
                Continue
            </Button>
            </Link>


      {/* FOOTER */}
      <div className="text-xs text-gray-500 text-center mt-6">
        Powered by Kaytop |{" "}
        <Link href="/terms" className="hover:underline">
          Terms & Conditions
        </Link>{" "}
        |{" "}
        <Link href="/privacy" className="hover:underline">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}




