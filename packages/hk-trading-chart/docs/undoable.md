## UndoableEdit class

Contains a list of `UndoableChange`

| Method | Description |
| -- | -- |
| `add(change: UndoableChange)` | |
| `undo()` | |
| `redo()` | |
| `isEmpty()` | |
| | |

## UndoableChange interface

| method | Description |
| -- | -- |
| `execute` | `() => void` |
| `undo?` | `() => void` |
| `redo?` | `() => void` |

# Undoable Change Types

## SelectionChange

Action to change the current root in a view

## ValueChange
Action to change a value in the specified model
