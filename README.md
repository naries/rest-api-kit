# Rest Api Kit
Welcome to `rest-api-kit` – your go-to solution for gaining precise control over caching in API requests within your React and React Native applications. Tired of feeling restricted by caching mechanisms that lack flexibility and clarity? Look no further. With `rest-api-kit`, developers like you can finally take charge of caching with ease. Say goodbye to complex configurations and unreliable results. Our package empowers you to determine exactly when cache entries are created, updated, or deleted, based on parameters you define. Whether you're building a web application with React or a mobile app with React Native, `rest-api-kit` simplifies caching implementation without compromising on effectiveness. Take control of your cache today with `rest-api-kit`

## installation
rest-api-kit is available for use as a package on npm:
```sh
npm i rest-api-kit
```
or yarn:
```sh
yarn add rest-api-kit
```
  
## What's in it?

Rest API kit comes with a base and hooks. The hooks are created from endpoint objects that are injected with the createEndpoints method as you'll see in the usage section of this documentation.

## Usage
### Import createRestBase
Import the `createRestBase` from `rest-api-kit` like so:
```ts
import { createRestBase } from "rest-api-kit";
```

### Assign it
assign it to a variable like so:
```ts
const api = createRestBase({ baseUrl: "https://jsonplaceholder.typicode.com" });
```

### Inject the endpoints
Create the endpoints at the base of your index file or App so it gets loaded in soon as uour project starts up.
```ts
const injector = api.createEndpoints((builder) => ({
  getATodo: builder({
    url: "/todos/1",
    params: {
      preferCacheValue: false,
      saveToCache: true,
      successCondition: (data) => {
        if (data.completed) {
          return true;
        }
        return false;
      },
      transformResponse: (data) => {
        // always return data;
        return data;
      }
    }
  }),
  createTodo: builder({
    url: "/post",
    params: {
      method: 'POST',
      updates: ['getATodo'],
    }
  }),
}));

export const { useGetATodo, useCreateTodo, useDeleteTodo } = injector;
```
### Use it.
In the components that you need it in, you can use it like so:
```ts
const [getATodo, { data }] = useGetATodo();
const [deleteATodo, state] = useDeleteTodo();


  console.log(state, "<= state");

  useEffect(() => {
    getATodo();
  }, [])

  const deleteTodo = () => {
    deleteATodo({
      id: todoId
    })
  }
```

## Params