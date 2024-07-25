interface ActionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function ActionItem({ children, onClick, title, ...props }: ActionItemProps) {
  return (
    <div onClick={onClick} title={title} className="my-2 cursor-pointer" {...props}>
      {children}
    </div>
  )
}
