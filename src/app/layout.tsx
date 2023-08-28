import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

// todo configure next font for optimization
// todo create servcices
// todo create basic layout
// todo create font pallete
