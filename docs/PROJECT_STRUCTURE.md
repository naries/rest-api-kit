# Project Structure

This document explains the organization of the Rest API Kit project.

## 📁 Directory Structure

```
rest-api-kit/
├── .github/                    # GitHub configuration
│   ├── ISSUE_TEMPLATE/        # Issue templates
│   ├── workflows/             # CI/CD workflows
│   └── pull_request_template.md
├── docs/                       # Documentation
│   ├── guides/                # User guides
│   ├── release-notes/         # Release notes and fixes
│   └── README.md              # Documentation index
├── examples/                   # Usage examples
│   ├── organized-api/         # Multi-file API organization
│   ├── multiple-apis/         # Multiple base URLs example
│   ├── react-web-app/         # Web app example
│   └── react-native-app/      # Mobile app example
├── src/                        # Source code
│   ├── __test__/              # Tests
│   │   ├── helpers/           # Helper tests
│   │   └── hooks/             # Hook tests
│   ├── helpers/               # Utility functions
│   ├── hooks/                 # React hooks
│   ├── lib/                   # Core library code
│   │   ├── reducers/          # State reducers
│   │   └── states/            # Initial states
│   ├── apifunctions.ts        # API request functions
│   ├── base.ts                # Core API base creation
│   ├── defaults.ts            # Default configurations
│   ├── index.ts               # Main export file
│   └── types.ts               # TypeScript type definitions
├── dist/                       # Build output (gitignored)
├── coverage/                   # Test coverage (gitignored)
├── node_modules/              # Dependencies (gitignored)
├── .editorconfig              # Editor configuration
├── .eslintrc.json             # ESLint configuration
├── .gitignore                 # Git ignore rules
├── .node-version              # Node version for tooling
├── .npmignore                 # NPM publish ignore rules
├── .nvmrc                     # Node version for nvm
├── .prettierignore            # Prettier ignore rules
├── .prettierrc.json           # Prettier configuration
├── CHANGELOG.md               # Version history
├── CONTRIBUTING.md            # Contribution guidelines
├── LICENSE                    # MIT License
├── README.md                  # Main documentation
├── SECURITY.md                # Security policy
├── jest.config.js             # Jest configuration
├── package.json               # Package configuration
├── tsconfig.json              # TypeScript configuration
└── tsup.config.ts             # Build configuration
```

## 📦 Key Directories

### `/src` - Source Code
The main source code for the library.

**Key Files:**
- `base.ts` - Core functionality for creating API instances
- `hooks/useRest.ts` - Main hook for API requests
- `hooks/useStore.ts` - State management hook
- `apifunctions.ts` - HTTP client functions
- `types.ts` - TypeScript type definitions
- `index.ts` - Public API exports

### `/src/__test__` - Tests
Comprehensive test suite using Jest.

**Test Categories:**
- Unit tests for individual functions
- Hook tests using React Testing Library
- Integration tests for API workflows

### `/docs` - Documentation
All user-facing documentation.

**Subdirectories:**
- `guides/` - How-to guides and tutorials
- `release-notes/` - Version-specific release notes

### `/examples` - Usage Examples
Real-world examples showing different use cases.

**Examples:**
- `organized-api/` - Multi-file API organization (v0.0.53+)
- `multiple-apis/` - Multiple base URLs (v0.0.53+)
- `react-web-app/` - Complete web application
- `react-native-app/` - Complete mobile application

### `/.github` - GitHub Configuration
GitHub-specific configurations.

**Contents:**
- `workflows/` - CI/CD automation (tests, builds, releases)
- `ISSUE_TEMPLATE/` - Issue templates for bugs, features, questions
- `pull_request_template.md` - PR template

### `/dist` - Build Output
Generated files from the build process (not in git).

**Contents:**
- `index.js` - CommonJS build
- `index.mjs` - ES Module build
- `index.d.ts` - TypeScript declarations
- Source maps for debugging

## 📝 Configuration Files

### Build & Development
- `tsconfig.json` - TypeScript compiler settings
- `tsup.config.ts` - Build tool configuration
- `jest.config.js` - Test runner configuration

### Code Quality
- `.eslintrc.json` - Linting rules
- `.prettierrc.json` - Code formatting rules
- `.editorconfig` - Editor consistency settings

