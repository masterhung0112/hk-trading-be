- [ ] Multiple datasets with different scales
- [ ] Expand the original scale domain (time, price)
- [ ] Build ticks
- [ ] Generate gridline even though skipping ticks
- [ ] Sync the width of axis for multiple charts

# Scales Types
- [Continuous Scales](#continous-scales)
- [Sequential Scales](#sequential-scales)
- [Diverging Scales](#diverging-scales)
- [Quantize Scales](#quantize-scales)
- [Ordinal Scales](#ordinal-scales)

Encodings that map abstract data to visual representation.

Scale will draw grid, generate ticks, draw label in axis.

## General API
```ts
buildTicks<TickType>()
```

# Event

When domain or range of scale is updated, it will fire the event to notify

# Flow

## Update flow
- Determine min/max of scale
    - If there's no user-defined min/max, calculate min/max of each dataset by controller
- Determine the data limits by min/max of scale
    - build tick range

# Flow happenning when scale is updated
- Determine the margins (top, left, right, bottom) with the supplied margin
- Set the dimension
    - For horizontal, set width, left, right
    - For Vertical, set height, top, bottom
    - Reset padding
- Determine data min/max if not cached
    - Determine min/max of scale
        - If there's no user-defined min/max, calculate min/max of each dataset by controller
    - build tick range
- Build ticks
- Convert ticks to labels, sampling the tick if necessary
- Configure the scale
    - Update startPixel, endPixel, reversePixel, length, alignToPixels
- Calculate the width and height of the chart area

## Continuous Scales
Continuous scales map a continuous, quantitative input domain to a continuous output range. If the range is also numeric, the mapping may be inverted. A continuous scale is not constructed directly; instead, try a linear, power, log, identity, radial, time or sequential color scale.

```ts
var x = new ScaleLinear(
        [10, 130], // domain
        [0, 900] // range
    )
x.domain2Range(20); // 80
x.domain2Range(50); // 320

x.range([0, 230]) // Update new range, fire the event

var ticks = x.ticks(5)
    tickFormat = x.tickFormat(5, "+%")
ticks.map(ticketFormat); // ["-100%", "-50%", "+0%", "+50%", "+100%"]
```

### API
```ts
domain2Range(value: any): any
range2Domain(value: any): any
domain([domainValue]: any[])
range([rangevalue]: any[])
rangeBound([rangeValue]: any[])
clamp(isClamp: boolean)
interpolate(interpolate)
ticks(count)
tickFormat(count, specifier: string)
```

### Time Scales
Time scales are a variant of linear scales that have a temporal domain: domain values are coerced to dates rather than numbers, and invert likewise returns a date. Time scales implement ticks based on calendar intervals, taking the pain out of generating axes for temporal domains.

```ts
var x = new ScaleTime(
    [new Date(2000, 0, 1), new Date(2000, 0, 2)] // Domain
    [0, 900] // range
)

x.domain2Range(new Date(2000, 0, 1,  5)); // 200
x.domain2Range(new Date(2000, 0, 1, 16)); // 640
x.range2Domain(200); // Sat Jan 01 2000 05:00:00 GMT-0800 (PST)
x.range2Domain(640); // Sat Jan 01 2000 16:00:00 GMT-0800 (PST)

x.ticks(10)
// [Sat Jan 01 2000 00:00:00 GMT-0800 (PST),
//  Sat Jan 01 2000 03:00:00 GMT-0800 (PST),
//  Sat Jan 01 2000 06:00:00 GMT-0800 (PST),
//  Sat Jan 01 2000 09:00:00 GMT-0800 (PST),
//  Sat Jan 01 2000 12:00:00 GMT-0800 (PST),
//  Sat Jan 01 2000 15:00:00 GMT-0800 (PST),
//  Sat Jan 01 2000 18:00:00 GMT-0800 (PST),
//  Sat Jan 01 2000 21:00:00 GMT-0800 (PST),
//  Sun Jan 02 2000 00:00:00 GMT-0800 (PST)]

let x = new ScaleTime(
        [new Date(2000, 0, 1, 0), new Date(2000, 0, 1, 2)]
    );

x.ticks(d3.timeMinute.every(15));
// [Sat Jan 01 2000 00:00:00 GMT-0800 (PST),
//  Sat Jan 01 2000 00:15:00 GMT-0800 (PST),
//  Sat Jan 01 2000 00:30:00 GMT-0800 (PST),
//  Sat Jan 01 2000 00:45:00 GMT-0800 (PST),
//  Sat Jan 01 2000 01:00:00 GMT-0800 (PST),
//  Sat Jan 01 2000 01:15:00 GMT-0800 (PST),
//  Sat Jan 01 2000 01:30:00 GMT-0800 (PST),
//  Sat Jan 01 2000 01:45:00 GMT-0800 (PST),
//  Sat Jan 01 2000 02:00:00 GMT-0800 (PST)]
```

## Sequential Scales
Sequential scales, like diverging scales, are similar to continuous scales in that they map a continuous, numeric input domain to a continuous output range. However, unlike continuous scales, the input domain and output range of a sequential scale always has **exactly two elements**, and the output range is typically specified as an interpolator rather than an array of values. These scales do not expose invert and interpolate methods.

If domain is not specified, it defaults to [0, 1]


## Diverging Scales
Diverging scales, like sequential scales, are similar to continuous scales in that they map a continuous, numeric input domain to a continuous output range. However, unlike continuous scales, the input domain and output range of a diverging scale always has **exactly three elements**, and the output range is typically specified as an interpolator rather than an array of values. These scales do not expose invert and interpolate methods.

If domain is not specified, it defaults to [0, 0.5, 1]. 

## Quantize Scales
Quantize scales are similar to linear scales, except they use a discrete rather than continuous range. The continuous input domain is divided into uniform segments based on the number of values in (i.e., the cardinality of) the output range. Each range value y can be expressed as a quantized linear function of the domain value x: y = m round(x) + b.

```ts
var color = d3.scaleQuantize()
    .domain([0, 1])
    .range(["brown", "steelblue"]);

color(0.49); // "brown"
color(0.51); // "steelblue"

var width = d3.scaleQuantize()
    .domain([10, 100])
    .range([1, 2, 4]);

width.invertExtent(2); // [40, 70]
```

## Ordinal Scales
Map a discrete domain to a discrete range

### Band Scales

Band scales are like ordinal scales except the output range is continuous and numeric. Discrete output values are automatically computed by the scale by dividing the continuous range into uniform bands. Band scales are typically used for bar charts with an ordinal or categorical dimension. The unknown value of a band scale is effectively undefined: they do not allow implicit domain construction.

https://raw.githubusercontent.com/d3/d3-scale/master/img/band.png