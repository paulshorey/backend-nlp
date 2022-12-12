export type responseType = {
    auth_expires: number;
    host?: string;
    status?: string;
    code?: number;
    data?: responseDataType;
};
export type responseDataType = {
    auth_expires?: number;
    string_original?: string;
    string?: string;
    tld?: string;
    tlds?: string[];
    tlds_extra?: string[];
    domains_lists?: any;
    phrases?: any;
    phrase_lists?: any;
    word_hacks?: any;
    com_hacks?: any;
    phrase_hacks?: any;
    is_name?: boolean;
    is_tech?: boolean;
    is_brand?: boolean;
    is_about_nou?: boolean;
    is_about_ver?: boolean;
    syl_count?: number;
    is_food?: boolean;
    best_keys?: string[];
    chunks_dicts?: Record<string, [
        number,
        number,
        number,
        number,
        null,
        null,
        null,
        null,
        string,
        string,
        null,
        null,
        string,
        string,
        null,
        string
    ]>;
    options?: {
        use_phrase_hacks?: boolean;
        use_word_hacks?: boolean;
        use_synonyms?: boolean;
        use_dashes?: boolean;
        return_word_rows?: boolean;
        only_available?: boolean;
        str?: string;
        tlds_use?: string[];
        tlds_ignore?: string[];
        recaptcha2_token?: string;
        recaptcha3_token?: string;
        tld?: string;
        length_vs_relevance?: number;
        ext_suggestions_num?: number;
    };
    tlds_user?: string[];
    tlds_unchecked?: string[];
    tld_chunk?: {};
    chunks_keys?: string[];
    chunks_dict?: Record<string, {
        key?: string;
        str?: string;
        root?: string;
        singular?: string;
        plural?: string;
        pos1?: string;
        pos2?: string;
        pos3?: string;
        sentiment?: null;
        name?: boolean;
        brand?: boolean;
        ctr?: null;
        dict?: Record<string, [number, number, number, number, null, null, null, null, null, number, null, null, number]>;
        pos_short?: Record<string, string[]>;
        poss?: Record<string, string[]>;
        tlds?: Array<string[]>;
        list?: string[];
        ok_list?: string[];
        list_count?: number;
        ok_count?: number;
        word_count?: number;
        char_count?: number;
    }>;
    keys_words?: string[];
    string_nospaces?: string;
    string_original_nospaces?: string;
    bing_alts?: string[];
    keys_words_and_tld?: string[];
    chunks_keys_and_tld?: string[];
    word_ratings?: Record<string, number>;
    key_first?: string;
    key_last?: string;
    use_autocomplete?: boolean;
    tlds_with_generic?: string[];
    dom_ratings?: Record<string, number>;
    domains?: Record<string, string[]>;
};
