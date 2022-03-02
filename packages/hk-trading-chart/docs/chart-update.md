The list of events that can trigger the update of chart data:
- [ ] [The scale change](#the-scale-change)
- [ ] Any property of Display Object change (visibility, color, position, scale...)
- [ ] The number of Display Object change
- [ ] [The data source is updated](#the-data-source-is-updated)

The lits of events that trigger the update of chart render:
- [ ] The scale change
- [ ] The data updated in the visible scale range
- [ ] Any property of display objects that are in the visible scale range

# The scale change

- Event: The range of scale change
    - Trigger every the chart items
        - Chart item update the displayed display object
    - Trigger the data source if we need to fetch more data [Ref](#the-data-source-is-updated)

# The data source is updated

- Any element in data array is updated
- The data is added/removed

The data source can contain the larger number of the displayed object.
The min/max of scale will define what data source will be displayed.

# Property of display object updated

- The option of data change, which leads to the change of display object

