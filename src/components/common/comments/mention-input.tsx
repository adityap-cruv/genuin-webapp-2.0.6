import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createComment, mentionUser } from '@/lib/api/video'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { useWalletBalanceHandler } from '@/services/wallet-handler'
import { Input } from '@/components/ui/input'
import { commentDeepLink } from '@/lib/get-deeplink'
import { cn, openModal } from '@/lib/utils'
import { CustomAvatar } from '@/components/custom/custom-avatar'
import { type SelectedMention, type CommentMention } from '@/lib/schemas/player/comment'
import { type getVideosComments } from '@/lib/api/loop'
import { queryClient } from '@/components/providers/query-client-provider'
import { getQueryKeyForVideoComments } from '@/lib/utils/keys'
import { validateCommentDetails } from '@/lib/schemas/loop/comment'

function prependComment(commentData: any, videoId: string) {
  type QueryDataType = ReturnType<typeof getVideosComments>['data']
  queryClient.setQueryData(getQueryKeyForVideoComments(videoId), (oldData: QueryDataType): QueryDataType => {
    if (!oldData) return
    return {
      ...oldData,
      pages: oldData.pages.map((page, index) => {
        if (index === 0) {
          return { ...page, comments: [commentData, ...page.comments] }
        }
        return page
      }),
    }
  })
}

