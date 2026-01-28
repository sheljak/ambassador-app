export * from './features/shared/types';
export * from './features/feeds/types';
export * from './features/dialogs/types';
export * from './features/system/types';

export namespace Login {
    export interface Request {
        email: string;
        password: string;
    }
    
    export interface Response {
        user: import('./features/system/types').Account;
        token: string;
        refreshToken: string;
    }
}

export namespace GetAccountInfo {
    export interface Request {}
    
    export interface Response {
        account: import('./features/system/types').Account;
    }
}

export namespace GetFeeds {
    export interface Request {
        type?: import('./features/feeds/types').FeedType;
        page?: number;
        limit?: number;
    }
    
    export interface Response {
        feeds: import('./features/feeds/types').FeedItem[];
        meta: import('./features/shared/types').PaginationMeta;
    }
}

export namespace GetDialogs {
    export interface Request {
        page?: number;
        limit?: number;
    }
    
    export interface Response {
        dialogs: import('./features/dialogs/types').Dialog[];
        meta: import('./features/shared/types').PaginationMeta;
    }
}
