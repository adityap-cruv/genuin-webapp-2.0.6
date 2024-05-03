'use client'
import { GenuinIcon } from '@icons/genuin-icon'
import { useSearchParams } from 'next/navigation'

export default function Component() {
  const searchParams = Object.fromEntries(useSearchParams())
  const brandName = searchParams?.brand_name ? searchParams?.brand_name : 'Genuin'
  const brandLogo = searchParams?.brand_logo

  return (
    <>
      <div className="w-full p-6">
        {brandLogo ? <img src={brandLogo} className="h-12" /> : <GenuinIcon.logo className="h-12" />}
        <br />
        <h2 className="text-title-1-bold">Brand Guidelines</h2>
        <br />
        <span className="text-body-1-med">
          Welcome to {brandName}! As you get settled, we wanted to introduce you to our Platform Guidelines. To keep{' '}
          {brandName} a space for authentic connection and ongoing learning, here are a few ground rules, you, as a
          user, acknowledge and agree to by using this platform.
        </span>
        <br />
        <br />
        <span className="text-body-1-bold">Learn together: </span>
        <span className="text-body-1-med">
          {brandName} is all about learning and sharing knowledge with people who share your interests, passions, and
          experiences. We prioritize content that helps us to learn and grow together.
        </span>
        <br />
        <br />
        <span className="text-body-1-bold">Be Authentic: </span>
        <span className="text-body-1-med">
          Let's keep it genuine (see what we did there?) and secure. Do not impersonate another person or entity on
          {brandName}, and refrain from misrepresenting your expertise or title.
        </span>
        <br />
        <br />
        <span className="text-body-1-bold">Keep conversations respectful: </span>
        <span className="text-body-1-med">
          As humans, we don't always agree, and that's ok. We welcome sharing of opinions and respectful dialogue which
          means that we lead with positive intent and choose curiosity over conflict. Harassment and hate speech have no
          place here.
        </span>
        <br />
        <br />
        <span className="text-body-1-bold">Respect the privacy of your fellow users: </span>
        <span className="text-body-1-med">
          Do not reveal confidential or personal identifier information about another person or entity while on{' '}
          {brandName}.
        </span>
        <br />
        <br />
        <span className="text-body-1-bold">Enforcement</span>
        <br />
        <span className="text-body-1-med">We will enforce these guidelines as needed in the following manners :</span>
        <ul
          className="p-4"
          style={{
            listStyle: 'inside',
          }}>
          <li className="text-body-1-med">Ask you nicely to abide by our rules</li>
          <li className="text-body-1-med">Remove offending content</li>
          <li className="text-body-1-med">Limitation or termination of a user or community's access to {brandName}</li>
          <li className="text-body-1-med">If illegal activity is reported, we may notify relevant law enforcement.</li>
        </ul>
      </div>
    </>
  )
}
