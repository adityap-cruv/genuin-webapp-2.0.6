import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useRudderEvents } from '@/adapters/analytics/useRudderAnalytics';
import Delete from '@/assets/SvgIcons/Delete';
import Edit from '@/assets/SvgIcons/Edit';
import Options from '@/assets/SvgIcons/Options';
import Share from '@/assets/SvgIcons/Share';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { eventBus } from '@/core/events/EventBus';
import { EVENTS } from '@/core/events/eventRegistry';
import { deleteSessionV2 } from '@/services/api';
import { useSessionContext } from '@/stores/session/context';
import type { Session } from '@/types';

const Item = ({ session }: { session: Session }) => {
    const { currentSessionId, setCurrentSessionId, updateSessionName, removeSession, ipInfo } = useSessionContext();
    const { track } = useRudderEvents();

    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingSessionId === session.id && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingSessionId, session.id]);

    const enterEditMode = () => {
        setCurrentSessionId(session.id);
        setEditValue(session.name);
        setEditingSessionId(session.id);
        setOpenDropdownId(null);
    };

    const handleRename = () => {
        if (editValue.trim() === '') {
            setEditValue(session.name);
            return;
        }

        setEditingSessionId(null);
        setEditValue('');
        updateSessionName(session.id, editValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleRename();
        } else if (e.key === 'Escape') {
            setEditValue(session.name);
            setEditingSessionId(null);
        }
    };

    const isEditing = editingSessionId === session.id;
    const isDropdownOpen = openDropdownId === session.id;

    return (
        <div
            onClick={() => {
                if (currentSessionId === session.id) {
                    return;
                }
                setCurrentSessionId(session.id);
            }}
            className={`gai:group gai:relative gai:cursor-pointer gai:rounded-lg gai:p-2 gai:leading-[0px] gai:hover:bg-primary-100 ${
                currentSessionId === session.id ? 'gai:bg-primary-100' : ''
            }`}
        >
            {isEditing ? (
                <input
                    ref={inputRef}
                    type='text'
                    className='focus:gai:outline-none gai:w-full gai:border-none gai:bg-transparent gai:p-0 gai:font-body-1-med gai:text-secondary-gray-900 gai:outline-none'
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={handleRename}
                    onKeyDown={handleKeyDown}
                />
            ) : (
                <span
                    className={`gai:block gai:w-full gai:truncate gai:font-body-1-med gai:text-secondary-gray-900 gai:group-hover:pr-6 ${
                        isDropdownOpen ? 'gai:pr-6' : ''
                    }`}
                >
                    {session.name}
                </span>
            )}

            {!isEditing && (
                <DropdownMenu
                    open={isDropdownOpen}
                    onOpenChange={isOpen => setOpenDropdownId(isOpen ? session.id : null)}
                    modal={false}
                >
                    <DropdownMenuTrigger asChild>
                        <button
                            className={`gai:absolute gai:top-1/2 gai:right-2 gai:-translate-y-1/2 gai:opacity-0 gai:outline-0 gai:transition-opacity gai:group-hover:opacity-100 gai:hover:bg-transparent ${
                                isDropdownOpen ? 'gai:opacity-100' : ''
                            }`}
                        >
                            <Options className='gai:h-4 gai:w-4 gai:text-secondary-gray-600' />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align='end'
                        side='bottom'
                        className='gai:absolute gai:top-2 gai:left-[-20px] gai:min-w-[140px] gai:rounded-xl gai:border gai:border-primary-100'
                    >
                        <DropdownMenuItem
                            onClick={() => {
                                if (ipInfo) {
                                    track('genai:session_shared', {
                                        ipInfo,
                                        session_id: session.id,
                                    });
                                }
                                eventBus.emit(EVENTS.SHARE_LINK, {
                                    sessionId: session.id,
                                });
                                toast.success('Copied to clipboard');
                            }}
                            className='gai:font-body-1-med gai:text-secondary-gray-900 gai:focus:bg-primary-50'
                        >
                            <Share className='gai:mr-2' />
                            Share
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={enterEditMode}
                            className='gai:font-body-1-med gai:text-secondary-gray-900 gai:focus:bg-primary-50'
                        >
                            <Edit className='gai:mr-2' />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant='destructive'
                            onClick={async () => {
                                try {
                                    removeSession(session.id);
                                    await deleteSessionV2(session.id);
                                } catch (error) {
                                    console.error('Failed to delete session:', error);
                                    toast.error('Failed to delete session');
                                }
                            }}
                            className='gai:font-body-1-med gai:text-secondary-gray-900 gai:focus:bg-primary-50'
                        >
                            <Delete className='gai:mr-2' />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
};

export default Item;
