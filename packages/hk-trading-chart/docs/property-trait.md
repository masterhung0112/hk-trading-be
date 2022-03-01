# Property Trait

Allow a value of a object to be customized.

A trait have `valueType`, which define the type of value.
From the type defined in `valueType`, the corresponding UI might display to help setting the value

- [ ] How to create trait
    - [ ] Parse json structure to trait definition
    - [ ] Receive the object with property that want to be edited, create the trait for that property
- [x] From `valueType` in trait definition, create the corresponding model
- [x] From `valueType` in trait definition, map the widget to allow edit the model
- [x] From the widget, convert view data back to the model
- [x] From model, update the view

```ts
interface IPropertyTraitInfo {
    id: string // the id of attribute
    label: string // The label you will see in settings
    valueType: string // bool | color | integer | float | string | symbol | resolution | string session | source | time
    defval?: any
    group?: string
    inline?: string
}

interface IntegerTraitInfo extends IPropertyTraitInfo {
    minval?: number
    maxval?: number
    step?: number
}

interface OptionTraitInfo extends IPropertyTraitInfo {
    options: []{id: string, name: string}
}

interface BoolTraitInfo extends IPropertyTraitInfo {
    valueTrue?: any
    valueFalse?: any

    // set(options: Omit<PropertyTrait, 'id' | 'valueType' | 'set'>)
}
```

```ts
interface PropertyTraitModel<ModelT> {
    traitInfo() PropertyTraitInfo

    model(): ModelT

    // Notify there's new value for model from the view
    commitModel<ModelT>(model: ModelT) => Promise<void>
}
```

```ts
interface IPropertyTraitBinder<ModelT> {
    canHandleTraitType(type: string): boolean
    createTraitModel(): PropertyTraitModel<ModelT>
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
// TraitManager.addType('href-next', {
//     // Expects as return a simple HTML string or an HTML element
//     createInput({ trait }) {
//         return '<div></div>'
//     }
// })
```

# Event

## `propertytrait:modelChanged`

Notify there's model change. The client can get the new model

# Define new Trait type

Define a display for trait property

```jsx
const TraitDisplay = ({ traitModel }) => {
    const [value, setValue] = useState(traitModel.getModel())

    useEffect(() => {
        traitModel.on('propertytrait:modelChanged', (e) => {
            setValue(e.target.getModel())
        })
    }, [])

    switch (traitModel.traitInfo().valueType) {
        case 'text':
            return <div click={traitModel.commitModel('hello')}>{traitModel.traitInfo().label}: {value.text}</div>
        case 'number':
            return <div>{value.number}</div>
    }
}
```
