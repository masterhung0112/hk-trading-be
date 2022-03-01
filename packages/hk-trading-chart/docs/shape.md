Shape define the basic geometry that can be drawn on canvas
- the drawable definition
- 

- [Line](#line)
- [Arcs]()
- [Pies]()
- [Areas](#areas)
- [Curves]()
- [Custom Curves]()
- [Links]()
- [Symbols]()
- [Custom Symbol Types](#custom-symbol-types)
- [Stacks]()
- [Financial](#financial)

Reference for Tradingview chart: https://github.com/serdimoa/charting/wiki/Shapes-and-Overrides

# Line

```ts
const lineData = [
    {date: new Date(2007, 3, 24), value: 92.24},
    {date: new Date(2007, 3, 25), value: 92.25},
    {date: new Date(2007, 3, 26), value: 92.26},
]
d3.line()
    .x(d => x(d.date))
    .y(d => y(d.value))
```

# Areas

```ts
const lineData = [
    {date: new Date(2007, 3, 24), value: 92.24},
    {date: new Date(2007, 3, 25), value: 92.25},
    {date: new Date(2007, 3, 26), value: 92.26},
]
d3.area()
    .x(d => x(d.date))
    .y1(d => y(d.value))
    .y0(y(0))
```

# Custom Symbol Types

```ts
symbolType.draw(context, size)
```

# Financial

| Shape | |
|-- | -- |
| abcd_pattern | |
| trend_line | |
| parallel_channel | |
| fib_retracement | |
| head_and_shoulders | |