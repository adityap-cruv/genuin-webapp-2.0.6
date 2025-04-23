export interface SubItem {
  label: string
  value: string
}

export type OrderDetailsSectionType =
  | {
      indexTitle: string
      title: string
      captions: string[]
      subItems: SubItem[]
      image: string
    }
  | undefined

export interface OrderItem {
  title: string
  items: string[][]
}

export type InvoiceSectionType =
  | {
      subTitle: string
      title: string
      order: OrderItem
      subtotal: string
    }
  | undefined
