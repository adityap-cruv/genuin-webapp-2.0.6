import carouselImage from '@images/embed/carousel.png'
import Image from 'next/image'

const CarouselSection = () => {
  return (
    <div>
      <Image src={carouselImage} alt="imgPuppet" />
    </div>
  )
}

export default CarouselSection
