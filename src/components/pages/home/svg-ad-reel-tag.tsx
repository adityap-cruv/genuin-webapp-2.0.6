import { useRef } from 'react'
import { useInView } from 'framer-motion'
import Script from 'next/script'

export function SVGAdReelTag() {
  const svgRef = useRef<SVGSVGElement>(null)
  const isInView = useInView(svgRef, { amount: 1 })

  return (
    <>
      <svg ref={svgRef} width="317" height="651" viewBox="0 0 317 651" fill="none" xmlns="http://www.w3.org/2000/svg">
        <foreignObject xmlns="http://www.w3.org/1999/xhtml" x="7" y="5" width="300" height="600">
          <div
            className="gen-ext"
            data-tag-id="test-rohit"
            data-company-id="1129"
            style={{ height: '596px', width: '298px', marginTop: '3px', margin: 'auto', marginBottom: '40px' }}></div>
        </foreignObject>
        <rect x="3.73063" y="3.52042" width="307" height="604" rx="35" stroke="#16171A" strokeWidth="12" />
        <path
          d="M78.8398 3.60274H263.797V18.1951C263.797 29.0275 255.016 37.8089 244.183 37.8089H98.4536C87.6212 37.8089 78.8398 29.0275 78.8398 18.1951V3.60274Z"
          fill="#16171A"
          stroke="#16171A"
          strokeWidth="1.00583"
        />
        <g filter="url(#filter0_dd_0_5)">
          <rect x="145.008" y="17.5669" width="38.3893" height="5.05122" rx="2.52561" fill="#F8F8F8"></rect>
        </g>
        <rect x="191.479" y="17.5669" width="5.05122" height="5.05122" rx="2.52561" fill="#F8F8F8" />
      </svg>
      {isInView && <Script src="https://genuin-qa-media.s3.us-west-2.amazonaws.com/cxr/gen_ext.min.js" />}
    </>
  )
}
