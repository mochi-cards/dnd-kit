'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var core = require('@dnd-kit/core');
var utilities = require('@dnd-kit/utilities');

/**
 * Move an array item to a different position. Returns a new array with the item moved to the new position.
 */
function arrayMove(array, from, to) {
  const newArray = array.slice();
  newArray.splice(to < 0 ? newArray.length + to : to, 0, newArray.splice(from, 1)[0]);
  return newArray;
}

/**
 * Swap an array item to a different position. Returns a new array with the item swapped to the new position.
 */
function arraySwap(array, from, to) {
  const newArray = array.slice();
  newArray[from] = array[to];
  newArray[to] = array[from];
  return newArray;
}

function getSortedRects(items, layoutRects) {
  return items.reduce((accumulator, id, index) => {
    const layoutRect = layoutRects.get(id);

    if (layoutRect) {
      accumulator[index] = layoutRect;
    }

    return accumulator;
  }, Array(items.length));
}

function isValidIndex(index) {
  return index !== null && index >= 0;
}

// To-do: We should be calculating scale transformation
const defaultScale = {
  scaleX: 1,
  scaleY: 1
};
const horizontalListSortingStrategy = ({
  layoutRects,
  activeNodeRect: fallbackActiveRect,
  activeIndex,
  overIndex,
  index
}) => {
  var _layoutRects$activeIn;

  const activeNodeRect = (_layoutRects$activeIn = layoutRects[activeIndex]) != null ? _layoutRects$activeIn : fallbackActiveRect;

  if (!activeNodeRect) {
    return null;
  }

  const itemGap = getItemGap(layoutRects, index, activeIndex);

  if (index === activeIndex) {
    const newIndexRect = layoutRects[overIndex];

    if (!newIndexRect) {
      return null;
    }

    return {
      x: activeIndex < overIndex ? newIndexRect.offsetLeft + newIndexRect.width - (activeNodeRect.offsetLeft + activeNodeRect.width) : newIndexRect.offsetLeft - activeNodeRect.offsetLeft,
      y: 0,
      ...defaultScale
    };
  }

  if (index > activeIndex && index <= overIndex) {
    return {
      x: -activeNodeRect.width - itemGap,
      y: 0,
      ...defaultScale
    };
  }

  if (index < activeIndex && index >= overIndex) {
    return {
      x: activeNodeRect.width + itemGap,
      y: 0,
      ...defaultScale
    };
  }

  return {
    x: 0,
    y: 0,
    ...defaultScale
  };
};

function getItemGap(layoutRects, index, activeIndex) {
  const currentRect = layoutRects[index];
  const previousRect = layoutRects[index - 1];
  const nextRect = layoutRects[index + 1];

  if (!currentRect || !previousRect && !nextRect) {
    return 0;
  }

  if (activeIndex < index) {
    return previousRect ? currentRect.offsetLeft - (previousRect.offsetLeft + previousRect.width) : nextRect.offsetLeft - (currentRect.offsetLeft + currentRect.width);
  }

  return nextRect ? nextRect.offsetLeft - (currentRect.offsetLeft + currentRect.width) : currentRect.offsetLeft - (previousRect.offsetLeft + previousRect.width);
}

const rectSortingStrategy = ({
  layoutRects,
  activeIndex,
  overIndex,
  index
}) => {
  const newRects = arrayMove(layoutRects, overIndex, activeIndex);
  const oldRect = layoutRects[index];
  const newRect = newRects[index];

  if (!newRect || !oldRect) {
    return null;
  }

  return {
    x: newRect.offsetLeft - oldRect.offsetLeft,
    y: newRect.offsetTop - oldRect.offsetTop,
    scaleX: newRect.width / oldRect.width,
    scaleY: newRect.height / oldRect.height
  };
};

const rectSwappingStrategy = ({
  activeIndex,
  index,
  layoutRects,
  overIndex
}) => {
  let oldRect;
  let newRect;

  if (index === activeIndex) {
    oldRect = layoutRects[index];
    newRect = layoutRects[overIndex];
  }

  if (index === overIndex) {
    oldRect = layoutRects[index];
    newRect = layoutRects[activeIndex];
  }

  if (!newRect || !oldRect) {
    return null;
  }

  return {
    x: newRect.offsetLeft - oldRect.offsetLeft,
    y: newRect.offsetTop - oldRect.offsetTop,
    scaleX: newRect.width / oldRect.width,
    scaleY: newRect.height / oldRect.height
  };
};

