import React from "react";
import "../styles/globals.css";
import patterns from "@/public/patterns.png";
<<<<<<< HEAD
=======
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Kaytop App",
    default: "Welcome / The Kaytop App",
  },
  description:
    "Kaytop is a modern multipurpose investment platform that enables users to invest confidently, access financing, and grow wealth with ease.",
  // metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
  icons: {
    icon: "/logo.png",
  },
};

>>>>>>> 35af71aa7f763dc0adb3b3153c877668ec307350


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        style={{ backgroundImage: `url(${patterns.src})` }}
<<<<<<< HEAD
        className="flex items-center justify-center min-h-screen bg-no-repeat bg-bottom-right bg-bg"
=======
        className="flex items-center justify-center min-h-screen bg-no-repeat bg-bottom-right bg-neutral-100"
>>>>>>> 35af71aa7f763dc0adb3b3153c877668ec307350
      >
        {children}
      </body>
    </html>
  );
}
