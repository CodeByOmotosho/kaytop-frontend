import { ROUTES } from "@/lib/utils";
import { redirect } from "next/navigation";
import { JSX } from "react";

// This page was a static template with hardcoded data.
// Redirect users to the customers list where they can select a specific customer
// to view real dynamic data at /dashboard/bm/customer/details/[customerId]
export default function page(): JSX.Element {
  redirect(ROUTES.Bm.CUSTOMERS);
}
