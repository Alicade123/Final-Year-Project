import type { IframeHTMLAttributes } from "react";
import { RefObject } from "react";
import type { Font } from "./font";
import { ContentNode } from "./ContentNode";
export interface UseReactToPrintOptions {
    bodyClass?: string;
    contentRef?: RefObject<ContentNode>;
    documentTitle?: string;
    fonts?: Font[];
    ignoreGlobalStyles?: boolean;
    nonce?: string;
    onAfterPrint?: () => void;
    onBeforePrint?: () => Promise<void>;
    onPrintError?: (errorLocation: "onBeforePrint" | "print", error: Error) => void;
    pageStyle?: string;
    preserveAfterPrint?: boolean;
    print?: (target: HTMLIFrameElement) => Promise<any>;
    printIframeProps?: {
        allow?: IframeHTMLAttributes<HTMLIFrameElement>["allow"];
        referrerPolicy?: IframeHTMLAttributes<HTMLIFrameElement>["referrerPolicy"];
        sandbox?: IframeHTMLAttributes<HTMLIFrameElement>["sandbox"];
    };
    suppressErrors?: boolean;
    copyShadowRoots?: boolean;
}
