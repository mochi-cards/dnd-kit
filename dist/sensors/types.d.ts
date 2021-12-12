import type { MutableRefObject } from 'react';
import type { Active, Over, DraggableNode, DraggableNodes, DroppableContainers, LayoutRectMap } from '../store';
import type { Coordinates, LayoutRect, SyntheticEventName, Translate, UniqueIdentifier, ViewRect } from '../types';
export declare enum Response {
    Start = "start",
    Move = "move",
    End = "end"
}
export declare type SensorContext = {
    active: Active | null;
    activeNode: HTMLElement | null;
    collisionRect: ViewRect | null;
    draggableNodes: DraggableNodes;
    draggingNodeRect: LayoutRect | null;
    droppableRects: LayoutRectMap;
    droppableContainers: DroppableContainers;
    over: Over | null;
    scrollableAncestors: Element[];
    scrollAdjustedTranslate: Translate | null;
    translatedRect: ViewRect | null;
};
export declare type SensorOptions = {};
export interface SensorProps<T> {
    active: UniqueIdentifier;
    activeNode: DraggableNode;
    event: Event;
    context: MutableRefObject<SensorContext>;
    options: T;
    onStart(coordinates: Coordinates): void;
    onCancel(): void;
    onMove(coordinates: Coordinates): void;
    onEnd(): void;
}
export declare type SensorInstance = {
    autoScrollEnabled: boolean;
};
export declare type Activator<T> = {
    eventName: SyntheticEventName;
    handler(event: React.SyntheticEvent, options: T): boolean | undefined;
};
export declare type Activators<T> = Activator<T>[];
declare type Teardown = () => void;
export interface Sensor<T extends Object> {
    new (props: SensorProps<T>): SensorInstance;
    activators: Activators<T>;
    setup?(): Teardown | undefined;
}
export declare type Sensors = Sensor<any>[];
export declare type SensorDescriptor<T> = {
    sensor: Sensor<T>;
    options: T;
};
export declare type SensorHandler = (event: React.SyntheticEvent, active: UniqueIdentifier) => boolean | void;
export {};
