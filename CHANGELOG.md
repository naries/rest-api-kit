# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Multiple `createEndpoints` calls**: You can now call `createEndpoints` multiple times on the same API instance to organize endpoints across separate files
- **Multiple `createRestBase` instances**: Support for multiple base URLs in the same application for connecting to different APIs or microservices
- **Endpoint accumulation**: All endpoints and hooks accumulate across multiple `createEndpoints` calls
- **Duplicate detection**: Console warnings when duplicate endpoint names are detected
- Comprehensive guide for multiple endpoints and base URLs (`MULTIPLE_ENDPOINTS_GUIDE.md`)
- Examples showing API organization by feature (auth, users, todos, etc.)
- Examples for multi-service applications (main API, analytics, payments, etc.)
- Comprehensive documentation and examples
- Enhanced store management with middleware support
- TypeScript improvements and type safety
- React Native compatibility examples

### Changed
- Removed singleton pattern limitation from `createRestBase` - now supports multiple instances
- Changed `createEndpoints` from one-time initialization to accumulative registration
- Endpoints and hooks now merge with existing ones instead of replacing them

### Fixed
- IIFE bug in hook generation that caused "is not a function" errors
- Removed artificial limitation that prevented multiple `createEndpoints` calls
- **Debug console.log in useStore hook**: Removed debug logging that was causing console spam for every hook used in components

## [0.0.53] - 2025-08-28

### Added
- Enterprise-grade HTTP client with interceptors
- Retry logic with exponential backoff
- Timeout management and request cancellation
- Enhanced error handling and formatting
- Middleware system for request/response transformation
- DevTools integration for debugging
- Persistence layer with localStorage support
- Performance optimizations with memoization
- Comprehensive test coverage
- Extensive documentation and integration guides

### Changed
- Complete refactor of `apifunctions.ts` to enterprise-grade implementation
- Enhanced `storeListener.ts` with advanced state management
- Improved type safety throughout the library
- Updated examples for both React and React Native

### Fixed
- Memory leaks in store subscriptions
- Type safety issues in generic implementations
- Cache invalidation bugs
- URL mutation issues

## [0.0.52] - Previous Release

### Added
- Basic REST API management
- Simple caching mechanism
- React hooks for API calls
- TypeScript support

---

## Release Types

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes
