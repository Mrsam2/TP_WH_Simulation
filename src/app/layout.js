import "./globals.css";

export const metadata = {
  title: "Webhook Simulator",
  description: "Fire signed AppX webhook events to your Tracko backend for integration testing.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <main>{children}</main>
      </body>
    </html>
  );
}
