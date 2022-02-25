# Feature
[] Scrolling & zooming
[] Simple API for making new offchart overlay and onchart overlay
[] Custom drawing tools
[] Non-time based charts (e.g. Renko)
[] Responsive
[] Customizable colors and fonts
[] Scripts (make your own indicators)
[] Allow to select candlestick in chart
[] Allow to control the tool (line, rectangle) or edit text

# Implement steps
- [ ] General API for pane, Grid
- [ ] The responsive containers for chart, pane, grid
- [ ] Grid load data and draw

# uplot

1. Place div with `uplot` class as root
2. Place the following class inside root
    - wrap
        - under
        - canvas
        - over

`data` and `series` fields have the matching sizes
```ts
data = [
    [1, 2, 3, 4]
    [0.2, 0.4, 0.6 0.7]
]

series = [
    {},
    { stroke: 'red', fill: '#fdfdfd' }
]

// Draw grid
axes = [
    {
        grid: {
            show: true,
            stroke: "rgba(0,0,0,0.2)",
            width: 1,
        },
        ticks: {
            show: true,
            stroke: "rgba(0,0,0,0.2)",
            width: 1,
        }
    }
]
```
## Scales
Define a list of scale type.
Axe can use a defined scale type.

## Commit function
1. setScales
1. convergeSize
1. setSize
    - Set top,left,width,height for `under` and `over` section
    - Set width,height for `wrap` section
    - Fire `setSize` event
1. Clear the canvas rectangle
1. Draw order
    - Draw Axes Grid
    - Draw Series
    - Call `draw` of plugins
1. updateCursor
1. Fire `ready` event

# Layout Structure

Container
- center
    - chart toolbar
    - Chart container
        - Chart container border
            - Chart Window Pane
                - Chart Pane
                    - Chart Main Area
                    - Axis Container
                - Divider
                - Chart Pane
                    - Chart Main area
                    - Axis Container
                - Chart Pane
                    - Time Axis
                    - Axis Container
                - Chart control bar
            - Chart Window Pane...
        - spinner
        
- top
    - toolbar
- topleft
- left
    - drawing bar
- right
- bottom

# Draw Flow
- Transform the raw data to the render data

# Candle Y Transform for scaling
- Scale = -(height of the grid) / (max_of_local_dollar - max_low_of_local_dollar)
- Shift = -(max_of_local_dollar) * Scale

# When change time range
- Get the lowest and highest time based on the time resolution
- Get the data subset of selected time range
- Not necessary: Recalculate the interval
- Calculate the new layout

## Calculate interval
- For index-based, interval is 1, but the interval_ms is required
- For time resolution, the interval value is in millisecond format

## Calculate layout
1. Calculate the standard height of offchart
standard_height_of_offchart = height_of_canvas * (2 * sqrt(number_of_offchart) / (7 * (number_of_offchart || 1)))

1. Calculate the height of main chart
Height of main chart = height_of_canvas - height_bottom_bar - (number_offchart * standard_height_of_offchart)

1. Calculate sidebar width for main chart and all offcharts, then take the maximum value
    - Calulate the width based on the precision value '0     '
1. Calculate offset for offchart based on the height of main chart and the above offchart
1. Calculate max and min value of dollar for main grid
1. Calculate the scaling
    - max_number_time_slots = local_time_range_diff / interval_ms
    - candlestick_pixel_step = (main_grid_width - max_width_sidebars) / (max_number_time_slots)
    - ratio_pixel_for_time = (main_grid_width / local_time_range_diff)
    - first_candle_x = (timestamp_of_first_candle - min_local_time_range) * ratio_pixel_for_time
    - Then `Candle Y Transform for scaling`
1. Calculate the x axis for grid
1. Calculate the y axis for grid

## Manage Overlay
Each grid contains the list of overlay. Each overlay handle a specific data block

# New Data Incoming
- Data has two types:
    - Candle
    - Tick

## For tick update
- Get the last bar from the chart, then use the tick data to update that bar.
- Fast merge the candle stick to the main grid
- After a certain interval, send data to web worker

Web worker handle a list of message
Script engine can send the following message types:
 - `on_overlay_data` set new overlay data from web worker
 - `on_overlay_update` update the data of overlay from web worker

