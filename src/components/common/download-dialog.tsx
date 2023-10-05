import { Dialog, DialogContent, DialogTrigger } from '@components/ui/dialog'

interface Props {
  trigger?: React.ReactNode
  title?: React.ReactNode
  subtitle?: React.ReactNode
}

export function DownloadDialog({ trigger, subtitle, title }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <div>
          <p>{title}</p>
          <p>{subtitle}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
