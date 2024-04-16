import { useSearchBarStore } from './store'
import InitialView from './views/initial'
import TabsView from './views/tabs'

export function SearchBody() {
  const { view } = useSearchBarStore()
  if (view === 'INITIAL') return <InitialView />
  if (view === 'TABS') return <TabsView />
}
