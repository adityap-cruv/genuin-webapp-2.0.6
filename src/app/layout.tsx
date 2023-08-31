import '../utils/common/globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Genuin Inc.</title>
      </head>
      <body className="bg-yellow-400  flex justify-center">{children}</body>
    </html>
  )
}

// todo configure next font for optimization
// todo create servcices
// todo create basic layout
// todo create font pallete
