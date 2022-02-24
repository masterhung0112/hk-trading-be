# Overview

## Cell

A cell contains geometry.

Geometry define the location of cell, width, height, control point.

## What is a chart layout

Chart layout is a group of charts (in Trading Terminal) or a single chart (in Charting library), 
Chart layout content includes drawing, indicators and chart settings like colors, styles, etc.

## What is a study template

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