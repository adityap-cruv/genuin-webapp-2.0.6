import Link from 'next/link'
import { Button } from '@genuin/ui/button'
export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="mb-4 text-2xl font-bold">Page Not Found</h2>
      <p className="mb-6 text-gray-600">The page you are looking for doesn't exist or has been moved.</p>
      <Link href="/">
        <Button>Return Home</Button>
      </Link>
    </div>
  )
}