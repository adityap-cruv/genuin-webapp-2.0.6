import { Loader } from '@/components/loader'
import { NotFoundView } from '@/components/not-found-view'
import { getUserDetails } from '@/components/pages/settings/api'
import { EditProfile } from '@/components/pages/settings/edit/edit-profile'

type EditPagePropsType = {
  /**
   * User's nickname
   */
  nickname: string
}

export function EditPage({ nickname }: EditPagePropsType) {
  const {
    isLoading,
    data: profileDetails,
    isError,
    error,
    isFetching,
  } = getUserDetails(nickname)

  if (isLoading || isFetching)
    return (
      <div className='h-full w-full flex items-center justify-center'>
        <Loader />
      </div>
    )

  if (isError || error || !profileDetails) return <NotFoundView type='user' />

  return <EditProfile profileDetails={profileDetails} />
}
