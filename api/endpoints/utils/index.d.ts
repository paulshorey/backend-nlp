declare const _default: ({
    method: string;
    path: string;
    response: () => {
        v: string;
        time: number;
        greetings: string[];
    };
} | {
    method: string;
    path: string;
    response: ({ req }: {
        req: any;
    }) => {
        message: string;
        query: any;
        body: any;
    };
} | {
    method: string;
    path: string;
    response: ({ res }: {
        res: any;
    }) => string;
})[];
export default _default;
