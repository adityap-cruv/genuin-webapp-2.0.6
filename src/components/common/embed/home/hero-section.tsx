import { Button } from '@/components/ui/button'
import { PlayIcon } from '@icons/player-controls/play-icon'
import { type HeroSectionType } from '../../../../../types/embed/embed-home'

const HeroSection = ({ heroSection }: { heroSection: HeroSectionType }) => {
  if (!heroSection) return null

  const ActionButtons = () => (
    <div className="flex gap-6">
      <Button className="rounded-full px-6 py-3">
        <p className="text-cap-1-home">{heroSection.button[0].text}</p>
      </Button>
      <div className="flex cursor-pointer items-center gap-2 rounded-full">
        <div className=" rounded-full p-2" style={{ backgroundColor: heroSection.button[1].buttonColor }}>
          <PlayIcon className="fill-monochrome-black" />
        </div>
        <p className="text-cap-1-home text-monochrome-black">{heroSection.button[1].text}</p>
      </div>
    </div>
  )

  const HeroText = ({ title, caption }: { title: string; caption: string | undefined }) => (
    <>
      <p className="text-new-h1 text-secondary">{title}</p>
      <p className="text-title-2-demi font-medium">{caption}</p>
    </>
  )

  return (
    <>
      {/* Desktop */}
      <section className="hidden py-20 opacity-40 md:block">
        <div className="flex w-full items-center gap-6">
          <div className="flex w-1/2 flex-col gap-6">
            <HeroText title={heroSection.title} caption={heroSection.caption} />
            <ActionButtons />
          </div>
          <div className="w-1/2">
            <img src={heroSection.heroImage} alt="Hero Image" />
          </div>
        </div>
      </section>

      {/* Mobile */}
      <section className="py-10 opacity-40 md:hidden">
        <div className="flex flex-col items-center gap-6">
          <p className="text-title-1-bold-home-m text-secondary">{heroSection.title}</p>
          <img src={heroSection.heroImage} alt="Hero Image" />
          <p className="text-title-2-demi font-medium">{heroSection.caption}</p>
          <ActionButtons />
        </div>
      </section>
    </>
  )
}

export default HeroSection
