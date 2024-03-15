import { Loader } from '@components/ui/loader'

export function SplashScreen() {
  return (
    <main className="flex h-full w-full items-center justify-center">
      <Loader size="md" />
    </main>
  )
}
