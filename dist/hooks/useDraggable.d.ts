/// <reference types="react" />
import { Transform } from '@dnd-kit/utilities';
import { Data } from '../store';
import { SyntheticListenerMap } from './utilities';
export interface UseDraggableArguments {
    id: string;
    data?: Data;
    disabled?: boolean;
    attributes?: {
        role?: string;
        roleDescription?: string;
        tabIndex?: number;
    };
}
export declare type DraggableSyntheticListeners = SyntheticListenerMap | undefined;
export declare function useDraggable({ id, data, disabled, attributes, }: UseDraggableArguments): {
    active: import("../store").Active | null;
    activeNodeRect: import("..").ViewRect | null;
    activatorEvent: Event | null;
    attributes: {
        role: string;
        tabIndex: number;
        'aria-pressed': boolean | undefined;
        'aria-roledescription': string;
        'aria-describedby': string;
    };
    droppableRects: import("../store").LayoutRectMap;
    isDragging: boolean;
    listeners: SyntheticListenerMap | undefined;
    node: import("react").MutableRefObject<HTMLElement | null>;
    over: import("../store").Over | null;
    setNodeRef: (element: HTMLElement | null) => void;
    transform: Transform | null;
};
