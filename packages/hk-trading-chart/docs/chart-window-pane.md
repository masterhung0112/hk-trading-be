# Chart Window Pane API
Pane contains one main grid and mulitiple offchart grids.
Data of frame consists of:
- Setting of the frame
- Datasets for main grid and all offchart grids

Pane collects the sidebar width and drawable area from all child Grids,
then reserve the appropriate width and height for drawable area and sidebar width.

- [ ] Choose the symbol
- [ ] Choose time resolution
- [ ] Choose the chart type (line, candlestick...)
- [ ] Export grids to image
- [ ] Display legend

# Container Layout
- Table
    - Chart Pane (Row)
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
    - Divider
    - Chart Pane (Row)
        - Chart Pane Main
        - Axis Container
    - Divider
    - Chart Pane (Row)
        - Chart Pane Main
        - Axis Container



# Data Requirements
- Datasets for all charts
- The current cursor
- Axis + scale
- Legend Format

### update()
With the modified data, this will update all scales, then re-render the chart.

### render()
Redraw all chart elements. This doesn't update elements for new data. use `.update()` in that case.

### resize(width?, height?)
Resize the canvas element.
You can call with no parameters to have the chart take the size of its container elements,
or you can pass explicit dimensions.