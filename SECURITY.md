# Security Policy

## Supported Versions

We actively support the following versions of rest-api-kit:

| Version | Supported          |
| ------- | ------------------ |
| 0.0.53+ | :white_check_mark: |
| < 0.0.53| :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in rest-api-kit, please report it responsibly.

### How to Report

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. Email us directly at: **security@rest-api-kit.dev** (or create a private issue)
3. Include as much detail as possible:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: We'll acknowledge receipt within 48 hours
- **Assessment**: We'll assess the vulnerability within 1 week
- **Fix Timeline**: Critical issues will be fixed within 2 weeks
- **Disclosure**: We'll coordinate disclosure timeline with you

### Security Best Practices

When using rest-api-kit:

1. **Secure Token Storage**
   ```typescript
   // ✅ Good: Secure storage
   const token = await SecureStore.getItemAsync('authToken');
   
   // ❌ Avoid: Plain text storage
   const token = localStorage.getItem('authToken');
   ```

2. **Input Validation**
   ```typescript
   // ✅ Good: Validate inputs
   const validateData = (data) => {
     if (!data || typeof data !== 'object') {
       throw new Error('Invalid data format');
     }
     return data;
   };
   ```

3. **HTTPS Only**
   ```typescript
   // ✅ Good: Always use HTTPS
   const api = createRestBase({
     baseUrl: 'https://secure-api.com'
   });
   ```

4. **Sensitive Data Handling**
   ```typescript
   // ✅ Good: Don't log sensitive data
   const middleware = (action, state, next) => {
     if (action.type !== 'AUTH_ACTION') {
       console.log('Action:', action);
     }
     next(action);
   };
   ```

## Responsible Disclosure

We follow responsible disclosure practices:

- Vulnerabilities are fixed before public disclosure
- Credit is given to researchers who report issues responsibly
- Security advisories are published for significant issues

## Contact

For security-related questions or concerns:
- Email: security@rest-api-kit.dev
- GitHub: Create a private vulnerability report

Thank you for helping keep rest-api-kit secure!
