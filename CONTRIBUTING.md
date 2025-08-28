# Contributing to Rest API Kit

Thank you for your interest in contributing to Rest API Kit! 🎉

We welcome contributions from developers of all skill levels. Whether you're fixing bugs, adding features, improving documentation, or sharing feedback, your contributions help make Rest API Kit better for everyone.

## 🚀 Quick Start

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/rest-api-kit.git
   cd rest-api-kit
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Tests**
   ```bash
   npm test
   ```

4. **Build the Project**
   ```bash
   npm run build
   ```

## 🔧 Development Workflow

### Project Structure
```
rest-api-kit/
├── src/
│   ├── apifunctions.ts      # HTTP client implementation
│   ├── base.ts              # Core API base creation
│   ├── types.ts             # TypeScript definitions
│   ├── hooks/               # React hooks
│   │   ├── useRest.ts       # Main REST hook
│   │   ├── useStore.ts      # Store management hook
│   │   └── storeListener.ts # Enhanced store implementation
│   ├── helpers/             # Utility functions
│   ├── lib/                 # Core libraries
│   └── __test__/            # Test files
├── examples/                # Usage examples
├── docs/                    # Documentation
└── dist/                    # Build output
```

### Scripts
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run build` - Build the library
- `npm run lint` - Run linting (if configured)

## 🧪 Testing

We use Jest for testing. All code changes should include appropriate tests.

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- hooks/useRest.test.ts
```

### Writing Tests

#### Component Tests
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useGetTodos } from '../api/endpoints';

test('should fetch todos successfully', async () => {
  const { result } = renderHook(() => useGetTodos());
  
  await act(async () => {
    const response = await result.current[0]();
    expect(response.type).toBe('success');
  });
});
```

#### API Tests
```typescript
import fetchMock from 'jest-fetch-mock';
import { createRequest } from '../apifunctions';

beforeEach(() => {
  fetchMock.enableMocks();
});

test('should handle API requests', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({ success: true }));
  
  const response = await createRequest('/test');
  expect(response.type).toBe('success');
});
```

## 📝 Code Style

### TypeScript Guidelines
- Use strict TypeScript configuration
- Provide explicit types for public APIs
- Use generics appropriately for reusable components
- Document complex type definitions

```typescript
// ✅ Good
interface ApiResponse<T> {
  type: 'success' | 'error';
  data: T;
  status?: number;
  headers?: Headers;
}

// ❌ Avoid
const response: any = await fetchData();
```

### Code Organization
- Keep files focused and single-purpose
- Use descriptive names for functions and variables
- Add JSDoc comments for public APIs
- Group related functionality together

```typescript
/**
 * Creates a REST API hook with type safety and caching
 * @param url - The API endpoint URL
 * @param params - Configuration parameters
 * @returns Tuple with trigger function and state
 */
export function useRest<TData, TBody>(...) {
  // Implementation
}
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Clear Description**: What happened vs. what you expected
2. **Reproduction Steps**: Minimal code to reproduce the issue
3. **Environment**: OS, Node.js version, React version
4. **Error Messages**: Full error messages and stack traces

### Bug Report Template
```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Create component with useGetTodos hook
2. Call the trigger function
3. Observe the error

## Expected Behavior
Should fetch todos successfully

## Actual Behavior
Throws network error

## Environment
- OS: macOS 12.0
- Node.js: 18.0.0
- React: 18.0.0
- rest-api-kit: 0.0.53

## Additional Context
Any other relevant information
```

## ✨ Feature Requests

We love feature ideas! When suggesting features:

1. **Use Case**: Describe the problem you're trying to solve
2. **Proposed Solution**: How should the feature work?
3. **Alternatives**: What other solutions have you considered?
4. **Implementation**: Any thoughts on implementation approach?

### Feature Request Template
```markdown
## Problem Statement
Describe the problem or limitation

## Proposed Solution
How should this feature work?

## Example Usage
```typescript
// Show how the feature would be used
const [getData, state] = useGetData({
  newFeature: true
});
```

## Use Cases
What scenarios would this help with?

## Implementation Notes
Any thoughts on how to implement this?
```

