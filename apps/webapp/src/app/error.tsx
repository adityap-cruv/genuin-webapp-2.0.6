'use client'
import { useRouter } from 'next/navigation';
import { Button } from '@genuin/ui/components/button'
import { ErrorState } from '@genuin/components/molecules/error-state'

export default function Error() {
  const router = useRouter();
  return (
    <div className="h-screen w-screen flex justify-center items-center flex-col gap-3">
        <ErrorState className='gencl:h-fit gencl:w-full' type="GLOBAL_ERROR"/>
        <Button theme="primary" onClick={() => window.location.reload()}>Reload</Button>
    </div>
  )
}
