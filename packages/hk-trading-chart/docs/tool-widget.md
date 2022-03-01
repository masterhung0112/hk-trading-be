- [ ] Display tool in toolbar
- [ ] Display tool for altering the attribute of tool object
- [ ] Display dialog for attributes of tool object

Handlers give the editor required context to manipulate the widget.
For example, it describes how widget gets created, how it responds to drag'n'drop events,
what contextual commands is supporteds, etc.

```ts
export interface IWidgetOrder {
    // Name of a widget
    name: string

    displayName: string

    category?: string

    iconClass?: string
    iconUrl?: string

    createWidget?(): IWidgetFatoryResult<any, any>
    createModel(): Promise<any>

    // list of feature required for this widget
    requires: string[]
}
interface IWidgetHandler {
    getWidgetOrder?(): Promise<IWidgetOrder>
    getContextCommands?(context: WidgetContext): IContextCommandSet;
    canAccept?(dragSession: DragSession): boolean
    onDragOver?(dragSession: DragSession): void
    onDragDrop?(dragSession: DragSession): void
}
```