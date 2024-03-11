import { NavBar } from '@components/common/nav-bar'
import { verifyEmail } from '@lib/api/verify-email'
import Image from 'next/image'
import imgSuccess from '@images/verify-email/success.svg'
import imgError from '@images/verify-email/error.svg'

export default async function Page({ searchParams }: { searchParams: { token: string } }) {
  const data = await verifyEmail(searchParams.token)
  console.log(data)

  return (
    <>
      <NavBar variant="light" isMobile={false} />
      <section className="h-full w-full bg-monochrome-11">
        <div className="flex h-full items-center justify-center">
          <div className="flex max-w-full flex-col items-center justify-center rounded-xl bg-monochrome-white sm:max-w-sm md:max-w-lg">
            <div className="flex flex-col items-center justify-center px-4 py-12">
              <Image src={data.error ? imgError : imgSuccess} height={125} width={125} alt="status image." />
              <p style={{ fontSize: '32px', lineHeight: '48px' }} className="p-4 text-center font-bold">
                {data.title}
              </p>
              <p className="p-4 text-center text-title-3-demi">{data.subtitle}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
