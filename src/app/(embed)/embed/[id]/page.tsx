type Props = {
  params: {
    id: string
  }
}

export default function Page(props: Props) {
  console.log('props::', props)
  return <div>Hello world from embed</div>
}
