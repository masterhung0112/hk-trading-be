# Overview

The object on chart can set to be draggable.

- [ ] Drag multiple display object at a time
    - [ ] Have a list of drag'n'drop display object
- [ ] Indicate which display object support drag'n'drop feature

```ts
interface DraggableOptions {
    x: boolean // can move along vertical axis
    y: boolean // Can move along horizontal axis
    constrain: [min,max] // Relative limit of freedom
}

interface IDraggable {
    // Change the 'x' value in the draggable's options
    x(v: boolean): void 
    y(v: boolean): void 
    constrain(v: number[]): void

    // Stop the component from being draggable
    stop(): void
}
```

# Example

```ts
const rectangle = new Rectangle()
const draggableApi = rectangle.draggable({
    constrain: [
        [0, 0],
        [10, 20]
    ]
})
draggableApi.x = true
draggableApi.y =true
draggableApi.stop()
```

# Dependence Items

## Attributes
- Position of object
- The cursor of object

## Event
- Mouse:
    - mouseDown
    - mouseUp
    - mouseMove

## Methods

Need the methods to set new position for the target