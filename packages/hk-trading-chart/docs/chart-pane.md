## Chart Pane API

- Calculate the height and width for several components in canvas
    + Drawable area
    + Sidebar
- Call `draw` of controller to draw the elements.
- Accept multiple datasets

# Container Layout

- Chart Pane Main
    - canvas wrapper
        - chart canvas
            - grid
            - candlesticks
        - cursor canvas (can be plugin)
    - legend wrapper
        - legend main source
        - other sources wrapper
- Axis Container

# Code

```ts
const pane = hkchart.chartPane(el, {
    
})
pane.legend({
    title: 'hello'
})

pane.axis(scaledAxis)
```

# API

```ts
interface IChartPane {
    addSeries(series: ISeriesAPI): string
    getAllShapes()
    getAllStudies()
    createShape(point: Position, options)
    createMultipointShape(points: []Position, options)
    getShapeById(entityId: string): ShapeApi
    removeEntity(entityId: string)
}
```