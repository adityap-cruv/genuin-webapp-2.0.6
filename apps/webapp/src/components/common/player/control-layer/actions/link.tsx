/**
 * Component that displays a link action button.
 * When clicked, it opens the attached link in a new tab.
 */
import { checkAndAppendHttps } from '@lib/utils'
import icLinkout from '@icons/player-controls/icLinkout.svg'
import Link from 'next/link'
import Image from 'next/image'
import { ActionItem } from './action-item'

type LinkActionProps = {
  /** URL to open when clicking this action */
  attachedLink: string
}

export function LinkAction({ attachedLink }: LinkActionProps) {
  // Don't render anything if there's no link
  if (!attachedLink) return

  return (
    <Link href={checkAndAppendHttps(attachedLink)} target="_blank">
      <ActionItem title="Click Here!">
        <Image src={icLinkout} alt="link" className="h-8 w-8 shrink-0" height={32} width={32} />
      </ActionItem>
    </Link>
  )
}
