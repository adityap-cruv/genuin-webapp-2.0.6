// types.ts
export type PDPSection =
  | {
      title: string
      caption: string
      price: string
      category: PDPCategory[]
      button: PDPButton[]
      image: string
    }
  | undefined

export type PDPCategory = {
  label: string
  value: string
}

export type PDPButton = {
  text: string
  variant: any
}
