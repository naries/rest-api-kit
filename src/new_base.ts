type RestBaseConfig = {
  baseUrl: string;
  prepareHeaders: (headers: Headers) => Headers;
};

let baseUrl = "";
let headers = new Headers();

function createEndpoints(this: ReturnType<typeof createRestBase>) {
  console.log("Creating endpoints...");
  console.log(this);
  return this; // Return this to allow chaining
}

function getBaseUrl(this: ReturnType<typeof createRestBase>) {
  console.log(this);
  return this.baseUrl;
}

function getHeaders(this: ReturnType<typeof createRestBase>) {
  console.log(this);
  return this.headers;
}

function createRestBase({ baseUrl: url, prepareHeaders }: RestBaseConfig) {
  baseUrl = url;
  headers = prepareHeaders(headers);

  //chaining
  return {
    baseUrl,
    headers,
    createEndpoints,
    getBaseUrl,
    getHeaders,
  };
}

// Usage example:
let api = createRestBase({
  baseUrl: "https://api.example.com",
  prepareHeaders: (headers) => {
    headers.append("Authorization", "Bearer token");
    return headers;
  },
}).createEndpoints();
