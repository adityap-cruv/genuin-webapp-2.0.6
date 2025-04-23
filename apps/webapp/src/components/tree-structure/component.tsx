import { forwardRef, type ComponentProps } from 'react'
import { TreeStructureProvider } from './context'
import { cn } from '@/lib/utils'

export type TreeStructurePropsType = ComponentProps<'div'> & {
  /**
   * Pass true if tree structure is being rendered in embed
   */
  forEmbed?: boolean
  /**
   * Pass this props if tree-structure is being rendered on the profile/brand self page.
   */
  isSelfUser?: boolean
}

/**
 * This component is used to display the tree structure. for profile/brand page.
 * @returns
 */
export const TreeStructure = forwardRef<HTMLDivElement, TreeStructurePropsType>(function TreeStructure(props, ref) {
  const { isSelfUser, forEmbed, className, children, ...restProps } = props

  return (
    <div ref={ref} className={cn(className)} {...restProps}>
      <TreeStructureProvider forEmbed={forEmbed} isSelfUser={isSelfUser}>
        {children}
      </TreeStructureProvider>
    </div>
  )
})
