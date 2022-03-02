## Chart Pane API

- Calculate the height and width for several components in canvas
    + Drawable area
    + Sidebar
- Call `draw` of controller to draw the elements.
- Accept multiple datasets

# Overview of Trading Chart Pane Item
- API related to chart (bringToFront, isSelectionEnabled, isUserEditEnabled, isSavingEnabled...)

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

# Trading Chart Pane API

```ts
interface ITradingChartPane {
    addSeries(series: ISeriesAPI): string
    allShapes()
    allStudies()
    shapeById(entityId: string): IChartPaneShape

    createShape(point: Position, options)
    createMultipointShape(points: []Position, options)
    createStudy(indicatorName: string, forceOverlay: bool, inputs: any[]): Promise<void>
    removeEntity(entityId: string)

    timeScale() IScale
    priceScale() IScale
}

// Base class for all items of IChartPane
interface ITradingChartPaneItem {
    id(): string
    itemType(): string

    // For object tree
    isDisplayedInObjectTree(): bool

    // The root display object for renderer
    // displayObject(): DisplayObject

    visible(): bool
    setVisible(isShow: bool)
    
    bringToFront()
    sendToBack()

    render(render: IRenderer)
}

interface ITradingChartPaneShape extends IChartPaneItem {

}
```

# Event

## `tradingchartpaneitem:added`

# Trading Chart Area API

```ts
interface ITradingChartCanvasArea {
    // the root container of canvas
    displayObject(): DisplayObject
}
```