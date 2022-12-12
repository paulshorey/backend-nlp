declare const _default: {
    path: string;
    method: string;
    auth: string[];
    response: ({ res, req }: {
        res: any;
        req: any;
    }) => Promise<any>;
}[];
export default _default;
