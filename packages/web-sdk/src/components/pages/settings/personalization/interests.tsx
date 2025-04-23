import { AuthenticationModal } from '@/components/authentication'
import { ListItem } from '../list-item'
import { getCategoryList } from '@/components/authentication/screens/category-input/api'
import { Loader } from '@/components/loader'
import { useMemo } from 'react'
import { ChevronRightIcon } from '@/components/icons/chevron-right'

export function Interests() {
  const { data: categoryList, isLoading } = getCategoryList()

  const textToShow = useMemo(() => {
    if (!categoryList) return
    const { selectedCount, totalTopics } = categoryList.reduce(
      (acc, category) => {
        acc.selectedCount += category.topics.filter(
          (topic) => topic.is_selected,
        ).length
        acc.totalTopics += category.topics.length
        return acc
      },
      { selectedCount: 0, totalTopics: 0 },
    )
    const isAllSelected = selectedCount === totalTopics
    return isAllSelected ? 'All selected' : `${selectedCount} Categories`
  }, [categoryList])

  return (
    <ListItem
      title='Interests'
      showRightElement
      className='border-b py-4 rounded-none border-tertiary-300'
      onClick={() => {
        AuthenticationModal.open(undefined, 'CATEGORY_SELECTION_SETTINGS')
      }}
      rightElement={
        <div className='flex items-center gap-x-2'>
          {isLoading ? (
            <Loader className='h-4 w-4' />
          ) : (
            <p className='break-all whitespace-nowrap !text-title-3-demi'>
              {textToShow}
            </p>
          )}
          <ChevronRightIcon className='h-6 w-6 shrink-0' />
        </div>
      }
    />
  )
}