### Version Control
- `.gitignore` - Files to exclude from git
- `.npmignore` - Files to exclude from npm package

### Environment
- `.nvmrc` - Node version for nvm users
- `.node-version` - Node version for other tools

## 🏗️ Build Process

### Development Build
```bash
npm run dev          # Watch mode with hot reload
npm run build:watch  # Same as dev
```

### Production Build
```bash
npm run build       # Standard build
npm run build:prod  # Production build with optimizations
```

### Build Output
The build process generates:
1. **ESM** (`dist/index.mjs`) - For modern bundlers
2. **CJS** (`dist/index.js`) - For Node.js and older tools
3. **Types** (`dist/index.d.ts`) - For TypeScript users
4. **Source Maps** - For debugging

## 🧪 Testing

### Test Structure
```
src/__test__/
├── apifunctions.test.ts      # API function tests
├── base.test.ts              # Core functionality tests
├── typing.test.ts            # TypeScript type tests
├── helpers/
│   └── misc.test.ts          # Helper function tests
└── hooks/
    ├── useRest.test.ts       # Main hook tests
    └── storeListener.test.ts # Store management tests
```

### Running Tests
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
npm run test:ci       # CI environment
```

## 📚 Documentation Structure

### Root Level Docs
- `README.md` - Main project documentation
- `CHANGELOG.md` - Version history
- `CONTRIBUTING.md` - How to contribute
- `SECURITY.md` - Security policy
- `LICENSE` - MIT License

### `/docs/guides`
User guides and tutorials:
- Installation and setup
- Feature guides
- Best practices
- Troubleshooting

### `/docs/release-notes`
Version-specific information:
- Feature announcements
- Bug fixes
- Breaking changes
- Migration guides

## 🔄 Development Workflow

### 1. Development
```bash
npm run dev          # Start development build
npm run test:watch   # Run tests in watch mode
```

### 2. Validation
```bash
npm run validate     # Run all checks
# Runs: type-check, lint, format:check, test
```

### 3. Build
```bash
npm run build        # Build for production
```

### 4. Release
```bash
npm run release:patch  # Patch version (0.0.X)
npm run release:minor  # Minor version (0.X.0)
npm run release:major  # Major version (X.0.0)
```

## 📦 NPM Package

### Published Files
Only these files are included in the npm package:
- `/dist` - Built files
- `README.md` - Documentation
- `CHANGELOG.md` - Version history
- `LICENSE` - License file
- `package.json` - Package metadata

### Excluded from Package
See `.npmignore` for the complete list:
- Source files (`/src`)
- Tests (`/__test__`)
- Examples (`/examples`)
- Documentation (`/docs`)
- Development configurations

## 🎯 Package Entry Points

The package provides multiple entry points:

```json
{
  "main": "dist/index.js",      // CommonJS (Node.js, older bundlers)
  "module": "dist/index.mjs",   // ESM (Modern bundlers)
  "types": "dist/index.d.ts",   // TypeScript definitions
  "exports": {
    ".": {
      "import": "./dist/index.mjs",   // ESM import
      "require": "./dist/index.js",   // CJS require
      "types": "./dist/index.d.ts"    // TypeScript types
    }
  }
}
```

## 🔍 Finding Your Way

### To Add a New Feature
1. Add implementation in `/src`
2. Export from `/src/index.ts`
3. Add tests in `/src/__test__`
4. Update `/docs/guides` if needed
5. Update `CHANGELOG.md`

### To Add Documentation
1. Create/update file in `/docs/guides`
2. Link from `/docs/README.md`
3. Link from main `README.md` if appropriate

### To Add an Example
1. Create directory in `/examples`
2. Include `README.md` with instructions
3. Link from `/examples/README.md`
4. Link from relevant guide

### To Fix a Bug
1. Add failing test in `/src/__test__`
2. Fix implementation in `/src`
3. Verify test passes
4. Update `CHANGELOG.md`
5. Consider adding to troubleshooting guide

---

**Questions?** Check the [Contributing Guide](../CONTRIBUTING.md) or [open an issue](https://github.com/naries/rest-api-kit/issues)!
