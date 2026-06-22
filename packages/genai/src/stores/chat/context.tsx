import { createContext, useContext } from 'react';

import type { ChatContextType } from '@/modules/chat/types';

/** React context for the chat domain. */
export const ChatContext = createContext<ChatContextType | undefined>(undefined);

/**
 * Returns the nearest `ChatProvider` context value.
 * Throws if called outside of a `ChatProvider`.
 */
export function useChatContext(): ChatContextType {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider');
  return ctx;
}
