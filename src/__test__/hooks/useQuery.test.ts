import { renderHook, act } from '@testing-library/react-hooks';
import { useQuery } from '../../hooks/useQuery';
import * as apifunctions from '../../apifunctions'; // Adjust the import path as needed
import * as helpers from '../../helpers/misc'; // Adjust the import path as needed

describe('useQuery', () => {
    const url = 'https://example.com/api';
    const params = { page: '1', limit: '10' };
    const responseData = { /* mocked response data */ };
    const makeRequestMock = jest.spyOn(apifunctions, 'makeRequest').mockResolvedValueOnce(responseData);
    const concatenateParamsWithUrl = jest.spyOn(helpers, 'concatenateParamsWithUrl').mockReturnValueOnce(url);

    afterEach(() => {
        makeRequestMock.mockRestore();
        concatenateParamsWithUrl.mockRestore();
    })

    test('should trigger request and update state', async () => {
        const { result, waitForNextUpdate, rerender } = renderHook(() => useQuery(url, params));
        const [trigger, state] = result.current;

        expect(state.isLoading).toBeFalsy();
        expect(state.data).toBeUndefined();
        expect(state.error).toBeUndefined();

        act(() => {
            trigger();
        });

        expect(state.isLoading).toBeTruthy();
        rerender();

        await waitForNextUpdate();

        rerender();

        expect(state.isLoading).toBeFalsy();
        expect(state.data).toEqual(responseData);
        expect(state.error).toBeUndefined();


        expect(makeRequestMock).toHaveBeenCalledWith(url);
        expect(concatenateParamsWithUrl).toHaveBeenCalledWith(url, params);
    });
});
