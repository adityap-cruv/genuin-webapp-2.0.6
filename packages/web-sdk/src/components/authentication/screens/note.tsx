import { getGifLink } from '@/utils'
import { ModalShell } from '../modal-shell'

export function Note({
  title,
  success = true,
}: {
  title: string
  success?: boolean
}) {
  return (
    <ModalShell>
      {success && (
        <img
          height={150}
          width={150}
          style={{
            height: '150px',
            width: '150px',
          }}
          src={getGifLink('success')}
          alt='success'
        />
      )}
      <p
        className='text-center text-title-1-demi'
        style={{ fontSize: '32px' }}>
        {title}
      </p>
    </ModalShell>
  )
}
