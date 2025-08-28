import { renderHook, act } from '@testing-library/react-hooks';
import { useRest } from '../../hooks/useRest';
import { defaultOptions } from '../../defaullts';
import * as apifunctions from '../../apifunctions';

describe('useRest', () => {
    const url = 'https://example.com/api/resource';
    const responsePayload = { id: 1, name: 'Test' };

    beforeEach(() => {
        jest.spyOn(apifunctions, 'makeRequest').mockResolvedValueOnce({ type: 'success', data: responsePayload });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('triggers request and updates state with transformed data', async () => {
        const params = { ...defaultOptions, endpointName: 'testendpoint', saveToCache: true };
        const { result, waitForNextUpdate } = renderHook(() => useRest(url, params, {}));
        const [trigger, stateBefore] = result.current;
        expect(stateBefore.isLoading).toBeFalsy();

        act(() => {
            trigger();
        });

        // state becomes loading
        const [, loadingState] = result.current;
        expect(loadingState.isLoading).toBeTruthy();

        await waitForNextUpdate();
        const [, finalState] = result.current;
        expect(finalState.isLoading).toBeFalsy();
        expect(finalState.data).toEqual(responsePayload);
        expect(finalState.error).toBeUndefined();
    });
});
