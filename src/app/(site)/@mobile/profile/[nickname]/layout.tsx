export default function Layout({ children }: { children: React.ReactNode }) {
  return <section className="absolute h-full w-full px-1 md:px-0">{children}</section>
}
