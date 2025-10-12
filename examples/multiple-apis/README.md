# Multiple Base URLs Example

This example demonstrates how to work with **multiple APIs** (different base URLs) in the same application using Rest API Kit v0.0.53+.

## 🎯 Use Case

Your application might need to connect to:
- Your main backend API
- A third-party analytics service
- A payment processor
- A content delivery network (CDN)
- Microservices with different base URLs

This example shows how to set up and use multiple `createRestBase` instances.

## 📁 Structure

```
src/
├── api/
│   ├── mainApi.ts          # Main application API
│   ├── analyticsApi.ts     # Analytics/tracking API  
│   ├── paymentApi.ts       # Payment processing API
│   └── index.ts            # Re-export all
└── components/
    └── CheckoutPage.tsx    # Uses all three APIs
```

## 🚀 Implementation

### 1. Main Application API

```typescript
// api/mainApi.ts
import { createRestBase } from 'rest-api-kit';

export const mainApi = createRestBase({
  baseUrl: 'https://api.myapp.com/v1',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('mainApiToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const { useGetUser, useGetProducts } = mainApi.createEndpoints((builder) => ({
  getUser: builder({
    url: '/users/me',
    params: { method: 'GET' },
  }),
  getProducts: builder({
    url: '/products',
    params: { method: 'GET' },
  }),
}));
```

### 2. Analytics API

```typescript
// api/analyticsApi.ts
import { createRestBase } from 'rest-api-kit';

export const analyticsApi = createRestBase({
  baseUrl: 'https://analytics.myapp.com/v2',
  prepareHeaders: (headers) => {
    headers.set('X-API-Key', process.env.REACT_APP_ANALYTICS_KEY || '');
    return headers;
  },
});

export const { useTrackEvent, useGetAnalytics } = analyticsApi.createEndpoints((builder) => ({
  trackEvent: builder({
    url: '/events',
    params: { method: 'POST' },
  }),
  getAnalytics: builder({
    url: '/dashboard',
    params: { method: 'GET' },
  }),
}));
```

### 3. Payment API

```typescript
// api/paymentApi.ts
import { createRestBase } from 'rest-api-kit';

export const paymentApi = createRestBase({
  baseUrl: 'https://api.stripe.com/v1',
  prepareHeaders: (headers) => {
    headers.set('Authorization', `Bearer ${process.env.REACT_APP_STRIPE_SECRET}`);
    return headers;
  },
});

export const { useCreatePayment, useGetPaymentStatus } = paymentApi.createEndpoints((builder) => ({
  createPayment: builder({
    url: '/charges',
    params: { method: 'POST' },
  }),
  getPaymentStatus: builder({
    url: '/charges',
    params: { method: 'GET' },
  }),
}));
```

### 4. Using Multiple APIs Together

```typescript
// components/CheckoutPage.tsx
import React, { useEffect } from 'react';
import { useGetUser, useGetProducts } from '../api/mainApi';
import { useCreatePayment } from '../api/paymentApi';
import { useTrackEvent } from '../api/analyticsApi';

export const CheckoutPage = () => {
  const [getUser, userState] = useGetUser();
  const [getProducts, productsState] = useGetProducts();
  const [createPayment, paymentState] = useCreatePayment();
  const [trackEvent] = useTrackEvent();

  useEffect(() => {
    // Load data from main API
    getUser();
    getProducts();
    
    // Track page view in analytics
    trackEvent({ 
      event: 'page_view', 
      page: 'checkout' 
    });
  }, [getUser, getProducts, trackEvent]);

  const handleCheckout = async () => {
    // Track checkout start
    trackEvent({ 
      event: 'checkout_initiated',
      userId: userState.data?.id,
    });

    // Create payment via payment API
    const result = await createPayment({
      amount: 1000,
      currency: 'usd',
    });

    if (result) {
      // Track successful payment
      trackEvent({
        event: 'payment_completed',
        userId: userState.data?.id,
        amount: 1000,
      });
    }
  };

  return (
    <div>
      {/* Your checkout UI */}
      <button onClick={handleCheckout}>
        Complete Purchase
      </button>
    </div>
  );
};
```

## ✅ Benefits

### Independent Configuration
Each API has its own:
- Base URL
- Authentication strategy
- Headers
- Error handling

### Separation of Concerns
- Main app logic stays separate from payments
- Analytics doesn't interfere with business logic
- Easy to swap out third-party services

### Environment Management
Different APIs can use different:
- Development/staging/production URLs
- API keys and secrets
- Timeout settings

## 🔍 Key Concepts

### Multiple Instances
Each `createRestBase` call creates an **independent instance**:

```typescript
const api1 = createRestBase({ baseUrl: 'https://api1.com' });
const api2 = createRestBase({ baseUrl: 'https://api2.com' });

// api1 and api2 are completely independent!
// They have separate configurations and don't interfere with each other
```

### No Interference
- Caching is per-instance
- Headers are per-instance
- Endpoints don't conflict

### Real-World Pattern
```typescript
// Production
const mainApi = createRestBase({ 
  baseUrl: 'https://api.myapp.com' 
});

// Development
const mainApi = createRestBase({ 
  baseUrl: 'http://localhost:3000' 
});

// Use environment variables
const mainApi = createRestBase({ 
  baseUrl: process.env.REACT_APP_API_URL 
});
```

## 📚 Related Documentation

- [Multiple Endpoints Guide](../../MULTIPLE_ENDPOINTS_GUIDE.md)
- [Main README](../../README.md)
- [CHANGELOG](../../CHANGELOG.md)
