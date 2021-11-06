import uPlot from 'uplot'

// draws candlestick symbols (expects data in OHLC order)
export function candlestickPlugin({ gap = 2, shadowColor = '#000000', bearishColor = '#e54245', bullishColor = '#4ab650', bodyMaxWidth = 20, shadowWidth = 2, bodyOutline = 1 } = {}) {
    function drawCandles(u) {
        if (u.data.length == 0) {
            return
        }

        const [iMin, iMax] = u.series[0].idxs

        if (!iMin || !iMax) {
            return
        }

        if (u.data[0].length < iMax) {
            return
        }

        u.ctx.save()

        const offset = (shadowWidth % 2) / 2

        u.ctx.translate(offset, offset)

        const vol0AsY = u.valToPos(0, 'vol', true)

        for (let i = iMin; i <= iMax; i++) {
            const xVal         = u.scales.x.distr == 2 ? i : u.data[0][i]
            const open         = u.data[1][i]
            const high         = u.data[2][i]
            const low          = u.data[3][i]
            const close        = u.data[4][i]
            const vol          = u.data[5][i]

            const timeAsX      = u.valToPos(xVal,  'x', true)
            const lowAsY       = u.valToPos(low,   'y', true)
            const highAsY      = u.valToPos(high,  'y', true)
            const openAsY      = u.valToPos(open,  'y', true)
            const closeAsY     = u.valToPos(close, 'y', true)
            const volAsY       = u.valToPos(vol, 'vol', true)


            // shadow rect
            const shadowHeight = Math.max(highAsY, lowAsY) - Math.min(highAsY, lowAsY)
            const shadowX      = timeAsX - (shadowWidth / 2)
            const shadowY      = Math.min(highAsY, lowAsY)

            u.ctx.fillStyle = shadowColor
            u.ctx.fillRect(
                Math.round(shadowX),
                Math.round(shadowY),
                Math.round(shadowWidth),
                Math.round(shadowHeight),
            )

            // body rect
            const columnWidth  = u.bbox.width / (iMax - iMin)
            const bodyWidth    = Math.min(bodyMaxWidth, columnWidth - gap)
            const bodyHeight   = Math.max(closeAsY, openAsY) - Math.min(closeAsY, openAsY)
            const bodyX        = timeAsX - (bodyWidth / 2)
            const bodyY        = Math.min(closeAsY, openAsY)
            const bodyColor    = open > close ? bearishColor : bullishColor

            u.ctx.fillStyle = shadowColor
            u.ctx.fillRect(
                Math.round(bodyX),
                Math.round(bodyY),
                Math.round(bodyWidth),
                Math.round(bodyHeight),
            )

            u.ctx.fillStyle = bodyColor
            u.ctx.fillRect(
                Math.round(bodyX + bodyOutline),
                Math.round(bodyY + bodyOutline),
                Math.round(bodyWidth - bodyOutline * 2),
                Math.round(bodyHeight - bodyOutline * 2),
            )

            // volume rect
            u.ctx.fillRect(
                Math.round(bodyX),
                Math.round(volAsY),
                Math.round(bodyWidth),
                Math.round(vol0AsY - volAsY),
            )
        }

        u.ctx.translate(-offset, -offset)

        u.ctx.restore()
    }

    return {
        opts: (u, opts) => {
            uPlot.assign(opts, {
                cursor: {
                    points: {
                        show: false,
                    }
                }
            })

            opts.series.forEach(series => {
                series.paths = () => null
                series.points = {show: false}
            })
        },
        hooks: {
            draw: drawCandles,
        }
    }
}