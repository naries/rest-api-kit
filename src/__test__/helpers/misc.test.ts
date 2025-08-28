import { concatenateParamsWithUrl } from "../../helpers/misc"

describe('Miscellaneous functions', () => {
    describe("concatenateParamsWithUrl", () => {
        it('should return url if params is undefined', () => {
            let concatenatedUrl = concatenateParamsWithUrl("url");
            expect(concatenatedUrl).toEqual('url');
        })

        it('should return url if params is defined but has no properties', () => {
            let concatenatedUrl = concatenateParamsWithUrl("url", {});
            expect(concatenatedUrl).toEqual('url?');
        })

        it("should return url with params concatenated with '&' character", () => {
            let concatenatedUrl = concatenateParamsWithUrl("url", { a: 1, b: 2 });
            expect(concatenatedUrl).toEqual('url?a=1&b=2');
        })
    })
})