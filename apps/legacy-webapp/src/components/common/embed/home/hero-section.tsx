import { Button } from '@/components/ui/button'
import { PlayIcon } from '@icons/player-controls/play-icon'
import { type HeroSectionType } from '../../../../../types/embed/embed-home'

const ButtonWithIcon = ({
  text,
  icon,
  buttonColor,
  visibility,
}: {
  text: string
  icon: React.ReactNode
  buttonColor: string
  visibility: boolean
}) => {
  if (!visibility) return null

  return (
    <div className="flex cursor-pointer items-center gap-2 rounded-full">
      <div className="rounded-full p-2" style={{ backgroundColor: buttonColor }}>
        {icon}
      </div>
      <p className="text-cap-1-home text-monochrome-black">{text}</p>
    </div>
  )
}

const HeroText = ({ title, caption }: { title: string; caption: string | undefined }) => (
  <>
    <p className="text-new-h1 text-secondary">{title}</p>
    <p className="text-title-2-demi font-medium">{caption}</p>
  </>
)

const HeroSection = ({ heroSection }: { heroSection: HeroSectionType }) => {
  if (!heroSection) return null

  const { title, caption, heroImage, button } = heroSection

  return (
    <>
      {/* Desktop */}
      <section className="hidden pb-20 md:block">
        <div className="flex w-full items-center gap-6">
          <div className="flex w-1/2 flex-col gap-6">
            <HeroText title={title} caption={caption} />
            <div className="flex gap-6">
              <Button className="rounded-full px-6 py-3">
                <p className="text-cap-1-home">{button[0].text}</p>
              </Button>
              <ButtonWithIcon
                text={button[1].text}
                icon={<PlayIcon className="fill-monochrome-black" />}
                buttonColor={button[1].buttonColor ?? '#0645FF'}
                visibility={button[1].visibility ?? false}
              />
            </div>
          </div>
          <div className="w-1/2">
            <img src={heroImage} alt="Hero Image" />
          </div>
        </div>
      </section>

      {/* Mobile */}
      <section className="py-10 md:hidden">
        <div className="flex flex-col items-center gap-6">
          <p className="text-title-1-bold-home-m text-secondary">{title}</p>
          <img src={heroImage} alt="Hero Image" />
          <p className="text-title-3-med font-medium">{caption}</p>
          <div className="flex w-full gap-6">
            <Button className="rounded-full px-6 py-3">
              <p className="text-cap-1-home">{button[0].text}</p>
            </Button>
            <ButtonWithIcon
              text={button[1].text}
              icon={<PlayIcon className="fill-monochrome-black" />}
              buttonColor={button[1].buttonColor ?? '#0645FF'}
              visibility={button[1].visibility ?? false}
            />
          </div>
        </div>
      </section>
    </>
  )
}

export default HeroSection
