export const MainComponent = () => {
  return (
    <>
      <Component1 />
      <Component2 />
    </>
  )
}

function Component1() {
  return (
    <div
      id="initial-component"
      className="min-h-full pt-navbar"
      style={{ background: 'radial-gradient(123.19% 48.8% at 76.02% 69.05%, #E9CAF4 0%, #ADD8FB 100%)' }}>
      <div className="container">
        <p>Community, reimagined. Learn, connect and engage — all under one roof.</p>
        <p>
          Download Genuin to create communities, interact with your audience, and start conversations on the topics that
          really matter.
        </p>
      </div>
    </div>
  )
}

function Component2() {
  return <div className="bg-bg-monochrome-white min-h-full w-auto">Compoennt 2</div>
}
