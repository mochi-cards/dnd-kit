'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var reactDom = require('react-dom');
var utilities = require('@dnd-kit/utilities');
var accessibility = require('@dnd-kit/accessibility');

const screenReaderInstructions = {
  draggable: `
    To pick up a draggable item, press the space bar.
    While dragging, use the arrow keys to move the item.
    Press space again to drop the item in its new position, or press escape to cancel.
  `
};
const defaultAnnouncements = {
  onDragStart(id) {
    return `Picked up draggable item ${id}.`;
  },

  onDragOver(id, overId) {
    if (overId) {
      return `Draggable item ${id} was moved over droppable area ${overId}.`;
    }

    return `Draggable item ${id} is no longer over a droppable area.`;
  },

  onDragEnd(id, overId) {
    if (overId) {
      return `Draggable item ${id} was dropped over droppable area ${overId}`;
    }

    return `Draggable item ${id} was dropped.`;
  },

  onDragCancel(id) {
    return `Dragging was cancelled. Draggable item ${id} was dropped.`;
  }

};

var Action;

(function (Action) {
  Action["DragStart"] = "dragStart";
  Action["DragMove"] = "dragMove";
  Action["DragEnd"] = "dragEnd";
  Action["DragCancel"] = "dragCancel";
  Action["DragOver"] = "dragOver";
  Action["RegisterDroppable"] = "registerDroppable";
  Action["SetDroppableDisabled"] = "setDroppableDisabled";
  Action["UnregisterDroppable"] = "unregisterDroppable";
})(Action || (Action = {}));

function noop(..._args) {}

class DroppableContainersMap extends Map {
  get(id) {
    var _super$get;

    return id != null ? (_super$get = super.get(id)) != null ? _super$get : undefined : undefined;
  }

  toArray() {
    return Array.from(this.values());
  }

  getEnabled() {
    return this.toArray().filter(({
      disabled
    }) => !disabled);
  }

  getNodeFor(id) {
    var _this$get$node$curren, _this$get;

    return (_this$get$node$curren = (_this$get = this.get(id)) == null ? void 0 : _this$get.node.current) != null ? _this$get$node$curren : undefined;
  }

}

const Context = /*#__PURE__*/React.createContext({
  activatorEvent: null,
  active: null,
  activeNode: null,
  activeNodeRect: null,
  activeNodeClientRect: null,
  activators: [],
  ariaDescribedById: {
    draggable: ''
  },
  containerNodeRect: null,
  dispatch: noop,
  draggableNodes: {},
  droppableRects: /*#__PURE__*/new Map(),
  droppableContainers: /*#__PURE__*/new DroppableContainersMap(),
  over: null,
  dragOverlay: {
    nodeRef: {
      current: null
    },
    rect: null,
    setRef: noop
  },
  scrollableAncestors: [],
  scrollableAncestorRects: [],
  recomputeLayouts: noop,
  windowRect: null,
  willRecomputeLayouts: false
});

function getInitialState() {
  return {
    draggable: {
      active: null,
      initialCoordinates: {
        x: 0,
        y: 0
      },
      nodes: {},
      translate: {
        x: 0,
        y: 0
      }
    },
    droppable: {
      containers: new DroppableContainersMap()
    }
  };
}
function reducer(state, action) {
  switch (action.type) {
    case Action.DragStart:
      return { ...state,
        draggable: { ...state.draggable,
          initialCoordinates: action.initialCoordinates,
          active: action.active
        }
      };

    case Action.DragMove:
      if (!state.draggable.active) {
        return state;
      }

      return { ...state,
        draggable: { ...state.draggable,
          translate: {
            x: action.coordinates.x - state.draggable.initialCoordinates.x,
            y: action.coordinates.y - state.draggable.initialCoordinates.y
          }
        }
      };

    case Action.DragEnd:
    case Action.DragCancel:
      return { ...state,
        draggable: { ...state.draggable,
          active: null,
          initialCoordinates: {
            x: 0,
            y: 0
          },
          translate: {
            x: 0,
            y: 0
          }
        }
      };

    case Action.RegisterDroppable:
      {
        const {
          element
        } = action;
        const {
          id
        } = element;
        const containers = new DroppableContainersMap(state.droppable.containers);
        containers.set(id, element);
        return { ...state,
          droppable: { ...state.droppable,
            containers
          }
        };
      }

    case Action.SetDroppableDisabled:
      {
        const {
          id,
          key,
          disabled
        } = action;
        const element = state.droppable.containers.get(id);

        if (!element || key !== element.key) {
          return state;
        }

        const containers = new DroppableContainersMap(state.droppable.containers);
        containers.set(id, { ...element,
          disabled
        });
        return { ...state,
          droppable: { ...state.droppable,
            containers
          }
        };
      }

    case Action.UnregisterDroppable:
      {
        const {
          id,
          key
        } = action;
        const element = state.droppable.containers.get(id);

        if (!element || key !== element.key) {
          return state;
        }

        const containers = new DroppableContainersMap(state.droppable.containers);
        containers.delete(id);
        return { ...state,
          droppable: { ...state.droppable,
            containers
          }
        };
      }

    default:
      {
        return state;
      }
  }
}

const DndMonitorContext = /*#__PURE__*/React.createContext({
  type: null,
  event: null
});
function useDndMonitor({
  onDragStart,
  onDragMove,
  onDragOver,
  onDragEnd,
  onDragCancel
}) {
  const monitorState = React.useContext(DndMonitorContext);
  const previousMonitorState = React.useRef(monitorState);
  React.useEffect(() => {
    if (monitorState !== previousMonitorState.current) {
      const {
        type,
        event
      } = monitorState;

      switch (type) {
        case Action.DragStart:
          onDragStart == null ? void 0 : onDragStart(event);
          break;

        case Action.DragMove:
          onDragMove == null ? void 0 : onDragMove(event);
          break;

        case Action.DragOver:
          onDragOver == null ? void 0 : onDragOver(event);
          break;

        case Action.DragCancel:
          onDragCancel == null ? void 0 : onDragCancel(event);
          break;

        case Action.DragEnd:
          onDragEnd == null ? void 0 : onDragEnd(event);
          break;
      }

      previousMonitorState.current = monitorState;
    }
  }, [monitorState, onDragStart, onDragMove, onDragOver, onDragEnd, onDragCancel]);
}

function Accessibility({
  announcements = defaultAnnouncements,
  hiddenTextDescribedById,
  screenReaderInstructions
}) {
  const {
    announce,
    announcement
  } = accessibility.useAnnouncement();
  const liveRegionId = utilities.useUniqueId(`DndLiveRegion`);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  useDndMonitor(React.useMemo(() => ({
    onDragStart({
      active
    }) {
      announce(announcements.onDragStart(active.id));
    },

    onDragMove({
      active,
      over
    }) {
      if (announcements.onDragMove) {
        announce(announcements.onDragMove(active.id, over == null ? void 0 : over.id));
      }
    },

    onDragOver({
      active,
      over
    }) {
      announce(announcements.onDragOver(active.id, over == null ? void 0 : over.id));
    },

    onDragEnd({
      active,
      over
    }) {
      announce(announcements.onDragEnd(active.id, over == null ? void 0 : over.id));
    },

    onDragCancel({
      active
    }) {
      announce(announcements.onDragCancel(active.id));
    }

  }), [announce, announcements]));
  return mounted ? reactDom.createPortal(React__default.createElement(React__default.Fragment, null, React__default.createElement(accessibility.HiddenText, {
    id: hiddenTextDescribedById,
    value: screenReaderInstructions.draggable
  }), React__default.createElement(accessibility.LiveRegion, {
    id: liveRegionId,
    announcement: announcement
  })), document.body) : null;
}

const defaultCoordinates = /*#__PURE__*/Object.freeze({
  x: 0,
  y: 0
});

/**
 * Returns the distance between two points
 */
