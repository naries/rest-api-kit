import { createRequest, makeRequest } from "../apifunctions"; // Adjust the import path accordingly
import fetchMock from "jest-fetch-mock";

beforeAll(() => {
  fetchMock.enableMocks(); // Enable fetch mocking globally
});

afterEach(() => {
  fetchMock.resetMocks(); // Reset mocks after each test
});

describe("API request functions", () => {
  describe("createRequest", () => {
    it("should default to GET method if none is provided", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({}));
      const response = await createRequest("/test");
      expect(response).toEqual({});
    });

    it("should handle errors gracefully", async () => {
      fetchMock.mockRejectOnce(new Error("Network error"));
      const response = await createRequest("/test");
      expect(response).toBeUndefined();
    });
  });

  describe("makeRequest", () => {
    it("should pass string payload to createRequest", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ key: "value" }));
      const response = await makeRequest("/test");
      expect(response).toEqual({ key: "value" });
    });

    it("should pass object payload to createRequest", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ key: "value" }));
      const response = await makeRequest({
        url: "/test",
        method: "POST",
        body: { foo: "bar" },
        headers: {},
      });
      expect(response).toEqual({ key: "value" });
    });
  });
});
