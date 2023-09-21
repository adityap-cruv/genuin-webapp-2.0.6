import './globals.css'
import { NextAuthProvider } from '@components/providers/nextAuthProvider'
import { ReactQueryProvider } from '@components/providers/reactQueryProvider'
export const metadata = {
  title: 'Genuin Inc.',
  description: 'Working on new web application.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className=" flex min-h-screen bg-yellow-400 justify-center h-full w-full">
        <main>
          <ReactQueryProvider>
            <NextAuthProvider>{children}</NextAuthProvider>
          </ReactQueryProvider>
        </main>
      </body>
    </html>
  )
}

// todo configure next font for optimization
// todo create servcices
// todo create basic layout
// todo env variables are not working fix
