# 🤝 Contributing to VocalSpace

Thank you for your interest in contributing to VocalSpace! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Experience level
- Gender identity and expression
- Sexual orientation
- Disability
- Personal appearance
- Body size
- Race
- Ethnicity
- Age
- Religion
- Nationality

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards others

**Unacceptable behavior includes:**
- Harassment, trolling, or insulting comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

## 🚀 Getting Started

### 1. Fork the Repository

Click the "Fork" button at the top right of the repository page.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/vocalspace.git
cd vocalspace
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/vocalspace.git
```

### 4. Setup Development Environment

Follow the [SETUP_GUIDE.md](./SETUP_GUIDE.md) to set up your local environment.

## 🔄 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow coding standards (see below)
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# Manual testing
# Test all affected features
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature"
```

See [Commit Guidelines](#commit-guidelines) below.

### 5. Keep Your Branch Updated

```bash
git fetch upstream
git rebase upstream/main
```

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Create Pull Request

Go to the original repository and click "New Pull Request".

## 💻 Coding Standards

### Python (Backend)

**Style Guide:** PEP 8

```python
# Good
def analyze_pronunciation(audio_path: str, text: str) -> Dict:
    """Analyze user pronunciation."""
    result = speech_analyzer.analyze(audio_path, text)
    return result

# Bad
def analyzePronunciation(audioPath,text):
    result=speech_analyzer.analyze(audioPath,text)
    return result
```

**Key Points:**
- Use snake_case for functions and variables
- Use PascalCase for classes
- Type hints for function parameters and returns
- Docstrings for all functions and classes
- Maximum line length: 100 characters
- Use f-strings for string formatting

**Tools:**
```bash
# Format code
black backend/

# Lint code
flake8 backend/

# Type checking
mypy backend/
```

### JavaScript/React (Frontend)

**Style Guide:** Airbnb JavaScript Style Guide

```javascript
// Good
const AnalyzeButton = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="btn-primary"
    >
      Analyze
    </button>
  )
}

// Bad
const analyzeButton = (props) => {
  return <button onClick={props.onClick} disabled={props.disabled} className="btn-primary">Analyze</button>
}
```

**Key Points:**
- Use PascalCase for components
- Use camelCase for functions and variables
- Use arrow functions
- Destructure props
- Use meaningful variable names
- Maximum line length: 100 characters

**Tools:**
```bash
# Lint code
npm run lint

# Format code
npm run format
```

### CSS/Tailwind

```jsx
// Good - Organized classes
<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">

// Bad - Unorganized
<div className="shadow-lg p-4 rounded-lg bg-white flex dark:bg-gray-800 items-center justify-between">
```

**Class Order:**
1. Layout (flex, grid, block)
2. Positioning (relative, absolute)
3. Sizing (w-, h-, max-, min-)
4. Spacing (p-, m-)
5. Typography (text-, font-)
6. Colors (bg-, text-, border-)
7. Effects (shadow-, opacity-)
8. Transitions (transition-, duration-)

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements

### Examples

```bash
# Feature
git commit -m "feat(auth): add Google OAuth support"

# Bug fix
git commit -m "fix(api): resolve CORS issue in production"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactor
git commit -m "refactor(analyzer): improve phoneme detection algorithm"

# Multiple lines
git commit -m "feat(dashboard): add user statistics

- Add streak counter
- Add XP points display
- Add accuracy chart

Closes #123"
```

## 🔀 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Commit messages follow guidelines
- [ ] Branch is up to date with main

### PR Title

Follow commit message format:
```
feat(component): add new feature
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests pass
```

### Review Process

1. **Automated Checks** - CI/CD runs tests
2. **Code Review** - Maintainers review code
3. **Feedback** - Address review comments
4. **Approval** - At least one approval required
5. **Merge** - Maintainer merges PR

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run specific test file
pytest tests/test_auth.py

# Run with coverage
pytest --cov=app tests/

# Run specific test
pytest tests/test_auth.py::test_register
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

### Manual Testing Checklist

- [ ] Authentication flow works
- [ ] Profile completion works
- [ ] Practice session records audio
- [ ] AI analysis returns results
- [ ] Progress charts display correctly
- [ ] Admin dashboard shows data
- [ ] Dark/light theme toggles
- [ ] Mobile responsive
- [ ] No console errors

## 📚 Documentation

### Code Documentation

**Python:**
```python
def analyze_pronunciation(audio_path: str, text: str) -> Dict:
    """
    Analyze user pronunciation using AI.
    
    Args:
        audio_path: Path to audio file
        text: Expected text transcription
        
    Returns:
        Dict containing accuracy, weak phonemes, and feedback
        
    Raises:
        FileNotFoundError: If audio file doesn't exist
        ValueError: If text is empty
    """
    pass
```

**JavaScript:**
```javascript
/**
 * Analyze user's recorded audio
 * @param {Blob} audioBlob - Recorded audio blob
 * @param {string} text - Expected text
 * @returns {Promise<Object>} Analysis results
 */
const analyzeAudio = async (audioBlob, text) => {
  // Implementation
}
```

### README Updates

When adding features, update:
- Main README.md
- Component-specific README
- API documentation
- Setup guide (if needed)

## 🐛 Reporting Bugs

### Before Reporting

1. Check existing issues
2. Try latest version
3. Reproduce the bug
4. Gather information

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

**Additional context**
Any other information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
Clear description of desired solution

**Describe alternatives you've considered**
Alternative solutions or features

**Additional context**
Mockups, examples, etc.
```

## 🎯 Areas for Contribution

### High Priority

- [ ] Add comprehensive test coverage
- [ ] Improve error handling
- [ ] Add more phoneme examples
- [ ] Optimize AI model performance
- [ ] Add multi-language support

### Good First Issues

- [ ] Fix typos in documentation
- [ ] Add missing type hints
- [ ] Improve UI animations
- [ ] Add loading states
- [ ] Write unit tests

### Advanced

- [ ] Implement video recording
- [ ] Add real-time analysis
- [ ] Optimize database queries
- [ ] Add caching layer
- [ ] Implement WebSocket support

## 📞 Getting Help

- 💬 **Discussions:** GitHub Discussions
- 📧 **Email:** dev@vocalspace.com
- 📖 **Docs:** [Documentation](./SETUP_GUIDE.md)
- 🐛 **Issues:** [GitHub Issues](https://github.com/yourusername/vocalspace/issues)

## 🙏 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to VocalSpace!** 🎉

Your contributions help make speech therapy more accessible and effective for everyone.
