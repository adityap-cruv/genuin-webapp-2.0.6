import { Button } from '@/components/ui/button'
import { ModalShell } from '../../modal-shell'
import { addTopics, type Category, getCategoryList, type Topic } from './api'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { cn } from '@/utils'
import { Loader } from '@/components/loader'
import { type ScreenProps } from '..'
import { useAuth } from '@/context/auth'
import { useMutation } from '@tanstack/react-query'
import { getQueryKeyForCategoryList } from '@/utils/constants/keys'
import { queryClient } from '@/context/react-query'

type TopicType = NonNullable<
  Awaited<ReturnType<typeof getCategoryList>>['data']
>[number]['topics'][number]

type CategoryInputPropsType = ScreenProps & {
  forSettings: boolean
}

async function invalidateCategoryListQuery() {
  await queryClient.invalidateQueries({
    queryKey: getQueryKeyForCategoryList(),
    exact: true,
  })
}

export function CategoryInput({ forSettings, onNext }: CategoryInputPropsType) {
  const { mutate, isPending } = useMutation({
    mutationFn: addTopics,
    onSuccess: async (res) => {
      if (res) {
        updateUser({ hasTopics: true })
        await invalidateCategoryListQuery()
        forSettings
          ? onNext(undefined)
          : onNext(user?.usernameSet ? undefined : 'USERNAME_INPUT')
      } else {
        setError('Failed to add topics. Please try again.')
      }
    },
    onError: () => {
      setError('An error occurred. Please try again later.')
    },
  })

  const [selectedItems, setSelectedItem] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [allTopics, setAllTopics] = useState(false)
  const { data: categoryList, isLoading } = getCategoryList()

  const { updateUser, user } = useAuth()

  const topics = useMemo(
    () =>
      categoryList?.flatMap((category) =>
        category.topics
          .filter((topic) => topic.is_selected)
          .map((topic) => topic.topic_id),
      ),
    [categoryList],
  )

  const [hasChanged, setHasChanged] = useState(false)

  useEffect(() => {
    if (!categoryList) return
    setSelectedItem(new Set(topics))
  }, [categoryList, topics])

  useEffect(() => {
    const selectedTopicsArray = Array.from(selectedItems)
    const topicsArray = topics ?? []
    const isSame =
      selectedTopicsArray.length === topicsArray.length &&
      selectedTopicsArray.every((topic) => topicsArray.includes(topic))
    setHasChanged(!isSame)
  }, [selectedItems, topics])

  const getAllTopicIds = useCallback((categories: Category): string[] => {
    return categories.flatMap((category) =>
      category.topics.map((topic: Topic) => topic.topic_id),
    )
  }, [])

  const handleSubmit = useCallback(
    (allTopics: boolean) => {
      let topics = [...selectedItems.values()]
      setAllTopics(allTopics)

      if (allTopics) {
        topics = getAllTopicIds(categoryList ?? [])
      }

      mutate(topics)
    },
    [selectedItems, categoryList, mutate, getAllTopicIds],
  )

  const handleTopicClick = useCallback((topic: TopicType) => {
    setSelectedItem((state) => {
      const newState = new Set([...state.values()])
      if (newState.has(topic.topic_id)) {
        newState.delete(topic.topic_id)
      } else {
        newState.add(topic.topic_id)
      }
      return newState
    })
  }, [])

  return (
    <ModalShell className='max-h-[60vh] pb-0'>
      {isPending && allTopics ? (
        <div className='flex h-full w-full flex-col items-center justify-center text-center align-middle'>
          <Loader className='mb-2' />
          <p className='text-title-2-demi'>Customizing your feed...</p>
        </div>
      ) : (
        <>
          <div className='text-center'>
            <p className='text-heading-3'>What are you interested in?</p>
            <p className='text-title-3-med text-tertiary'>
              Get started by picking three topics you're interested in, to see
              more of what you love.
            </p>
          </div>
          {isLoading ? (
            <div className='flex h-full w-full items-center justify-center'>
              <Loader />
            </div>
          ) : (
            <div className='h-full w-full overflow-x-clip overflow-y-scroll'>
              {categoryList?.map((item) => {
                return (
                  <div
                    className='border-b border-b-tertiary-200 py-4 first:pt-0'
                    key={item.entity_id}>
                    <p className='pb-2 text-title-3-demi'>{item.title}</p>
                    <div className='flex w-full max-w-full flex-wrap overflow-clip'>
                      {item.topics.map((topic) => {
                        return (
                          <p
                            role='button'
                            tabIndex={0}
                            onClick={() => handleTopicClick(topic)}
                            className={cn(
                              'my-1 mr-2 line-clamp-1 w-fit cursor-pointer overflow-hidden break-all rounded-full border border-tertiary-200 px-3 py-1 text-body-1-demi leading-loose',
                              selectedItems.has(topic.topic_id) &&
                                'bg-primary-200 border-primary dark:bg-primary',
                            )}
                            key={topic.topic_id}>
                            {topic.topic}
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
            onClick={() => {
              handleSubmit(false)
            }}
            className='w-full'
            disabled={selectedItems.size < 3 || !hasChanged}>
            {isPending && !allTopics ? (
              <Loader className='stroke-white fill-white' />
            ) : (
              <p className='text-title-3-demi text-white'>
                {selectedItems.size < 3 ? 'Choose 3+' : 'Continue'}
              </p>
            )}
          </Button>
          <Button
            onClick={() => {
              handleSubmit(true)
            }}
            variant='outline'
            className='h-9 w-full'>
            {isPending && allTopics ? (
              <Loader className='stroke-white fill-white ' />
            ) : (
              <p className='text-title-3-demi'>Surprise Me</p>
            )}
          </Button>
        </>
      )}
      {error && (
        <p
          className='text-new-para-2-mobile flex items-center justify-center text-center text-red-500'
          role='alert'>
          {error}
        </p>
      )}
    </ModalShell>
  )
}
