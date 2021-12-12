/// <reference types="react" />
import { UseDraggableArguments } from '@dnd-kit/core';
import type { SortingStrategy } from '../types';
import type { AnimateLayoutChanges, NewIndexGetter, SortableTransition } from './types';
export interface Arguments extends UseDraggableArguments {
    animateLayoutChanges?: AnimateLayoutChanges;
    getNewIndex?: NewIndexGetter;
    strategy?: SortingStrategy;
    transition?: SortableTransition | null;
}
export declare function useSortable({ animateLayoutChanges, attributes: userDefinedAttributes, disabled, data: customData, getNewIndex, id, strategy: localStrategy, transition, }: Arguments): {
    active: import("@dnd-kit/core").Active | null;
    attributes: {
        role: string;
        tabIndex: number;
        'aria-pressed': boolean | undefined;
        'aria-roledescription': string;
        'aria-describedby': string;
    };
    activatorEvent: Event | null;
    rect: import("react").MutableRefObject<import("@dnd-kit/core").LayoutRect | null>;
    index: number;
    isSorting: boolean;
    isDragging: boolean;
    listeners: import("@dnd-kit/core/dist/hooks/utilities").SyntheticListenerMap | undefined;
    node: import("react").MutableRefObject<HTMLElement | null>;
    overIndex: number;
    over: import("@dnd-kit/core").Over | null;
    setNodeRef: (node: HTMLElement | null) => void;
    setDroppableNodeRef: (element: HTMLElement | null) => void;
    setDraggableNodeRef: (element: HTMLElement | null) => void;
    transform: import("@dnd-kit/utilities").Transform | null;
    transition: string | undefined;
};
