import { type ComponentProps } from 'react'

// Define the Props type which extends the default SVG properties and includes optional className and strokeClassName
type Props = ComponentProps<'svg'> & { className?: string; strokeClassName?: string }

// BurgerIcon component renders a burger menu icon using SVG
export function BurgerIcon({
  className = 'stroke-monochrome-black', // Default class for the SVG element
  strokeClassName = 'stroke-monochrome-black', // Default class for the stroke of the paths
  ...props // Spread the remaining props to the SVG element
}: Props) {
  return (
    <svg
      width="24" // Set the width of the SVG
      height="24" // Set the height of the SVG
      viewBox="0 0 24 24" // Define the viewbox for the SVG
      fill="none" // No fill color for the SVG
      xmlns="http://www.w3.org/2000/svg" // SVG namespace
      className={className} // Apply the className to the SVG element
      {...props} // Spread the remaining props to the SVG element
    >
      {/* First line of the burger icon */}
      <path
        d="M2 18.0031H22" // Define the path for the line
        stroke="white" // Set the stroke color to white
        strokeWidth="1.5" // Set the stroke width
        strokeLinecap="round" // Set the stroke line cap to round
        strokeLinejoin="round" // Set the stroke line join to round
        className={strokeClassName} // Apply the strokeClassName to the path
      />
      {/* Second line of the burger icon */}
      <path
        d="M2 12.0031H22" // Define the path for the line
        stroke="white" // Set the stroke color to white
        strokeWidth="1.5" // Set the stroke width
        strokeLinecap="round" // Set the stroke line cap to round
        strokeLinejoin="round" // Set the stroke line join to round
        className={strokeClassName} // Apply the strokeClassName to the path
      />
      {/* Third line of the burger icon */}
      <path
        d="M2 6.00305H22" // Define the path for the line
        stroke="white" // Set the stroke color to white
        strokeWidth="1.5" // Set the stroke width
        strokeLinecap="round" // Set the stroke line cap to round
        strokeLinejoin="round" // Set the stroke line join to round
        className={strokeClassName} // Apply the strokeClassName to the path
      />
    </svg>
  )
}