// To-do: We should be calculating scale transformation
const defaultScale$1 = {
  scaleX: 1,
  scaleY: 1
};
const verticalListSortingStrategy = ({
  activeIndex,
  activeNodeRect: fallbackActiveRect,
  index,
  layoutRects,
  overIndex
}) => {
  var _layoutRects$activeIn;

  const activeNodeRect = (_layoutRects$activeIn = layoutRects[activeIndex]) != null ? _layoutRects$activeIn : fallbackActiveRect;

  if (!activeNodeRect) {
    return null;
  }

  if (index === activeIndex) {
    const overIndexRect = layoutRects[overIndex];

    if (!overIndexRect) {
      return null;
    }

    return {
      x: 0,
      y: activeIndex < overIndex ? overIndexRect.offsetTop + overIndexRect.height - (activeNodeRect.offsetTop + activeNodeRect.height) : overIndexRect.offsetTop - activeNodeRect.offsetTop,
      ...defaultScale$1
    };
  }

  const itemGap = getItemGap$1(layoutRects, index, activeIndex);

  if (index > activeIndex && index <= overIndex) {
    return {
      x: 0,
      y: -activeNodeRect.height - itemGap,
      ...defaultScale$1
    };
  }

  if (index < activeIndex && index >= overIndex) {
    return {
      x: 0,
      y: activeNodeRect.height + itemGap,
      ...defaultScale$1
    };
  }

  return {
    x: 0,
    y: 0,
    ...defaultScale$1
  };
};

function getItemGap$1(layoutRects, index, activeIndex) {
  const currentRect = layoutRects[index];
  const previousRect = layoutRects[index - 1];
  const nextRect = layoutRects[index + 1];

  if (!currentRect) {
    return 0;
  }

  if (activeIndex < index) {
    return previousRect ? currentRect.offsetTop - (previousRect.offsetTop + previousRect.height) : nextRect ? nextRect.offsetTop - (currentRect.offsetTop + currentRect.height) : 0;
  }

  return nextRect ? nextRect.offsetTop - (currentRect.offsetTop + currentRect.height) : previousRect ? currentRect.offsetTop - (previousRect.offsetTop + previousRect.height) : 0;
}

const ID_PREFIX = 'Sortable';
const Context = /*#__PURE__*/React__default.createContext({
  activeIndex: -1,
  containerId: ID_PREFIX,
  disableTransforms: false,
  items: [],
  overIndex: -1,
  useDragOverlay: false,
  sortedRects: [],
  strategy: rectSortingStrategy,
  wasDragging: {
    current: false
  }
});
function SortableContext({
  children,
  id,
  items: userDefinedItems,
  strategy = rectSortingStrategy
}) {
  const {
    active,
    dragOverlay,
    droppableRects,
    over,
    recomputeLayouts,
    willRecomputeLayouts
  } = core.useDndContext();
  const containerId = utilities.useUniqueId(ID_PREFIX, id);
  const useDragOverlay = Boolean(dragOverlay.rect !== null);
  const items = React.useMemo(() => userDefinedItems.map(item => typeof item === 'string' ? item : item.id), [userDefinedItems]);
  const isDragging = active != null;
  const wasDragging = React.useRef(false);
  const activeIndex = active ? items.indexOf(active.id) : -1;
  const isSorting = activeIndex !== -1;
  const overIndex = over ? items.indexOf(over.id) : -1;
  const previousItemsRef = React.useRef(items);
  const sortedRects = getSortedRects(items, droppableRects);
  const itemsHaveChanged = !isEqual(items, previousItemsRef.current);
  const disableTransforms = overIndex !== -1 && activeIndex === -1 || itemsHaveChanged;
  utilities.useIsomorphicLayoutEffect(() => {
    if (itemsHaveChanged && isSorting && !willRecomputeLayouts) {
      // To-do: Add partial recompution of only subset of rects
      recomputeLayouts();
    }
  }, [itemsHaveChanged, isSorting, recomputeLayouts, willRecomputeLayouts]);
  React.useEffect(() => {
    previousItemsRef.current = items;
  }, [items]);
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      wasDragging.current = isDragging;
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [isDragging]);
  const contextValue = React.useMemo(() => ({
    activeIndex,
    containerId,
    disableTransforms,
    items,
    overIndex,
    useDragOverlay,
    sortedRects,
    strategy,
    wasDragging
  }), [activeIndex, containerId, disableTransforms, items, overIndex, sortedRects, useDragOverlay, strategy, wasDragging]);
  return React__default.createElement(Context.Provider, {
    value: contextValue
  }, children);
}

function isEqual(arr1, arr2) {
  return arr1.join() === arr2.join();
}

