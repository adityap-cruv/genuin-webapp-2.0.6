import CollapseSidebar from '@/assets/SvgIcons/CollapseSidebar';
import ExpandSidebar from '@/assets/SvgIcons/ExpandSidebar';
import { useAgentsContext } from '../../context/app/context';
import Item from './SidebarItem';
import Spinner from '../ui/spinner';
import type { Session } from '@/types';
import NewChat from '@/assets/SvgIcons/NewChat';

const Sidebar = () => {
    const { isSidebarCollapsed, setIsSidebarCollapsed, sessions, sessionsFetched, enteredInChatMode, handleNewChat } =
        useAgentsContext();
    const ToggleButton = isSidebarCollapsed ? ExpandSidebar : CollapseSidebar;

    if (isSidebarCollapsed) {
        return (
            <div
                onClick={() => setIsSidebarCollapsed(false)}
                className='gai:flex gai:h-10 gai:w-10 gai:cursor-pointer gai:items-center gai:justify-center gai:rounded-md gai:text-secondary-gray-700 gai:hover:bg-primary-100 gai:hover:text-secondary-gray-900'
            >
                <ToggleButton />
            </div>
        );
    }

    const sessionsArray = Object.values(sessions);

    function filterSessionsByDate(sessions: Session[]): {
        todaySessions: Session[];
        previous7DaysSessions: Session[];
    } {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOf7DaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);

        let todaySessions = sessions.filter(session => {
            const updatedAt = new Date(session.updatedAt);
            return updatedAt >= startOfToday;
        });

        let previous7DaysSessions = sessions.filter(session => {
            const updatedAt = new Date(session.updatedAt);
            return updatedAt >= startOf7DaysAgo && updatedAt < startOfToday;
        });

        todaySessions = todaySessions.sort(
            (s1, s2) => new Date(s2.updatedAt).getTime() - new Date(s1.updatedAt).getTime()
        );

        previous7DaysSessions = previous7DaysSessions.sort(
            (s1, s2) => new Date(s2.updatedAt).getTime() - new Date(s1.updatedAt).getTime()
        );

        return { todaySessions, previous7DaysSessions };
    }

    const { todaySessions, previous7DaysSessions } = filterSessionsByDate(sessionsArray);

    return (
        <div className='gai:flex gai:h-full gai:flex-col gai:bg-primary-50'>
            <div className='gai:flex gai:w-full gai:items-center gai:justify-between gai:px-4 gai:py-2'>
                <div className='gai:h-10 gai:w-10'>
                    <div
                        onClick={() => setIsSidebarCollapsed(true)}
                        className='gai:flex gai:h-full gai:w-full gai:cursor-pointer gai:items-center gai:justify-center gai:rounded-md gai:text-secondary-gray-700 gai:hover:bg-primary-100 gai:hover:text-secondary-gray-900'
                    >
                        <ToggleButton />
                    </div>
                </div>
                {enteredInChatMode && (
                    <div className='gai:h-10 gai:w-10'>
                        <div
                            onClick={() => {
                                handleNewChat();
                            }}
                            className='gai:flex gai:h-full gai:w-full gai:cursor-pointer gai:items-center gai:justify-center gai:rounded-md gai:text-secondary-gray-700 gai:hover:bg-primary-100 gai:hover:text-secondary-gray-900'
                        >
                            <NewChat />
                        </div>
                    </div>
                )}
            </div>
            <div className='gai:scrollbar-hide gai:flex gai:flex-1 gai:flex-col gai:gap-1 gai:overflow-y-auto gai:px-2'>
                {!sessionsFetched ? (
                    <div className='gai:flex gai:h-full gai:w-full gai:items-center gai:justify-center'>
                        <Spinner size='md' />
                    </div>
                ) : (
                    <>
                        {/* if no sessions, show a message */}
                        {todaySessions.length === 0 && previous7DaysSessions.length === 0 && (
                            <div className='gai:flex gai:h-full gai:w-full gai:items-center gai:justify-center'>
                                <div className='gai:p-2 gai:font-body-1-med gai:text-secondary-gray-600'>
                                    No sessions found
                                </div>
                            </div>
                        )}
                        {todaySessions.length > 0 && (
                            <div className='gai:flex gai:flex-col gai:gap-1'>
                                <div className='gai:p-2 gai:font-body-1-med gai:text-secondary-gray-600'>Today</div>
                                {todaySessions.map(session => (
                                    <Item key={session.id} session={session} />
                                ))}
                            </div>
                        )}
                        {previous7DaysSessions.length > 0 && (
                            <div className='gai:flex gai:flex-col gai:gap-1'>
                                <div className='gai:p-2 gai:font-body-1-med gai:text-secondary-gray-600'>
                                    Previous 7 days
                                </div>
                                {previous7DaysSessions.map(session => (
                                    <Item key={session.id} session={session} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
