import type { Metadata } from "next"; import "./globals.css";
export const metadata: Metadata = { title:"Packaged Heat Competition", description:"Guess how many rooms this plate heat exchanger can heat and enter to win." };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