const MentionInput: React.FC<{
  videoId: string
  loopId: string
  videoSlug: string
  communityId: string
  className?: string
}> = ({ videoId, loopId, videoSlug, className, communityId }) => {
  const { handleWalletBalance } = useWalletBalanceHandler()
  const { user } = useGenuinOptions((state) => ({
    user: state.user,
    isMobile: state.isMobile,
  }))
  const searchParams = Object.fromEntries(useSearchParams())
  const [text, setText] = useState('')
  const [isMentioning, setIsMentioning] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [caretPosition, setCaretPosition] = useState(0)
  const [isPosting, setIsPosting] = useState(false)
  const [filteredMentions, setFilteredMentions] = useState<CommentMention[]>([])
  const [selectedMentions, setSelectedMentions] = useState<SelectedMention[]>([])
  const mentionListRef = useRef<any>(null)
  const textareaRef = useRef<any>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const shouldOpenRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const REGEX_FOR_URLS = /(?:https?:\/\/)?(?:www\.)?[\w-]+(\.[\w-]+)+(\/[^\s]*)?/g

  const postComment = async () => {
    if (!text.trim()) return
    try {
      setIsPosting(true)
      await handleWalletBalance({ action: 'comments', videoId, type: 'POST' })
      const commentData = convertCommentTextToArray(text, selectedMentions)

      const response = await createComment(videoId, loopId, 3, text, commentData)
      if (response.code === 200) {
        if (response.commentData) {
          prependComment(validateCommentDetails(response.commentData), videoId)
        }
        setText('')
        setCaretPosition(0)
        setSelectedMentions([])
        setFilteredMentions([])
      }
    } catch (error) {
      console.error('Failed to post comment', error)
    } finally {
      setIsPosting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, selectionStart } = e.target
    setText(value)
    setCaretPosition(selectionStart ?? 0)

    const textBeforeCaret = value.slice(0, selectionStart ?? 0)
    const mentionMatch = textBeforeCaret.match(/@([\w._]*)$/)
    const urlMatches = value.match(REGEX_FOR_URLS)

    if (mentionMatch) {
      shouldOpenRef.current = true
      setMentionQuery(mentionMatch[1])
      handleMentionSearch(mentionMatch[1])
    } else {
      shouldOpenRef.current = false
      setIsMentioning(false)
      setMentionQuery('')
    }

    if (urlMatches) {
      urlMatches.forEach((url: any) => {
        const isUrlAlreadyAdded = selectedMentions.some((mention: any) => mention.id === url)
        if (!isUrlAlreadyAdded) {
          setSelectedMentions((prev: any) => [...prev, { handle: url, id: url, type: 'url' }])
        }
      })
    }
  }

  const convertCommentTextToArray = (commentText: string, selectedMentions: SelectedMention[]) => {
    const result: Array<string | object> = []
    const words = commentText.split(' ')
    let lastIndex = 0

    words.forEach((word, index) => {
      const matchedMention = selectedMentions.find((mention) => mention.handle === word.trim())

      if (matchedMention) {
        const textBefore = commentText.slice(lastIndex, commentText.indexOf(word, lastIndex))
        if (textBefore.trim()) {
          result.push(textBefore)
        } else if (result.length > 0 && typeof result[result.length - 1] === 'object') {
          result.push(' ')
        }

        if (matchedMention.type === 'member') {
          result.push({ member_id: matchedMention.id, text: matchedMention.handle })
        } else if (matchedMention.type === 'community') {
          result.push({ community_id: matchedMention.id, text: matchedMention.handle, slug: matchedMention.slug })
        } else if (matchedMention.type === 'url') {
          result.push({ url: matchedMention.handle, text: matchedMention.handle })
        }

        lastIndex = commentText.indexOf(word, lastIndex) + word.length
      } else if (index === words.length - 1) {
        const remainingText = ' ' + commentText.slice(lastIndex).trim()
        if (remainingText) {
          result.push(remainingText)
        }
      }
    })

    return result
  }

  const debounce = (callback: () => void, delay: number) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(callback, delay)
  }

  const handleMentionSearch = (query: string) => {
    debounce(async () => {
      // Cancel the previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create a new AbortController
      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        const response = await mentionUser(videoId, query, controller.signal)
        if (response?.code === 200 && shouldOpenRef.current) {
          if (response.data.length !== 0) {
            setFilteredMentions(response.data)
            setIsMentioning(true)
          } else {
            setFilteredMentions([])
            setIsMentioning(false)
          }
        }
      } catch (error) {
        console.error('Error fetching mentions', error)
      }
    }, 300)
  }

  const handleUserSelect = (selected: CommentMention) => {
    if (textareaRef.current) {
      const value = text
      const start = value.slice(0, caretPosition - mentionQuery.length - 1) // Text before "@"
      const end = value.slice(caretPosition) // Text after caret

      const isCommunity = selected.type === 3
      const handle = isCommunity ? selected.community?.handle ?? '' : '@' + selected.user?.nickname
      const id = isCommunity ? selected.community?.community_id ?? '' : selected.user?.member_id ?? ''
      const slug = isCommunity ? selected.community?.slug ?? '' : ''
      const type = isCommunity ? 'community' : 'member'

      const updatedText = `${start}${handle} ${end}`
      setText(updatedText)
      setIsMentioning(false)
      setMentionQuery('')
      setSelectedMentions((prev: any) => [...prev, { handle, id, slug, type }])

      const newCaretPosition = start.length + handle.length + 2
      textareaRef.current.setSelectionRange(newCaretPosition, newCaretPosition)
      textareaRef.current.focus()
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mentionListRef.current && !mentionListRef.current.contains(event.target as Node)) {
        setIsMentioning(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      void postComment();
    }
  }, [postComment]);

  return (
    <div>
      {isMentioning && (
        <div
          ref={mentionListRef}
          className="absolute bottom-16 left-0 z-50 flex max-h-60 w-full flex-col gap-1 overflow-hidden overflow-y-scroll rounded-t-2xl bg-monochrome-white p-3"
          style={{ boxShadow: '0px -4px 11.7px 0px rgba(0, 0, 0, 0.08)' }}>
          {filteredMentions.length > 0 &&
            filteredMentions.map((mention: any) => {
              const isCommunity = mention.type === 3
              const name = isCommunity ? mention.community.name : '@' + mention.user.nickname
              const profileImage = isCommunity ? mention.community.dp : mention.user.profile_image
              const description = isCommunity
                ? mention.community.description
                  ? 'Community ・ ' + mention.community.description
                  : 'Community'
                : mention.user.bio

              return (
                <div
                  key={isCommunity ? mention.community.community_id : mention.user.name}
                  onClick={() => {
                    handleUserSelect(mention)
                  }}
                  className="hover:bg-gray-200 flex flex-1 cursor-pointer items-center gap-x-3 rounded-md p-2">
                  <CustomAvatar
                    imageUrl={profileImage ?? ''}
                    fallbackString={isCommunity ? mention.community.name : mention.user.nickname}
                    isAvatar={false}
                    className="h-11 w-11"
                  />
                  <div className="pr-2">
                    <p className="line-clamp-1 break-all text-title-3-bold">{name}</p>
                    <p className="text-gray-500 line-clamp-1 break-all text-body-1-med">{description}</p>
                  </div>
                </div>
              )
            })}
        </div>
      )}

      <div
        className={cn(
          'absolute bottom-0 left-0 z-50 max-h-16 w-full border-t-2 border-t-tertiary-200 bg-tertiary-200 py-3 shadow-md',
          className
        )}>
        <div className="flex w-full flex-1 items-center gap-x-4 px-4">
          {user ? (
            <div className="w-full">
              <div className="flex items-center rounded-full border border-tertiary-200 bg-monochrome-white px-4">
                <Input
                  ref={textareaRef}
                  placeholder="Add a comment"
                  value={text}
                  maxLength={500}
                  disabled={!user}
                  className="border-none rounded-full pr-4"
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onClick={(e: React.MouseEvent<HTMLInputElement>) => {
                    setCaretPosition(e.currentTarget.selectionStart ?? 0)
                  }}
                  onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    setCaretPosition(e.currentTarget.selectionStart ?? 0)
                  }}
                />

                <button
                  onClick={postComment}
                  disabled={text.trim().length === 0 || isPosting}
                  className={`text-body-1-bold ${
                    text.trim().length === 0 || isPosting ? 'text-primary-600' : 'text-primary'
                  }`}>
                  {isPosting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={async () => {
                await commentDeepLink({ videoSlug, communityId, loopId, searchParams }).then((generatedLink) => {
                  openModal({ deepLink: generatedLink, subtitle: <>Get the app to comment on this video.</> })
                })
              }}
              placeholder="Add a comment"
              className="h-full w-full rounded-full border-2 border-tertiary-200 bg-monochrome-white py-2 pl-6">
              <p className="text-start text-title-3-demi text-tertiary">Add a Comment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MentionInput
