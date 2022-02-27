# Overview
- [ ] Able to alter the value of several attributes
- [ ] Merge the list of components by JSON
- [ ] Map the attribute to the edit viewmodel
- [ ] Indicate the renderable object for the component

Drawable object consists of model and view.

Model define the data that can be exported to JSON.


Component Trait describe the property that can be altered.
Renderable Object 
Display object is the base class for all objects that are rendered on the screne.


```ts
interface Component {
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

## Cell

A cell contains geometry.

Geometry define the location of cell, width, height, control point.
# Display Object

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

The alpha with which the display object will be rendered is called the `worldAlpha`

## API
```ts
interface IDisplayObject {
    calculateBounds(): void
    render(render: Renderer): void
    zIndex: number
    pivot: ObservablePoint
    visible: bool
    renderable: bool

    worldAlpha: number
    alpha: number
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

# Component Trait

```ts
interface ComponentTrait {
    id: string // the id of attribute
    label: string // The label you will see in settings
    valueType: string // bool | color | integer | float | string | symbol | resolution | session | source | time
    defval?: any
    options?: []{id: string, name: string}
    group?: string
    minval?: number
    maxval?: number
    step?: number
    confirm?: bool
    inline?: string
}
```

```ts
// Update the value of trait at run-time
component.getTrait('trigger').set('options', [
    { id: 'opt1', name: 'New option 1' },
    { id: 'opt2', name: 'New option 2' },
])
component.getTrait('trigger').set({
    label: 'hello',
    options: [
    { id: 'opt1', name: 'New option 1' },
    { id: 'opt2', name: 'New option 2' },
]})

// Define new trait
TraitManager.addType('href-next', {
    // Expects as return a simple HTML string or an HTML element
    createInput({ trait }) {
        return '<div></div>'
    }
})
```

## Event
### `componenttrait:propertyChanged`

## Create edit model for trait
Display a form to input/edit the attributes of the model

## Bind edit model to component model
Copy the value from edit model to the model

## Bind component model to edit model

## Built-in trait types
bool | color | integer | float | string | symbol | resolution | session | source | time

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