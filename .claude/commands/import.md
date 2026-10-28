Import a specific GitHub repository.

Usage: /import <owner/repo>

1. Clone the repo (shallow: `--depth 1`):
   ```bash
   git clone --depth 1 https://github.com/<owner>/<repo>.git /tmp/<repo>
   ```

2. Identify importable content:
   - SKILL.md files → `skills/<source>/`
   - Prompt files → `prompts/imported/`
   - Agent definitions → `agents/imported/`

3. Copy files maintaining structure:
   ```bash
   # Example for skills
   mkdir -p skills/<source>
   cp -r /tmp/<repo>/skills/* skills/<source>/
   ```

4. Create `skills/<source>/README.md` with:
   - Repository name and link
   - Stars count
   - Description
   - What was imported
   - Source attribution

5. Clean up:
   ```bash
   rm -rf /tmp/<repo>
   ```

6. Create PR:
   ```bash
   git add .
   git commit -m "Import skills from <owner>/<repo>"
   git push
   gh pr create --title "Import: <repo>" --body "Imported from <url>"
   ```
