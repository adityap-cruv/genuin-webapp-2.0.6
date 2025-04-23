import { useState, createContext, useContext } from 'react'
import { type ShouldPlayType, useBaseContext } from './base'

type BrandType = {
  brand_id: number
  brand_slug: string
  brand_user_logo: number
}

export type OwnerOfCommentType = {
  member_id: string
  name: string
  nickname: string
  bio: string
  is_brand_system_user: boolean
  is_avatar: boolean
  profile_image: string
  profile_image_l?: string
  profile_image_s?: string
  profile_image_m?: string
  brand?: BrandType
}

export type CommentDataType = {
  owner: OwnerOfCommentType
  chat_id: string
  conversation_id: string
  comment_id: string
  type: number
  url: string | null
  video_url_m3u8: string | null
  thumbnail: string | null
  link: string | null
  duration: number | null
  meta_data: unknown | null
  created_at: number
  no_of_views: number
  is_read: boolean
  questions: unknown[]
  comment_text: string
  comment_data: string
  no_of_sparks: number
  is_sparked: boolean
}

type CommentContextType = {
  comments: CommentDataType[]
  activeCommentId: string | null
  playComment: (id: string | null) => void
  pauseComment: () => void
  setComments: React.Dispatch<React.SetStateAction<CommentDataType[]>>
  addComments: (comments: CommentDataType[]) => void
  prependComments: (videoId: string, comments: CommentDataType[]) => void
}

const CommentContext = createContext<CommentContextType>({
  comments: [],
  activeCommentId: null,
  setComments: () => {},
  addComments: () => {},
  prependComments: () => {},
  playComment: () => {},
  pauseComment: () => {},
})

type CommentProviderComponentPropsType = {
  children: React.ReactNode
  renderedIn?: ShouldPlayType
  onCommentCountChange?: (videoId: string, count: number) => void
}

export const CommentProvider = ({
  children,
  renderedIn,
  onCommentCountChange,
}: CommentProviderComponentPropsType) => {
  const [comments, setComments] = useState<any[]>([])
  const { increaseCommentCount, updateShouldPlay } = useBaseContext()
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null)

  return (
    <CommentContext.Provider
      value={{
        comments,
        activeCommentId,
        setComments,
        addComments(comments) {
          setComments((old) => [...old, ...comments])
        },
        prependComments(videoId, newComments) {
          const updatedComments = [...newComments, ...comments]
          setComments(updatedComments)
          // If onCommentCountChange is provided, call it with the updated count, else increaseCommentCount will be called.
          if (onCommentCountChange) {
            onCommentCountChange?.(videoId, updatedComments.length)
          } else {
            increaseCommentCount(videoId, updatedComments.length)
          }
        },
        pauseComment: () => {
          renderedIn && updateShouldPlay(renderedIn)
          setActiveCommentId(null)
        },
        playComment(id) {
          updateShouldPlay('COMMENT')
          setActiveCommentId(id)
        },
      }}>
      {children}
    </CommentContext.Provider>
  )
}

export const useCommentContext = () => {
  const context = useContext(CommentContext)
  if (!context)
    throw new Error(
      'Please use this component inside comment context component.',
    )
  return context
}
