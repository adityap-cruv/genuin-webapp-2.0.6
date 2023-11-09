interface Props {
  children: React.ReactNode
}

//todo fix navbar for this page.
export default function Layout({ children }: Props) {
  return (
    <main className="absolute left-0 top-0 h-full w-full">
      <section className="h-full w-full">
        <div className="h-full w-full overflow-hidden xl:container">{children}</div>
      </section>
    </main>
  )
}
