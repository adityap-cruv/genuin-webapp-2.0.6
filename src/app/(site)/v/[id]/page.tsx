import axios from 'axios'
import { MainComponent } from './main-component'

interface PageProps {
  params: {
    id: string
  }
  searchParams: {
    l: string
  }
}

export const dynamic = 'force-static'

export default async function Component(props: PageProps) {
  console.log('get videos details')
  return <MainComponent />
}
