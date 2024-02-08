'use client'
import React from 'react'
import Image from 'next/image'
import style from './comparePlan.module.scss'
import HeadingComponent from '@components/business/heading'
import check from '@icons/business/check.svg'
import dash from '@icons/business/dash.svg'
import content from '../../../../content/pricing-page.json'

export default function ComparePlan() {
  return (
    <section className={style.container}>
      <div className={style.row}>
        <HeadingComponent headingLevel={2} title={content.table.title} colorVariant={'black'} />
      </div>
      <div className={style.tableContainer}>
        <table className={style.responsiveTable}>
          <thead>
            <tr>
              <th>&nbsp;</th>
              <th>Free</th>
              <th>Starter</th>
              <th>Essential</th>
              <th>Pro</th>
              <th>Enterprise</th>
            </tr>
          </thead>
          <tbody>
            {content.table.tableData.map((row, index) => (
              <tr key={index}>
                <td data-label="Category" className="text-new-sm font-bold">
                  {row.category}
                </td>
                <td data-label="Free">
                  <div className="flex justify-center">
                    {row.free ? (
                      <Image priority loading="eager" src={check} width={32} height={32} alt="Check" />
                    ) : (
                      <Image priority loading="eager" src={dash} width={32} height={32} alt="Check" />
                    )}
                  </div>
                </td>
                <td data-label="Starter">
                  <div className="flex justify-center">
                    {row.starter ? (
                      <Image priority loading="eager" src={check} width={32} height={32} alt="Check" />
                    ) : (
                      <Image priority loading="eager" src={dash} width={32} height={32} alt="Check" />
                    )}
                  </div>
                </td>
                <td data-label="Essential">
                  <div className="flex justify-center">
                    {row.essential ? (
                      <Image priority loading="eager" src={check} width={32} height={32} alt="Check" />
                    ) : (
                      <Image priority loading="eager" src={dash} width={32} height={32} alt="Check" />
                    )}
                  </div>
                </td>
                <td data-label="Pro">
                  <div className="flex justify-center">
                    {row.pro ? (
                      <Image priority loading="eager" src={check} width={32} height={32} alt="Check" />
                    ) : (
                      <Image priority loading="eager" src={dash} width={32} height={32} alt="Check" />
                    )}
                  </div>
                </td>
                <td data-label="Enterprise">
                  <div className="flex justify-center">
                    {row.enterprise ? (
                      <Image priority loading="eager" src={check} width={32} height={32} alt="Check" />
                    ) : (
                      <Image priority loading="eager" src={dash} width={32} height={32} alt="Check" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
