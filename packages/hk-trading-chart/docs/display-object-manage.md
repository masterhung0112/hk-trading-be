Each dataset can create a list of display objects.

# Structure

## Canvas structure
- Chart Window Pane
    - Chart Pane 1
        - Canvas for main graph
            - Canvas Stage
                - Canvas Container (of Dataset controller 1)
                - Canvas Container (of indicator 1)
                - Canvas Container (of Tool Tree)
        - Canvas for money scale
    - Chart Pane 2
        - Canvas for study 1
    - Chart Pane 3
        - Canvas for study 2
    - Canvas for time scale
    - Canvas for cursor

# How Object Tree can detect object

Each chart pane has its own object tree.
The item in object tree can be
- Drawable object of Study
- Drawable of Tool tree

`ObjectTreeItem` interface must be implemented by Display Object.
`ObjectTreeItem` provides the methods that control hiding, locking.

- [ ] When a study is added, it is added to the object tree
- [ ] When a display object of tool is added, it is added to the object tree

# Layer of Canvas Stage
- [ ] Display canvas container by the defined z-index
- [ ] The object of drag must display on top of other container