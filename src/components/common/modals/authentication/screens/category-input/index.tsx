import { Button } from '@components/ui/button'
import { ModalShell } from '../../modal-shell'
import { addTopics, getCategoryList } from './api'
import { useState } from 'react'
import { cn } from '@lib/utils'
import { Loader } from '@components/ui/loader'
import { useAuthenticationModalStore } from '../../store'
import { useSession } from 'next-auth/react'

export function CategoryInput() {
  const [selectedItems, setSelectedItem] = useState<Set<string>>(new Set())
  const [postingTopics, setPostingTopics] = useState(false)
  const { data, isLoading } = getCategoryList()
  const { update: updateSession, data: sessionData } = useSession()
  const { close } = useAuthenticationModalStore((state) => ({ close: state.close }))

  // useEffect(() => {
  //   if (!data) return
  //   const newSet = new Set<string>()
  //   data.forEach((item) => {
  //     item.topics.forEach((item) => {
  //       if (item.is_selected) newSet.add(item.topic_id)
  //     })
  //   })
  //   if (newSet.size > 0) {
  //     setSelectedItem(newSet)
  //   }
  // }, [data])

  return (
    <ModalShell className="max-h-[60vh] pb-0">
      <span className="text-center">
        <p className="text-heading-3">What are you interested in?</p>
        <p className="text-title-3-med text-tertiary">
          Get started by picking three topics you're interested in, to see more of what you love.
        </p>
      </span>
      {isLoading ? (
        <div className="flex h-[40vh] w-full items-center justify-center">
          <Loader size="md" />
        </div>
      ) : (
        <div className="h-full w-full overflow-x-clip overflow-y-scroll">
          {data?.map((item) => {
            return (
              <div className="border-b border-b-tertiary-200 py-4 first:pt-0" key={item.entity_id}>
                <p className="pb-2 text-title-3-demi">{item.title}</p>
                <div className="flex w-full max-w-full flex-wrap overflow-clip">
                  {item.topics.map((item) => {
                    return (
                      <p
                        onClick={(e) => {
                          setSelectedItem((state) => {
                            const newState = new Set([...state.values()])
                            if (newState.has(item.topic_id)) {
                              newState.delete(item.topic_id)
                            } else {
                              newState.add(item.topic_id)
                            }
                            return newState
                          })
                        }}
                        className={cn(
                          'my-1 mr-2 line-clamp-1 w-fit cursor-pointer overflow-hidden break-all rounded-full border border-tertiary-200 px-3 py-1 text-body-1-demi leading-loose',
                          selectedItems.has(item.topic_id) && 'border-primary bg-primary-100'
                        )}
                        key={item.topic_id}>
                        {item.topic}
                      </p>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
      <Button
        onClick={async () => {
          setPostingTopics(true)
          const res = await addTopics([...selectedItems.values()])
          setPostingTopics(false)
          if (res) {
            await updateSession({ ...sessionData, user: { ...sessionData?.user, hasTopics: true } })
            close()
          }
        }}
        className="w-full"
        disabled={selectedItems.size < 3}>
        {postingTopics ? (
          <Loader size="md" className="fill-monochrome-white" />
        ) : (
          <p className="text-title-3-demi">{selectedItems.size < 3 ? 'Choose 3+' : 'Continue'}</p>
        )}
      </Button>
    </ModalShell>
  )
}