function distanceBetween(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function getRelativeTransformOrigin(event, rect) {
  if (utilities.isKeyboardEvent(event)) {
    return '0 0';
  }

  const eventCoordinates = utilities.getEventCoordinates(event);
  const transformOrigin = {
    x: (eventCoordinates.x - rect.left) / rect.width * 100,
    y: (eventCoordinates.y - rect.top) / rect.height * 100
  };
  return `${transformOrigin.x}% ${transformOrigin.y}%`;
}

/**
 * Returns the coordinates of the center of a given ClientRect
 */

function centerOfRectangle(rect, left = rect.offsetLeft, top = rect.offsetTop) {
  return {
    x: left + rect.width * 0.5,
    y: top + rect.height * 0.5
  };
}
/**
 * Returns the closest rectangle from an array of rectangles to the center of a given
 * rectangle.
 */


const closestCenter = ({
  collisionRect,
  droppableContainers
}) => {
  const centerRect = centerOfRectangle(collisionRect, collisionRect.left, collisionRect.top);
  let minDistanceToCenter = Infinity;
  let minDroppableContainer = null;

  for (const droppableContainer of droppableContainers) {
    const {
      rect: {
        current: rect
      }
    } = droppableContainer;

    if (rect) {
      const distBetween = distanceBetween(centerOfRectangle(rect), centerRect);

      if (distBetween < minDistanceToCenter) {
        minDistanceToCenter = distBetween;
        minDroppableContainer = droppableContainer.id;
      }
    }
  }

  return minDroppableContainer;
};

function adjustScale(transform, rect1, rect2) {
  return { ...transform,
    scaleX: rect1 && rect2 ? rect1.width / rect2.width : 1,
    scaleY: rect1 && rect2 ? rect1.height / rect2.height : 1
  };
}

function getRectDelta(rect1, rect2) {
  return rect1 && rect2 ? {
    x: rect1.left - rect2.left,
    y: rect1.top - rect2.top
  } : defaultCoordinates;
}

function createRectAdjustmentFn(modifier) {
  return function adjustViewRect(viewRect, ...adjustments) {
    return adjustments.reduce((acc, adjustment) => ({ ...acc,
      top: acc.top + modifier * adjustment.y,
      bottom: acc.bottom + modifier * adjustment.y,
      left: acc.left + modifier * adjustment.x,
      right: acc.right + modifier * adjustment.x,
      offsetLeft: acc.offsetLeft + modifier * adjustment.x,
      offsetTop: acc.offsetTop + modifier * adjustment.y
    }), { ...viewRect
    });
  };
}
const getAdjustedRect = /*#__PURE__*/createRectAdjustmentFn(1);

function isFixed(node, computedStyle = window.getComputedStyle(node)) {
  return computedStyle.position === 'fixed';
}

function isScrollable(node, computedStyle = window.getComputedStyle(node)) {
  const overflowRegex = /(auto|scroll|overlay)/;
  const properties = ['overflow', 'overflowX', 'overflowY'];
  return properties.find(property => {
    const value = computedStyle[property];
    return typeof value === 'string' ? overflowRegex.test(value) : false;
  }) != null;
}

function getScrollableAncestors(element) {
  const scrollParents = [];

  function findScrollableAncestors(node) {
    if (!node) {
      return scrollParents;
    }

    if (utilities.isDocument(node) && node.scrollingElement != null && !scrollParents.includes(node.scrollingElement)) {
      scrollParents.push(node.scrollingElement);
      return scrollParents;
    }

    if (!utilities.isHTMLElement(node) || utilities.isSVGElement(node)) {
      return scrollParents;
    }

    if (scrollParents.includes(node)) {
      return scrollParents;
    }

    const computedStyle = window.getComputedStyle(node);

    if (isScrollable(node, computedStyle)) {
      scrollParents.push(node);
    }

    if (isFixed(node, computedStyle)) {
      return scrollParents;
    }

    return findScrollableAncestors(node.parentNode);
  }

  return element ? findScrollableAncestors(element.parentNode) : scrollParents;
}

function getScrollableElement(element) {
  if (!utilities.canUseDOM || !element) {
    return null;
  }

  if (utilities.isWindow(element)) {
    return element;
  }

  if (!utilities.isNode(element)) {
    return null;
  }

  if (utilities.isDocument(element) || element === utilities.getOwnerDocument(element).scrollingElement) {
    return window;
  }

  if (utilities.isHTMLElement(element)) {
    return element;
  }

  return null;
}

function getScrollCoordinates(element) {
  if (utilities.isWindow(element)) {
    return {
      x: element.scrollX,
      y: element.scrollY
    };
  }

  return {
    x: element.scrollLeft,
    y: element.scrollTop
  };
}

var Direction;

(function (Direction) {
  Direction[Direction["Forward"] = 1] = "Forward";
  Direction[Direction["Backward"] = -1] = "Backward";
})(Direction || (Direction = {}));

function getScrollPosition(scrollingContainer) {
  const minScroll = {
    x: 0,
    y: 0
  };
  const maxScroll = {
    x: scrollingContainer.scrollWidth - scrollingContainer.clientWidth,
    y: scrollingContainer.scrollHeight - scrollingContainer.clientHeight
  };
  const isTop = scrollingContainer.scrollTop <= minScroll.y;
  const isLeft = scrollingContainer.scrollLeft <= minScroll.x;
  const isBottom = scrollingContainer.scrollTop >= maxScroll.y;
  const isRight = scrollingContainer.scrollLeft >= maxScroll.x;
  return {
    isTop,
    isLeft,
    isBottom,
    isRight,
    maxScroll,
    minScroll
  };
}

function isDocumentScrollingElement(element) {
  if (!utilities.canUseDOM || !element) {
    return false;
  }

  return element === document.scrollingElement;
}

const defaultThreshold = {
  x: 0.2,
  y: 0.2
};
function getScrollDirectionAndSpeed(scrollContainer, scrollContainerRect, {
  top,
  left,
  right,
  bottom
}, acceleration = 10, thresholdPercentage = defaultThreshold) {
  const {
    clientHeight,
    clientWidth
  } = scrollContainer;
  const finalScrollContainerRect = isDocumentScrollingElement(scrollContainer) ? {
    top: 0,
    left: 0,
    right: clientWidth,
    bottom: clientHeight,
    width: clientWidth,
    height: clientHeight
  } : scrollContainerRect;
  const {
    isTop,
    isBottom,
    isLeft,
    isRight
  } = getScrollPosition(scrollContainer);
  const direction = {
    x: 0,
    y: 0
  };
  const speed = {
    x: 0,
    y: 0
  };
  const threshold = {
    height: finalScrollContainerRect.height * thresholdPercentage.y,
    width: finalScrollContainerRect.width * thresholdPercentage.x
  };

  if (!isTop && top <= finalScrollContainerRect.top + threshold.height) {
    // Scroll Up
    direction.y = Direction.Backward;
    speed.y = acceleration * Math.abs((finalScrollContainerRect.top + threshold.height - top) / threshold.height);
  } else if (!isBottom && bottom >= finalScrollContainerRect.bottom - threshold.height) {
    // Scroll Down
    direction.y = Direction.Forward;
    speed.y = acceleration * Math.abs((finalScrollContainerRect.bottom - threshold.height - bottom) / threshold.height);
  }

  if (!isRight && right >= finalScrollContainerRect.right - threshold.width) {
    // Scroll Right
    direction.x = Direction.Forward;
    speed.x = acceleration * Math.abs((finalScrollContainerRect.right - threshold.width - right) / threshold.width);
  } else if (!isLeft && left <= finalScrollContainerRect.left + threshold.width) {
    // Scroll Left
    direction.x = Direction.Backward;
    speed.x = acceleration * Math.abs((finalScrollContainerRect.left + threshold.width - left) / threshold.width);
  }

  return {
    direction,
    speed
  };
}

function getScrollElementRect(element) {
  if (element === document.scrollingElement) {
    const {
      innerWidth,
      innerHeight
    } = window;
    return {
      top: 0,
      left: 0,
      right: innerWidth,
      bottom: innerHeight,
      width: innerWidth,
      height: innerHeight
    };
  }

  const {
    top,
    left,
    right,
    bottom
  } = element.getBoundingClientRect();
  return {
    top,
    left,
    right,
    bottom,
    width: element.clientWidth,
    height: element.clientHeight
  };
}

function getScrollOffsets(scrollableAncestors) {
  return scrollableAncestors.reduce((acc, node) => {
    return utilities.add(acc, getScrollCoordinates(node));
  }, defaultCoordinates);
}

function getEdgeOffset(node, parent, offset = defaultCoordinates) {
  if (!node || !utilities.isHTMLElement(node)) {
    return offset;
  }

  const nodeOffset = {
    x: offset.x + node.offsetLeft,
    y: offset.y + node.offsetTop
  };

  if (node.offsetParent === parent) {
    return nodeOffset;
  }

  return getEdgeOffset(node.offsetParent, parent, nodeOffset);
}

function getLayoutRect(element) {
  const {
    offsetWidth: width,
    offsetHeight: height
  } = element;
  const {
    x: offsetLeft,
    y: offsetTop
  } = getEdgeOffset(element, null);
  return {
    width,
    height,
    offsetTop,
    offsetLeft
  };
}
function getViewportLayoutRect(element) {
  const {
    width,
    height,
    top,
    left
  } = element.getBoundingClientRect();
  const scrollableAncestors = getScrollableAncestors(element);
  const scrollOffsets = getScrollOffsets(scrollableAncestors);
  return {
    width,
    height,
    offsetTop: top + scrollOffsets.y,
    offsetLeft: left + scrollOffsets.x
  };
}
function getBoundingClientRect(element) {
  if (utilities.isWindow(element)) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    return {
      top: 0,
      left: 0,
      right: width,
      bottom: height,
      width,
      height,
      offsetTop: 0,
      offsetLeft: 0
    };
  }

  const {
    offsetTop,
    offsetLeft
  } = getLayoutRect(element);
  const {
    width,
    height,
    top,
    bottom,
    left,
    right
  } = element.getBoundingClientRect();
  return {
    width,
    height,
    top,
    bottom,
    right,
    left,
    offsetTop,
    offsetLeft
  };
}
function getViewRect(element) {
  const {
    width,
    height,
    offsetTop,
    offsetLeft
  } = getLayoutRect(element);
  const scrollableAncestors = getScrollableAncestors(element);
  const scrollOffsets = getScrollOffsets(scrollableAncestors);
  const top = offsetTop - scrollOffsets.y;
  const left = offsetLeft - scrollOffsets.x;
  return {
    width,
    height,
    top,
    bottom: top + height,
    right: left + width,
    left,
    offsetTop,
    offsetLeft
  };
}

function isViewRect(entry) {
  return 'top' in entry;
}

/**
 * Returns the coordinates of the corners of a given rectangle:
 * [TopLeft {x, y}, TopRight {x, y}, BottomLeft {x, y}, BottomRight {x, y}]
 */

function cornersOfRectangle(rect, left = rect.offsetLeft, top = rect.offsetTop) {
  return [{
    x: left,
    y: top
  }, {
    x: left + rect.width,
    y: top
  }, {
    x: left,
    y: top + rect.height
  }, {
    x: left + rect.width,
    y: top + rect.height
  }];
}
/**
 * Returns the closest rectangle from an array of rectangles to the corners of
 * another rectangle.
 */


