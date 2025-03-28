//layout.js

import { Geist } from 'next/font/google'
import { Geist_Mono } from 'next/font/google'
import { MantineProvider, ColorSchemeScript } from '@mantine/core'
import '@mantine/core/styles.css'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans'
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono'
})

export const metadata = {
  title: "Veed Creator",
  description: "Created by Rashi Gupta",
  icons: {
    icon: '/favicon.ico'
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <ColorSchemeScript />
      </head>
      <body className="antialiased">
        <MantineProvider 
          theme={{
            fontFamily: 'var(--font-geist-sans)',
            fontFamilyMonospace: 'var(--font-geist-mono)',
            primaryColor: 'blue'
          }}
        >
          {children}
        </MantineProvider>
      </body>
    </html>
  )
}