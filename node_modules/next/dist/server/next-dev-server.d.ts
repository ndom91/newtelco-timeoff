/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
import { UrlWithParsedQuery } from 'url';
import Server, { ServerConstructor } from '../next-server/server/next-server';
export default class DevServer extends Server {
    private devReady;
    private setDevReady?;
    private webpackWatcher?;
    private hotReloader?;
    constructor(options: ServerConstructor);
    protected currentPhase(): string;
    protected readBuildId(): string;
    addExportPathMapRoutes(): Promise<void>;
    startWatcher(): Promise<unknown>;
    stopWatcher(): Promise<void>;
    prepare(): Promise<void>;
    protected close(): Promise<void>;
    run(req: IncomingMessage, res: ServerResponse, parsedUrl: UrlWithParsedQuery): Promise<void>;
    generateRoutes(): import("../next-server/server/router").Route[];
    protected generatePublicRoutes(): never[];
    protected getDynamicRoutes(): never[];
    _filterAmpDevelopmentScript(html: string, event: {
        line: number;
        col: number;
        code: string;
    }): boolean;
    /**
     * Check if resolver function is build or request new build for this function
     * @param {string} pathname
     */
    protected resolveApiRequest(pathname: string): Promise<string | null>;
    renderToHTML(req: IncomingMessage, res: ServerResponse, pathname: string, query: {
        [key: string]: string;
    }, options?: {}): Promise<string | null>;
    renderErrorToHTML(err: Error | null, req: IncomingMessage, res: ServerResponse, pathname: string, query: {
        [key: string]: string;
    }): Promise<string | null>;
    sendHTML(req: IncomingMessage, res: ServerResponse, html: string): Promise<void>;
    protected setImmutableAssetCacheControl(res: ServerResponse): void;
    servePublic(req: IncomingMessage, res: ServerResponse, path: string): Promise<void>;
    hasPublicFile(path: string): Promise<boolean>;
    getCompilationError(page: string): Promise<any>;
}
