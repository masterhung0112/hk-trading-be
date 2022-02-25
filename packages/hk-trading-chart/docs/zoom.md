Pan and zoom SVG, HTML or Canvas using mouse or touch input

- [ ] Zoom by x, y, or both directions
- [ ] Clamp by limits

# Flow
- zoom logic set new min/max to the scale
- The scale fire the range changed event
- Dataset controller listen to the event and calculate new elements with new scale's range
- Axis listen to the event and calculate with new scale's range

# Dependency variables
- Center point of chart area
- min/max value of the scale

## Zoom State
| Field | Description |
| ----- |-- |
| originalScaleLimits | Keep the `{min, max}` of scale before doing any zoom |
| updatedScaleLimits | Map from `scale.id` to `{min, max}`, keep the current value of zoom |
| handlers | |
| panDelta | |

```ts
const scale = chart.scales[scaleId];
zoomScale(scale, range, limits=undefined, zoom=true))
chart.update('none')
```

## Undoable zoom
Save the min/max value of scale, we can restore later by setting the saved min/max to the scale.

## Imperative Zoom/Pan API

## pane

`chart.pane(delta, scales?, node = 'none'): void`

Pans the current chart by the specified amount in one or more axes.
The value of `delta` can be a number, in which case all axes are panned by the same amount, or it can be an `{x, y}` object to pan different amounts in the horizontal and vertical directions.

The value of `scales` is a list of scale objects that should be panned. By default, all scales of chart will be panned.

## zoom

`chart.zoom(zoomLevel, mode='none'):void`

Zooms the current chart by the specified amount in one more axes. the value of `zoomLevel` can be a number, in which case all axes are zoomed by the same amount, or it can be an `{x, y}`  object to zoom different amounts in the horizontal and vertical directions.

## zoomScale

`chart.zoomScale(scaleId, newRange, mode = 'none'): void`

Zooms the specified scale to the range given by `newRange`.
This is an object in the form `{min, max}` and represents the new bounds of that scale.
The value of `mode` should be one of [Tramsition Mode]


# Implementation with Hammer

Listen to the following of hammer
- `pinchstart`, `pinch`, `pinchend`
- `panstart`, `pan`, `panend`