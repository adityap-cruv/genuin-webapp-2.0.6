import { ChevronRightIcon } from 'lucide-react'
import { LinkedInIcon } from '@icons/linkedin-icon'
import { TwitterIcon } from '@icons/twitter-icon'
import { type BlogSectionType } from '../../../../../types/embed/embed-blog'
import MultiEmbed from '../multi-embed'

const BlogsSection = ({ blogSection }: { blogSection: BlogSectionType }) => {
  return (
    <>
      <section className="hidden pb-20 md:block">
        <div className="flex w-full gap-14">
          <div className="flex w-3/4 flex-col gap-6">
            <img src={blogSection?.image} alt="blog-image" className="h-auto w-full opacity-40" />
            <div className="flex flex-col gap-4 opacity-40">
              <p className="text-title-1-bold">{blogSection?.blogContent[0].title}</p>
              <p className="text-title-3-med">{blogSection?.blogContent[0].description}</p>
            </div>
            <MultiEmbed type="blog1" />
            {blogSection?.blogContent.slice(1).map((item, index) => (
              <div className="flex flex-col gap-4 opacity-40" key={index}>
                <p className="text-title-1-bold">{item.title}</p>
                <p className="text-title-3-med">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="flex w-1/4 flex-col gap-6">
            <MultiEmbed type="blog2" />

            <p className="px-10 py-5 text-title-1-bold opacity-40">Popular</p>

            {blogSection?.popularBlogs.map((item, index) => (
              <div className="flex flex-col gap-5 p-10 opacity-40" key={index}>
                <p className="flex items-center justify-between gap-4">
                  <span className="text-title-3-demi">{item.blog}</span>
                  <ChevronRightIcon />
                </p>
                <p className="text-body-1-med text-secondary-400">{item.videos}</p>
              </div>
            ))}

            <div className="flex flex-col gap-3 rounded-xl bg-primary p-5 opacity-40">
              <p className="text-title-3-med text-monochrome-white">Share with your community!</p>
              <div className="flex items-center gap-3">
                <LinkedInIcon className="fill-monochrome-white" />
                <TwitterIcon className="fill-monochrome-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 md:hidden">
        <div className="flex w-full gap-14">
          <div className="flex flex-col gap-6">
            <img src={blogSection?.image} alt="blog-image" className="h-auto w-full opacity-40" />
            <div className="flex flex-col gap-4 opacity-40">
              <p className="text-title-1-bold">{blogSection?.blogContent[0].title}</p>
              <p className="text-body-1-med">{blogSection?.blogContent[0].description}</p>
            </div>
            <MultiEmbed type="blog1" />
            {blogSection?.blogContent.slice(1).map((item, index) => (
              <div className="flex flex-col gap-4 opacity-40" key={index}>
                <p className="text-title-1-bold">{item.title}</p>
                <p className="text-body-1-med">{item.description}</p>
              </div>
            ))}

            <div className="flex flex-col gap-6">
              <MultiEmbed type="blog2" />

              <p className="px-10 py-4 text-title-2-bold opacity-40">Popular</p>

              {blogSection?.popularBlogs.map((item, index) => (
                <div className="flex flex-col gap-5 px-10 py-4 opacity-40" key={index}>
                  <p className="flex items-center justify-between gap-4">
                    <span className="text-title-2-demi">{item.blog}</span>
                    <ChevronRightIcon />
                  </p>
                  <p className="text-body-1-med text-secondary-400">{item.videos}</p>
                </div>
              ))}

              <div className="flex flex-col gap-3 rounded-xl bg-primary p-5 opacity-40">
                <p className="text-body-1-med text-monochrome-white">Share with your community!</p>
                <div className="flex items-center gap-3">
                  <LinkedInIcon className="fill-monochrome-white" />
                  <TwitterIcon className="fill-monochrome-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default BlogsSection