const defaultNewIndexGetter = ({
  id,
  items,
  activeIndex,
  overIndex
}) => arrayMove(items, activeIndex, overIndex).indexOf(id);
const defaultAnimateLayoutChanges = ({
  containerId,
  isSorting,
  wasDragging,
  index,
  items,
  newIndex,
  previousItems,
  previousContainerId,
  transition
}) => {
  if (!transition || !wasDragging) {
    return false;
  }

  if (previousItems !== items && index === newIndex) {
    return false;
  }

  if (isSorting) {
    return true;
  }

  return newIndex !== index && containerId === previousContainerId;
};
const defaultTransition = {
  duration: 200,
  easing: 'ease'
};
const transitionProperty = 'transform';
const disabledTransition = /*#__PURE__*/utilities.CSS.Transition.toString({
  property: transitionProperty,
  duration: 0,
  easing: 'linear'
});
const defaultAttributes = {
  roleDescription: 'sortable'
};

/*
 * When the index of an item changes while sorting,
 * we need to temporarily disable the transforms
 */

function useDerivedTransform({
  disabled,
  index,
  node,
  rect
}) {
  const [derivedTransform, setDerivedtransform] = React.useState(null);
  const previousIndex = React.useRef(index);
  utilities.useIsomorphicLayoutEffect(() => {
    if (!disabled && index !== previousIndex.current && node.current) {
      const initial = rect.current;

      if (initial) {
        const current = core.getBoundingClientRect(node.current);
        const delta = {
          x: initial.offsetLeft - current.offsetLeft,
          y: initial.offsetTop - current.offsetTop,
          scaleX: initial.width / current.width,
          scaleY: initial.height / current.height
        };

        if (delta.x || delta.y) {
          setDerivedtransform(delta);
        }
      }
    }

    if (index !== previousIndex.current) {
      previousIndex.current = index;
    }
  }, [disabled, index, node, rect]);
  React.useEffect(() => {
    if (derivedTransform) {
      requestAnimationFrame(() => {
        setDerivedtransform(null);
      });
    }
  }, [derivedTransform]);
  return derivedTransform;
}

function useSortable({
  animateLayoutChanges = defaultAnimateLayoutChanges,
  attributes: userDefinedAttributes,
  disabled,
  data: customData,
  getNewIndex = defaultNewIndexGetter,
  id,
  strategy: localStrategy,
  transition = defaultTransition
}) {
  const {
    items,
    containerId,
    activeIndex,
    disableTransforms,
    sortedRects,
    overIndex,
    useDragOverlay,
    strategy: globalStrategy,
    wasDragging
  } = React.useContext(Context);
  const index = items.indexOf(id);
  const data = React.useMemo(() => ({
    sortable: {
      containerId,
      index,
      items
    },
    ...customData
  }), [containerId, customData, index, items]);
  const {
    rect,
    node,
    setNodeRef: setDroppableNodeRef
  } = core.useDroppable({
    id,
    data
  });
  const {
    active,
    activeNodeRect,
    activatorEvent,
    attributes,
    setNodeRef: setDraggableNodeRef,
    listeners,
    isDragging,
    over,
    transform
  } = core.useDraggable({
    id,
    data,
    attributes: { ...defaultAttributes,
      ...userDefinedAttributes
    },
    disabled
  });
  const setNodeRef = utilities.useCombinedRefs(setDroppableNodeRef, setDraggableNodeRef);
  const isSorting = Boolean(active);
  const displaceItem = isSorting && wasDragging.current && !disableTransforms && isValidIndex(activeIndex) && isValidIndex(overIndex);
  const shouldDisplaceDragSource = !useDragOverlay && isDragging;
  const dragSourceDisplacement = shouldDisplaceDragSource && displaceItem ? transform : null;
  const strategy = localStrategy != null ? localStrategy : globalStrategy;
  const finalTransform = displaceItem ? dragSourceDisplacement != null ? dragSourceDisplacement : strategy({
    layoutRects: sortedRects,
    activeNodeRect,
    activeIndex,
    overIndex,
    index
  }) : null;
  const newIndex = isValidIndex(activeIndex) && isValidIndex(overIndex) ? getNewIndex({
    id,
    items,
    activeIndex,
    overIndex
  }) : index;
  const prevItems = React.useRef(items);
  const itemsHaveChanged = items !== prevItems.current;
  const prevNewIndex = React.useRef(newIndex);
  const previousContainerId = React.useRef(containerId);
  const shouldAnimateLayoutChanges = animateLayoutChanges({
    active,
    containerId,
    isDragging,
    isSorting,
    id,
    index,
    items,
    newIndex: prevNewIndex.current,
    previousItems: prevItems.current,
    previousContainerId: previousContainerId.current,
    transition,
    wasDragging: wasDragging.current
  });
  const derivedTransform = useDerivedTransform({
    disabled: !shouldAnimateLayoutChanges,
    index,
    node,
    rect
  });
  React.useEffect(() => {
    if (isSorting && prevNewIndex.current !== newIndex) {
      prevNewIndex.current = newIndex;
    }

    if (containerId !== previousContainerId.current) {
      previousContainerId.current = containerId;
    }

    if (items !== prevItems.current) {
      prevItems.current = items;
    }
  }, [isSorting, newIndex, containerId, items]);
  return {
    active,
    attributes,
    activatorEvent,
    rect,
    index,
    isSorting,
    isDragging,
    listeners,
    node,
    overIndex,
    over,
    setNodeRef,
    setDroppableNodeRef,
    setDraggableNodeRef,
    transform: derivedTransform != null ? derivedTransform : finalTransform,
    transition: getTransition()
  };

  function getTransition() {
    if ( // Temporarily disable transitions for a single frame to set up derived transforms
    derivedTransform || // Or to prevent items jumping to back to their "new" position when items change
    itemsHaveChanged && prevNewIndex.current === index) {
      return disabledTransition;
    }

    if (shouldDisplaceDragSource || !transition) {
      return undefined;
    }

    if (isSorting || shouldAnimateLayoutChanges) {
      return utilities.CSS.Transition.toString({ ...transition,
        property: transitionProperty
      });
    }

    return undefined;
  }
}