const closestCorners = ({
  collisionRect,
  droppableContainers
}) => {
  let minDistanceToCorners = Infinity;
  let minDistanceContainer = null;
  const corners = cornersOfRectangle(collisionRect, collisionRect.left, collisionRect.top);

  for (const droppableContainer of droppableContainers) {
    const {
      rect: {
        current: rect
      }
    } = droppableContainer;

    if (rect) {
      const rectCorners = cornersOfRectangle(rect, isViewRect(rect) ? rect.left : undefined, isViewRect(rect) ? rect.top : undefined);
      const distances = corners.reduce((accumulator, corner, index) => {
        return accumulator + distanceBetween(rectCorners[index], corner);
      }, 0);
      const effectiveDistance = Number((distances / 4).toFixed(4));

      if (effectiveDistance < minDistanceToCorners) {
        minDistanceToCorners = effectiveDistance;
        minDistanceContainer = droppableContainer.id;
      }
    }
  }

  return minDistanceContainer;
};

/**
 * Returns the intersecting rectangle area between two rectangles
 */
function getIntersectionRatio(entry, target) {
  const top = Math.max(target.top, entry.offsetTop);
  const left = Math.max(target.left, entry.offsetLeft);
  const right = Math.min(target.left + target.width, entry.offsetLeft + entry.width);
  const bottom = Math.min(target.top + target.height, entry.offsetTop + entry.height);
  const width = right - left;
  const height = bottom - top;

  if (left < right && top < bottom) {
    const targetArea = target.width * target.height;
    const entryArea = entry.width * entry.height;
    const intersectionArea = width * height;
    const intersectionRatio = intersectionArea / (targetArea + entryArea - intersectionArea);
    return Number(intersectionRatio.toFixed(4));
  } // Rectangles do not overlap, or overlap has an area of zero (edge/corner overlap)


  return 0;
}
/**
 * Returns the rectangle that has the greatest intersection area with a given
 * rectangle in an array of rectangles.
 */


const rectIntersection = ({
  collisionRect,
  droppableContainers
}) => {
  let maxIntersectionRatio = 0;
  let maxIntersectingDroppableContainer = null;

  for (const droppableContainer of droppableContainers) {
    const {
      rect: {
        current: rect
      }
    } = droppableContainer;

    if (rect) {
      const intersectionRatio = getIntersectionRatio(rect, collisionRect);

      if (intersectionRatio > maxIntersectionRatio) {
        maxIntersectionRatio = intersectionRatio;
        maxIntersectingDroppableContainer = droppableContainer.id;
      }
    }
  }

  return maxIntersectingDroppableContainer;
};

(function (AutoScrollActivator) {
  AutoScrollActivator[AutoScrollActivator["Pointer"] = 0] = "Pointer";
  AutoScrollActivator[AutoScrollActivator["DraggableRect"] = 1] = "DraggableRect";
})(exports.AutoScrollActivator || (exports.AutoScrollActivator = {}));

(function (TraversalOrder) {
  TraversalOrder[TraversalOrder["TreeOrder"] = 0] = "TreeOrder";
  TraversalOrder[TraversalOrder["ReversedTreeOrder"] = 1] = "ReversedTreeOrder";
})(exports.TraversalOrder || (exports.TraversalOrder = {}));

