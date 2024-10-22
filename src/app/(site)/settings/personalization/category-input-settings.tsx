import { Button } from '@components/ui/button'
import { ModalShell } from '../../../../components/common/modals/authentication/modal-shell'
import { addTopics } from '../../../../components/common/modals/authentication/screens/category-input/api'
import { useState } from 'react'
import { cn } from '@lib/utils'
import { Loader } from '@components/ui/loader'

export function CategoryInputSettings({
  CategoryData,
  isLoading,
  selectedItems,
  setSelectedItem,
  onClose,
}: {
  CategoryData: any
  isLoading: boolean
  selectedItems: Set<string>
  setSelectedItem: (items: any) => void
  onClose: () => void
}) {
  const [postingTopics, setPostingTopics] = useState(false)
  const [error, setError] = useState('')

  const toggleTopicSelection = (topicId: string) => {
    setSelectedItem((prevState: Set<string>) => {
      const newState = new Set(prevState)
      if (newState.has(topicId)) {
        newState.delete(topicId)
      } else {
        newState.add(topicId)
      }
      return newState
    })
  }

  async function handleSubmit() {
    setPostingTopics(true)
    const res = await addTopics([...selectedItems])
    if (res) {
      onClose()
    } else {
      setError('Please try again.')
    }
    setPostingTopics(false)
  }

  return (
    <ModalShell className="max-h-[60vh] pb-0">
      <span className="text-center">
        <p className="text-heading-3">Interests</p>
        <p className="text-title-3-med text-tertiary">
          Choose 3 or more topics you're interested in, and we'll suggest posts you'll love.
        </p>
      </span>
      {isLoading ? (
        <div className="flex h-[40vh] w-full items-center justify-center">
          <Loader size="md" />
        </div>
      ) : (
        <div className="my-2 h-full w-full overflow-x-clip overflow-y-scroll">
          {CategoryData?.map((item: any) => (
            <div className="border-b border-b-monochrome-9 py-4 first:pt-0" key={item.entity_id}>
              <p className="pb-2 text-title-3-demi">{item.title}</p>
              <div className="flex w-full max-w-full flex-wrap overflow-clip">
                {item.topics.map((topic: any) => (
                  <p
                    onClick={() => {
                      toggleTopicSelection(topic.topic_id)
                    }}
                    className={cn(
                      'my-1 mr-2 line-clamp-1 w-fit cursor-pointer overflow-hidden break-all rounded-full border border-monochrome-9 px-3 py-1 text-body-1-demi leading-loose',
                      selectedItems.has(topic.topic_id) && 'border-primary bg-primary-100'
                    )}
                    key={topic.topic_id}>
                    {topic.topic}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <Button onClick={handleSubmit} className="w-full" disabled={selectedItems.size < 3}>
        {postingTopics ? (
          <Loader size="md" className="fill-monochrome-white" />
        ) : (
          <p className="text-title-3-demi">{selectedItems.size < 3 ? 'Choose 3+' : 'Save'}</p>
        )}
      </Button>
      {error && (
        <p className="text-text-new-para-2-mobile flex items-center justify-center text-center text-supplementary-red">
          {error}
        </p>
      )}
    </ModalShell>
  )
}
