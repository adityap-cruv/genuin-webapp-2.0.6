'use client'
import { AlignJustify, ChevronRight } from 'lucide-react'
// import { GenuinIcon } from '../old/genuin-icon'
import { GenuinIcon } from '@icons/genuin-icon'
import CustomButton from './custom-button'
import { PATH_NAME } from '@/lib/utils/constants/path'
// import { PATH_NAME } from '@/lib/paths'
// import { ContactUs } from '../old/contact-us'
import { ContactUs } from '../common/modals/contact-us'
// import { BCC_LOGIN_LINK } from '@/lib/const'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import Link from 'next/link'
import { BCC_LOGIN_LINK } from '@/lib/constants'
import { Button } from '../ui/button'

export function NavBar() {
  return (
    <>
      <nav
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.40)',
          backdropFilter: 'blur(5px)',
          borderBottom: '1px solid #DEE2E6',
        }}
        className="fixed top-0 z-20 box-border hidden w-full lg:flex">
        <div className="box-border flex w-full items-center justify-between p-4">
          <div className="flex items-center gap-8">
            <Link href={PATH_NAME.index()}>
              <GenuinIcon.logo className="fill-white" style={{ height: 32, width: 115 }} />
            </Link>
            <Link
              href={PATH_NAME.mediaNetwork}
              className="text-white pl-4 text-cap-1-demi-home transition-all hover:scale-105 hover:text-blue">
              For Media Networks
            </Link>
            <Link
              href={PATH_NAME.brands()}
              className="text-white text-cap-1-demi-home transition-all hover:scale-105 hover:text-blue">
              For Brands
            </Link>
            <Link
              href={PATH_NAME.creators()}
              className="text-white text-cap-1-demi-home transition-all hover:scale-105 hover:text-blue">
              For Creators
            </Link>
            <Link
              href={PATH_NAME.about()}
              className="text-white text-cap-1-demi-home transition-all hover:scale-105 hover:text-blue">
              About us
            </Link>
            <Link
              href={PATH_NAME.explore()}
              className="text-white text-cap-1-demi-home transition-all hover:scale-105 hover:text-blue">
              Discover
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ContactUs>
              <p className="text-white text-cap-1-demi-home font-extrabold transition-all hover:scale-105 hover:text-blue">
                Contact Us
              </p>
            </ContactUs>
            <div style={{ width: '1px' }} className="bg-white h-full">
              &nbsp;
            </div>
            <Link href={BCC_LOGIN_LINK} target="_blank" rel="noopener noreferrer">
              <p className="text-white text-cap-1-demi-home font-extrabold transition-all hover:scale-105 hover:text-blue">
                Login
              </p>
            </Link>
            <Link href={BCC_LOGIN_LINK} target="_blank" rel="noopener noreferrer">
              <CustomButton
                variant="blue"
                className="px-6 py-4 text-cap-1-bold-home font-extrabold leading-none"
                radius="rounded-full">
                Start for free
              </CustomButton>
            </Link>
          </div>
        </div>
      </nav>
      <nav
        className="flex items-center justify-between px-5 py-3 lg:hidden"
        style={{
          backgroundColor: 'rgba(9, 10, 27, 0.40)',
          backdropFilter: 'blur(5px)',
          borderBottom: '1px solid #DEE2E6',
        }}>
        <Link href={PATH_NAME.index()}>
          <GenuinIcon.icon height={36} width={36} className="fill-blue" />
        </Link>
        <div className="flex h-full items-center gap-2 lg:hidden">
          <Link href={PATH_NAME.mediaNetwork}>
            <div
              className="flex items-center rounded-full py-3 pl-3 pr-2"
              style={{ backgroundColor: 'rgba(248, 249, 250, 0.20)' }}>
              <p className=" h-min text-[14px] font-semibold leading-none">For Media Networks</p>
              <ChevronRight className="stroke-blue" />
            </div>
          </Link>
          <Sheet>
            <SheetTrigger>
              <div className="h-full rounded-[26px] px-2 py-3" style={{ backgroundColor: 'rgba(248, 249, 250, 0.20)' }}>
                <AlignJustify height={24} width={28} className="stroke-black" />
              </div>
            </SheetTrigger>
            <Content />
          </Sheet>
        </div>
      </nav>
    </>
  )
}

const linkData = [
  {
    link: PATH_NAME.mediaNetwork,
    text: 'For Media Networks',
  },
  {
    link: PATH_NAME.brands(),
    text: 'For Brands',
  },
  {
    link: PATH_NAME.creators(),
    text: 'For Creators',
  },
  {
    link: PATH_NAME.explore(),
    text: 'Discover Communities',
  },
  {
    link: PATH_NAME.about(),
    text: 'About us',
  },
]

function Content() {
  return (
    <SheetContent side="right" className="w-full">
      <GenuinIcon.icon className="fill-blue" height={32} width={32} />
      <div className="flex flex-col">
        {linkData.map((data, index) => {
          return <Item key={index} link={data.link} text={data.text} />
        })}
      </div>
      <div className="absolute bottom-0 left-0 w-full">
        <BottomBar />
      </div>
    </SheetContent>
  )
}

function Item({ link, text }: { link: string; text: string }) {
  return (
    <Link
      href={link}
      className="flex w-full items-center justify-between py-5"
      style={{ borderBottom: '1px dashed #DEE2E6' }}>
      <p className="text-cap-1-bold-home leading-none">{text}</p>
      <ChevronRight className="stroke-black" />
    </Link>
  )
}

export function BottomBar() {
  return (
    <>
      <div
        style={{ borderColor: '#DEE2E6', backgroundColor: '#F8F9FA' }}
        className="hidden w-min items-center gap-6 whitespace-nowrap rounded-full border py-1 pl-6 pr-2 text-cap-1-demi-home lg:flex">
        <p>Input your MAUs to see the incremental revenue potential</p>
        <Link href={'#revenue-calculator'}>
          <CustomButton variant="blue" className="px-4 py-2 text-cap-1-bold-home" radius="rounded-full" showIcon>
            Calculate
          </CustomButton>
        </Link>
      </div>
      <div
        className="flex w-full items-center justify-center gap-2 py-3 lg:hidden"
        style={{ backgroundColor: 'rgba(9, 10, 27, 0.20)', borderTop: '1px solid #DEE2E6' }}>
        <Button className="items-center rounded-full bg-blue py-3 pl-4 pr-3">
          <p className="text-white text-[14px] font-extrabold">Get Started</p>
          <ChevronRight className="stroke-white" />
        </Button>
        <ContactUs>
          <div className="flex items-center gap-2 pl-6 pr-2">
            <p className="text-white text-cap-1-demi-home">Contact Us</p>
            <ChevronRight className="stroke-white" />
          </div>
        </ContactUs>
      </div>
    </>
  )
}
