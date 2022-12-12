/**
 * @param {array} word_arr
 * @output {object}
 * @output.chunks {array of arrays} - list of words (strs) of chunked phrases
 *     same data as @output.chunks_keys, but includes capitalization/punctuation
 * @output.chunks_keys {array of arrays} - list of words (keys) of chunked phrases
 *     ONLY add key to this list if there is a corresponding value in the dictionary (chunks_rows)
 *     IMPORTANT: last item in chunks_keys should always be individual words
 * @output.chunks_rows {object} - dictionary of all chunked rows (chunk is word entry in DB)
 *     { chunk string: object from DB, }
 */
export default function (word_arr?: any[]): Promise<any>;
