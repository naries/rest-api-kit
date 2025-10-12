# Development Stages & Workflow

This document defines the development stages, branching strategy, and release process for Rest API Kit.

## 🌳 Branching Strategy

We follow a simplified Git Flow model:

### Main Branches

#### `main`
- **Purpose**: Production-ready code
- **Protected**: Yes
- **Auto-deploy**: Published to npm
- **Requires**: PR approval, passing tests, no conflicts

#### `develop` (optional)
- **Purpose**: Integration branch for features
- **Protected**: Yes
- **Auto-deploy**: No
- **Requires**: PR approval, passing tests

### Supporting Branches

#### Feature Branches (`feature/*`)
```bash
# Create from: main or develop
# Merge to: main or develop
# Naming: feature/short-description
# Example: feature/add-retry-logic
```

#### Bugfix Branches (`bugfix/*`)
```bash
# Create from: main or develop  
# Merge to: main or develop
# Naming: bugfix/issue-number-description
# Example: bugfix/123-fix-cache-invalidation
```

#### Hotfix Branches (`hotfix/*`)
```bash
# Create from: main
# Merge to: main (and develop if exists)
# Naming: hotfix/version-description
# Example: hotfix/0.0.57-security-patch
```

#### Release Branches (`release/*`)
```bash
# Create from: develop
# Merge to: main and develop
# Naming: release/version
# Example: release/1.0.0
```

## 📊 Development Stages

### Stage 1: Local Development

**Purpose**: Active development and testing

```bash
# 1. Create feature branch
git checkout -b feature/my-new-feature

# 2. Make changes
# ... code ...

# 3. Run development checks
npm run dev           # Watch mode development
npm run test:watch    # Tests in watch mode
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format code

# 4. Commit changes (follow conventional commits)
git add .
git commit -m "feat: add new feature description"
```

**Quality Checks**:
- ✅ Code runs without errors
- ✅ Tests pass locally
- ✅ Linting passes
- ✅ Code is formatted

### Stage 2: Pre-Commit

**Purpose**: Automated checks before commit

**Checks Run**:
- Linting (ESLint)
- Formatting (Prettier)
- Type checking (TypeScript)

```bash
# Automated via git hooks (if husky is installed)
# Or manually:
npm run validate
```

### Stage 3: Pull Request

**Purpose**: Code review and automated testing

```bash
# 1. Push your branch
git push origin feature/my-new-feature

# 2. Create PR on GitHub
# - Use the PR template
# - Link related issues
# - Request reviewers

# 3. Wait for CI checks
# - Tests run on multiple Node versions
# - Build verification
# - Coverage reports
```

**CI Checks**:
- ✅ Tests pass on Node 14, 16, 18
- ✅ Build succeeds
- ✅ No TypeScript errors
- ✅ Linting passes
- ✅ Code coverage maintained

**Review Requirements**:
- At least 1 approval
- All CI checks passing
- No merge conflicts
- Branch up to date with base

### Stage 4: Integration

**Purpose**: Merge approved changes

```bash
# After PR approval
# 1. Squash and merge (or merge commit)
# 2. Delete feature branch
```

**Actions**:
- Code merged to main/develop
- Branch deleted automatically
- CI runs on main branch

### Stage 5: Release Preparation

**Purpose**: Prepare for npm release

```bash
# 1. Ensure all changes are merged
# 2. Update version and changelog
npm run release:patch   # 0.0.X
npm run release:minor   # 0.X.0
npm run release:major   # X.0.0

# 3. This will:
# - Run validation (tests, linting, type-check)
# - Update package.json version
# - Create git tag
# - Push changes and tags
```

**Pre-release Checklist**:
- [ ] All PRs merged
- [ ] CHANGELOG.md updated
- [ ] Documentation updated
- [ ] Examples work
- [ ] No breaking changes (or documented)
- [ ] Version number follows semver

### Stage 6: Publishing

**Purpose**: Release to npm

```bash
# Automatic via GitHub Actions (recommended)
# Or manual:
npm publish
```

**Post-publish**:
- Package available on npm
- GitHub release created
- Documentation site updated (if applicable)

## 🔄 Workflow Examples

### Adding a New Feature

```bash
# 1. Create branch from main
git checkout main
git pull origin main
git checkout -b feature/multiple-base-urls

# 2. Develop feature
npm run dev                      # Start dev server
# ... make changes ...
npm run test:watch               # Run tests

# 3. Validate before commit
npm run validate                 # Run all checks

# 4. Commit with conventional commit message
git add .
git commit -m "feat: add support for multiple base URLs"

# 5. Push and create PR
git push origin feature/multiple-base-urls
# Create PR on GitHub

# 6. After approval, squash and merge
# 7. Delete branch

# 8. Create release (if ready)
git checkout main
git pull origin main
npm run release:minor           # 0.X.0
npm publish                     # Publish to npm
```

