
# Contributing to RefSpring 🤝

Thank you for your interest in contributing to RefSpring! We welcome contributions from the community.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase account for development
- Git

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/refspring.git
   cd refspring
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Add your Firebase configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📝 How to Contribute

### 🐛 Reporting Bugs
- Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md)
- Include steps to reproduce
- Add screenshots if applicable
- Specify browser and version

### ✨ Suggesting Features
- Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md)
- Describe the problem you're solving
- Explain your proposed solution

### 🔧 Code Contributions

1. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes**
   - Follow our coding standards
   - Add tests if applicable
   - Update documentation

3. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

4. **Push and create a PR**
   ```bash
   git push origin feature/amazing-feature
   ```

## 📋 Coding Standards

### TypeScript
- Use strict TypeScript
- Prefer interfaces over types
- Add proper JSDoc comments

### React
- Use functional components with hooks
- Follow the existing component structure
- Keep components small and focused

### Styling
- Use Tailwind CSS classes
- Follow the existing design system
- Ensure responsive design

### Git Commits
We follow [Conventional Commits](https://conventionalcommits.org/):
- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance tasks

## 🔍 Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update the CHANGELOG.md
5. Request review from maintainers

## 🏗️ Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── pages/         # Application pages
├── lib/           # Utilities and configuration
├── types/         # TypeScript definitions
└── i18n/          # Internationalization
```

## 🧪 Testing

```bash
# Run tests (when available)
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 💬 Getting Help

- 📖 Check the [documentation](README.md)
- 💬 Join our [Discord](https://discord.gg/refspring)
- 📧 Email: support@refspring.com

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
