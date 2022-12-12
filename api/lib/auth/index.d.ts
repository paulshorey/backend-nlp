/**
 * Authentication handler
 * @returns {string} error message
 */
export default function authIndex({ req, auth }: {
    req: any;
    auth: any;
}): Promise<string>;
