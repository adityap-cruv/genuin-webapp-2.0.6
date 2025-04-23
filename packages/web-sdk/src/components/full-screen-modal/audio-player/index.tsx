import { useBaseContext } from '@/context/base'
import { type ComponentProps, useEffect, useId } from 'react'
import { BarWaveform } from './bar-waveform'
import { PauseIcon } from '@/components/icons/pause-icon'
import { PlayIcon } from '@/components/icons/play-icon'
import { useCommentContext } from '@/context/comment'

type AudioPlayerPropsType = ComponentProps<'audio'> & { commentId: string }

const sampleData = [
  0.2, 0.3, 0.5, 0.7, 0.2, 0.4, 0.9, 0.9, 0.2, 0.1, 0.4, 0.9, 0.8, 0.5, 0.9,
  0.7, 0.3, 0.8, 1.0, 0.8, 0.7, 0.2, 0.1, 0.9, 1.0, 0.9, 0.8, 0.1, 0.8, 0.5,
]

const CANVAS_HEIGHT = 50

export function AudioCommentPlayer({
  commentId,
  src,
  ...restProps
}: AudioPlayerPropsType) {
  const { customizations, shouldPlay } = useBaseContext()
  const { playComment, pauseComment, activeCommentId } = useCommentContext()
  const audioId = useId()
  const canvasId = useId()
  const progressCanvasId = useId()
  const upperProgressCanvasId = useId()

  useEffect(() => {
    const audioElement = document.getElementById(audioId) as HTMLAudioElement
    if (!audioElement) return
    if (activeCommentId === commentId && shouldPlay === 'COMMENT') {
      audioElement.play()
    } else {
      audioElement.pause()
    }
  }, [activeCommentId, shouldPlay])

  useEffect(() => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement
    const audioElement = document.getElementById(audioId) as HTMLAudioElement
    const progressCanvas = document.getElementById(
      progressCanvasId,
    ) as HTMLCanvasElement
    const upperProgressDiv = document.getElementById(
      upperProgressCanvasId,
    ) as HTMLDivElement
    if (!canvas || !audioElement || !progressCanvas || !upperProgressDiv) return
    progressCanvas.style.setProperty('width', canvas.clientWidth + 'px')

    const waveform = new BarWaveform(
      canvas,
      3,
      3,
      customizations?.brandColors['--tertiary'],
      'center',
    )
    waveform.drawWaveform(sampleData)

    const progressWave = new BarWaveform(
      progressCanvas,
      3,
      3,
      customizations?.brandColors['--primary'],
      'center',
    )

    progressWave.drawWaveform(sampleData)

    const resizeObserver = new ResizeObserver(() => {
      progressCanvas.style.setProperty('width', canvas.clientWidth + 'px')
      waveform.drawWaveform(sampleData)
      progressWave.drawWaveform(sampleData)
    })

    resizeObserver.observe(canvas)

    function handleTimeUpdate() {
      if (audioElement.duration === 0) return
      upperProgressDiv.style.setProperty(
        'width',
        `${(audioElement.currentTime / audioElement.duration) * 100}%`,
      )
    }

    audioElement.addEventListener('timeupdate', handleTimeUpdate)
    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate)
      resizeObserver.disconnect()
    }
  }, [])

  function handleOnEnded(e: any) {
    const progressCanvas = document.getElementById(
      upperProgressCanvasId,
    ) as HTMLDivElement
    if (!progressCanvas) return
    const audio = e.target as HTMLAudioElement
    setTimeout(() => {
      progressCanvas.classList.toggle('__gen__sdk__animate__all')
      audio.currentTime = 0
      progressCanvas.style.setProperty('width', '0%')
      setTimeout(() => {
        progressCanvas.classList.toggle('__gen__sdk__animate__all')
      }, 200)
      pauseComment()
    }, 700)
  }

  return (
    <div className='flex items-center gap-4 p-2 border border-solid border-tertiary-200 rounded-xl w-3/4'>
      <div
        className='h-8 w-8 flex items-center justify-center'
        onClick={
          activeCommentId === commentId
            ? pauseComment
            : () => {
                playComment(commentId)
              }
        }>
        {activeCommentId === commentId ? (
          <PauseIcon className='h-6 w-6 fill-foreground' />
        ) : (
          <PlayIcon className='h-6 w-6 fill-foreground' />
        )}
      </div>
      <div
        className='relative w-full'
        style={{ height: CANVAS_HEIGHT }}>
        <canvas
          className='w-full'
          style={{ height: CANVAS_HEIGHT }}
          id={canvasId}
        />
        <div
          id={upperProgressCanvasId}
          style={{
            height: CANVAS_HEIGHT,
            width: '0px',
          }}
          className='__gen__sdk__animate__all overflow-clip absolute top-0 left-0'>
          <canvas
            className='w-full'
            style={{
              height: CANVAS_HEIGHT,
            }}
            id={progressCanvasId}></canvas>
        </div>
      </div>
      <audio
        id={audioId}
        src={src}
        muted={false}
        playsInline
        onEnded={handleOnEnded}
        {...restProps}
      />
    </div>
  )
}
