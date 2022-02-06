# Feature
[] Scrolling & zooming
[] Simple API for making new offchart overlay and onchart overlay
[] Custom drawing tools
[] Non-time based charts (e.g. Renko)
[] Responsive
[] Customizable colors and fonts
[] Scripts (make your own indicators)

# uplot

1. Place div with `uplot` class as root
2. Place the following class inside root
    - wrap
        - under
        - canvas
        - over

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

# Draw Flow
- Transform the raw data to the render data

# Candle Y Transform for scaling
Scale = -(height of the canvas) / (max_of_local_time - max_low_of_local_time)
Shift = -(max_height) * Scale

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
1. Calculate the positions
    - candlestick_step = (canvas_width - max_width_sidebars) / (time_range_diff / interval_ms)

# New Data Incoming