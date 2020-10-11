/* eslint-disable */
/// <reference types="jest" />

import SubscriptionBlueprint from "../../domain/SubscriptionBlueprint";
import ShopifyService from "../../domain/ShopifyService";
import SubscriptionContext from "../../domain/SubscriptionContext";

let blueprint: SubscriptionBlueprint | undefined = undefined;


test('test basic fields', () => {
    blueprint = new SubscriptionBlueprint('title');
    expect(blueprint.title).toBe('title');
    expect(blueprint.productId).toBe('');
    expect(blueprint.id).toBe('');

    blueprint.title = '1';
    expect(blueprint.title).toBe('1');
    blueprint.id = '1';
    expect(blueprint.id).toBe('1');
    blueprint.productId = '1';
    expect(blueprint.productId).toBe('1');
});

test('test create product', async () => {
    blueprint = new SubscriptionBlueprint('title');
    const serviceMock: ShopifyService = {
        async createProduct(): Promise<string> {
            return Promise.resolve('3');
        }
    }
    const contextMock: SubscriptionContext = {accessToken: '', shop: ''}
    
    blueprint.setContextAndServices(serviceMock, contextMock);
    await blueprint.createShopifyProduct();
    expect(blueprint.productId).toBe('3');
});

test('product creation without service injection failes', async () => {
    blueprint = new SubscriptionBlueprint('title');
    await expect(blueprint.createShopifyProduct).rejects.toThrowError();
});

