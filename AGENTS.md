# AGENTS.md

## Development Best Practices

### Sensitive Information
- **Never commit** credentials, API keys, tokens, or secrets to version control
- Files like `credentials.json`, `firebase_creds.json`, `.env` files, and IDE settings (`*.DotSettings.user`) are already excluded from git
- If you accidentally commit sensitive data, notify the team immediately

### Git Workflow
- Always check `git status` before committing to ensure no sensitive files are staged
- Use meaningful commit messages that describe what changed
- Review diffs before committing
- **Never commit without explicit user approval** - always ask for approval before making commits

### Code Standards
- Follow existing code style and conventions in the codebase
- Add comments only when necessary for complex logic
- Keep functions focused and modular

### API Development
- Use generic naming (e.g., `MediaDto` over `MovieDto`) to allow for future expansion
- Handle both successful responses and error cases gracefully

### Frontend Development
- Use TypeScript interfaces for type safety
- Keep components small and reusable
- Test UI changes on both light and dark backgrounds

### Database & Storage
- Never hardcode database connection strings or storage credentials
- Use environment variables or secure configuration management

---

*Last updated: Feb 2026*
