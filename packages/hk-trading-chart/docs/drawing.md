# Overview
- [ ] Able to alter the value of several attributes
- [ ] Merge the list of components by JSON
- [ ] Map the attribute to the edit viewmodel
- [ ] Indicate the renderable object for the component

Drawable object consists of model and view.

Model define the data that can be exported to JSON.

View describe 

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

# Component Trait

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