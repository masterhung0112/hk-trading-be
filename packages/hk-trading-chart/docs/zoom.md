Pan and zoom SVG, HTML or Canvas using mouse or touch input

## Zoom State
| Field | Description |
| ----- |-- |
| originalScaleLimits | |
| updatedScaleLimits | Map from `scale.id` to `{min, max}` |
| handlers | |
| panDelta | |

```ts
const scale = chart.scales[scaleId];
zoomScale(scale, range, limits=undefined, zoom=true))
chart.update('none')
```

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
