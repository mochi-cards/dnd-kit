---
'@dnd-kit/core': patch
'@dnd-kit/modifiers': patch
'@dnd-kit/sortable': patch
---

No longer setting `pointer-events` to `none` for DragOverlay component as it interferes with custom cursors.