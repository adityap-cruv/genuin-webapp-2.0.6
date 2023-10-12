interface Props {
  children: React.ReactNode
}

export function CommunityDetails({ children }: Props) {
  return (
    <div className="min-w-tablet flex h-full w-full justify-between ">
      <div className="w-1/3">This contains profile data..</div>
      {children}
      <div className="w-1/3">Moderators this side.</div>
    </div>
  )
}
