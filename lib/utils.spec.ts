import { gidToId, idToGid } from './utils';

describe('util functions', () => {
    test('valid gid is transformed correctly', () => {
        expect(gidToId('gid://shopify/Product/5742734213283')).toBe(
            '5742734213283',
        );
    });

    test('valid id is transformed correctly', () => {
        expect(idToGid('5742734213283', 'Product')).toBe(
            'gid://shopify/Product/5742734213283',
        );
    });
});
