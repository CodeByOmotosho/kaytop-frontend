"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Button from "../../../_components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../_components/ui/Select";
import { Label } from "../../../_components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";


export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    phone: "",
    branch: "",
    state: "",
    email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  /* -------------------- VALIDATION -------------------- */
  const isValidNigerianNumber = (phone: string) => {
    const regex = /^(070|080|081|090|091)\d{8}$/;
    return regex.test(phone);
  };

  const validate = () => {
    const e: Record<string, string> = {};

    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.phone) {
      e.phone = "Phone number is required";
    } else if (!isValidNigerianNumber(form.phone)) {
      e.phone = "Enter a valid Nigerian phone number";
    }
    if (!form.branch) e.branch = "Please select a branch";
    if (!form.state) e.state = "Please select a state";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* -------------------- SUBMIT -------------------- */
  const handleContinue = () => {
    if (!validate()) return;

    sessionStorage.setItem("register_data", JSON.stringify(form));
    router.push("/auth/agent/register/password");
  };

  /* -------------------- PHONE HANDLER -------------------- */
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // numbers only
    if (value.length <= 11) {
      setForm({ ...form, phone: value });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-10 w-full mx-auto max-w-md md:max-w-2xl mt-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <img src="/logo.png" className="h-7" alt="logo" />
          <span className="font-semibold text-primary">Kaytop MI</span>
        </div>

        <Link
          href="/auth/agent/login"
          className="text-sm text-secondary hover:underline"
        >
          Already have an account?{" "}
          <span className="font-semibold">Sign in</span>
        </Link>
      </div>

      <h2 className="text-3xl font-bold text-primary mb-2">Welcome</h2>
      <p className="text-sm text-gray-600 mb-8">
        Create your account to continue
      </p>

      {/* FIRST & LAST NAME */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label>First Name</Label>
          <Input
            value={form.firstName}
            onChange={(e) =>
              setForm({ ...form, firstName: e.target.value })
            }
            placeholder="Enter First Name"
          />
          {errors.firstName && (
            <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
          <Label>Last Name</Label>
          <Input
            value={form.lastName}
            onChange={(e) =>
              setForm({ ...form, lastName: e.target.value })
            }
            placeholder="Enter Last Name"
          />
          {errors.lastName && (
            <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* DOB & PHONE */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label>Date of Birth</Label>
          <Input
            type="date"
            value={form.dob}
            onChange={(e) =>
              setForm({ ...form, dob: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Phone Number</Label>
          <Input
            type="tel"
            placeholder="e.g. 08012345678"
            value={form.phone}
            onChange={handlePhoneChange}
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* EMAIL */}
      <div className="mb-4">
        <Label>Email Address</Label>
        <Input
          type="email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          placeholder="Enter email address"
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email}</p>
        )}
      </div>

      {/* BRANCH & STATE */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <Label>Branch</Label>
          <Select
            value={form.branch}
            onValueChange={(value) =>
              setForm({ ...form, branch: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lagos">Lagos</SelectItem>
              <SelectItem value="abuja">Abuja</SelectItem>
              <SelectItem value="ibadan">Ibadan</SelectItem>
            </SelectContent>
          </Select>
          {errors.branch && (
            <p className="text-sm text-red-500 mt-1">{errors.branch}</p>
          )}
        </div>

        <div>
          <Label>State</Label>
          <Select
            value={form.state}
            onValueChange={(value) =>
              setForm({ ...form, state: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lagos">Lagos</SelectItem>
              <SelectItem value="abuja">Abuja</SelectItem>
              <SelectItem value="oyo">Oyo</SelectItem>
            </SelectContent>
          </Select>
          {errors.state && (
            <p className="text-sm text-red-500 mt-1">{errors.state}</p>
          )}
        </div>
      </div>

      {/* SUBMIT */}
      <Button
        variant="tertiary"
        fullWidth
        size="lg"
        onClick={handleContinue}
      >
        Continue
      </Button>

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

// export default function RegisterPage() {
//     const router = useRouter();
//   const [form, setForm] = useState({
//   firstName: "",
//   lastName: "",
//   dob: "",
//   phone: "",
//   branch: "",
//   state: "",
//   email: "",
// });

// const [errors, setErrors] = useState<Record<string, string>>({});

// const validate = () => {
//   const e: Record<string, string> = {};

//   if (!form.firstName) e.firstName = "First name is required";
//   if (!form.lastName) e.lastName = "Last name is required";
//   if (!form.phone) e.phone = "Phone number is required";
//   if (!form.email) e.email = "Email is required";
//   if (!form.branch) e.branch = "Please select a branch";
//   if (!form.state) e.state = "Please select a state";

//   setErrors(e);
//   return Object.keys(e).length === 0;
// };

// const handleContinue = () => {
//   if (!validate()) return;

//   sessionStorage.setItem("register_data", JSON.stringify(form));
//   router.push("/auth/agent/register/password");
// };

//   return (
//     <div className="bg-white rounded-xl shadow-md p-10 w-full mx-auto max-w-md md:max-w-2xl mt-6">
      
//       {/* HEADER */}
//       <div className="flex justify-between items-center mb-8">
//         <div className="flex items-center gap-2">
//           <img src="/logo.png" className="h-7" alt="logo" />
//           <span className="font-semibold text-primary">Kaytop MI</span>
//         </div>

//         <Link href="/auth/agent/login" className="text-sm text-secondary hover:underline">
//           Already have an account? <span className="font-semibold">Sign in</span>
//         </Link>
//       </div>

//       <h2 className="text-3xl font-bold text-primary mb-2">Welcome</h2>
//       <p className="text-sm text-gray-600 mb-8">
//         Sign in to your account to continue
//       </p>

//       {/* NAME FIELDS */}
// <div className="grid grid-cols-2 gap-4 mb-4">
//   <div className="flex flex-col gap-1">
//     <Label className="font-normal text-base text-muted-foreground" htmlFor="firstName">First Name</Label>
//     <Input id="firstName" placeholder="Enter First Name" value={form.firstName}
//   onChange={(e) =>
//     setForm({ ...form, firstName: e.target.value })
//   }
//   />
//     {errors.firstName && (
//   <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
// )}

//   </div>

//   <div className="flex flex-col gap-1">
//     <Label className="font-normal text-base text-muted-foreground" htmlFor="lastName">Last Name</Label>
//     <Input id="lastName" placeholder="Enter Last Name" />
//     {errors.lastName && (
//   <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
// )}

//   </div>
// </div>

// {/* DOB + PHONE */}
// <div className="grid grid-cols-2 gap-4 mb-4">
//   <div className="flex flex-col gap-1">
//     <Label className="font-normal text-base text-muted-foreground" htmlFor="dob">Date of Birth</Label>
//     <Input id="dob" type="date" />
//   </div>

//   <div className="flex flex-col gap-1">
//     <Label className="font-normal text-base text-muted-foreground" htmlFor="phone">Phone Number</Label>
//     <Input id="phone" type="tel" placeholder="e.g. 08012345678" />
//   </div>
// </div>


//       <div className="grid grid-cols-2 gap-4 mb-4">
//   {/* BRANCH */}
//   <div className="flex flex-col gap-1">
//     <Label className="font-normal text-base text-muted-foreground" htmlFor="branch">Branch</Label>
//     <Select>
//       <SelectTrigger id="branch">
//         <SelectValue placeholder="Select Branch" />
//       </SelectTrigger>
//       <SelectContent>
//         <SelectItem value="lagos">Lagos</SelectItem>
//         <SelectItem value="abuja">Abuja</SelectItem>
//         <SelectItem value="ibadan">Ibadan</SelectItem>
//       </SelectContent>
//     </Select>
//   </div>

//   {/* STATE */}
//   <div className="flex flex-col gap-1">
//     <Label className="font-normal text-base text-muted-foreground" htmlFor="state">State</Label>
//     <Select>
//       <SelectTrigger id="state">
//         <SelectValue placeholder="Select State" />
//       </SelectTrigger>
//       <SelectContent>
//         <SelectItem value="lagos">Lagos</SelectItem>
//         <SelectItem value="abuja">Abuja</SelectItem>
//         <SelectItem value="ibadan">Ibadan</SelectItem>
//         <SelectItem value="oyo">Oyo</SelectItem>
//       </SelectContent>
//     </Select>
//   </div>
// </div>


//       {/* SUBMIT */}
//       <Link href="/auth/agent/register/password" className="block">
//             <Button variant="tertiary" fullWidth size="lg">
//                 Continue
//             </Button>
//             </Link>


//       {/* FOOTER */}
//       <div className="text-xs text-gray-500 text-center mt-6">
//         Powered by Kaytop |{" "}
//         <Link href="/terms" className="hover:underline">
//           Terms & Conditions
//         </Link>{" "}
//         |{" "}
//         <Link href="/privacy" className="hover:underline">
//           Privacy Policy
//         </Link>
//       </div>
//     </div>
//   );
// }




