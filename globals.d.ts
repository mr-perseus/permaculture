declare const API_KEY: string;

declare module 'store-js' {
    function get(name: string): string;
    function set<T>(name: string, item: T): void;
}
