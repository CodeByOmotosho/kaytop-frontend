'use client';

export const dynamic = 'force-dynamic';

import CreditClient from "@/app/_components/ui/CreditClient";
import SpinnerLg from "@/app/_components/ui/SpinnerLg";
import { Suspense } from "react";

export default function page() {
  return (
    <div className="drawer-content">
      <div className="container h-full px-5 pt-4 mx-auto max-w-7xl">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-[70vh]">
              <SpinnerLg />
            </div>
          }
        >
          <CreditClient />
        </Suspense>
      </div>
    </div>
  );
}
