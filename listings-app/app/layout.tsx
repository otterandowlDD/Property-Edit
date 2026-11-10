import type { Metadata } from "next";
export const metadata: Metadata = { title: "Property Edit | Available Properties", description: "Selected rentals and sales in Thailand", robots: { index: false, follow: false } };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="th"><body style={{margin:0,background:"#f8f7f4",color:"#1f2522",fontFamily:"Arial,sans-serif"}}>{children}</body></html>; }
