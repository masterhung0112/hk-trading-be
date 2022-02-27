# API

```ts
interface ObjectTreeItem {
    getLabel(): string
    getIcon(): string
    
    canHide(): bool
    toggleHidden(): void
    isHidden(): bool
}

interface ObjectTree {
    addItem(item: ObjectTreeItem)
    removeItem(item: ObjectTreeItem)
}
```

# Events of Object Tree

## `objecttree::ready`
## `objecttree::itemAdded`
## `objecttree::itemRemoved`

# Events of ObjectTreeItem

## `objecttreeitem:visibilityChanged`
## `objecttreeitem:lockChanged`