'use client'
import { getLoopDetails } from '@lib/api/loop'
import { useQuery } from '@tanstack/react-query'

export const MainComponent = () => {
  const { data, isLoading } = useQuery({ queryKey: ['loop', 'details'], queryFn: getLoopDetails('17bb88b72c80153b') })
  console.log('data::', data)
  if (isLoading) return <div>loader..</div>
  return <div>{data.chat_id}</div>
}
