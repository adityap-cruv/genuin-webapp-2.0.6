import React from 'react' // Import React for creating React components
import style from './communities.module.scss' // Import SCSS styles for the header
import HeadingComponent from '../../heading' // Import typography component for section title
// import ParagraphComponent from '../../paragraph' // Import typography component for paragraphs
import dashboard from '@images/business/brand-page/video-base-communities/dashboard.webp'
import Image from 'next/image'
// import img01 from '@images/business/brand-page/video-base-communities/01.png'
// import img02 from '@images/business/brand-page/video-base-communities/02.png'
// import Genuin from '@images/business/brand-page/video-base-communities/Genuin.png'
// import Discord from '@images/business/brand-page/video-base-communities/Discord.png'
// import Reddit from '@images/business/brand-page/video-base-communities/Reddit.png'
// import Facebook from '@images/business/brand-page/video-base-communities/Facebook.png'
// import Whatsapp from '@images/business/brand-page/video-base-communities/Whatsapp.png'

// export default function VideoBasedCommunities() {
//   return (
//     <section className={style.container}>
//       <HeadingComponent headingLevel={2} title={'Why build short video based Communities?'} colorVariant={'black'} />
//       <div className="flex h-20 w-full items-center justify-between">
//         <div className="w-1/3">
//           <HeadingComponent headingLevel={5} title={'Short video'} colorVariant={'black'} />
//         </div>
//         <div className="w-1/3">
//           <HeadingComponent headingLevel={5} title={'Vs.'} colorVariant={'black'} />
//         </div>
//         <div className="w-1/3">
//           <HeadingComponent headingLevel={5} title={'Text'} colorVariant={'black'} />
//         </div>
//       </div>

//       <div className="flex h-96 w-full items-center justify-between rounded-2xl bg-[#F7F1F9]">
//         <div className="mx-32">
//           <Image priority loading="eager" src={img01} alt={'01'} width={300} className={style.testimonialImg} />
//         </div>
//         <div className="mx-32">
//           <Image priority loading="eager" src={img02} alt={'02'} width={300} className={style.testimonialImg} />
//         </div>
//       </div>

//       <div className="flex w-full items-center justify-between">
//         <div className="mt-4 flex w-1/3 flex-col items-center justify-center gap-4">
//           <HeadingComponent headingLevel={5} title={'Genuin'} colorVariant={'black'} />
//           <Image priority loading="eager" src={Genuin} alt={'01'} width={80} className={style.testimonialImg} />
//         </div>
//         <div className="mt-4 flex w-1/3 flex-col items-center justify-center gap-4">
//           <HeadingComponent headingLevel={5} title={'Other platforms'} colorVariant={'black'} />
//           <div className="flex gap-8">
//             <Image priority loading="eager" src={Discord} alt={'01'} width={80} className={style.testimonialImg} />
//             <Image priority loading="eager" src={Reddit} alt={'01'} width={80} className={style.testimonialImg} />{' '}
//             <Image priority loading="eager" src={Facebook} alt={'01'} width={80} className={style.testimonialImg} />{' '}
//             <Image priority loading="eager" src={Whatsapp} alt={'01'} width={80} className={style.testimonialImg} />
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }

export default function VideoBasedCommunities() {
  return (
    <section className={style.container}>
      <HeadingComponent headingLevel={2} title={'Manage Your First Party Data'} colorVariant={'black'} />
      <div className="mt-12 flex justify-center">
        {/* <img
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          src={dashboard.src}
          alt="genuin"
          className={style.testimonialImg}
        /> */}
        <Image priority loading="eager" src={dashboard} alt={'01'} className={style.testimonialImg} />
      </div>
    </section>
  )
}
