'use client'
import React from 'react'
import Image from 'next/image'
import style from './comparePlan.module.scss'
import HeadingComponent from '@components/business/heading'
import check from '@icons/business/check.svg'
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
            <tr>
              <td colSpan={6} style={{ fontSize: '32px', fontWeight: 600 }}>
                Category
              </td>
            </tr>
            {content.table.tableData.map((row, index) => (
              <tr key={index}>
                <td data-label="Category">{row.category}</td>
                <td data-label="Free">
                  {row.free && <Image priority loading="eager" src={check} width={32} height={32} alt="Check" />}
                </td>
                <td data-label="Starter">
                  {row.starter && <Image priority loading="eager" src={check} width={32} height={32} alt="Check" />}
                </td>
                <td data-label="Essential">
                  {row.essential && <Image priority loading="eager" src={check} width={32} height={32} alt="Check" />}
                </td>
                <td data-label="Pro">
                  {row.pro && <Image priority loading="eager" src={check} width={32} height={32} alt="Check" />}
                </td>
                <td data-label="Enterprise">
                  {row.enterprise && <Image priority loading="eager" src={check} width={32} height={32} alt="Check" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
