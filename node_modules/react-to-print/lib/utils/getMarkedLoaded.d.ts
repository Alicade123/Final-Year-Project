import type { Font } from "../types/font";
import type { UseReactToPrintOptions } from "../types/UseReactToPrintOptions";
export declare function getMarkedLoaded(options: UseReactToPrintOptions, numResourcesToLoad: number, printWindow: HTMLIFrameElement): (resource: Element | Font | FontFace, errorMessages?: unknown[]) => void;
