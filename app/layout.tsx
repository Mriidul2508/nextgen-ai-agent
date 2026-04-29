import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Optimized font loading
const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'NextGen AI | The Ultimate Conversational AI Agent',
  description: 'Automate customer support and scale sales with a powerful conversational AI agent. Deploy a voice AI assistant and AI chatbot to drive true AI automation.',
  keywords: ['Conversational AI agent', 'AI chatbot', 'voice AI assistant', 'AI automation', 'customer support AI'],
  openGraph: {
    title: 'NextGen AI | Conversational AI Agent',
    description: 'Stop losing customers to slow responses. Automate your business with an intelligent AI chatbot and voice assistant.',
    url: 'https://your-vercel-domain.com',
    siteName: 'NextGen AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NextGen AI | Conversational AI Agent',
    description: 'Automate customer support and scale sales with a powerful conversational AI agent.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}