import { useSearchBarStore } from './store'
import { Recents } from './views/recents'
import Suggestions from './views/suggestions'
import TabsView from './views/tabs'

export function SearchBody() {
  const { view } = useSearchBarStore()

  if (view === 'SUGGESTION') return <Suggestions />
  if (view === 'TABS') return <TabsView />
  if (view === 'RECENT') return <Recents />
}
