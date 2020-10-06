declare const API_KEY: string;

declare module 'store-js' {
    function get<T>(name: string): T;
    function set<T>(name: string, item: T): void;
}
