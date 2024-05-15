import { Dialog, DialogContent } from '@components/ui/dialog'
import { useRepostModalStore } from './state'

export function Body() {
  const { isOpen } = useRepostModalStore((state) => ({ isOpen: state.isOpen }))
  return (
    <Dialog open={isOpen} modal>
      <DialogContent showClose={false} className="">
        <div>this is content</div>
      </DialogContent>
    </Dialog>
  )
}
