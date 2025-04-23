import { ListItem } from '../list-item'
import { NotificationSwitch } from './notification-switch'
import { Interests } from './interests'

export function PersonalizationMenu() {
  return (
    <div className='p-4'>
      <ListItem
        className='border-b py-4 rounded-none border-tertiary-300'
        title='Group Notifications'
        showRightElement={true}
        rightElement={<NotificationSwitch />}
      />
      <Interests />
    </div>
  )
}
