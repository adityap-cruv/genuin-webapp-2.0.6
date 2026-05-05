import NewChat from '../../assets/SvgIcons/NewChat';

import { Button } from './button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './dialog';

interface NewChatDialogProps {
    currentSessionId: string | null;
    onNewChat: () => void;
}

export function NewChatDialog({ currentSessionId, onNewChat }: NewChatDialogProps) {
    return (
        <Dialog>
            <DialogTrigger className='gai:outline-none'>
                <div
                    className='gai:flex gai:h-10 gai:w-10 gai:cursor-pointer gai:items-center gai:justify-center gai:rounded-md gai:text-secondary-gray-700 gai:hover:bg-primary-100 gai:hover:text-secondary-gray-900'
                    title='New chat'
                >
                    <NewChat />
                </div>
            </DialogTrigger>
            <DialogContent className='gai:flex gai:w-[520px] gai:flex-col gai:items-start gai:gap-5 gai:rounded-2xl gai:border-none gai:bg-white gai:p-8 gai:pb-5'>
                <DialogHeader className='gai:flex gai:w-full gai:flex-col gai:items-start gai:gap-6'>
                    <DialogTitle className='gai:text-primary-gray-900 gai:flex gai:h-8 gai:w-full gai:items-center gai:font-headline-4-semi'>
                        Clear current chat?
                    </DialogTitle>
                    <DialogDescription className='gai:w-full gai:text-left gai:font-body-1-med gai:text-secondary-gray-900 gai:md:font-body-0-semi'>
                        To start a chat with a new agent, your current conversation will be discarded.{' '}
                        <span className='gai:font-body-1-bold gai:md:font-body-0-bold'>Sign up</span> or{' '}
                        <span className='gai:font-body-1-bold gai:md:font-body-0-bold'>log in</span> to save chats.
                    </DialogDescription>
                </DialogHeader>

                <div className='gai:flex gai:w-full gai:flex-row gai:items-center gai:justify-center gai:gap-4 gai:md:justify-end'>
                    <a
                        href={`${process.env.NEXT_PUBLIC_BCC_URL}/login?${currentSessionId ? `sessionId=${currentSessionId}` : ''}`}
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        <Button variant={'ghost'} className='gai:bg-none gai:font-body-0-med gai:hover:bg-primary-50'>
                            Log in
                        </Button>
                    </a>

                    <Button className='gai:font-body-0-med' onClick={onNewChat}>
                        Clear Chat
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
