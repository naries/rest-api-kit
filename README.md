# Rest Api Kit
Welcome to `rest-api-kit` – your go-to solution for gaining precise control over caching in API requests within your React and React Native applications. Tired of feeling restricted by caching mechanisms that lack flexibility and clarity? Look no further. With `rest-api-kit`, developers like you can finally take charge of caching with ease. Say goodbye to complex configurations and unreliable results. Our package empowers you to determine exactly when cache entries are created, updated, or deleted, based on parameters you define. Whether you're building a web application with React or a mobile app with React Native, `rest-api-kit` simplifies caching implementation without compromising on effectiveness. Take control of your cache today with `rest-api-kit`

## installation
rest-api-kit is available for use as a package on npm:
```npm i rest-api-kit```
or yarn:
```yarn add rest-api-kit```

## What's in it?

Rest API kit comes with the following hooks:
`"useRest"`: creates a base for apis. This hook returns a trigger function and a state object. Each works as follows:


If you use the `saveToCache` option when using a trigger function, then we create a cache entry based entirely on the url passed in from the same trigger. Whether that cache entry is new is dependent on:
1. If there is a cache with the same url as its key already, we then check if the `preferCacheValue` is set to `true`. If it is, we supply you the value in the cache and not createa new entry
2. If there is no cache with the same url as its key already, we make the request and create a new cache entry with the url. At this point even if `preferCacheValue` is set to true, it doesn't matter because we are only just creating the cache entry.