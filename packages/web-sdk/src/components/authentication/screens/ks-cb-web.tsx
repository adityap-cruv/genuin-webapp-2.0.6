import { ModalShell } from '../modal-shell'
import { AppStoreTab } from '@/components/icons/app-store-tab'
import { PlayStoreTab } from '@/components/icons/play-store-tab'
import { URL_TO_APP_STORE, URL_TO_PLAY_STORE } from '@/const'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'
import { GenuinIcon } from '@/components/icons/genuin-icon'
import { QRCode } from 'react-qrcode-logo'
import { KsCbSlides } from '../components/ks-cb-slides'

export function KsToCbWeb() {
  const pathName = usePathNameWithSubdomain()
  const logoImageDataUrl =
    "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M100 0C44.7783 0 0.222931 44.3332 0.000709297 99.5552C-0.165957 144.333 29.0562 182.333 69.5005 195.277C88.5004 201.333 109.334 192.777 117.834 174.722C120.5 169.055 122 162.722 122 155.999V154.111C122 152.388 120.278 151.166 118.667 151.777C112.5 153.999 105.834 155.166 98.8892 154.999C68.8893 154.388 44.7228 129.444 45.0005 99.4441C45.2783 69.3331 69.8338 44.9998 100 44.9998C130.389 44.9998 155 69.6109 155 99.9996V155.999C155 167.277 152.556 177.999 148.222 187.61C179.111 170.611 200 137.722 200 99.9996C200 44.7776 155.222 0 100 0Z' fill='%230645FF'/%3E%3C/svg%3E"

  return (
    <ModalShell className='max-w-[450px] sm:min-w-[450px]'>
      <KsCbSlides />
      <div
        className='flex max-h-40 w-full items-center rounded-lg bg-[#F8F8F8] px-4 py-3'
        style={{
          background:
            'linear-gradient(30deg, #E9CAF4 5%, #F8F8F8 50%, #ADDAFF 100%)',
        }}>
        <div className='flex w-[65%] flex-col gap-2'>
          <p className='text-cap-1-bold'>
            Ready to embark on{' '}
            <span className='font-semibold'>your community</span> building
            journey?
          </p>
          <div className='flex items-center'>
            <p className='text-cap-1-med'>Download the</p>
            <div>
              <a
                target='_blank'
                href={pathName.home()}>
                <GenuinIcon.logo className='mr-2 h-4 w-16 fill-black' />
              </a>
            </div>
            <p className='text-cap-1-med'>app.</p>
          </div>
          <div className='flex gap-x-2'>
            <a
              href={URL_TO_APP_STORE}
              target='_blank'
              rel='noopener noreferrer'>
              <AppStoreTab />
            </a>
            <a
              href={URL_TO_PLAY_STORE}
              target='_blank'
              rel='noopener noreferrer'>
              <PlayStoreTab />
            </a>
          </div>
        </div>
        <div className='flex w-[35%] flex-col items-center justify-center'>
          <div className='h-1 w-[100px] rounded-t-md bg-background '></div>
          <QRCode
            value='https://qabegenuin.page.link/a7Td'
            size={80}
            qrStyle='dots'
            logoImage={logoImageDataUrl}
            logoHeight={20}
            logoWidth={20}
            eyeRadius={10}
            logoOpacity={1}
            logoPaddingStyle='circle'
            removeQrCodeBehindLogo={true}
            style={{ borderRadius: '100px' }}
          />
          <div
            className='w-[100px] rounded-b-md bg-background p-0.5 pt-0 text-center'
            style={{
              fontSize: '10px',
            }}>
            Scan to download
          </div>
        </div>
      </div>
    </ModalShell>
  )
}
