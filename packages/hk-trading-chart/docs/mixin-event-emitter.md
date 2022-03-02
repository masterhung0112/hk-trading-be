# Event Object
- [ ] Support bubble
- [ ] Support stopping propagation
- [ ] Prevent the initial DOM event default behaviour
- [ ] Support parent event
- [ ] [Mouse Event](#mouse-event)
- [ ] Keyboard event

# Example
```ts
const c = new Component()
c.on('pass', () => {})
c.fire({ name: 'pass' })

c.on('three', () => {})
 .on('three.mod', () => {})
c.fire({
    name: 'three',
    getModifier: () => { return 'mod' }
})

c.on(['event1', 'event2'], () => {})


```

# API

```ts
interface EventEmitter {
    // Listen to an event or multiple events
    // @param isTargeted Should only listen to event targeting itself
    on(eventName: string | string[], callback: Function, isTargeted = false): EventEmitter
    fire(event: { name: string, target: any, getModifier?: () => any }): EventEmitter
    off(eventName: string, callback: Function): EventEmitter
}
```

# Mouse Event

## Event Types
- `mousedown`, `mouseup`, `mousemove`
- `hover`: Mouse goes hover a component
- `click`, `dblclick`
- `contextmenu`
- `leave`:  Mouse leave a component
- `mousewheel`: Mouse wheel is scrolled in any direction
- `scrolldown`: Mouse wheel is scrolled down (away from the screen)
- `scrollup`: Mouse wheel is scrolled up (toward the screen)
- `zoomout`, `zoomin`

Draggable object
- `grab`: Mouse is clicked on a draggable component
- `drag`: Mouse is moved while grabbing a component
- `drop`: Mouse is release after dragging a component

Edit Object
- `resize`: Mouse is moved while holding the handle of a resizable component
- `rotate`: Mouse is rotating a component
