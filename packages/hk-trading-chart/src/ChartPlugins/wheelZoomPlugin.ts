import uPlot from 'uplot'

export function wheelZoomPlugin(): uPlot.Plugin {
    const factor = 0.75

    let xMin, xMax, yMin, yMax, xRange, yRange

    function clamp(nRange, nMin, nMax, fRange, fMin, fMax): [number, number] {
        if (nRange > fRange && fMin !== null && fMax !== null) {
            nMin = fMin
            nMax = fMax
        } else if (nMin < fMin) {
            nMin = fMin
            nMax = fMin + nRange
        } else if (nMax > fMax) {
            nMax = fMax
            nMin = fMax - nRange
        }

        return [nMin, nMax]
    }

    function scaleXAndY(chartWidget: uPlot, rect: DOMRect, e: WheelEvent): [number, number, number, number] {
        const { left, top } = chartWidget.cursor

        const leftPct = left / rect.width
        const btmPct = 1 - top / rect.height
        // Get value of x at cursor
        const xVal = chartWidget.posToVal(left, 'x')
        // Get value of y at cursor
        const yVal = chartWidget.posToVal(top, 'y')
        // Get the current range of the child range
        const oxRange = chartWidget.scales.x.max - chartWidget.scales.x.min
        const oyRange = chartWidget.scales.y.max - chartWidget.scales.y.min
        const nxRange = e.deltaY < 0 ? oxRange * factor : oxRange / factor
        const nxMinTmp = xVal - leftPct * nxRange
        const nxMaxTmp = nxMinTmp + nxRange
        const [nxMin, nxMax] = clamp(nxRange, nxMinTmp, nxMaxTmp, xRange, xMin, xMax)
        // const [nxMin, nxMax] = clamp(nxRange, nxMinTmp, nxMaxTmp, xRange, 0, chartWidget.data[chartWidget.data.length - 1][0])

        const nyRange = e.deltaY < 0 ? oyRange * factor : oyRange / factor
        const nyMinTmp = yVal - btmPct * nyRange
        const nyMaxTmp = nyMinTmp + nyRange
        const [nyMin, nyMax] = clamp(nyRange, nyMinTmp, nyMaxTmp, yRange, yMin, yMax)

        return [nxMin, nxMax, nyMin, nyMax]
    }

    function keepScaleXFromCursor(chartWidget: uPlot, rect: DOMRect, e: WheelEvent): [number, number, number, number] {
        const { left } = chartWidget.cursor

        const leftPct = left / rect.width
        const xVal = chartWidget.posToVal(left, 'x')
        const oxRange = chartWidget.scales.x.max - chartWidget.scales.x.min
        const nxRange = e.deltaY < 0 ? oxRange * factor : oxRange / factor
        const nxMin = xVal - leftPct * nxRange
        // const [nxMin, nxMax] = clamp(nxRange, nxMinTmp, xMax, xRange, xMin, xMax)
        // const [nxMin, nxMax] = clamp(nxRange, nxMinTmp, xMax, xRange, xMin, xMax)
        // console.log('nxMin', nxMin)
        return [nxMin, xMax, yMin, yMax]
    }

    return {
        hooks: {
            ready: (chartWidget) => {
                xMin = chartWidget.scales.x.min
                xMax = chartWidget.scales.x.max
                yMin = chartWidget.scales.y.min
                yMax = chartWidget.scales.y.max

                xRange = xMax - xMin
                yRange = yMax - yMin

                const over = chartWidget.over
                const rect = over.getBoundingClientRect()

                over.addEventListener('wheel', e => {
                    e.preventDefault()

                    // const { left, top } = chartWidget.cursor

                    // const leftPct = left / rect.width
                    // const btmPct = 1 - top / rect.height
                    // // Get value of x at cursor
                    // const xVal = chartWidget.posToVal(left, 'x')
                    // // Get value of y at cursor
                    // const yVal = chartWidget.posToVal(top, 'y')
                    // // Get the current range of the child range
                    // const oxRange = chartWidget.scales.x.max - chartWidget.scales.x.min
                    // const oyRange = chartWidget.scales.y.max - chartWidget.scales.y.min

                    // const nxRange = e.deltaY < 0 ? oxRange * factor : oxRange / factor
                    // const nxMinTmp = xVal - leftPct * nxRange
                    // const nxMaxTmp = nxMinTmp + nxRange
                    // const [nxMin, nxMax] = clamp(nxRange, nxMinTmp, nxMaxTmp, xRange, xMin, xMax)

                    // const nyRange = e.deltaY < 0 ? oyRange * factor : oyRange / factor
                    // const nyMinTmp = yVal - btmPct * nyRange
                    // const nyMaxTmp = nyMinTmp + nyRange
                    // const [nyMin, nyMax] = clamp(nyRange, nyMinTmp, nyMaxTmp, yRange, yMin, yMax)

                    const [nxMin, nxMax, nyMin, nyMax] = keepScaleXFromCursor(chartWidget, rect, e)
                    console.log(nxMin, nxMax, nyMin, nyMax)
                    if (nxMin === null || nxMax === null || nyMin === null || nyMax === null) {
                        console.error(`invalid range for wheel zoom: ${nxMin} ${nxMax} ${nyMin} ${nxMax}`)
                    } else {
                        chartWidget.batch(() => {
                            chartWidget.setScale('x', {
                                min: nxMin,
                                max: nxMax,
                            })

                            chartWidget.setScale('y', {
                                min: nyMin,
                                max: nyMax,
                            })
                        })
                    }
                })
            },
            setScale: (chartWidget) => {
                if (xMin === undefined || xMin === null) {
                    xMin = chartWidget.scales.x.min
                    xMax = chartWidget.scales.x.max
                    yMin = chartWidget.scales.y.min
                    yMax = chartWidget.scales.y.max

                    xRange = xMax - xMin
                    yRange = yMax - yMin
                }
            }
        }
    }
}