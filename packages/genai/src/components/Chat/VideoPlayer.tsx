import { useEffect, useRef, useState } from 'react';

import { Pause, Play, VolumeOff, VolumeOn } from '@/assets/SvgIcons/icons';

interface VideoPlayerProps {
    videoUrl: string;
    thumbnailUrl?: string;
}

const VideoPlayer = ({ videoUrl, thumbnailUrl }: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(true);
    // const [currentTime, setCurrentTime] = useState(0);
    // const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        // const handleTimeUpdate = () => setCurrentTime(video.currentTime);
        // const handleLoadedMetadata = () => setDuration(video.duration);

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        // video.addEventListener('timeupdate', handleTimeUpdate);
        // video.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            // video.removeEventListener('timeupdate', handleTimeUpdate);
            // video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, []);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(!isMuted);
        }
    };

    // const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    //     if (videoRef.current) {
    //         const rect = e.currentTarget.getBoundingClientRect();
    //         const x = e.clientX - rect.left;
    //         const percentage = x / rect.width;
    //         videoRef.current.currentTime = percentage * duration;
    //     }
    // };

    return (
        <div className='gai:mb-3 gai:w-full gai:max-w-[257.62px]'>
            <div
                className='gai:relative gai:flex gai:flex-col gai:items-end gai:overflow-hidden gai:rounded-lg gai:bg-black'
                style={{
                    width: '257.62px',
                    height: '458px',
                }}
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => isPlaying && setShowControls(false)}
            >
                <video
                    ref={videoRef}
                    className='gai:absolute gai:inset-0 gai:h-full gai:w-full gai:object-cover'
                    playsInline
                    preload='metadata'
                    poster={thumbnailUrl}
                    onClick={togglePlay}
                >
                    <source src={videoUrl} type='video/mp4' />
                </video>

                {/* Top bar with gradient overlay */}
                {showControls && (
                    <div
                        className='gai:absolute gai:top-0 gai:z-10 gai:flex gai:w-full gai:flex-row gai:items-start gai:gap-1 gai:p-2'
                        style={{
                            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%)',
                            height: '40px',
                        }}
                    >
                        <div className='gai:flex gai:flex-row gai:items-center gai:gap-2'>
                            {/* Play/Pause button */}
                            <button
                                onClick={togglePlay}
                                className='gai:flex gai:h-8 gai:w-8 gai:items-center gai:justify-center gai:rounded-full'
                                style={{
                                    background: 'rgba(0, 0, 0, 0.4)',
                                    backdropFilter: 'blur(1.5px)',
                                }}
                            >
                                {isPlaying ? (
                                    <Pause width='16' height='16' className='gai:text-white' />
                                ) : (
                                    <Play className='gai:text-white gai:scale-[0.9]' />
                                )}
                            </button>

                            {/* Mute button */}
                            <button
                                onClick={toggleMute}
                                className='gai:flex gai:h-8 gai:w-8 gai:items-center gai:justify-center gai:rounded-full'
                                style={{
                                    background: 'rgba(0, 0, 0, 0.4)',
                                    backdropFilter: 'blur(1.5px)',
                                }}
                            >
                                {isMuted ? <VolumeOff className='gai:text-white' /> : <VolumeOn className='gai:text-white' />}
                            </button>
                        </div>
                    </div>
                )}

                {/* Center play/pause button */}
                {!isPlaying && (
                    <button
                        onClick={togglePlay}
                        className='gai:absolute gai:top-1/2 gai:left-1/2 gai:z-20 gai:flex gai:h-10 gai:w-10 gai:-translate-x-1/2 gai:-translate-y-1/2 gai:items-center gai:justify-center gai:rounded-full'
                        style={{
                            background: 'rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(3px)',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                        }}
                    >
                        <Play className='gai:text-white gai:scale-[1.8]' />
                    </button>
                )}

                {/* Progress bar */}
                {/* {showControls && duration > 0 && (
                    <div
                        className='gai:absolute gai:bottom-0 gai:z-10 gai:w-full gai:cursor-pointer gai:bg-transparent gai:p-2'
                        onClick={handleProgressClick}
                    >
                        <div className='gai:h-1 gai:w-full gai:overflow-hidden gai:rounded-full gai:bg-white/30'>
                            <div
                                className='gai:h-full gai:bg-white gai:transition-all'
                                style={{
                                    width: `${(currentTime / duration) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                )} */}
            </div>
        </div>
    );
};

export default VideoPlayer;