### Fixing a Bug

```bash
# 1. Create bugfix branch
git checkout -b bugfix/123-console-logging

# 2. Fix the bug
# ... make changes ...
npm test                        # Verify fix

# 3. Commit
git add .
git commit -m "fix: remove debug console.log statements

Fixes #123"

# 4. Push and create PR
git push origin bugfix/123-console-logging
# Create PR, link issue #123

# 5. After approval, merge
# 6. Create patch release
git checkout main
git pull origin main
npm run release:patch           # 0.0.X
npm publish
```

### Creating a Hotfix

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/0.0.57-security-fix

# 2. Fix the critical issue
# ... make changes ...
npm run validate

# 3. Commit
git add .
git commit -m "fix: patch security vulnerability"

# 4. Create PR (mark as urgent)
git push origin hotfix/0.0.57-security-fix

# 5. Fast-track review and merge

# 6. Immediate release
git checkout main
git pull origin main
npm run release:patch
npm publish
```

## 📋 Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions or fixes
- `chore`: Build process or auxiliary tool changes
- `ci`: CI/CD changes

### Examples
```bash
# Feature
feat(hooks): add useMultipleEndpoints hook

# Bug fix
fix(cache): prevent cache invalidation race condition

Fixes #123

# Breaking change
feat(api)!: change endpoint configuration format

BREAKING CHANGE: endpoint params must now be wrapped in params object

# Documentation
docs(guides): add troubleshooting section

# Chore
chore(deps): update typescript to 5.4.5
```

## 🏷️ Versioning

We follow [Semantic Versioning](https://semver.org/):

### Version Format: MAJOR.MINOR.PATCH

#### PATCH (0.0.X)
- Bug fixes
- Documentation updates
- Internal refactoring
- No API changes

```bash
npm run release:patch
```

#### MINOR (0.X.0)
- New features (backward compatible)
- New APIs
- Deprecations (with warnings)

```bash
npm run release:minor
```

#### MAJOR (X.0.0)
- Breaking changes
- API removals
- Major refactors

```bash
npm run release:major
```

### Pre-1.0.0 Note
Currently in 0.x.x:
- Minor version can include breaking changes
- Patch version for fixes only
- Aim for 1.0.0 when API is stable

## 🚀 Release Checklist

### Before Release
- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Examples tested
- [ ] Breaking changes documented
- [ ] Migration guide (if needed)
- [ ] Version number decided

### During Release
- [ ] Run `npm run validate`
- [ ] Run `npm run release:*`
- [ ] Verify git tag created
- [ ] Verify changes pushed

### After Release
- [ ] Verify package on npm
- [ ] Create GitHub release
- [ ] Announce on relevant channels
- [ ] Close related issues
- [ ] Update documentation site

## 🛠️ Scripts Reference

### Development
```bash
npm run dev              # Development with watch mode
npm run build            # Production build
npm run build:watch      # Build with watch mode
npm run clean            # Clean build artifacts
```

### Testing
```bash
npm test                 # Run all tests
npm run test:watch       # Tests in watch mode
npm run test:coverage    # Tests with coverage
npm run test:ci          # Tests for CI environment
```

### Quality
```bash
npm run lint             # Check for linting errors
npm run lint:fix         # Auto-fix linting errors
npm run format           # Format code
npm run format:check     # Check formatting
npm run type-check       # Check TypeScript types
npm run validate         # Run all quality checks
```

### Release
```bash
npm run release:patch    # Patch release (0.0.X)
npm run release:minor    # Minor release (0.X.0)
npm run release:major    # Major release (X.0.0)
```

## 🔐 Protected Branches

### `main` Branch Rules
- Require pull request reviews (1+ approval)
- Require status checks to pass
- Require branches to be up to date
- Require linear history
- Include administrators

### Status Checks Required
- CI tests (Node 14, 16, 18)
- Build verification
- Linting
- Type checking
- Code coverage

## 📞 Getting Help

- **Questions**: Open a [question issue](https://github.com/naries/rest-api-kit/issues/new?template=question.md)
- **Bugs**: Open a [bug report](https://github.com/naries/rest-api-kit/issues/new?template=bug_report.md)
- **Features**: Open a [feature request](https://github.com/naries/rest-api-kit/issues/new?template=feature_request.md)
- **Chat**: Join our discussions

---

**Happy developing!** 🚀
