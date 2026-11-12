import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Siftly — Internships that actually fit",
  description:
    "An AI matcher that scores every new internship against your profile and resume, so you spend time applying instead of searching.",
};

// Runs inline before React hydrates to set data-theme from localStorage.
// Defaults to dark for first-time visitors.
const THEME_INIT_SCRIPT = `(function(){try{var c=localStorage.getItem('siftly.theme');var t;if(c==='light'||c==='dark'){t=c}else if(c==='system'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}else{t='dark'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','dark')}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" data-theme="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
