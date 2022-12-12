/**
 * Get DB row, add domains
 * @params key {string} - keyword string
 * @params options {object}
 * @params options.model {boolean} - flag,
 *    true = ignore database row, return empty default model
 *    false = ignore empty default model, return undefined if row not found in database
 *    undefined = return row from database if exists, or default empty model object
 * @resolves {object} row - DB row {key, pos1, root, etc}
 */
declare const thisModule: (str: any, options?: any) => Promise<any>;
export default thisModule;