function useAutoScroller({
  acceleration,
  activator = exports.AutoScrollActivator.Pointer,
  canScroll,
  draggingRect,
  enabled,
  interval = 5,
  order = exports.TraversalOrder.TreeOrder,
  pointerCoordinates,
  scrollableAncestors,
  scrollableAncestorRects,
  threshold
}) {
  const [setAutoScrollInterval, clearAutoScrollInterval] = utilities.useInterval();
  const scrollSpeed = React.useRef({
    x: 1,
    y: 1
  });
  const rect = React.useMemo(() => {
    switch (activator) {
      case exports.AutoScrollActivator.Pointer:
        return pointerCoordinates ? {
          top: pointerCoordinates.y,
          bottom: pointerCoordinates.y,
          left: pointerCoordinates.x,
          right: pointerCoordinates.x
        } : null;

      case exports.AutoScrollActivator.DraggableRect:
        return draggingRect;
    }

    return null;
  }, [activator, draggingRect, pointerCoordinates]);
  const scrollDirection = React.useRef(defaultCoordinates);
  const scrollContainerRef = React.useRef(null);
  const autoScroll = React.useCallback(() => {
    const scrollContainer = scrollContainerRef.current;

    if (!scrollContainer) {
      return;
    }

    const scrollLeft = scrollSpeed.current.x * scrollDirection.current.x;
    const scrollTop = scrollSpeed.current.y * scrollDirection.current.y;
    scrollContainer.scrollBy(scrollLeft, scrollTop);
  }, []);
  const sortedScrollableAncestors = React.useMemo(() => order === exports.TraversalOrder.TreeOrder ? [...scrollableAncestors].reverse() : scrollableAncestors, [order, scrollableAncestors]);
  React.useEffect(() => {
    if (!enabled || !scrollableAncestors.length || !rect) {
      clearAutoScrollInterval();
      return;
    }

    for (const scrollContainer of sortedScrollableAncestors) {
      if ((canScroll == null ? void 0 : canScroll(scrollContainer)) === false) {
        continue;
      }

      const index = scrollableAncestors.indexOf(scrollContainer);
      const scrolllContainerRect = scrollableAncestorRects[index];

      if (!scrolllContainerRect) {
        continue;
      }

      const {
        direction,
        speed
      } = getScrollDirectionAndSpeed(scrollContainer, scrolllContainerRect, rect, acceleration, threshold);

      if (speed.x > 0 || speed.y > 0) {
        clearAutoScrollInterval();
        scrollContainerRef.current = scrollContainer;
        setAutoScrollInterval(autoScroll, interval);
        scrollSpeed.current = speed;
        scrollDirection.current = direction;
        return;
      }
    }

    scrollSpeed.current = {
      x: 0,
      y: 0
    };
    scrollDirection.current = {
      x: 0,
      y: 0
    };
    clearAutoScrollInterval();
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [acceleration, autoScroll, canScroll, clearAutoScrollInterval, enabled, interval, // eslint-disable-next-line react-hooks/exhaustive-deps
  JSON.stringify(rect), setAutoScrollInterval, scrollableAncestors, sortedScrollableAncestors, scrollableAncestorRects, // eslint-disable-next-line react-hooks/exhaustive-deps
  JSON.stringify(threshold)]);
}

function useCachedNode(draggableNodes, id) {
  const draggableNode = id !== null ? draggableNodes[id] : undefined;
  const node = draggableNode ? draggableNode.node.current : null;
  return utilities.useLazyMemo(cachedNode => {
    var _ref;

    if (id === null) {
      return null;
    } // In some cases, the draggable node can unmount while dragging
    // This is the case for virtualized lists. In those situations,
    // we fall back to the last known value for that node.


    return (_ref = node != null ? node : cachedNode) != null ? _ref : null;
  }, [node, id]);
}

function useCombineActivators(sensors, getSyntheticHandler) {
  return React.useMemo(() => sensors.reduce((accumulator, sensor) => {
    const {
      sensor: Sensor
    } = sensor;
    const sensorActivators = Sensor.activators.map(activator => ({
      eventName: activator.eventName,
      handler: getSyntheticHandler(activator.handler, sensor)
    }));
    return [...accumulator, ...sensorActivators];
  }, []), [sensors, getSyntheticHandler]);
}

function useData(data) {
  const dataRef = React.useRef(data);
  utilities.useIsomorphicLayoutEffect(() => {
    if (dataRef.current !== data) {
      dataRef.current = data;
    }
  }, [data]);
  return dataRef;
}

(function (MeasuringStrategy) {
  MeasuringStrategy[MeasuringStrategy["Always"] = 0] = "Always";
  MeasuringStrategy[MeasuringStrategy["BeforeDragging"] = 1] = "BeforeDragging";
  MeasuringStrategy[MeasuringStrategy["WhileDragging"] = 2] = "WhileDragging";
})(exports.MeasuringStrategy || (exports.MeasuringStrategy = {}));

(function (MeasuringFrequency) {
  MeasuringFrequency["Optimized"] = "optimized";
})(exports.MeasuringFrequency || (exports.MeasuringFrequency = {}));

const defaultValue = /*#__PURE__*/new Map();
const defaultConfig = {
  measure: getLayoutRect,
  strategy: exports.MeasuringStrategy.WhileDragging,
  frequency: exports.MeasuringFrequency.Optimized
};
function useDroppableMeasuring(containers, {
  dragging,
  dependencies,
  config
}) {
  const [willRecomputeLayouts, setWillRecomputeLayouts] = React.useState(false);
  const {
    frequency,
    measure,
    strategy
  } = { ...defaultConfig,
    ...config
  };
  const containersRef = React.useRef(containers);
  const recomputeLayouts = React.useCallback(() => setWillRecomputeLayouts(true), []);
  const recomputeLayoutsTimeoutId = React.useRef(null);
  const disabled = isDisabled();
  const layoutRectMap = utilities.useLazyMemo(previousValue => {
    if (disabled && !dragging) {
      return defaultValue;
    }

    if (!previousValue || previousValue === defaultValue || containersRef.current !== containers || willRecomputeLayouts) {
      for (let container of containers) {
        if (!container) {
          continue;
        }

        container.rect.current = container.node.current ? measure(container.node.current) : null;
      }

      return createLayoutRectMap(containers);
    }

    return previousValue;
  }, [containers, dragging, disabled, measure, willRecomputeLayouts]);
  React.useEffect(() => {
    containersRef.current = containers;
  }, [containers]);
  React.useEffect(() => {
    if (willRecomputeLayouts) {
      setWillRecomputeLayouts(false);
    }
  }, [willRecomputeLayouts]);
  React.useEffect(function recompute() {
    if (disabled) {
      return;
    }

    requestAnimationFrame(recomputeLayouts);
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [dragging, disabled]);
  React.useEffect(function forceRecomputeLayouts() {
    if (disabled || typeof frequency !== 'number' || recomputeLayoutsTimeoutId.current !== null) {
      return;
    }

    recomputeLayoutsTimeoutId.current = setTimeout(() => {
      recomputeLayouts();
      recomputeLayoutsTimeoutId.current = null;
    }, frequency);
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [frequency, disabled, recomputeLayouts, ...dependencies]);
  return {
    layoutRectMap,
    recomputeLayouts,
    willRecomputeLayouts
  };

  function isDisabled() {
    switch (strategy) {
      case exports.MeasuringStrategy.Always:
        return false;

      case exports.MeasuringStrategy.BeforeDragging:
        return dragging;

      default:
        return !dragging;
    }
  }
}

function createLayoutRectMap(containers) {
  const layoutRectMap = new Map();

  if (containers) {
    for (const container of containers) {
      if (!container) {
        continue;
      }

      const {
        id,
        rect
      } = container;

      if (rect.current == null) {
        continue;
      }

      layoutRectMap.set(id, rect.current);
    }
  }

  return layoutRectMap;
}

function useScrollOffsets(elements) {
  const [scrollCoordinates, setScrollCoordinates] = React.useState(null);
  const prevElements = React.useRef(elements); // To-do: Throttle the handleScroll callback

  const handleScroll = React.useCallback(event => {
    const scrollingElement = getScrollableElement(event.target);

    if (!scrollingElement) {
      return;
    }

    setScrollCoordinates(scrollCoordinates => {
      if (!scrollCoordinates) {
        return null;
      }

      scrollCoordinates.set(scrollingElement, getScrollCoordinates(scrollingElement));
      return new Map(scrollCoordinates);
    });
  }, []);
  React.useEffect(() => {
    const previousElements = prevElements.current;

    if (elements !== previousElements) {
      cleanup(previousElements);
      const entries = elements.map(element => {
        const scrollableElement = getScrollableElement(element);

        if (scrollableElement) {
          scrollableElement.addEventListener('scroll', handleScroll, {
            passive: true
          });
          return [scrollableElement, getScrollCoordinates(scrollableElement)];
        }

        return null;
      }).filter(entry => entry != null);
      setScrollCoordinates(entries.length ? new Map(entries) : null);
      prevElements.current = elements;
    }

    return () => {
      cleanup(elements);
      cleanup(previousElements);
    };

    function cleanup(elements) {
      elements.forEach(element => {
        const scrollableElement = getScrollableElement(element);
        scrollableElement == null ? void 0 : scrollableElement.removeEventListener('scroll', handleScroll);
      });
    }
  }, [handleScroll, elements]);
  return React.useMemo(() => {
    if (elements.length) {
      return scrollCoordinates ? Array.from(scrollCoordinates.values()).reduce((acc, coordinates) => utilities.add(acc, coordinates), defaultCoordinates) : getScrollOffsets(elements);
    }

    return defaultCoordinates;
  }, [elements, scrollCoordinates]);
}

const defaultValue$1 = [];
function useScrollableAncestors(node) {
  const previousNode = React.useRef(node);
  const ancestors = utilities.useLazyMemo(previousValue => {
    if (!node) {
      return defaultValue$1;
    }

    if (previousValue && node && previousNode.current && node.parentNode === previousNode.current.parentNode) {
      return previousValue;
    }

    return getScrollableAncestors(node);
  }, [node]);
  React.useEffect(() => {
    previousNode.current = node;
  }, [node]);
  return ancestors;
}

function useSensorSetup(sensors) {
  React.useEffect(() => {
    if (!utilities.canUseDOM) {
      return;
    }

    const teardownFns = sensors.map(({
      sensor
    }) => sensor.setup == null ? void 0 : sensor.setup());
    return () => {
      for (const teardown of teardownFns) {
        teardown == null ? void 0 : teardown();
      }
    };
  }, // TO-DO: Sensors lenght could theoretically change which would not be a valid dependency
  // eslint-disable-next-line react-hooks/exhaustive-deps
  sensors.map(({
    sensor
  }) => sensor));
}

function useSyntheticListeners(listeners, id) {
  return React.useMemo(() => {
    return listeners.reduce((acc, {
      eventName,
      handler
    }) => {
      acc[eventName] = event => {
        handler(event, id);
      };

      return acc;
    }, {});
  }, [listeners, id]);
}

const useClientRect = /*#__PURE__*/createUseRectFn(getBoundingClientRect);
const useClientRects = /*#__PURE__*/createUseRectsFn(getBoundingClientRect);
function useRect(element, getRect, forceRecompute) {
  const previousElement = React.useRef(element);
  return utilities.useLazyMemo(previousValue => {
    if (!element) {
      return null;
    }

    if (forceRecompute || !previousValue && element || element !== previousElement.current) {
      if (utilities.isHTMLElement(element) && element.parentNode == null) {
        return null;
      }

      return getRect(element);
    }

    return previousValue != null ? previousValue : null;
  }, [element, forceRecompute, getRect]);
}
function createUseRectFn(getRect) {
  return (element, forceRecompute) => useRect(element, getRect, forceRecompute);
}

function createUseRectsFn(getRect) {
  const defaultValue = [];
  return function useRects(elements, forceRecompute) {
    const previousElements = React.useRef(elements);
    return utilities.useLazyMemo(previousValue => {
      if (!elements.length) {
        return defaultValue;
      }

      if (forceRecompute || !previousValue && elements.length || elements !== previousElements.current) {
        return elements.map(element => getRect(element));
      }

      return previousValue != null ? previousValue : defaultValue;
    }, [elements, forceRecompute]);
  };
}

function getMeasurableNode(node) {
  if (!node) {
    return null;
  }

  if (node.children.length > 1) {
    return node;
  }

  const firstChild = node.children[0];
  return utilities.isHTMLElement(firstChild) ? firstChild : node;
}

function getDragOverlayRect(element) {
  const {
    width,
    height,
    offsetLeft,
    offsetTop
  } = getLayoutRect(element);
  return {
    top: offsetTop,
    bottom: offsetTop + height,
    left: offsetLeft,
    right: offsetLeft + width,
    width,
    height,
    offsetTop,
    offsetLeft
  };
}

const useDragOverlayRect = /*#__PURE__*/createUseRectFn(getDragOverlayRect);
function useDragOverlayMeasuring({
  disabled,
  forceRecompute
}) {
  const [nodeRef, setRef] = utilities.useNodeRef();
  const rect = useDragOverlayRect(disabled ? null : getMeasurableNode(nodeRef.current), forceRecompute);
  return React.useMemo(() => ({
    nodeRef,
    rect,
    setRef
  }), [rect, nodeRef, setRef]);
}

function useSensor(sensor, options) {
  return React.useMemo(() => ({
    sensor,
    options: options != null ? options : {}
  }), // eslint-disable-next-line react-hooks/exhaustive-deps
  [sensor, options]);
}

function useSensors(...sensors) {
  return React.useMemo(() => [...sensors].filter(sensor => sensor != null), // eslint-disable-next-line react-hooks/exhaustive-deps
  [...sensors]);
}

class Listeners {
  constructor(target) {
    this.target = void 0;
    this.listeners = [];

    this.removeAll = () => {
      this.listeners.forEach(listener => {
        var _this$target;

        return (_this$target = this.target) == null ? void 0 : _this$target.removeEventListener(...listener);
      });
    };

    this.target = target;
  }

  add(eventName, handler, options) {
    var _this$target2;

    (_this$target2 = this.target) == null ? void 0 : _this$target2.addEventListener(eventName, handler, options);
    this.listeners.push([eventName, handler, options]);
  }

}

function getEventListenerTarget(target) {
  // If the `event.target` element is removed from the document events will still be targeted
  // at it, and hence won't always bubble up to the window or document anymore.
  // If there is any risk of an element being removed while it is being dragged,
  // the best practice is to attach the event listeners directly to the target.
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
  const {
    EventTarget
  } = utilities.getWindow(target);
  return target instanceof EventTarget ? target : utilities.getOwnerDocument(target);
}

function hasExceededDistance(delta, measurement) {
  const dx = Math.abs(delta.x);
  const dy = Math.abs(delta.y);

  if (typeof measurement === 'number') {
    return Math.sqrt(dx ** 2 + dy ** 2) > measurement;
  }

  if ('x' in measurement && 'y' in measurement) {
    return dx > measurement.x && dy > measurement.y;
  }

  if ('x' in measurement) {
    return dx > measurement.x;
  }

  if ('y' in measurement) {
    return dy > measurement.y;
  }

  return false;
}

var EventName;

(function (EventName) {
  EventName["Click"] = "click";
  EventName["DragStart"] = "dragstart";
  EventName["Keydown"] = "keydown";
  EventName["ContextMenu"] = "contextmenu";
  EventName["Resize"] = "resize";
  EventName["SelectionChange"] = "selectionchange";
  EventName["VisibilityChange"] = "visibilitychange";
})(EventName || (EventName = {}));

function preventDefault(event) {
  event.preventDefault();
}
function stopPropagation(event) {
  event.stopPropagation();
}

(function (KeyboardCode) {
  KeyboardCode["Space"] = "Space";
  KeyboardCode["Down"] = "ArrowDown";
  KeyboardCode["Right"] = "ArrowRight";
  KeyboardCode["Left"] = "ArrowLeft";
  KeyboardCode["Up"] = "ArrowUp";
  KeyboardCode["Esc"] = "Escape";
  KeyboardCode["Enter"] = "Enter";
})(exports.KeyboardCode || (exports.KeyboardCode = {}));

const defaultKeyboardCodes = {
  start: [exports.KeyboardCode.Space, exports.KeyboardCode.Enter],
  cancel: [exports.KeyboardCode.Esc],
  end: [exports.KeyboardCode.Space, exports.KeyboardCode.Enter]
};
const defaultKeyboardCoordinateGetter = (event, {
  currentCoordinates
}) => {
  switch (event.code) {
    case exports.KeyboardCode.Right:
      return { ...currentCoordinates,
        x: currentCoordinates.x + 25
      };

    case exports.KeyboardCode.Left:
      return { ...currentCoordinates,
        x: currentCoordinates.x - 25
      };

    case exports.KeyboardCode.Down:
      return { ...currentCoordinates,
        y: currentCoordinates.y + 25
      };

    case exports.KeyboardCode.Up:
      return { ...currentCoordinates,
        y: currentCoordinates.y - 25
      };
  }

  return undefined;
};

class KeyboardSensor {
  constructor(props) {
    this.props = void 0;
    this.autoScrollEnabled = false;
    this.coordinates = defaultCoordinates;
    this.listeners = void 0;
    this.windowListeners = void 0;
    this.props = props;
    const {
      event: {
        target
      }
    } = props;
    this.props = props;
    this.listeners = new Listeners(utilities.getOwnerDocument(target));
    this.windowListeners = new Listeners(utilities.getWindow(target));
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.attach();
  }

  attach() {
    this.handleStart();
    this.windowListeners.add(EventName.Resize, this.handleCancel);
    this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
    setTimeout(() => this.listeners.add(EventName.Keydown, this.handleKeyDown));
  }

  handleStart() {
    const {
      activeNode,
      onStart
    } = this.props;

    if (!activeNode.node.current) {
      throw new Error('Active draggable node is undefined');
    }

    const activeNodeRect = getBoundingClientRect(activeNode.node.current);
    const coordinates = {
      x: activeNodeRect.left,
      y: activeNodeRect.top
    };
    this.coordinates = coordinates;
    onStart(coordinates);
  }

  handleKeyDown(event) {
    if (utilities.isKeyboardEvent(event)) {
      const {
        coordinates
      } = this;
      const {
        active,
        context,
        options
      } = this.props;
      const {
        keyboardCodes = defaultKeyboardCodes,
        coordinateGetter = defaultKeyboardCoordinateGetter,
        scrollBehavior = 'smooth'
      } = options;
      const {
        code
      } = event;

      if (keyboardCodes.end.includes(code)) {
        this.handleEnd(event);
        return;
      }

      if (keyboardCodes.cancel.includes(code)) {
        this.handleCancel(event);
        return;
      }

      const newCoordinates = coordinateGetter(event, {
        active,
        context: context.current,
        currentCoordinates: coordinates
      });

      if (newCoordinates) {
        const scrollDelta = {
          x: 0,
          y: 0
        };
        const {
          scrollableAncestors
        } = context.current;

        for (const scrollContainer of scrollableAncestors) {
          const direction = event.code;
          const coordinatesDelta = utilities.subtract(newCoordinates, coordinates);
          const {
            isTop,
            isRight,
            isLeft,
            isBottom,
            maxScroll,
            minScroll
          } = getScrollPosition(scrollContainer);
          const scrollElementRect = getScrollElementRect(scrollContainer);
          const clampedCoordinates = {
            x: Math.min(direction === exports.KeyboardCode.Right ? scrollElementRect.right - scrollElementRect.width / 2 : scrollElementRect.right, Math.max(direction === exports.KeyboardCode.Right ? scrollElementRect.left : scrollElementRect.left + scrollElementRect.width / 2, newCoordinates.x)),
            y: Math.min(direction === exports.KeyboardCode.Down ? scrollElementRect.bottom - scrollElementRect.height / 2 : scrollElementRect.bottom, Math.max(direction === exports.KeyboardCode.Down ? scrollElementRect.top : scrollElementRect.top + scrollElementRect.height / 2, newCoordinates.y))
          };
          const canScrollX = direction === exports.KeyboardCode.Right && !isRight || direction === exports.KeyboardCode.Left && !isLeft;
          const canScrollY = direction === exports.KeyboardCode.Down && !isBottom || direction === exports.KeyboardCode.Up && !isTop;

          if (canScrollX && clampedCoordinates.x !== newCoordinates.x) {
            const canFullyScrollToNewCoordinates = direction === exports.KeyboardCode.Right && scrollContainer.scrollLeft + coordinatesDelta.x <= maxScroll.x || direction === exports.KeyboardCode.Left && scrollContainer.scrollLeft + coordinatesDelta.x >= minScroll.x;

            if (canFullyScrollToNewCoordinates) {
              // We don't need to update coordinates, the scroll adjustment alone will trigger
              // logic to auto-detect the new container we are over
              scrollContainer.scrollBy({
                left: coordinatesDelta.x,
                behavior: scrollBehavior
              });
              return;
            }

            scrollDelta.x = direction === exports.KeyboardCode.Right ? scrollContainer.scrollLeft - maxScroll.x : scrollContainer.scrollLeft - minScroll.x;
            scrollContainer.scrollBy({
              left: -scrollDelta.x,
              behavior: scrollBehavior
            });
            break;
          } else if (canScrollY && clampedCoordinates.y !== newCoordinates.y) {
            const canFullyScrollToNewCoordinates = direction === exports.KeyboardCode.Down && scrollContainer.scrollTop + coordinatesDelta.y <= maxScroll.y || direction === exports.KeyboardCode.Up && scrollContainer.scrollTop + coordinatesDelta.y >= minScroll.y;

            if (canFullyScrollToNewCoordinates) {
              // We don't need to update coordinates, the scroll adjustment alone will trigger
              // logic to auto-detect the new container we are over
              scrollContainer.scrollBy({
                top: coordinatesDelta.y,
                behavior: scrollBehavior
              });
              return;
            }

            scrollDelta.y = direction === exports.KeyboardCode.Down ? scrollContainer.scrollTop - maxScroll.y : scrollContainer.scrollTop - minScroll.y;
            scrollContainer.scrollBy({
              top: -scrollDelta.y,
              behavior: scrollBehavior
            });
            break;
          }
        }

        this.handleMove(event, utilities.add(newCoordinates, scrollDelta));
      }
    }
  }

  handleMove(event, coordinates) {
    const {
      onMove
    } = this.props;
    event.preventDefault();
    onMove(coordinates);
    this.coordinates = coordinates;
  }

  handleEnd(event) {
    const {
      onEnd
    } = this.props;
    event.preventDefault();
    this.detach();
    onEnd();
  }

  handleCancel(event) {
    const {
      onCancel
    } = this.props;
    event.preventDefault();
    this.detach();
    onCancel();
  }

  detach() {
    this.listeners.removeAll();
    this.windowListeners.removeAll();
  }

}
KeyboardSensor.activators = [{
  eventName: 'onKeyDown',
  handler: (event, {
    keyboardCodes = defaultKeyboardCodes,
    onActivation
  }) => {
    const {
      code
    } = event.nativeEvent;

    if (keyboardCodes.start.includes(code)) {
      event.preventDefault();
      onActivation == null ? void 0 : onActivation({
        event: event.nativeEvent
      });
      return true;
    }

    return false;
  }
}];

function isDistanceConstraint(constraint) {
  return Boolean(constraint && 'distance' in constraint);
}

function isDelayConstraint(constraint) {
  return Boolean(constraint && 'delay' in constraint);
}

class AbstractPointerSensor {
  constructor(props, events, listenerTarget = getEventListenerTarget(props.event.target)) {
    this.props = void 0;
    this.events = void 0;
    this.autoScrollEnabled = true;
    this.document = void 0;
    this.activated = false;
    this.initialCoordinates = void 0;
    this.timeoutId = null;
    this.listeners = void 0;
    this.documentListeners = void 0;
    this.windowListeners = void 0;
    this.props = props;
    this.events = events;
    const {
      event
    } = props;
    const {
      target
    } = event;
    this.props = props;
    this.events = events;
    this.document = utilities.getOwnerDocument(target);
    this.documentListeners = new Listeners(this.document);
    this.listeners = new Listeners(listenerTarget);
    this.windowListeners = new Listeners(utilities.getWindow(target));
    this.initialCoordinates = utilities.getEventCoordinates(event);
    this.handleStart = this.handleStart.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.removeTextSelection = this.removeTextSelection.bind(this);
    this.attach();
  }

  attach() {
    const {
      events,
      props: {
        options: {
          activationConstraint
        }
      }
    } = this;
    this.listeners.add(events.move.name, this.handleMove, {
      passive: false
    });
    this.listeners.add(events.end.name, this.handleEnd);
    this.windowListeners.add(EventName.Resize, this.handleCancel);
    this.windowListeners.add(EventName.DragStart, preventDefault);
    this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
    this.windowListeners.add(EventName.ContextMenu, preventDefault);
    this.documentListeners.add(EventName.Keydown, this.handleKeydown);

    if (activationConstraint) {
      if (isDistanceConstraint(activationConstraint)) {
        return;
      }

      if (isDelayConstraint(activationConstraint)) {
        this.timeoutId = setTimeout(this.handleStart, activationConstraint.delay);
        return;
      }
    }

    this.handleStart();
  }

  detach() {
    this.listeners.removeAll();
    this.windowListeners.removeAll(); // Wait until the next event loop before removing document listeners
    // This is necessary because we listen for `click` and `selection` events on the document

    setTimeout(this.documentListeners.removeAll, 50);

    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  handleStart() {
    const {
      initialCoordinates
    } = this;
    const {
      onStart
    } = this.props;

    if (initialCoordinates) {
      this.activated = true; // Stop propagation of click events once activation constraints are met

      this.documentListeners.add(EventName.Click, stopPropagation, {
        capture: true
      }); // Remove any text selection from the document

      this.removeTextSelection(); // Prevent further text selection while dragging

      this.documentListeners.add(EventName.SelectionChange, this.removeTextSelection);
      onStart(initialCoordinates);
    }
  }

  handleMove(event) {
    const {
      activated,
      initialCoordinates,
      props
    } = this;
    const {
      onMove,
      options: {
        activationConstraint
      }
    } = props;

    if (!initialCoordinates) {
      return;
    }

    const coordinates = utilities.getEventCoordinates(event);
    const delta = utilities.subtract(initialCoordinates, coordinates);

    if (!activated && activationConstraint) {
      // Constraint validation
      if (isDelayConstraint(activationConstraint)) {
        if (hasExceededDistance(delta, activationConstraint.tolerance)) {
          return this.handleCancel();
        }

        return;
      }

      if (isDistanceConstraint(activationConstraint)) {
        if (activationConstraint.tolerance != null && hasExceededDistance(delta, activationConstraint.tolerance)) {
          return this.handleCancel();
        }

        if (hasExceededDistance(delta, activationConstraint.distance)) {
          return this.handleStart();
        }

        return;
      }
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    onMove(coordinates);
  }

  handleEnd() {
    const {
      onEnd
    } = this.props;
    this.detach();
    onEnd();
  }

  handleCancel() {
    const {
      onCancel
    } = this.props;
    this.detach();
    onCancel();
  }

  handleKeydown(event) {
    if (event.code === exports.KeyboardCode.Esc) {
      this.handleCancel();
    }
  }

  removeTextSelection() {
    var _this$document$getSel;

    (_this$document$getSel = this.document.getSelection()) == null ? void 0 : _this$document$getSel.removeAllRanges();
  }

}

const events = {
  move: {
    name: 'pointermove'
  },
  end: {
    name: 'pointerup'
  }
};
class PointerSensor extends AbstractPointerSensor {
  constructor(props) {
    const {
      event
    } = props; // Pointer events stop firing if the target is unmounted while dragging
    // Therefore we attach listeners to the owner document instead

    const listenerTarget = utilities.getOwnerDocument(event.target);
    super(props, events, listenerTarget);
  }

}
PointerSensor.activators = [{
  eventName: 'onPointerDown',
  handler: ({
    nativeEvent: event
  }, {
    onActivation
  }) => {
    if (!event.isPrimary || event.button !== 0) {
      return false;
    }

    onActivation == null ? void 0 : onActivation({
      event
    });
    return true;
  }
}];

const events$1 = {
  move: {
    name: 'mousemove'
  },
  end: {
    name: 'mouseup'
  }
};
var MouseButton;

(function (MouseButton) {
  MouseButton[MouseButton["RightClick"] = 2] = "RightClick";
})(MouseButton || (MouseButton = {}));

class MouseSensor extends AbstractPointerSensor {
  constructor(props) {
    super(props, events$1, utilities.getOwnerDocument(props.event.target));
  }

}
MouseSensor.activators = [{
  eventName: 'onMouseDown',
  handler: ({
    nativeEvent: event
  }, {
    onActivation
  }) => {
    if (event.button === MouseButton.RightClick) {
      return false;
    }

    onActivation == null ? void 0 : onActivation({
      event
    });
    return true;
  }
}];

const events$2 = {
  move: {
    name: 'touchmove'
  },
  end: {
    name: 'touchend'
  }
};
class TouchSensor extends AbstractPointerSensor {
  constructor(props) {
    super(props, events$2);
  }

  static setup() {
    // Adding a non-capture and non-passive `touchmove` listener in order
    // to force `event.preventDefault()` calls to work in dynamically added
    // touchmove event handlers. This is required for iOS Safari.
    window.addEventListener(events$2.move.name, noop, {
      capture: false,
      passive: false
    });
    return function teardown() {
      window.removeEventListener(events$2.move.name, noop);
    }; // We create a new handler because the teardown function of another sensor
    // could remove our event listener if we use a referentially equal listener.

    function noop() {}
  }

}
TouchSensor.activators = [{
  eventName: 'onTouchStart',
  handler: ({
    nativeEvent: event
  }, {
    onActivation
  }) => {
    const {
      touches
    } = event;

    if (touches.length > 1) {
      return false;
    }

    onActivation == null ? void 0 : onActivation({
      event
    });
    return true;
  }
}];

function applyModifiers(modifiers, {
  transform,
  ...args
}) {
  return (modifiers == null ? void 0 : modifiers.length) ? modifiers.reduce((accumulator, modifier) => {
    return modifier({
      transform: accumulator,
      ...args
    });
  }, transform) : transform;
}

const defaultSensors = [{
  sensor: PointerSensor,
  options: {}
}, {
  sensor: KeyboardSensor,
  options: {}
}];
const defaultData = {
  current: {}
};
const ActiveDraggableContext = /*#__PURE__*/React.createContext({ ...defaultCoordinates,
  scaleX: 1,
  scaleY: 1
});
const DndContext = /*#__PURE__*/React.memo(function DndContext({
  id,
  autoScroll = true,
  announcements,
  children,
  sensors = defaultSensors,
  collisionDetection = rectIntersection,
  measuring,
  modifiers,
  screenReaderInstructions: screenReaderInstructions$1 = screenReaderInstructions,
  ...props
}) {
  var _measuring$draggable$, _measuring$draggable, _sensorContext$curren, _dragOverlay$rect, _over$rect;

  const store = React.useReducer(reducer, undefined, getInitialState);
  const [state, dispatch] = store;
  const [monitorState, setMonitorState] = React.useState(() => ({
    type: null,
    event: null
  }));
  const [isDragging, setIsDragging] = React.useState(false);
  const {
    draggable: {
      active: activeId,
      nodes: draggableNodes,
      translate
    },
    droppable: {
      containers: droppableContainers
    }
  } = state;
  const node = activeId ? draggableNodes[activeId] : null;
  const activeRects = React.useRef({
    initial: null,
    translated: null
  });
  const active = React.useMemo(() => {
    var _node$data;

    return activeId != null ? {
      id: activeId,
      // It's possible for the active node to unmount while dragging
      data: (_node$data = node == null ? void 0 : node.data) != null ? _node$data : defaultData,
      rect: activeRects
    } : null;
  }, [activeId, node]);
  const activeRef = React.useRef(null);
  const [activeSensor, setActiveSensor] = React.useState(null);
  const [activatorEvent, setActivatorEvent] = React.useState(null);
  const latestProps = React.useRef(props);
  const draggableDescribedById = utilities.useUniqueId(`DndDescribedBy`, id);
  const enabledDroppableContainers = React.useMemo(() => {
    return droppableContainers.getEnabled();
  }, [droppableContainers]);
  const {
    layoutRectMap: droppableRects,
    recomputeLayouts,
    willRecomputeLayouts
  } = useDroppableMeasuring(enabledDroppableContainers, {
    dragging: isDragging,
    dependencies: [translate.x, translate.y],
    config: measuring == null ? void 0 : measuring.droppable
  });
  const activeNode = useCachedNode(draggableNodes, activeId);
  const activationCoordinates = activatorEvent ? utilities.getEventCoordinates(activatorEvent) : null;
  const activeNodeRect = useRect(activeNode, (_measuring$draggable$ = measuring == null ? void 0 : (_measuring$draggable = measuring.draggable) == null ? void 0 : _measuring$draggable.measure) != null ? _measuring$draggable$ : getViewRect);
  const activeNodeClientRect = useClientRect(activeNode);
  const initialActiveNodeRectRef = React.useRef(null);
  const initialActiveNodeRect = initialActiveNodeRectRef.current;
  const sensorContext = React.useRef({
    active: null,
    activeNode,
    collisionRect: null,
    droppableRects,
    draggableNodes,
    draggingNodeRect: null,
    droppableContainers,
    over: null,
    scrollableAncestors: [],
    scrollAdjustedTranslate: null,
    translatedRect: null
  });
  const overNode = droppableContainers.getNodeFor((_sensorContext$curren = sensorContext.current.over) == null ? void 0 : _sensorContext$curren.id);
  const windowRect = useClientRect(activeNode ? activeNode.ownerDocument.defaultView : null);
  const containerNodeRect = useClientRect(activeNode ? activeNode.parentElement : null);
  const scrollableAncestors = useScrollableAncestors(activeId ? overNode != null ? overNode : activeNode : null);
  const scrollableAncestorRects = useClientRects(scrollableAncestors);
  const dragOverlay = useDragOverlayMeasuring({
    disabled: activeId == null,
    forceRecompute: willRecomputeLayouts
  }); // Use the rect of the drag overlay if it is mounted

  const draggingNodeRect = (_dragOverlay$rect = dragOverlay.rect) != null ? _dragOverlay$rect : activeNodeRect; // The delta between the previous and new position of the draggable node
  // is only relevant when there is no drag overlay

  const nodeRectDelta = draggingNodeRect === activeNodeRect ? getRectDelta(activeNodeRect, initialActiveNodeRect) : defaultCoordinates;
  const modifiedTranslate = applyModifiers(modifiers, {
    transform: {
      x: translate.x - nodeRectDelta.x,
      y: translate.y - nodeRectDelta.y,
      scaleX: 1,
      scaleY: 1
    },
    activatorEvent,
    active,
    activeNodeRect: activeNodeClientRect,
    containerNodeRect,
    draggingNodeRect,
    over: sensorContext.current.over,
    overlayNodeRect: dragOverlay.rect,
    scrollableAncestors,
    scrollableAncestorRects,
    windowRect
  });
  const pointerCoordinates = activationCoordinates ? utilities.add(activationCoordinates, translate) : null;
  const scrollAdjustment = useScrollOffsets(scrollableAncestors);
  const scrollAdjustedTranslate = utilities.add(modifiedTranslate, scrollAdjustment);
  const translatedRect = draggingNodeRect ? getAdjustedRect(draggingNodeRect, modifiedTranslate) : null;
  const collisionRect = translatedRect ? getAdjustedRect(translatedRect, scrollAdjustment) : null;
  const overId = active && collisionRect ? collisionDetection({
    active,
    collisionRect,
    droppableContainers: enabledDroppableContainers
  }) : null;
  const [over, setOver] = React.useState(null);
  const transform = adjustScale(modifiedTranslate, (_over$rect = over == null ? void 0 : over.rect) != null ? _over$rect : null, activeNodeRect);
  const instantiateSensor = React.useCallback((event, {
    sensor: Sensor,
    options
  }) => {
    if (!activeRef.current) {
      return;
    }

    const activeNode = draggableNodes[activeRef.current];

    if (!activeNode) {
      return;
    }

    const sensorInstance = new Sensor({
      active: activeRef.current,
      activeNode,
      event: event.nativeEvent,
      options,
      // Sensors need to be instantiated with refs for arguments that change over time
      // otherwise they are frozen in time with the stale arguments
      context: sensorContext,

      onStart(initialCoordinates) {
        const id = activeRef.current;

        if (!id) {
          return;
        }

        const node = draggableNodes[id];

        if (!node) {
          return;
        }

        const {
          onDragStart
        } = latestProps.current;
        const event = {
          active: {
            id,
            data: node.data,
            rect: activeRects
          }
        };
        reactDom.unstable_batchedUpdates(() => {
          dispatch({
            type: Action.DragStart,
            initialCoordinates,
            active: id
          });
          setMonitorState({
            type: Action.DragStart,
            event
          });
        });
        onDragStart == null ? void 0 : onDragStart(event);
      },

      onMove(coordinates) {
        dispatch({
          type: Action.DragMove,
          coordinates
        });
      },

      onEnd: createHandler(Action.DragEnd),
      onCancel: createHandler(Action.DragCancel)
    });
    reactDom.unstable_batchedUpdates(() => {
      setActiveSensor(sensorInstance);
      setActivatorEvent(event.nativeEvent);
    });

    function createHandler(type) {
      return async function handler() {
        const {
          active,
          over,
          scrollAdjustedTranslate
        } = sensorContext.current;
        let event = null;

        if (active && scrollAdjustedTranslate) {
          const {
            cancelDrop
          } = latestProps.current;
          event = {
            active: active,
            delta: scrollAdjustedTranslate,
            over
          };

          if (type === Action.DragEnd && typeof cancelDrop === 'function') {
            const shouldCancel = await Promise.resolve(cancelDrop(event));

            if (shouldCancel) {
              type = Action.DragCancel;
            }
          }
        }

        activeRef.current = null;
        reactDom.unstable_batchedUpdates(() => {
          dispatch({
            type
          });
          setOver(null);
          setIsDragging(false);
          setActiveSensor(null);
          setActivatorEvent(null);

          if (event) {
            setMonitorState({
              type,
              event
            });
          }
        });

        if (event) {
          const {
            onDragCancel,
            onDragEnd
          } = latestProps.current;
          const handler = type === Action.DragEnd ? onDragEnd : onDragCancel;
          handler == null ? void 0 : handler(event);
        }
      };
    }
  }, [dispatch, draggableNodes]);
  const bindActivatorToSensorInstantiator = React.useCallback((handler, sensor) => {
    return (event, active) => {
      const nativeEvent = event.nativeEvent;

      if ( // No active draggable
      activeRef.current !== null || // Event has already been captured
      nativeEvent.dndKit || nativeEvent.defaultPrevented) {
        return;
      }

      if (handler(event, sensor.options) === true) {
        nativeEvent.dndKit = {
          capturedBy: sensor.sensor
        };
        activeRef.current = active;
        instantiateSensor(event, sensor);
      }
    };
  }, [instantiateSensor]);
  const activators = useCombineActivators(sensors, bindActivatorToSensorInstantiator);
  useSensorSetup(sensors);
  utilities.useIsomorphicLayoutEffect(() => {
    latestProps.current = props;
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  Object.values(props));
  React.useEffect(() => {
    if (activeId != null) {
      setIsDragging(true);
    }
  }, [activeId]);
  React.useEffect(() => {
    if (!active) {
      initialActiveNodeRectRef.current = null;
    }

    if (active && activeNodeRect && !initialActiveNodeRectRef.current) {
      initialActiveNodeRectRef.current = activeNodeRect;
    }
  }, [activeNodeRect, active]);
  React.useEffect(() => {
    const {
      onDragMove
    } = latestProps.current;
    const {
      active,
      over
    } = sensorContext.current;

    if (!active) {
      return;
    }

    const event = {
      active,
      delta: {
        x: scrollAdjustedTranslate.x,
        y: scrollAdjustedTranslate.y
      },
      over
    };
    setMonitorState({
      type: Action.DragMove,
      event
    });
    onDragMove == null ? void 0 : onDragMove(event);
  }, [scrollAdjustedTranslate.x, scrollAdjustedTranslate.y]);
  React.useEffect(() => {
    const {
      active,
      droppableContainers,
      scrollAdjustedTranslate
    } = sensorContext.current;

    if (!active || !activeRef.current || !scrollAdjustedTranslate) {
      return;
    }

    const {
      onDragOver
    } = latestProps.current;
    const overContainer = droppableContainers.get(overId);
    const over = overContainer && overContainer.rect.current ? {
      id: overContainer.id,
      rect: overContainer.rect.current,
      data: overContainer.data,
      disabled: overContainer.disabled
    } : null;
    const event = {
      active,
      delta: {
        x: scrollAdjustedTranslate.x,
        y: scrollAdjustedTranslate.y
      },
      over
    };
    reactDom.unstable_batchedUpdates(() => {
      setOver(over);
      setMonitorState({
        type: Action.DragOver,
        event
      });
      onDragOver == null ? void 0 : onDragOver(event);
    });
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [overId]);
  utilities.useIsomorphicLayoutEffect(() => {
    sensorContext.current = {
      active,
      activeNode,
      collisionRect,
      droppableRects,
      draggableNodes,
      draggingNodeRect,
      droppableContainers,
      over,
      scrollableAncestors,
      scrollAdjustedTranslate: scrollAdjustedTranslate,
      translatedRect
    };
    activeRects.current = {
      initial: draggingNodeRect,
      translated: translatedRect
    };
  }, [active, activeNode, collisionRect, draggableNodes, draggingNodeRect, droppableRects, droppableContainers, over, scrollableAncestors, scrollAdjustedTranslate, translatedRect]);
  useAutoScroller({ ...getAutoScrollerOptions(),
    draggingRect: translatedRect,
    pointerCoordinates,
    scrollableAncestors,
    scrollableAncestorRects
  });
  const contextValue = React.useMemo(() => {
    const memoizedContext = {
      active,
      activeNode,
      activeNodeRect,
      activeNodeClientRect,
      activatorEvent,
      activators,
      ariaDescribedById: {
        draggable: draggableDescribedById
      },
      containerNodeRect,
      dispatch,
      dragOverlay,
      draggableNodes,
      droppableContainers,
      droppableRects,
      over,
      recomputeLayouts,
      scrollableAncestors,
      scrollableAncestorRects,
      willRecomputeLayouts,
      windowRect
    };
    return memoizedContext;
  }, [active, activeNode, activeNodeClientRect, activeNodeRect, activatorEvent, activators, containerNodeRect, dragOverlay, dispatch, draggableNodes, draggableDescribedById, droppableContainers, droppableRects, over, recomputeLayouts, scrollableAncestors, scrollableAncestorRects, willRecomputeLayouts, windowRect]);
  return React__default.createElement(DndMonitorContext.Provider, {
    value: monitorState
  }, React__default.createElement(Context.Provider, {
    value: contextValue
  }, React__default.createElement(ActiveDraggableContext.Provider, {
    value: transform
  }, children)), React__default.createElement(Accessibility, {
    announcements: announcements,
    hiddenTextDescribedById: draggableDescribedById,
    screenReaderInstructions: screenReaderInstructions$1
  }));

  function getAutoScrollerOptions() {
    const activeSensorDisablesAutoscroll = (activeSensor == null ? void 0 : activeSensor.autoScrollEnabled) === false;
    const autoScrollGloballyDisabled = typeof autoScroll === 'object' ? autoScroll.enabled === false : autoScroll === false;
    const enabled = !activeSensorDisablesAutoscroll && !autoScrollGloballyDisabled;

    if (typeof autoScroll === 'object') {
      return { ...autoScroll,
        enabled
      };
    }

    return {
      enabled
    };
  }
});

const NullContext = /*#__PURE__*/React.createContext(null);
const defaultRole = 'button';
const ID_PREFIX = 'Droppable';
function useDraggable({
  id,
  data,
  disabled = false,
  attributes
}) {
  const key = utilities.useUniqueId(ID_PREFIX);
  const {
    active,
    activeNodeRect,
    activatorEvent,
    ariaDescribedById,
    draggableNodes,
    droppableRects,
    activators,
    over
  } = React.useContext(Context);
  const {
    role = defaultRole,
    roleDescription = 'draggable',
    tabIndex = 0
  } = attributes != null ? attributes : {};
  const isDragging = (active == null ? void 0 : active.id) === id;
  const transform = React.useContext(isDragging ? ActiveDraggableContext : NullContext);
  const [node, setNodeRef] = utilities.useNodeRef();
  const listeners = useSyntheticListeners(activators, id);
  const dataRef = useData(data);
  React.useEffect(() => {
    draggableNodes[id] = {
      id,
      key,
      node,
      data: dataRef
    };
    return () => {
      const node = draggableNodes[id];

      if (node && node.key === key) {
        delete draggableNodes[id];
      }
    };
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [draggableNodes, id]);
  const memoizedAttributes = React.useMemo(() => ({
    role,
    tabIndex,
    'aria-pressed': isDragging && role === defaultRole ? true : undefined,
    'aria-roledescription': roleDescription,
    'aria-describedby': ariaDescribedById.draggable
  }), [role, tabIndex, isDragging, roleDescription, ariaDescribedById.draggable]);
  return {
    active,
    activeNodeRect,
    activatorEvent,
    attributes: memoizedAttributes,
    droppableRects,
    isDragging,
    listeners: disabled ? undefined : listeners,
    node,
    over,
    setNodeRef,
    transform
  };
}

function useDndContext() {
  return React.useContext(Context);
}

const ID_PREFIX$1 = 'Droppable';
function useDroppable({
  data,
  disabled = false,
  id
}) {
  const key = utilities.useUniqueId(ID_PREFIX$1);
  const {
    active,
    dispatch,
    over
  } = React.useContext(Context);
  const rect = React.useRef(null);
  const [nodeRef, setNodeRef] = utilities.useNodeRef();
  const dataRef = useData(data);
  utilities.useIsomorphicLayoutEffect(() => {
    dispatch({
      type: Action.RegisterDroppable,
      element: {
        id,
        key,
        disabled,
        node: nodeRef,
        rect,
        data: dataRef
      }
    });
    return () => dispatch({
      type: Action.UnregisterDroppable,
      key,
      id
    });
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [id]);
  React.useEffect(() => {
    dispatch({
      type: Action.SetDroppableDisabled,
      id,
      key,
      disabled
    });
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [disabled]);
  return {
    active,
    rect,
    isOver: (over == null ? void 0 : over.id) === id,
    node: nodeRef,
    over,
    setNodeRef
  };
}

function useDropAnimation({
  animate,
  adjustScale,
  activeId,
  draggableNodes,
  duration,
  easing,
  dragSourceOpacity,
  node,
  transform
}) {
  const [dropAnimationComplete, setDropAnimationComplete] = React.useState(false);
  React.useEffect(() => {
    if (!animate || !activeId || !easing || !duration) {
      if (animate) {
        setDropAnimationComplete(true);
      }

      return;
    }

    requestAnimationFrame(() => {
      var _draggableNodes$activ;

      const finalNode = (_draggableNodes$activ = draggableNodes[activeId]) == null ? void 0 : _draggableNodes$activ.node.current;

      if (transform && node && finalNode && finalNode.parentNode !== null) {
        const fromNode = getMeasurableNode(node);

        if (fromNode) {
          const from = fromNode.getBoundingClientRect();
          const to = getViewRect(finalNode);
          const delta = {
            x: from.left - to.left,
            y: from.top - to.top
          };

          if (Math.abs(delta.x) || Math.abs(delta.y)) {
            const scaleDelta = {
              scaleX: adjustScale ? to.width * transform.scaleX / from.width : 1,
              scaleY: adjustScale ? to.height * transform.scaleY / from.height : 1
            };
            const finalTransform = utilities.CSS.Transform.toString({
              x: transform.x - delta.x,
              y: transform.y - delta.y,
              ...scaleDelta
            });
            const originalOpacity = finalNode.style.opacity;

            if (dragSourceOpacity != null) {
              finalNode.style.opacity = `${dragSourceOpacity}`;
            }

            const nodeAnimation = node.animate([{
              transform: utilities.CSS.Transform.toString(transform)
            }, {
              transform: finalTransform
            }], {
              easing,
              duration
            });

            nodeAnimation.onfinish = () => {
              node.style.display = 'none';
              setDropAnimationComplete(true);

              if (finalNode && dragSourceOpacity != null) {
                finalNode.style.opacity = originalOpacity;
              }
            };

            return;
          }
        }
      }

      setDropAnimationComplete(true);
    });
  }, [animate, activeId, adjustScale, draggableNodes, duration, easing, dragSourceOpacity, node, transform]);
  utilities.useIsomorphicLayoutEffect(() => {
    if (dropAnimationComplete) {
      setDropAnimationComplete(false);
    }
  }, [dropAnimationComplete]);
  return dropAnimationComplete;
}

const defaultTransition = activatorEvent => {
  const isKeyboardActivator = utilities.isKeyboardEvent(activatorEvent);
  return isKeyboardActivator ? 'transform 250ms ease' : undefined;
};

const defaultDropAnimation = {
  duration: 250,
  easing: 'ease',
  dragSourceOpacity: 0
};
const DragOverlay = /*#__PURE__*/React__default.memo(({
  adjustScale = false,
  children,
  dropAnimation = defaultDropAnimation,
  style: styleProp,
  transition = defaultTransition,
  modifiers,
  wrapperElement = 'div',
  className,
  zIndex = 999
}) => {
  var _active$id, _attributesSnapshot$c;

  const {
    active,
    activeNodeRect,
    activeNodeClientRect,
    containerNodeRect,
    draggableNodes,
    activatorEvent,
    over,
    dragOverlay,
    scrollableAncestors,
    scrollableAncestorRects,
    windowRect
  } = useDndContext();
  const transform = React.useContext(ActiveDraggableContext);
  const modifiedTransform = applyModifiers(modifiers, {
    activatorEvent,
    active,
    activeNodeRect: activeNodeClientRect,
    containerNodeRect,
    draggingNodeRect: dragOverlay.rect,
    over,
    overlayNodeRect: dragOverlay.rect,
    scrollableAncestors,
    scrollableAncestorRects,
    transform,
    windowRect
  });
  const isDragging = active !== null;
  const finalTransform = adjustScale ? modifiedTransform : { ...modifiedTransform,
    scaleX: 1,
    scaleY: 1
  };
  const initialNodeRect = utilities.useLazyMemo(previousValue => {
    if (isDragging) {
      return previousValue != null ? previousValue : activeNodeRect;
    }

    return null;
  }, [isDragging, activeNodeRect]);
  const style = initialNodeRect ? {
    position: 'fixed',
    width: initialNodeRect.width,
    height: initialNodeRect.height,
    top: initialNodeRect.top,
    left: initialNodeRect.left,
    zIndex,
    transform: utilities.CSS.Transform.toString(finalTransform),
    touchAction: 'none',
    transformOrigin: adjustScale && activatorEvent ? getRelativeTransformOrigin(activatorEvent, initialNodeRect) : undefined,
    transition: typeof transition === 'function' ? transition(activatorEvent) : transition,
    ...styleProp
  } : undefined;
  const attributes = isDragging ? {
    style,
    children,
    className,
    transform: finalTransform
  } : undefined;
  const attributesSnapshot = React.useRef(attributes);
  const derivedAttributes = attributes != null ? attributes : attributesSnapshot.current;
  const {
    children: finalChildren,
    transform: _,
    ...otherAttributes
  } = derivedAttributes != null ? derivedAttributes : {};
  const prevActiveId = React.useRef((_active$id = active == null ? void 0 : active.id) != null ? _active$id : null);
  const dropAnimationComplete = useDropAnimation({
    animate: Boolean(dropAnimation && prevActiveId.current && !active),
    adjustScale,
    activeId: prevActiveId.current,
    draggableNodes,
    duration: dropAnimation == null ? void 0 : dropAnimation.duration,
    easing: dropAnimation == null ? void 0 : dropAnimation.easing,
    dragSourceOpacity: dropAnimation == null ? void 0 : dropAnimation.dragSourceOpacity,
    node: dragOverlay.nodeRef.current,
    transform: (_attributesSnapshot$c = attributesSnapshot.current) == null ? void 0 : _attributesSnapshot$c.transform
  });
  const shouldRender = Boolean(finalChildren && (children || dropAnimation && !dropAnimationComplete));
  React.useEffect(() => {
    if ((active == null ? void 0 : active.id) !== prevActiveId.current) {
      var _active$id2;

      prevActiveId.current = (_active$id2 = active == null ? void 0 : active.id) != null ? _active$id2 : null;
    }

    if (active && attributesSnapshot.current !== attributes) {
      attributesSnapshot.current = attributes;
    }
  }, [active, attributes]);
  React.useEffect(() => {
    if (dropAnimationComplete) {
      attributesSnapshot.current = undefined;
    }
  }, [dropAnimationComplete]);

  if (!shouldRender) {
    return null;
  }

  return React__default.createElement(wrapperElement, { ...otherAttributes,
    ref: dragOverlay.setRef
  }, finalChildren);
});

exports.DndContext = DndContext;
exports.DragOverlay = DragOverlay;
exports.KeyboardSensor = KeyboardSensor;
exports.MouseSensor = MouseSensor;
exports.PointerSensor = PointerSensor;
exports.TouchSensor = TouchSensor;
exports.applyModifiers = applyModifiers;
exports.closestCenter = closestCenter;
exports.closestCorners = closestCorners;
exports.defaultAnnouncements = defaultAnnouncements;
exports.defaultCoordinates = defaultCoordinates;
exports.defaultDropAnimation = defaultDropAnimation;
exports.getBoundingClientRect = getBoundingClientRect;
exports.getLayoutRect = getLayoutRect;
exports.getScrollableAncestors = getScrollableAncestors;
exports.getViewRect = getViewRect;
exports.getViewportLayoutRect = getViewportLayoutRect;
exports.rectIntersection = rectIntersection;
exports.useDndContext = useDndContext;
exports.useDndMonitor = useDndMonitor;
exports.useDraggable = useDraggable;
exports.useDroppable = useDroppable;
exports.useSensor = useSensor;
exports.useSensors = useSensors;
//# sourceMappingURL=core.cjs.development.js.map
