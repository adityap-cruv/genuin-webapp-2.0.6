export type SearchTopSection =
  | {
      searchInputText: string
      searchResultText: string
      button: SearchButton[]
      searchItemType: number
      searchItemsTop: SearchItem[]
      searchItemsBottom: SearchItem[]
    }
  | undefined

export type SearchButton = {
  text: string
  variant: any
}

export type SearchItem = {
  image: string
  title: string
  caption: string
  price: string
  time: string
  highlightedText?: string
  button?: SearchButton[]
}
