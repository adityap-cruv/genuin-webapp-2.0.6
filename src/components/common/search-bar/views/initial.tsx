import { useSearchBarStore } from '../store'

export default function Initial() {
  return (
    <div className="relative h-full w-full">
      <Bottom />
    </div>
  )
}

function Bottom() {
  const { setView } = useSearchBarStore()
  return (
    <div className="absolute bottom-0 flex h-10 w-full items-center justify-center border-t">
      <p
        className="cursor-pointer text-body-1-bold"
        onClick={() => {
          setView('TABS')
        }}>
        See all results
      </p>
    </div>
  )
}
