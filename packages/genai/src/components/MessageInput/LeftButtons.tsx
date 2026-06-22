import { useState } from 'react';

import { useUIContext } from '@/stores/ui/context';

import Add from '../../assets/SvgIcons/Add';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface LeftButtonsProps {
    isStylesOpen: boolean;
    setIsStylesOpen: (open: boolean) => void;
    onUploadClick: () => void;
    isUploadingFiles: boolean;
}

// const BackgroundMusicOption = ({ bgm }: { bgm: VideoStyleOption }) => {
//     const audioRef = useRef<HTMLAudioElement | null>(null);
//     const [isPlaying, setIsPlaying] = useState(false);

//     useEffect(() => {
//         const audio = audioRef.current;
//         if (!audio) return;

//         const handleEnded = () => setIsPlaying(false);
//         audio.addEventListener('ended', handleEnded);

//         return () => {
//             audio.removeEventListener('ended', handleEnded);
//         };
//     }, []);

//     const handleTogglePlay = () => {
//         const audio = audioRef.current;
//         if (!audio) return;

//         if (isPlaying) {
//             audio.pause();
//             setIsPlaying(false);
//         } else {
//             audio.play();
//             setIsPlaying(true);
//         }
//     };

//     return (
//         <div className='gai:flex gai:h-9 gai:w-full gai:max-w-[237px] gai:flex-row gai:items-center gai:gap-2 gai:rounded-xl gai:px-2'>
//             <button
//                 type='button'
//                 onClick={handleTogglePlay}
//                 className='gai:flex gai:h-5 gai:w-5 gai:items-center gai:justify-center gai:rounded-full gai:bg-secondary-gray-900 gai:backdrop-blur-[1.5px]'
//             >
//                 {isPlaying ? (
//                     <Pause className='gai:h-2.5 gai:w-2.5 gai:text-utility-white' />
//                 ) : (
//                     <Play className='gai:h-2.5 gai:w-2.5 gai:text-utility-white' />
//                 )}
//             </button>
//             <span className='gai:flex-1 gai:truncate gai:font-body-1-med gai:text-primary-500'>{bgm.name}</span>
//             <audio ref={audioRef} src={bgm.url} className='gai:hidden' />
//         </div>
//     );
// };

