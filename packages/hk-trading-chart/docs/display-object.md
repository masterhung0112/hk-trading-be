# Overview

Display Object
- [ ] Able to alter the value of several attributes in one call
- [ ] Merge the list of components by JSON
- [ ] Map the attribute to the edit viewmodel
- [ ] Indicate the renderable object for the component
- [ ] Cascade the property set
    - [ ] Default property
    - [ ] Overrided property
- [ ] For drawable that have text, we need a dedicated attribute
- [ ] [Support layers](#control-z-layer)
- [ ] Architecture for controls of display object

Renderable Object
- [ ] Hit test for the Renderable Object
- [ ] Map the hit test to the Display Object event

Drawable object consists of model and view.

Model define the data that can be exported to JSON.

Component Trait describe the property that can be altered.
Renderable Object 
Display object is the base class for all objects that are rendered on the scene.

# Display Object

Display object is the object that is accessible by other tools.
It should only contain the state, e.g. position, size...
For the shape, we should use `Shape` API

## Transforms
The [transform]{@link DisplayObject#transform} of a display object describes the project from its local coordinate space to its parent's local coordinate space.

- position
- scale
- rotation
- skew
- pivot

## Bounds
The bounds of a display object is defined by the minimum axis-aligned rectangle in world space that can fit around it.

## Renderable vs Visible
The `renderable` and `visible` properties can be used to prevent a display object from being rendered to the screen.

When using `renderable`, the transforms of the display object (and its children subtree) will continue to be calculated.

When using `visible`, the transformwill not be calculated.

## Alpha
This alpha sets a display object's **relative opacity** w.r.t its parent. For example, if the alpha of a display object is 0.5 and its parent's alpha is 0.5, then it will be rendered with 25% opacity (assuming alpha is not applied on any ancestor further up the chain).

The alpha with which the display object will be rendered is called the `worldAlpha`.

```ts
interface Alpha {
    alpha: number
    worldAlpha: number
}
```

If the display object has the parent, `worldAlpha` is the multiply of this object's `alpha` and the parent's `worldAlpha`.

## Display Object API
```ts
interface IDisplayObject extends ZIndex, Alpha {
    calculateBounds(): void
    render(render: Renderer): void

    parent: IDisplayObjectContainer

    pivot: ObservablePoint
    visible: bool
    renderable: bool
}

interface IDisplayObjectContainer extends IDisplayObject {
    children: IDisplayObject[]

    addChild<T extends IDisplayObject[]>(...children: T): T[0]
    addChildAt<T extends IDisplayObject>(child: T, index: number): T
    getChildAt(index: number): IDisplayObject
    removeChild<T extends IDisplayObject[]>(...children: T): T[0]
    removeChildAt(index: number): IDisplayObject
    removeChildren(beginIndex = 0, endIndex = this.children.length): IDisplayObject[]

    swapChildren(child: IDisplayObject, child2: IDisplayObject): void

    sortChildren(): void
}
```

| Field | Description |
| -- | -- |
| parent | The display object container that contains this display object |
| visible | indicating if this object is visible |
| | |

# Display Object Definition

```ts
interface DisplayObjectDef {
    // tagname?: string
    id: string
    type?: string // "trendline"
    traits: []ComponentTrait
    attributes?: []{ id: string, value: any }
    options?: Record<string, any>    
    parentId?: string
    // childrenIds?: string[]; // Child nodes of the widget.
}
```

```json
{
    "components": [{
        "id": "1",
        "type": "trendline",
        "options": {
            "color": "#ffffff"
        },
        "attributes": [{ "id": "trigger", "value": "open" }],
        "parentId": "2",
    }, {
        "id": "2",
        "type": "group",
    }]
}
```

# Renderer object

```ts
interface IRenderableContainer extends IRenderableObject {
    /** Retrieves the local bounds of the displayObject as a rectangle object */
    getLocalBounds(rect?: Rectangle, skipChildrenUpdate?: boolean): Rectangle;
}

interface IRenderableObject {
    /** Object must have a parent container */
    parent: IRenderableContainer;
    /** Before method for transform updates */
    enableTempParent(): IRenderableContainer;
    /** Update the transforms */
    updateTransform(): void;
    /** After method for transform updates */
    disableTempParent(parent: IRenderableContainer): void;
    /** Render object directly */
    render(renderer: Renderer): void;
}

interface IRenderer {
    width: number
    height: number
    resize(desiredWidth: number, desiredHeight: number): void
    render(displayObject: IRenderableObject, options?: IRendererRenderOptions): void
}
```

## GraphicData

GraphicData contains shape, fillStyole, lineStyle, color, matrix

## Render for display object
    - setContextTransform
    - setBlendMode
    - Set the canvas context
        - lineWidth
        - lineCap
        - lineJoin
        - miterLimit
        - globalAlpha
        - fillStyle
        - strokeStyle

## Render of Canvas renderer
- [ ] Render the canvas in by tick
- [ ] Render the canvas immediately

- If not request skipping update Transform, call `updateTransform` of display object
- Reset transform of context
- Reset global alpha to context
- Set globalCompositeOperation (blend mode) to context
- call `renderCanvas` for display object 

## Update of stage
- Reset the transformation
- Clear the canvas if necessary
- Clip the rectangle if request
- Call draw of container

## Render for animation
- [ ] How animation can trigger the render

## Draggable object
- create a shape
- Add that shape to the container
- Add dragable mixin to that shape, listen for `drag` event

## How the event generated for canvas element

### hitTest
If display Object has the hitArea, return true
If not, check the geometry of the display object if it contains the point
If the display object has mask and mask contains the point, return false

# Control Z-layer
- Each dataset must have a layer, each layer must have a default z-index
- When dragging, the object is moved to `drag group` temporarily

Sorts children by zIndex. Previous order is maintained for 2 children with the same zIndex.

```ts
interface ZIndex {
    // A higher value will mean it will be rendered on top of other displayObjects within the same container.
    zIndex: number
}

interface ZIndexContainer {
    // Should children be sorted by zIndex at the next updateTransform call
    abstract sortDirty: bool

    // Indicate whether to sort layer even if sortDirty is true
    sortableChildren: boolean
    sortChildren(): void
}
```

## Event
### `componenttrait:propertyChanged`

# What is a chart layout

Chart layout is a group of charts (in Trading Terminal) or a single chart (in Charting library), 
Chart layout content includes drawing, indicators and chart settings like colors, styles, etc.

# What is a study template

Study template is a set applied indicators and their settings (inputs and styles)

# REST

`charts_storage_url/v1/charts?client=client_id&user=user_id` for charts
`charts_storage_url/v1/study_templates?client=client_id&user=user_id` for study template

## List charts

URL: GET `charts_storage_url/v1/charts?client=client_id&user=user_id`
RESPONSE

```ts
{
    status: 'ok' | 'error'
    data: [{
        timestamp: number
        symbol: string // base symbol of chart, eg. AA
        resolution: string // e.g. 1D
        id: string // unique integer identifier of the chart
        name: string // chart name, e.g. Test
    }]
}
```

## Save chart

URL: POST `charts_storage_url/v1/charts?client=client_id&user=user_id`
BODY
```ts
{
    symbol: string // base symbol of chart, eg. AA
    resolution: string // e.g. 1D    
    name: string // chart name, e.g. Test
    content: string // content of chart
}
```

RESPONSE
```ts
{
    status: 'ok' | 'error'
    id: string
}
```

# Models

Each ***cell*** has ***cell state***.


## Drawing Template
| Field | Description |
| -- | -- |
| ownerSource | string |
| ownerId | string |
| name | string |
| tool | string |
| content | json type |

## Cell State Style

| Field | Description |
| -- | -- |
| align | `left`, `right`, `center` |
| shape | `rectangle` | `ellipse` |