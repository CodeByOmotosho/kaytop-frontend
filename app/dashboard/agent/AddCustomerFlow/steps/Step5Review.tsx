"use client";
import React from "react";

export default function Step5Review({
  data,
  onSubmit,
  onBack,
}: {
  data: any;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">Review Details</h2>
      <p className="text-sm text-slate-500 mt-1">
        Confirm all information before submitting.
      </p>

      <div className="mt-6 space-y-4">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-slate-800">Personal Info</h3>
          <p className="text-sm text-slate-600">{data.firstName} {data.lastName}</p>
          <p className="text-sm text-slate-600">{data.phone}</p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold">Contact Details</h3>
          <p className="text-sm text-slate-600">{data.address}</p>
          <p className="text-sm text-slate-600">{data.email}</p>
          <p className="text-sm text-slate-600">{data.state}, {data.lga}</p>
        </div>

        <div className="border rounded-lg p-4 flex items-center gap-4">
          <img
            src={data.selfiePreview}
            className="h-20 w-20 rounded-md object-cover"
          />
          <div>
            <p className="font-semibold">Selfie Captured</p>
            <p className="text-green-600 text-sm font-medium">✔ Verified</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button onClick={onBack} className="px-4 py-2 rounded-md border">
          Back
        </button>

        <button
          onClick={onSubmit}
          className="px-4 py-2 rounded-md bg-purple-600 text-white"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