const directions = [core.KeyboardCode.Down, core.KeyboardCode.Right, core.KeyboardCode.Up, core.KeyboardCode.Left];
const sortableKeyboardCoordinates = (event, {
  context: {
    active,
    droppableContainers,
    translatedRect,
    scrollableAncestors
  }
}) => {
  if (directions.includes(event.code)) {
    event.preventDefault();

    if (!active || !translatedRect) {
      return;
    }

    const filteredContainers = [];
    droppableContainers.getEnabled().forEach(entry => {
      if (!entry || (entry == null ? void 0 : entry.disabled)) {
        return;
      }

      const node = entry == null ? void 0 : entry.node.current;

      if (!node) {
        return;
      }

      const rect = core.getViewRect(node);
      const container = { ...entry,
        rect: {
          current: rect
        }
      };

      switch (event.code) {
        case core.KeyboardCode.Down:
          if (translatedRect.top + translatedRect.height <= rect.top) {
            filteredContainers.push(container);
          }

          break;

        case core.KeyboardCode.Up:
          if (translatedRect.top >= rect.top + rect.height) {
            filteredContainers.push(container);
          }

          break;

        case core.KeyboardCode.Left:
          if (translatedRect.left >= rect.left + rect.width) {
            filteredContainers.push(container);
          }

          break;

        case core.KeyboardCode.Right:
          if (translatedRect.left + translatedRect.width <= rect.left) {
            filteredContainers.push(container);
          }

          break;
      }
    });
    const closestId = core.closestCorners({
      active,
      collisionRect: translatedRect,
      droppableContainers: filteredContainers
    });

    if (closestId) {
      var _droppableContainers$;

      const newNode = (_droppableContainers$ = droppableContainers.get(closestId)) == null ? void 0 : _droppableContainers$.node.current;

      if (newNode) {
        const newScrollAncestors = core.getScrollableAncestors(newNode);
        const hasDifferentScrollAncestors = newScrollAncestors.some((element, index) => scrollableAncestors[index] !== element);
        const newRect = core.getViewRect(newNode);
        const offset = hasDifferentScrollAncestors ? {
          x: 0,
          y: 0
        } : {
          x: translatedRect.width - newRect.width,
          y: translatedRect.height - newRect.height
        };
        const newCoordinates = {
          x: newRect.left - offset.x,
          y: newRect.top - offset.y
        };
        return newCoordinates;
      }
    }
  }

  return undefined;
};

exports.SortableContext = SortableContext;
exports.arrayMove = arrayMove;
exports.arraySwap = arraySwap;
exports.defaultAnimateLayoutChanges = defaultAnimateLayoutChanges;
exports.defaultNewIndexGetter = defaultNewIndexGetter;
exports.horizontalListSortingStrategy = horizontalListSortingStrategy;
exports.rectSortingStrategy = rectSortingStrategy;
exports.rectSwappingStrategy = rectSwappingStrategy;
exports.sortableKeyboardCoordinates = sortableKeyboardCoordinates;
exports.useSortable = useSortable;
exports.verticalListSortingStrategy = verticalListSortingStrategy;
//# sourceMappingURL=sortable.cjs.development.js.map
