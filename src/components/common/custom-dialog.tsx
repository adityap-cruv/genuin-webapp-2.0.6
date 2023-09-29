import { Dialog, DialogContent, DialogTrigger } from '@components/ui/dialog'

// todo create this component by using radix-ui library which support animation
export function CustomDialog() {
  return (
    <Dialog>
      <DialogTrigger>Trigger from here</DialogTrigger>
      <DialogContent>Triggered response...</DialogContent>
    </Dialog>
  )
}
