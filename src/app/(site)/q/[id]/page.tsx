import { MainComponent } from './main-component'
import { fetchQuestionDetails } from '@lib/api/question'

interface Props {
  params: {
    id: string
  }
  searchParams: {}
}

export default async function Component({ params }: Props) {
  const questionDetails = await fetchQuestionDetails(params.id)
  return <MainComponent questionDetails={questionDetails} />
}
