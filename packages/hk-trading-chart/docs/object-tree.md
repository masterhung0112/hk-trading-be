# Feature
- [ ] Notify there's added/removed object in object tree
- [ ] Able to decide what to display in object tree
- [ ] Display tree item in group
    - [ ] Item group can be virtual created by logic or physically created by object tree


# API

```ts
interface IObjectTreeItem {
    getLabel(): string
    getIcon(): string

    canHide(): bool
    toggleHidden(): void
    isHidden(): bool
}

interface IObjectTree {
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