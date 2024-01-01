import { Loader } from '@components/ui/loader'

export default function Loading() {
  return <Loader size="lg" />
}

//! use it in case of shimmer requirement
// const ShimmerComponent = () => {
//   return (
//     <div className="container my-10 flex h-full min-h-full flex-col  md:flex-row">
//       <div className="flex w-full flex-col items-center md:mx-auto md:w-[25%]">
//         <div className="mt-2 w-full">
//           <Shimmer className="h-12 w-12 rounded-full" />
//           <div className="my-2">
//             <Shimmer className="my-2 h-4 w-full" />
//             <Shimmer className="my-2 h-4 w-[70%]" />
//           </div>
//         </div>
//         <Shimmer className="my-4 h-4 w-full" />
//         <Shimmer className="my-2 h-40 w-full" />
//       </div>
//       <div className="align-items-center my-10 flex h-full w-full justify-center md:px-10">
//         <Shimmer className="h-full w-full" />
//       </div>
//     </div>
//   )
// }
