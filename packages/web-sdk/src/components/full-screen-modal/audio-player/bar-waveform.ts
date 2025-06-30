export class BarWaveform {
  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D
  private barWidth: number
  private barGap: number
  private barColor: string
  private barRadius: number = 16
  private barAlign: 'top' | 'bottom' | 'center' = 'center'

  constructor(
    canvas: HTMLCanvasElement,
    barWidth: number = 2,
    barGap: number = 1,
    barColor: string = '#000',
    barAlign: 'top' | 'bottom' | 'center' = 'center',
  ) {
    this.canvas = canvas
    this.context = canvas.getContext('2d')!
    this.barWidth = barWidth
    this.barGap = barGap
    this.barColor = barColor
    this.barAlign = barAlign
  }

  private getPixelRatio(): number {
    return Math.max(1, window.devicePixelRatio || 1)
  }

  public drawWaveform(data: number[]): void {
    const ctx = this.context
    const vScale = 1.3
    const length = data.length

    const { width, height } = ctx.canvas
    const halfHeight = height / 2
    const pixelRatio = this.getPixelRatio()

    const barWidth = this.barWidth ? this.barWidth * pixelRatio : 1
    const barGap = this.barGap
      ? this.barGap * pixelRatio
      : this.barWidth
        ? barWidth / 2
        : 0
    const barRadius = this.barRadius || 0
    const barIndexScale = width / (barWidth + barGap) / length

    const rectFn = barRadius && 'roundRect' in ctx ? 'roundRect' : 'rect'
    ctx.beginPath()

    let prevX = 0
    let maxTop = 0
    let maxBottom = 0
    for (let i = 0; i <= length; i++) {
      const x = Math.round(i * barIndexScale)

      if (x > prevX) {
        const topBarHeight = Math.round(maxTop * halfHeight * vScale)
        const bottomBarHeight = Math.round(maxBottom * halfHeight * vScale)
        const barHeight = topBarHeight + bottomBarHeight || 1
        const y = halfHeight - barHeight / 2

        ctx.roundRect(prevX * (barWidth + barGap), y, barWidth, barHeight, this.barRadius)
        prevX = x
        maxTop = 0
        maxBottom = 0
      }

      const magnitudeTop = Math.abs(data[0] || 0)
      const magnitudeBottom = Math.abs(data[i] || 0)
      if (magnitudeTop > maxTop) maxTop = magnitudeTop
      if (magnitudeBottom > maxBottom) maxBottom = magnitudeBottom
    }
    ctx.fillStyle = this.barColor
    ctx.fill()
    ctx.closePath()
  }
}