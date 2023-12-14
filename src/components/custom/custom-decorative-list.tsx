'use client'
export default function CustomDecorativeList({ loopList }: any) {
  return (
    <div>
      <style>
        {`          
              ul li.has-child::before {
                display: none;
              }
              
              ul li::before {
                content: '';
                width: 2em;
                height: 10px;
                border-bottom-left-radius: 10px;
                border-color: red;
                border-bottom: 2px solid #e7e7e7;
                border-left: 2px solid #e7e7e7;
                position: absolute;
                left: -2.1em;
                top: 50%;
                transform: translateY(-100%);
              }
            `}
      </style>
      <ul
        style={{
          borderLeft: '2px solid',
          paddingLeft: '2em',
          marginLeft: '22px',
          height: 'fit-content',
          borderImage: 'linear-gradient(to bottom, #e7e7e7 76%, transparent 75%) 1',
        }}>
        &nbsp;
        {loopList.map((item: any, index: any) => (
          <li className="relative my-4 w-full rounded-lg bg-monochrome-9 p-4 pb-2" key={index}>
            <LoopDetails communityHandle={item} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function LoopDetails({ communityHandle }: any) {
  const videos = ['Video1', 'Video1', 'Video1', 'Video1', 'Video1', 'Video1', 'Video1', 'Video1']
  return (
    <>
      <p className="text-title-sm">{communityHandle}</p>
      <div className="my-2 grid w-full grid-cols-4 gap-2 md:grid-cols-8">
        {videos.map((item: any, index: any) => (
            <div key={index} className="aspect-reel rounded bg-blue-10"></div>
        ))}
      </div>
      <p className="w-full pt-2 text-cap-lg text-monochrome flex justify-center">See N more</p>
    </>
  )
}
