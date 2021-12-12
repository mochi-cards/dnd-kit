import type { ClientRect, LayoutRect, ViewRect } from '../../types';
export declare function getLayoutRect(element: HTMLElement): LayoutRect;
export declare function getViewportLayoutRect(element: HTMLElement): LayoutRect;
export declare function getBoundingClientRect(element: HTMLElement | typeof window): ClientRect;
export declare function getViewRect(element: HTMLElement): ViewRect;
