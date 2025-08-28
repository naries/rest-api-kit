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
      const payload = { a: 1 };
      fetchMock.mockResponseOnce(JSON.stringify(payload), {
        headers: { 'content-type': 'application/json' }
      });
      const response = await createRequest("/test");
      expect(response.type).toBe("success");
      expect(response.data).toEqual(payload);
      expect(response.status).toBe(200);
    });

    it("should handle errors gracefully", async () => {
      fetchMock.mockRejectOnce(new Error("Network error"));
      const response = await createRequest("/test");
      expect(response?.type).toBe("error");
      expect(response?.data).toBe("Network error");
    });
  });

  describe("makeRequest", () => {
    it("should pass string payload to createRequest", async () => {
      const payload = { key: "value" };
      fetchMock.mockResponseOnce(JSON.stringify(payload), {
        headers: { 'content-type': 'application/json' }
      });
      const response = await makeRequest("/test", new Headers());
      expect(response?.type).toBe("success");
      expect(response?.data).toEqual(payload);
    });

    it("should pass object payload to createRequest", async () => {
      const payload = { key: "value" };
      fetchMock.mockResponseOnce(JSON.stringify(payload), {
        headers: { 'content-type': 'application/json' }
      });
      const response = await makeRequest(
        {
          url: "/test",
          method: "POST",
          body: { foo: "bar" },
        },
        new Headers()
      );
      expect(response?.type).toBe("success");
      expect(response?.data).toEqual(payload);
    });
  });
});