## 🔄 Pull Request Process

### Before You Start
1. Check existing issues and PRs to avoid duplicates
2. Create an issue to discuss large changes
3. Fork the repository and create a feature branch

### Development Process
1. **Create Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write your code
   - Add tests for new functionality
   - Update documentation if needed

3. **Test Your Changes**
   ```bash
   npm test
   npm run build
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

### Commit Message Format
We follow conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Test additions or changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

Examples:
```
feat: add retry logic to HTTP requests
fix: resolve memory leak in store listeners
docs: update integration guide for React Native
test: add comprehensive store management tests
```

### Pull Request Guidelines
1. **Clear Title**: Descriptive title explaining the change
2. **Description**: Detailed explanation of what and why
3. **Breaking Changes**: Clearly mark any breaking changes
4. **Testing**: Confirm all tests pass
5. **Documentation**: Update docs for new features

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] All existing tests pass
- [ ] New tests added for changes
- [ ] Manual testing completed

## Documentation
- [ ] README updated
- [ ] API documentation updated
- [ ] Examples added/updated

## Breaking Changes
List any breaking changes and migration path

## Additional Notes
Any other relevant information
```

## 📖 Documentation

### Types of Documentation
1. **README**: Overview and quick start guide
2. **API Reference**: Detailed function/hook documentation
3. **Examples**: Real-world usage examples
4. **Guides**: Step-by-step tutorials

### Documentation Standards
- Use clear, concise language
- Provide working code examples
- Include both React and React Native examples
- Keep examples up-to-date with latest API

### Adding Examples
```typescript
// examples/todo-app/TodoList.tsx
import React, { useEffect } from 'react';
import { useGetTodos, useCreateTodo } from './api';

export const TodoList: React.FC = () => {
  const [getTodos, { data: todos, loading }] = useGetTodos();
  const [createTodo] = useCreateTodo();

  useEffect(() => {
    getTodos();
  }, []);

  // Component implementation
  return (
    <div>
      {/* JSX content */}
    </div>
  );
};
```

## 🤝 Code Review Process

### What We Look For
1. **Correctness**: Does the code work as intended?
2. **Performance**: Are there performance implications?
3. **Type Safety**: Proper TypeScript usage
4. **Testing**: Adequate test coverage
5. **Documentation**: Sufficient documentation
6. **Breaking Changes**: Impact on existing users

### Review Guidelines
- Be constructive and respectful
- Explain the reasoning behind suggestions
- Ask questions when something is unclear
- Approve when ready, request changes when needed

## 🚀 Release Process

### Version Management
We follow semantic versioning (SemVer):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist
1. Update version in package.json
2. Update CHANGELOG.md
3. Run full test suite
4. Build and verify output
5. Create release tag
6. Publish to npm

## 💬 Getting Help

### Community Support
- **GitHub Discussions**: For questions and ideas
- **Issues**: For bugs and feature requests
- **Discord**: Real-time community chat (if available)

### Maintainer Response Time
- We aim to respond to issues within 48 hours
- PRs typically reviewed within 1 week
- Security issues handled with high priority

## 📜 Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please:

1. **Be Respectful**: Treat all community members with respect
2. **Be Constructive**: Focus on improving the project
3. **Be Patient**: Allow time for responses and reviews
4. **Be Collaborative**: Work together toward common goals

### Unacceptable Behavior
- Harassment, discrimination, or exclusionary behavior
- Spam or off-topic discussions
- Sharing private information without permission
- Any behavior that creates an unwelcoming environment

## 🙏 Recognition

Contributors are recognized in several ways:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- GitHub contributor statistics
- Special recognition for significant contributions

## 📞 Contact

For questions about contributing:
- Open a GitHub Discussion
- Create an issue with the "question" label
- Email: maintainers@rest-api-kit.dev

---

Thank you for contributing to Rest API Kit! Together, we're building something amazing. 🎉
