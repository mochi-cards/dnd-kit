import type { LayoutRect } from '../../types';
declare type RectFn<T, U> = (element: U) => T;
export declare const useViewRect: (element: HTMLElement | null, forceRecompute?: boolean | undefined) => import("../../types").ViewRect | null;
export declare const useClientRect: (element: HTMLElement | (Window & typeof globalThis) | null, forceRecompute?: boolean | undefined) => import("../../types").ClientRect | null;
export declare const useClientRects: (elements: Element[], forceRecompute?: boolean | undefined) => import("../../types").ClientRect[];
export declare function useRect<T = LayoutRect, U extends Element | Window = HTMLElement>(element: U | null, getRect: (element: U) => T, forceRecompute?: boolean): T | null;
export declare function createUseRectFn<T = LayoutRect, U extends Element | Window = HTMLElement>(getRect: RectFn<T, U>): (element: U | null, forceRecompute?: boolean | undefined) => T | null;
export {};
