export declare const endpointHandler: ({ expressApp, method, path, response, auth }: {
    expressApp: any;
    method: any;
    path: any;
    response: any;
    auth: any;
}) => void;
export declare const errorHandler: ({ err, req, res, method, path }: {
    err: any;
    req: any;
    res: any;
    method: any;
    path: any;
}) => void;
export declare const http_response: (response: any, status_code: number, data: any, extras?: any) => void;