Tool can send the following message types:
- `update-data` to notify there's new value for candles

# Updating Charts
When the chart data or options are changed, the chart will animate to the new data values and options.

## Add or Removing data
```js
// Update main grid
chart.data.datasets[0].data.push([1, 2, 3])
chart.update()

chart.data.datasets[0].data.pop()
chart.update()

// Update offchart grid
chart.data.offchart[0].data.push([3, 4, 5])
chart.update()
```
## Updating Options
```js
chart.options.reponsive = false
chart.update()
```

# API
- [Chart Controller](#chart-controller)
- [Chart UI API](#chart-ui-api)
- [Chart Window Pane](docs/chart-window-pane.md)
- [Chart Pane](docs/chart-pane.md)
- [Dataset Controller](docs/dataset-controller.md)
- [Plugin](#plugin)
- [Scale](docs/scales.md)
- [Symbol Store]()
- [Realtime Provider]()
- [History Provider]()
- [Axes](#axes)
- [Dragging](#dragging)
- [Zooming](docs/zoom.md)

ChartController hold a chart UI so it can draw multiple panes.
Chart UI is a window that can draw multiple chart pane.
Each chart pane contains one 'main grid', several offchart grids.

## How
- [ ] Where to contains the data of multiple symbols with multiple time resolutions
- [ ] Data can be generated on FE or fetched from BE

## Chart Controller
- Load the plugin
- Keep track the list of plugins and register the plugin to the target pane

Chart Controller mainly work with data.
Chart UI API will handle the UI

## Chart UI API

Chart UI may consists of multiple Chart pane

- [ ] Choose the pane layout
- [ ] Sync betweens panes
    - [ ] Symbol
    - [ ] Interval
    - [ ] Crosshair
    - [ ] Time
    - [ ] Drawings


## Plugins
Able to load plugin

## Axes
- [Set Axe Title](#set-axe-title)
- [Set Axe Tick Label](#set-axe-tick-label)

### Overview

Axes are used to determine how data maps to a pixel value on the chart.
The default `scaleId` for caterian charts are 'x' and 'y', for fadial charts is 'r'.

In a cartesian charts, there is 1 or more X-axis and 1 or more Y-axis to map points into the 2-dimensional canvas.

In a radial charts, such as a radar chart, or a polar area chart, there is a single axis that map points into angular and radial directions.

- [ ] Multiple X & Y axes are supported
- [ ] Multiple scales and grids
- [ ] A built-in label auto-skip feature detects would-be overlapping ticks and labels and removes every nth label to keep things displaying normally
- [ ] Scale titles are supported
- [ ] New scale types can be exteded without writing an entirely new chart type

Catesian Axes Types
- [ ] Catesian Axes
- [ ] Category Axis
- [ ] Linear Axis
- [ ] Logarithmic Axis
- [ ] Time Cartesian Axis
- [ ] Time Series Axis

Radial Axes Types
- [ ] Radial Axes
- [ ] Linear Radial Axis

### Set Axe Title
When creating a chart, you want to tell he viewer what data they are viewing. Labelling the axis help it.
```ts
options.scales[scaleId].title = {
    display: true,
    text: 'EUR/USD'
}
```

### Set Axe Tick Label

```ts
options.scales[scaleId].ticks.callback = (value, index, ticks) => { return '$' + value }
```
- `value` The tick value in the internal data format
- `index` The tick index in the ticks array
- `ticks` The array containing all of the tick objects

### API

```ts
// Determines the data limits. Should set `min` and `max` to be the data max/min
determineDataLimits: () => void;

// Generate ticks array.
buildTicks: () => Tick[];

// Used to get the label to display in the tooltip for the given value
getLabelForValue: (value: number) => string

// Returns the location of the tick at the given index. 
// The coordinate (0, 0) is at the upper-left corner of the canvas
// @param index index into the ticks array
getPixelForTick: (index) => number

// Returns the location of the given data point. Value can either be an index or a numerical value
// @param value the value to get pixel for
// @param index: index into the data array of the value
getPixelForValue: (value: number, index?: number) => number

// Used to get the data value from a given pixel. This is the inverse of getPixelForValue.
getValueForPixel: (pixel) => number
```

# Chart Global
```ts
xAxis: {
    title: { text: 'Fruit Number' }
},
plotOptions: {
    candlestick: {
        // shared options for all candlestick series
    }
},
series: [{
    type: 'candlestick',
    data: [
        [0, 7, 2, 0, 3],
        [1, 1, 3, 4, 5],
    ],
},{
    type: 'candlestick',
    data: [
        {x: 1, open: 9, high, 2, low: 4, close: 6, name: 'point2', color: '#00FF00'},
        {x: 2, open: 1, high, 4, low: 4, close: 6, name: 'point2', color: '#00FF00'},
    ],
}],
time: {
    timezone: 'America/New_York'
},
```

## Dataset Format
Dataset can contains data for constructing the drawing, the options for the plugin...

`data` field in `dataset` contains raw data for constructing the drawing.

`dataset.scales` 

`dataset.series`

`dataset.axes`

`dataset.data` can be one of:
- **array of number**
- **array of object with `x` and `y` as properties**
- **array of object using custom properties**.


```ts
const dataset = {
    type: 'bar',
    data: {
        datasets: [{
            data: {id: 'Sales', nested: {value: 1500}}
        }]
    },
    options: {
        parsing: {
            xAxisKey: 'id',
            yAxisKey: 'nested.value'
        }
    }
}

const dataList = [
    {x: 'Jan', net: 100, cogs: 50, gm: 50}, 
    {x: 'Feb', net: 120, cogs: 55, gm: 55}
]
const dataset1 = {
    type: 'bar':
    data: {
        datasets: [{
            label: 'Net sales',
            data: data,
            parsing: [
                yAxisKey: 'net'
            ]
        }, {
            label: 'Cost of goods sold',
            data: data,
            parsing: [
                yAxisKey: 'cogs'
            ]
        }]
    }
}

// x axis: product, y axis: sales, series: location
const productData = [
    { location: "Naperville", product: "Hammer", sales: 10 },
    { location: "Naperville", product: "Ladder", sales: 4 },
    { location: "Darien", product: "Hammer", sales: 12 },
    { location: "Darien", product: "Ladder", sales: 23 },
]
```

Hide the series
```
e.dataSeries.visible = false
e.chart.render()
```

# Line Chart

```ts
const data = {
    datasets: [{
        data: [65, 59, 80],
    }]
}
```

# Convert the raw data to the drawing model data

# Dragging
Drag and drop SVG, HTML or Canvas using mouse or touch input

# Chart Controller
This class contains
- a list of controllers that correspond to the dataset
- A list of scales

# My Update Process

The event that might cause the graph to be updated
- domain or range of scale is updated
- Dataset: new data is added, data is removed, data is updated
- 

# Chart.js Update process
- Config update
- Update Scales
    - Ensure scales have IDs
    - Build or Update Scales
        - For each scale
            - Configure scale with layout
            - Add scale to layout box
- Build Or Update Controllers
    - Remove metaset that doesn't have the corresponding dataset
    - Foreach dataset
        - if the type of dataset meta doesn't match the dataset, destroy that dataset meta
            - destroy the controller
        - If controller found,
            - updateIndex of controller
            - link Scales of controller
                - Set xScale, yScale, rScale, iScale, vScale to meta
        - If controller not found
            - Create new controller for dataset
    - Sort metaset by order and index
- For each dataset
    - Get the controller for that dataset
    - Build or Update elements
        - For each element created for each data
        - 
        - If there's mismatch between element and data
            - insert/remove new element
                - Convert each data to object {x: xx, y: yy}
                    - If the data is of array
                    - If the data is of object
                        - xScale.parse
                    - If the data is of primitive
- Update Layout
- Reset Controllers if we have animations
- Update datasets
    - Call Update for controller of each dataset
        - controller update properties of element (calculate x, y, width, height...)

- Render
    - If there's animtor, then start animator
    - If not, call draw

# Chart.js Draw process
- Resize with new width and height
- Clear canvas
- Draw layers that have lower z (layer is generated by layout with box)
- Draw datasets
    - Get BoundingBox of cell, if the bounding box is out of graph view, then don't draw
- Draw layers that have higher z
