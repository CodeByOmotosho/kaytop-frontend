"use client";

import { Label } from "@/app/_components/ui/label";
import { useCustomerFlow } from "../AddCustomerFlowProvider";
import Input from "@/app/_components/ui/Input";
import Button from "@/app/_components/ui/Button";

interface Step1PersonalProps {
  data: any;
  onChange: (field: string, value: string) => void;
  onNext: () => void;
}

export default function Step1Personal({
  data,
  onChange,
  onNext,
}: Step1PersonalProps) {
  return (
    <div>
          <h2 className="text-lg font-semibold">Add New Customer</h2>
    
        <p className="text-sm text-gray-500 mb-6">
          Tell us about your customer. It only takes a few minutes.
        </p>

        {/* Form */}
        <div className="space-y-4">

  {/* First Name */}
  <div className="flex items-center">
    <label className="text-sm font-medium w-40">First name</label>
    <input
      type="text"
      placeholder="e.g. Linear"
      value={data.firstName}
      onChange={(e) => onChange("firstName", e.target.value)}
      className="flex-1 border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
    />
  </div>

  {/* Last Name */}
  <div className="flex items-center">
    <label className="text-sm font-medium w-40">Last name</label>
    <input
      type="text"
      placeholder="www.example.com"
      value={data.lastName}
      onChange={(e) => onChange("lastName", e.target.value)}
      className="flex-1 border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
    />
  </div>

  {/* Phone */}
  <div className="flex items-center">
    <label className="text-sm font-medium w-40">Phone Number</label>
    <input
      type="text"
      placeholder="www.example.com"
      value={data.phone}
      onChange={(e) => onChange("phone", e.target.value)}
      className="flex-1 border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
    />
  </div>

  {/* Email */}
  <div className="flex items-center">
    <label className="text-sm font-medium w-40">Email Address</label>
    <input
      type="email"
      placeholder="www.example.com"
      value={data.email}
      onChange={(e) => onChange("email", e.target.value)}
      className="flex-1 border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
    />
  </div>

  {/* House Address */}
  <div className="flex items-center">
    <label className="text-sm font-medium w-40">House Address</label>
    <input
      type="text"
      placeholder="www.example.com"
      value={data.address}
      onChange={(e) => onChange("address", e.target.value)}
      className="flex-1 border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
    />
  </div>

  {/* Upload */}
  <div className="flex items-start">
    <label className="text-sm font-medium w-40">Customer's image*</label>

    <div className="flex-1 border border-dashed rounded-lg p-4 flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition">
      <button className="p-3 bg-purple-100 rounded-full text-purple-600">📁</button>

      <div>
        <p className="text-sm text-purple-600 font-medium cursor-pointer">Click to upload</p>
        <p className="text-xs text-gray-500">
          or drag and drop SVG, PNG, JPG or GIF (max. 800×400px)
        </p>
      </div>
    </div>
  </div>
</div>


        {/* Footer Buttons */}
        <div className="mt-6 flex justify-end gap-3">
         
          <Button onClick={onNext} variant="tertiary"  className="px-10 py-2 w-1/2  text-white rounded-md text-sm">
            Continue
          </Button>
        </div>
      
    </div>
  );
}

