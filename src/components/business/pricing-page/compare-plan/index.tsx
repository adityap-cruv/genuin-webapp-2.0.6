'use client'
import React from 'react'
import Image from 'next/image'
import check from '@icons/business/check.svg'
import dash from '@icons/business/dash.svg'
import content from '../../../../content/pricing-page.json'

export default function ComparePlan() {
  return (
    <div className="my-28">
      <p className="mb-10 text-center text-new-h1-mobile">Compare All Plan Features</p>
      <div className="bg-white sticky top-0 z-10">
        <div className="grid grid-cols-6 rounded-xl bg-[#ADDAFF] px-4 py-6">
          <div className="flex justify-center"></div>
          <div className="flex justify-center text-title-2-bold">Free</div>
          <div className="flex justify-center text-title-2-bold">Starter</div>
          <div className="flex justify-center text-title-2-bold">Essential</div>
          <div className="flex justify-center text-title-2-bold">Pro</div>
          <div className="flex justify-center text-title-2-bold">Enterprise</div>
        </div>
      </div>
      <div className="mt-6 ">
        {content.table.tableData.map((row, index) => (
          <div key={index} className="my-4 rounded-lg border-b border-monochrome-9">
            <div className="grid grid-cols-6 ">
              <div className="flex rounded-tl-lg p-4 text-new-sm font-bold">{row.category}</div>
              <div className="flex justify-center rounded-tl-lg p-4">
                {row.free ? (
                  <Image priority loading="eager" src={check} width={32} height={32} alt="Check" />
                ) : (
                  <Image priority loading="eager" src={dash} width={32} height={32} alt="Check" />
                )}
              </div>
              <div className="flex justify-center p-4">
                {row.starter ? (
                  <Image priority loading="eager" src={check} width={32} height={32} alt="Check" />
                ) : (
                  <Image priority loading="eager" src={dash} width={32} height={32} alt="Check" />
                )}
              </div>
              <div className="flex justify-center p-4">
                {row.essential ? (
                  <Image priority loading="eager" src={check} width={32} height={32} alt="Check" />
                ) : (
                  <Image priority loading="eager" src={dash} width={32} height={32} alt="Check" />
                )}
              </div>
              <div className="flex justify-center p-4">
                {row.pro ? (
                  <Image priority loading="eager" src={check} width={32} height={32} alt="Check" />
                ) : (
                  <Image priority loading="eager" src={dash} width={32} height={32} alt="Check" />
                )}
              </div>
              <div className="flex justify-center rounded-tr-lg p-4">
                {row.enterprise ? (
                  <Image priority loading="eager" src={check} width={32} height={32} alt="Check" />
                ) : (
                  <Image priority loading="eager" src={dash} width={32} height={32} alt="Check" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
