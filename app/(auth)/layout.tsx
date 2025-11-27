import React from "react";
import "../globals.css";
import patterns from "@/public/patterns.png";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        style={{ backgroundImage: `url(${patterns.src})` }}
        className="flex  justify-center items-center min-h-screen bg-no-repeat bg-bottom-right bg-bg"
      >
        {children}
      </body>
    </html>
  );
}
