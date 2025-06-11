'use client'
import { Button } from '@genuin/ui/button'
import { Slider } from '@genuin/ui/slider'
import { useCallback } from 'react'
import { cn } from '@genuin/ui/lib/utils'
import { useFeedContext } from '@templates/feed/context'

const PLAYBACK_SPEEDS = [0.25, 1.0, 1.25, 1.5, 2.0]

export default function PlaybackSpeedControlSlider() {
    const { playbackSpeed, setPlaybackSpeed } = useFeedContext();

    const decreaseSpeed = useCallback(() => {
        const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed.speed)
        if (currentIndex > 0) setPlaybackSpeed({ speed: PLAYBACK_SPEEDS[currentIndex - 1] || 1 , isSpeedFromGesture : false })
    }, [playbackSpeed.speed, setPlaybackSpeed])

    const increaseSpeed = useCallback(() => {
        const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed.speed)
        if (currentIndex < PLAYBACK_SPEEDS.length - 1) setPlaybackSpeed({ speed: PLAYBACK_SPEEDS[currentIndex + 1] || 1, isSpeedFromGesture : false })
    }, [playbackSpeed.speed, setPlaybackSpeed])

    return (
        <div className="gencl:flex gencl:flex-col gencl:gap-5 gencl:items-center gencl:justify-center">
            <div className="gencl:flex gencl:items-center gencl:space-x-4 gencl:w-full">
                <Button
                    theme="secondary"
                    onClick={decreaseSpeed}
                    disabled={playbackSpeed.speed === PLAYBACK_SPEEDS[0]}
                    className="gencl:h-10 gencl:w-10 gencl:rounded-full"
                >
                    <span className="gencl:text-black">−</span>
                </Button>

                <Slider
                    value={[playbackSpeed.speed]}
                    onValueChange={(val) => {
                        const closestSpeed = PLAYBACK_SPEEDS.reduce((prev, curr) => {
                            return Math.abs(curr - (val[0] ?? 1)) < Math.abs(prev - (val[0] ?? 1)) ? curr : prev
                        })
                        setPlaybackSpeed({ speed: closestSpeed , isSpeedFromGesture : false })
                    }}
                    min={PLAYBACK_SPEEDS[0]}
                    max={PLAYBACK_SPEEDS[PLAYBACK_SPEEDS.length - 1]}
                    step={0.25}
                    className="gencl:flex-1"
                />
                <Button
                    theme="secondary"
                    onClick={increaseSpeed}
                    disabled={playbackSpeed.speed === PLAYBACK_SPEEDS[PLAYBACK_SPEEDS.length - 1]}
                    className="gencl:h-10 gencl:w-10 gencl:rounded-full"
                >
                    <span className="gencl:text-black">+</span>
                </Button>
            </div>

            <div className="gencl:flex gencl:justify-between gencl:gap-4 gencl:w-full">
                {PLAYBACK_SPEEDS.map((speed) => (
                    <Button
                        theme="secondary"
                        key={speed}
                        onClick={() => {
                            setPlaybackSpeed({ speed , isSpeedFromGesture : false })
                        }}
                        className={cn(
                            'gencl:w-20 gencl:rounded-full gencl:px-4 gencl:py-2 gencl:text-body-0-semi-bold',
                            playbackSpeed.speed === speed && 'gencl:bg-primary gencl:text-white!'
                        )}
                    >
                        {speed}
                    </Button>
                ))}
            </div>
        </div>
    )
}
