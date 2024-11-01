// import { cn } from '@/lib/utils'
// import { type StaticImageData } from 'next/image'
// import { type ComponentProps, type ReactNode, useEffect } from 'react'
// import Image from 'next/image'
// import { useGenuinOptions } from '@/lib/stores/genuin-options'
// import { useLocalStorage } from '@/lib/stores/local-storage'
// import gifChevronUp from '@images/gifs/chevronUp.gif'
// import gifClickGesture from '@images/gifs/clickGesture.png'
// import gifTapGesture from '@images/gifs/tapGesture.png'
// import gifSwipeGesture from '@images/gifs/swipeGesture.png'

// /**
//  * When user comes on website for the first time ksGestures will be shown.
//  * To educate user about the gestures to use the <Feed />.
//  * It will be shown only once. And local-storage will be used to store the state.
//  */
// export function KsGestures() {
//   const { isMobile } = useGenuinOptions()
//   const { updateGestureStep, gestureStep } = useLocalStorage()

//   useEffect(() => {
//     let timeOutId: NodeJS.Timeout | null = setTimeout(() => {
//       updateGestureStep()
//     }, 5000)

//     return () => {
//       if (timeOutId) {
//         clearTimeout(timeOutId)
//         timeOutId = null
//       }
//     }
//   }, [gestureStep])

//   return (
//     <div
//       onClick={updateGestureStep}
//       className={cn(
//         'fixed inset-0 z-[1000] h-full w-full bg-monochrome-black/40 backdrop-blur-sm sm:absolute',
//         gestureStep !== 'play_pause' && 'pointer-events-none'
//       )}>
//       {gestureStep === 'swipe' &&
//         (isMobile ? (
//           <GestureContent
//             image={gifSwipeGesture}
//             text={
//               <>
//                 Swipe up
//                 <br /> to view videos
//               </>
//             }
//           />
//         ) : (
//           <GestureContent
//             className="justify-end pb-20"
//             image={gifChevronUp}
//             text={
//               <>
//                 Swipe up
//                 <br /> to view videos
//               </>
//             }
//           />
//         ))}
//       {gestureStep === 'play_pause' &&
//         (isMobile ? (
//           <GestureContent
//             image={gifTapGesture}
//             text={
//               <>
//                 Tap to play or pause
//                 <br /> the video
//               </>
//             }
//           />
//         ) : (
//           <GestureContent
//             image={gifClickGesture}
//             text={
//               <>
//                 Click to play or pause <br />
//                 the video
//               </>
//             }
//           />
//         ))}
//     </div>
//   )
// }

// type GestureContentPropsType = {
//   image: StaticImageData
//   text: string | ReactNode
// } & ComponentProps<'div'>

// function GestureContent({ image, text, className }: GestureContentPropsType) {
//   return (
//     <div className={cn('flex h-full w-full flex-col items-center justify-center gap-2', className)}>
//       <Image src={image} alt="gif" height={80} width={80} />
//       <p className="text-center text-body-1-bold text-monochrome-white">{text}</p>
//     </div>
//   )
// }
