import './globals.css'
import { NextAuthProvider } from '../../providers/next_auth_provider'

export const metadata = {
  title: 'Genuin Inc.',
  description: 'Working on new web application.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className=" flex min-h-screen bg-yellow-400 justify-center h-full w-full" style={{ height: '100%', width: '100%' }}>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  )
}

// todo configure next font for optimization
// todo create servcices
// todo create basic layout
// todo create font pallete
