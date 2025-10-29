# Contributing to Real Estate Brokerage Break-Even Analyzer

Thank you for considering contributing to this project! Here are some guidelines to help you get started.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/brokerage-management.git
   cd brokerage-management
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Add your Supabase credentials

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Project Structure

```
/Users/martin2/Desktop/Brokerage Management/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Dashboard
│   ├── analyze/             # Analysis tool
│   ├── history/             # Saved scenarios
│   ├── auth/                # Authentication
│   ├── api/                 # API routes
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── ui/                  # Base UI components
│   ├── kpi-card.tsx         # KPI display component
│   ├── navbar.tsx           # Navigation
│   └── theme-toggle.tsx     # Dark mode toggle
├── lib/                     # Utilities and configurations
│   ├── types.ts             # TypeScript types
│   ├── schemas.ts           # Zod validation schemas
│   ├── utils.ts             # Helper functions
│   └── supabase-browser.ts  # Supabase client
├── supabase/                # Supabase configurations
│   ├── functions/           # Edge Functions
│   │   └── calculate/       # Calculation function
│   └── schema.sql           # Database schema
└── public/                  # Static assets
```

## Code Style

### TypeScript
- Use TypeScript for all new files
- Avoid `any` types when possible
- Define proper interfaces and types

### React Components
- Use functional components with hooks
- Prefer named exports for components
- Keep components small and focused
- Use "use client" directive for client components

### Naming Conventions
- Components: PascalCase (e.g., `KPICard.tsx`)
- Utilities: camelCase (e.g., `formatCurrency`)
- Types: PascalCase (e.g., `Inputs`, `Results`)
- Constants: UPPER_SNAKE_CASE (e.g., `DEFAULT_INPUTS`)

### Styling
- Use Tailwind CSS utility classes
- Follow existing patterns for consistency
- Use the `cn()` utility for conditional classes
- Maintain the glass-morphism theme

## Making Changes

### 1. Create a Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes
- Write clean, readable code
- Follow existing patterns
- Add comments for complex logic

### 3. Test Your Changes
```bash
npm run build
npm run dev
```

### 4. Commit Your Changes
```bash
git add .
git commit -m "feat: add your feature description"
```

Use conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

### 5. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Feature Requests

### Adding New Features

When adding new features:
1. Check existing issues/PRs first
2. Open an issue to discuss the feature
3. Wait for approval before implementing
4. Follow the code style guidelines
5. Add documentation
6. Update README if needed

### Examples of Welcome Contributions

- **New Calculations**: Additional financial metrics
- **Export Formats**: PDF export, Excel export
- **Charts**: New visualization types
- **Reports**: Automated report generation
- **Integrations**: Third-party service integrations
- **Internationalization**: Multi-language support
- **Accessibility**: ARIA labels, keyboard navigation
- **Performance**: Optimization improvements

## Bug Reports

### Before Reporting

1. Check if the bug has already been reported
2. Try to reproduce the bug consistently
3. Test in multiple browsers if UI-related

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g., macOS, Windows]
 - Browser: [e.g., Chrome, Safari]
 - Version: [e.g., 22]

**Additional context**
Any other context about the problem.
```

## Testing

### Manual Testing Checklist

- [ ] Dashboard displays correctly with default values
- [ ] Analyze page form validates inputs
- [ ] Calculations produce correct results
- [ ] Save scenario works for authenticated users
- [ ] History page displays saved scenarios
- [ ] CSV export works correctly
- [ ] Delete scenario works
- [ ] Auth (sign up/sign in/sign out) works
- [ ] Dark mode toggle works
- [ ] Mobile responsive design works
- [ ] Charts render correctly

### Edge Cases to Test

- Invalid input values (negative numbers, out-of-range)
- Missing environment variables
- Network errors
- Database errors
- Auth errors (wrong password, email already exists)

## Documentation

When adding features, please update:
- README.md (if user-facing)
- DEPLOYMENT.md (if deployment-related)
- Inline code comments (for complex logic)
- Type definitions (for new data structures)

## Questions?

Feel free to open an issue for any questions about contributing.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

