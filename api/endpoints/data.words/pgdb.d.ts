/**************************************************************************************************
 * LEGACY FUNCTIONS
 **************************************************************************************************/
export declare const crawl_stopwords_get: (key: any) => Promise<unknown>;
export declare const crawl_word_get: (key: any, columns: any, limit?: number) => Promise<unknown>;
/**************************************************************************************************
 * FUNCTIONS
 **************************************************************************************************/
export declare const data_word_delete: (key: any) => Promise<unknown>;
/**
 * Check if a key will still be unique in DB after it is sanitized
 *    If it will not be unique, then compare which DB row is better,
 *    and keep the better one (better = higher row.list_count).
 *    Delete the inferior row.
 * @param row {object} - DB row
 * @resolves {object|null} - If passed row is the better one (higher row.list_count),
 *    return it, with updated meta (str, key, proper, acronym).
 *    If passed row is inferior, delete it, return null. Stop.
 */
export declare const data_key_str_unique: (row: any) => Promise<any>;
export declare const data_word_get: (str: any, columns?: string, limit?: number) => Promise<unknown>;
export declare const data_word_get_parsed: (key: any, columns?: any, limit?: any) => Promise<unknown>;
/**
 * Save user-submitted object to DB, and do some minor fixes
 * @param row {object} - DB row, with key (required) for lookup, plus any other properties to overwrite
 * @param REBUILD {boolean}
 * @resolves {boolean} - true (success / updated DB row), false (failed / did not update)
 */
export declare const data_word_put: (row: any, REBUILD?: boolean) => Promise<boolean>;
export declare const data_word_sentiment_of_synonym: (key: any, synonym: any, sentiment: any) => Promise<unknown>;
export declare const data_word_proper_of_synonym: (key: any, synonym: any, newProper: any) => Promise<unknown>;
export declare const data_word_remove_words: ({ key, words }: {
    key: any;
    words: any;
}) => Promise<unknown>;
export declare const data_word_add_poswords: ({ key, pos, poswords: new_words }: {
    key: any;
    pos: any;
    poswords: any;
}) => Promise<unknown>;
export declare const data_word_add_to_others: ({ word, pos, addtoothers }: {
    word: any;
    pos: any;
    addtoothers: any;
}) => Promise<unknown>;
export declare const data_get_words: (where: any, columns?: string, limit?: number) => Promise<unknown>;
/**
 * Sort words by sentiment
 * Besides getting the sentiment of a word, this is a great function to
 * check that strings in a list are real words (have entries in the database)
 * @param list {array} - array of keys, to check against database
 * @param orderby_prop {string} - ex: what to order by 'agg_sentiment'
 * @param orderby_desc {string} - ex: "DESC" or "ASC"
 * @resolves {array} - array of objects [{key:"",something:""},], sorted by sentiment
 */
export declare const data_word_sort_keys_by_sentiment: (list: any, orderby_prop?: string, orderby_desc?: string) => Promise<unknown>;