export const LeftButtons = ({ onUploadClick, isUploadingFiles }: LeftButtonsProps) => {
    const { brand_id } = useUIContext();

    const [isAddPopoverOpen, setIsAddPopoverOpen] = useState(false);
    return (
        <div className='gai:flex gai:items-center gai:gap-2'>
            {brand_id === -1 ? (
                <Popover open={isAddPopoverOpen} onOpenChange={setIsAddPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button size={'icon'} variant={'tools'}>
                            <Add />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className='gai:w-80 gai:rounded-2xl gai:border gai:border-primary-100 gai:shadow-none gai:md:w-96'
                        side='top'
                        align='start'
                    >
                        <div className='gai:space-y-4'>
                            <div className='gai:space-y-2'>
                                <h4 className='gai:font-body-0-semi gai:text-secondary-gray-900'>
                                    Try advanced features for free
                                </h4>
                                <p className='gai:font-body-1-med gai:text-secondary-gray-700'>
                                    Get your brand and community related responses, upload files, voice, select GenAI
                                    agents, and many more by logging in.
                                </p>
                            </div>
                            <div className='gai:flex gai:gap-2 gai:font-body-1-semi'>
                                <Button
                                    variant={'ghost'}
                                    className='gai:border gai:border-primary-100'
                                    onClick={() => {
                                        const currentSessionId = new URLSearchParams(window.location.search).get(
                                            'sessionId'
                                        );
                                        window.location.href = `${process.env.NEXT_PUBLIC_BCC_URL}/login?${currentSessionId ? `sessionId=${currentSessionId}` : ''}`;
                                    }}
                                >
                                    Login
                                </Button>
                                <Button
                                    onClick={() => {
                                        const currentSessionId = new URLSearchParams(window.location.search).get(
                                            'sessionId'
                                        );
                                        window.location.href = `${process.env.NEXT_PUBLIC_BCC_URL}/login?${currentSessionId ? `sessionId=${currentSessionId}` : ''}`;
                                    }}
                                >
                                    Start for free
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            ) : (
                <Popover open={isAddPopoverOpen} onOpenChange={setIsAddPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button size={'icon'} variant={'tools'}>
                            <Add />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className='gai:w-50 gai:rounded-2xl gai:border gai:border-primary-100 gai:p-2 gai:shadow-lg'
                        side='top'
                        align='start'
                    >
                        <div className='gai:space-y-2'>
                            <div className='gai:flex gai:flex-col gai:gap-1'>
                                <Button
                                    variant={'ghost'}
                                    className='gai:cursor-pointer gai:justify-start gai:font-body-1-semi gai:hover:bg-primary-50'
                                    onClick={() => {
                                        onUploadClick();
                                        setIsAddPopoverOpen(false);
                                    }}
                                    disabled={isUploadingFiles}
                                >
                                    Upload files
                                </Button>
                                {/* <Button
                                    variant={'ghost'}
                                    className='gai:cursor-pointer gai:justify-start gai:font-body-1-semi gai:hover:bg-primary-50'
                                    onClick={() => {
                                        const videoAgent = agents.find(a => a.slug === 'video_generator_agent');
                                        if (videoAgent) {
                                            setCurrentAgent(videoAgent.id);
                                        }
                                        setIsAddPopoverOpen(false);
                                    }}
                                >
                                    Generate video
                                </Button> */}
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            )}

            {/* {currentAgentSlug === 'video_generator_agent' && (
                <>
                    <Button variant={'tools'} size='tools' className='gai:cursor-pointer'>
                        <span className='gai:font-body-1-semi gai:text-primary-500'>Video</span>
                        <Close className='gai:size-4' onClick={() => {
                            const bccAgent = agents.find(a => a.slug === 'bcc_octo_head');
                            if (bccAgent) {
                                setCurrentAgent(bccAgent.id);
                            }
                        }} />
                    </Button>
                    <DropdownMenu open={isStylesOpen} onOpenChange={setIsStylesOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant={'tools'}
                                size={'tools'}
                                className='gai:flex gai:cursor-pointer gai:flex-row gai:items-center gai:gap-1'
                            >
                                <Freehand
                                    className={`gai:size-4 ${videoStyles.some(style => style.selected) && 'gai:text-primary-500'}`}
                                />
                                <span
                                    className={`gai:font-body-1-semi ${videoStyles.some(style => style.selected) && 'gai:text-primary-500'}`}
                                >
                                    Styles
                                </span>
                                <ChevronDown
                                    className={`gai:size-3 gai:transition-transform ${videoStyles.some(style => style.selected) && 'gai:text-primary-500'} ${!isStylesOpen ? '' : 'gai:rotate-180'}`}
                                />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className='gai:flex gai:w-[253px] gai:flex-col gai:gap-1 gai:rounded-2xl gai:border gai:border-primary-100 gai:p-2 gai:shadow-[0px_4px_10px_5px_rgba(6,69,255,0.05)]'
                            side='top'
                            align='start'
                        >
                            {videoStyles.map((style, styleIndex) =>
                                style.options ? (
                                    <DropdownMenuSub key={style.name}>
                                        <DropdownMenuSubTrigger
                                            disabled={style.disabled}
                                            className={`gai:flex gai:cursor-pointer gai:flex-row gai:items-center gai:gap-2 gai:rounded-xl gai:p-2 ${
                                                style.selected ? 'gai:bg-primary-100' : 'gai:hover:bg-primary-50'
                                            } ${style.disabled ? 'gai:opacity-50 gai:cursor-not-allowed' : ''}`}
                                        >
                                            <span className='gai:flex-1 gai:font-body-1-med gai:text-secondary-gray-900'>
                                                {style.name}
                                            </span>
                                            {
                                                style.disabled && (
                                                    <span className='gai:font-body-1-med gai:text-secondary-gray-500'>
                                                        Coming soon
                                                    </span>
                                                )
                                            }
                                            {style.selected && style.options.some(opt => opt.selected) && (
                                                <span className='gai:font-body-2-med gai:text-primary-500'>
                                                    {style.options.find(opt => opt.selected)?.name}
                                                </span>
                                            )}
                                            <ChevronRight className='gai:size-4 gai:text-secondary-gray-600' />
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent
                                            className='gai:flex gai:max-h-[250px] gai:w-50 gai:flex-col gai:gap-1 gai:overflow-y-auto gai:rounded-2xl gai:border gai:border-primary-100 gai:p-2'
                                            sideOffset={12}
                                        >
                                            {style.options.map((option, optionIndex) => (
                                                <DropdownMenuItem
                                                    key={option.name}
                                                    className={`gai:flex gai:cursor-pointer gai:flex-col gai:items-start gai:gap-2 gai:rounded-xl gai:p-1 ${
                                                        option.selected ? 'gai:bg-primary-100' : 'gai:hover:bg-primary-50'
                                                    }`}
                                                    onSelect={e => {
                                                        e.preventDefault();
                                                        toggleOptionSelection(styleIndex, optionIndex);
                                                    }}
                                                >
                                                    {(() => {
                                                        switch (style.field) {
                                                            case 'captions':
                                                                return (
                                                                    <div className='gai:w-full gai:max-w-[250px]'>
                                                                        <img
                                                                            src={option.url}
                                                                            alt={option.name}
                                                                            className='gai:h-auto gai:w-full gai:rounded-lg gai:object-contain'
                                                                        />
                                                                    </div>
                                                                );
                                                            case 'background_music':
                                                                return <BackgroundMusicOption bgm={option} />;
                                                            default:
                                                                return (
                                                                    <span
                                                                        className={`gai:font-body-1-med ${
                                                                            option.selected
                                                                                ? 'gai:text-primary-500'
                                                                                : 'gai:text-secondary-gray-900'
                                                                        }`}
                                                                    >
                                                                        {option.name}
                                                                    </span>
                                                                );
                                                        }
                                                    })()}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                ) : (
                                    <DropdownMenuItem
                                        key={style.name}
                                        className={`gai:flex gai:cursor-pointer gai:flex-row gai:items-center gai:gap-2 gai:rounded-xl gai:p-2 gai:hover:bg-primary-50 ${
                                            style.selected ? 'gai:bg-primary-50' : ''
                                        }`}
                                        onSelect={e => {
                                            e.preventDefault();
                                            toggleStyleSelection(styleIndex);
                                        }}
                                    >
                                        <span className='gai:flex-1 gai:font-body-1-med gai:text-secondary-gray-900'>
                                            {style.name}
                                        </span>
                                        <ToggleSwitch
                                            checked={style.selected}
                                            onChange={() => toggleStyleSelection(styleIndex)}
                                        />
                                    </DropdownMenuItem>
                                )
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            )} */}
        </div>
    );
};
