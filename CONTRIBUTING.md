# 🤝 Contributing to ChatApp

First off, thank you for considering contributing to ChatApp! 🎉 It's people like you that make ChatApp such a great tool for real-time communication.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Issue Guidelines](#issue-guidelines)
- [Community](#community)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [koustavsinghcollege@gmail.com](mailto:koustavsinghcollege@gmail.com).

### Our Standards

- **Be respectful** and inclusive
- **Be collaborative** and constructive
- **Be patient** with newcomers
- **Focus on the issue**, not the person
- **Give and receive feedback** gracefully

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git
- Code editor (VS Code recommended)

### Quick Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/koustavx08/chat-app.git
   cd chat-app
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/koustavx08/chat-app.git
   ```
4. **Install dependencies**:
   ```bash
   npm run install:all
   ```

---

## 🛠️ How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title** and description
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, Node version, etc.)

**Use this template:**

```markdown
**Bug Description:**
A clear description of what the bug is.

**To Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
What you expected to happen.

**Environment:**
- OS: [e.g., Windows 11]
- Node.js version: [e.g., 18.17.0]
- Browser: [e.g., Chrome 115]
```

### ✨ Suggesting Features

Feature requests are welcome! Please:

- **Check existing feature requests** first
- **Explain the problem** you're trying to solve
- **Describe the solution** you'd like
- **Consider alternatives** you've thought about

### 🔧 Code Contributions

1. **Look for issues** labeled `good first issue` or `help wanted`
2. **Comment on the issue** to get assigned
3. **Follow the development setup** below
4. **Create a pull request** when ready

---

## 💻 Development Setup

### Environment Configuration

1. **Backend setup**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Required environment variables**:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/chatapp
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=development
   UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=10485760
   ```

### Running the Application

```bash
# Start both frontend and backend
npm run dev

# Or run separately
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

### Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Run all tests
npm run test:all
```

---

## 🔄 Pull Request Process

### Before Submitting

- [ ] **Update documentation** if needed
- [ ] **Add tests** for new features
- [ ] **Ensure all tests pass**
- [ ] **Follow code style guidelines**
- [ ] **Update CHANGELOG.md** if applicable

### PR Guidelines

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes** and commit:
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

3. **Keep your branch updated**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

4. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Create a Pull Request** with:
   - Clear title and description
   - Reference to related issues
   - Screenshots/GIFs if UI changes
   - Checklist of completed items

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
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Manual testing completed

## Screenshots
(If applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

---

## 🎨 Style Guidelines

### TypeScript/JavaScript

- **Use TypeScript** for type safety
- **ESLint + Prettier** for code formatting
- **Functional components** with hooks
- **Named exports** over default exports
- **Descriptive variable names**

```typescript
// Good ✅
const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  // ...
};

// Avoid ❌
const Modal = ({ user, onClose }) => {
  const [editing, setEditing] = useState(false);
  // ...
};
```

### CSS/Styling

- **TailwindCSS** for styling
- **Mobile-first** responsive design
- **Consistent spacing** using Tailwind classes
- **Dark mode support** for all components

```tsx
// Good ✅
<div className="flex flex-col space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
    {title}
  </h2>
</div>
```

### File Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI elements
│   └── features/       # Feature-specific components
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── stores/             # State management
├── lib/                # Utilities and services
└── types/              # TypeScript definitions
```

---

## 📝 Commit Message Guidelines

We follow [Conventional Commits](https://conventionalcommits.org/) specification:

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
feat(auth): add OAuth login support
fix(chat): resolve message ordering issue
docs(readme): update installation instructions
style(components): format with prettier
refactor(api): extract user service
test(messages): add unit tests for message validation
chore(deps): update dependencies
```

---

## 🐛 Issue Guidelines

### Bug Reports

Use the **Bug Report** template and include:

- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots/logs if relevant

### Feature Requests

Use the **Feature Request** template and include:

- Problem description
- Proposed solution
- Alternative solutions considered
- Additional context

### Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `documentation`: Documentation improvements
- `frontend`: Frontend-related changes
- `backend`: Backend-related changes

---

## 🌟 Recognition

Contributors will be recognized in our:

- **Contributors section** in README.md
- **Release notes** for significant contributions
- **GitHub contributors** page

### Hall of Fame 🏆

Special recognition for contributors who:
- Fix critical bugs
- Implement major features
- Improve documentation significantly
- Help with code reviews
- Mentor newcomers

---

## 📞 Community

### Get Help

- **GitHub Discussions** for questions and ideas
- **Discord Server** for real-time chat (coming soon)
- **Email** [koustavsinghcollege@gmail.com](mailto:koustavsinghcollege@gmail.com)

### Stay Updated

- **Watch** the repository for notifications
- **Follow** [@koustavx08](https://github.com/koustavx08) on GitHub
- **Star** the project if you find it useful

---

## ❓ FAQ

**Q: How do I set up the development environment?**
A: Follow the [Development Setup](#development-setup) section above.

**Q: Can I work on multiple issues at once?**
A: We recommend focusing on one issue at a time for better code quality.

**Q: How long does it take for PRs to be reviewed?**
A: We aim to review PRs within 2-3 business days.

**Q: What if my PR conflicts with the main branch?**
A: Rebase your branch against the latest main branch and resolve conflicts.

---

<div align="center">

**Thank you for contributing to ChatApp! 🚀**

*Let's build something amazing together!*

[⬆ Back to Top](#-contributing-to-chatapp)

</div>
