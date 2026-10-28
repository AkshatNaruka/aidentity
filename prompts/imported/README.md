# Imported Prompts

Prompt libraries from upstream projects, kept with attribution.

## Sources

### fabric-patterns/
**Source**: https://github.com/danielmiessler/fabric — MIT

256 pattern-based AI workflows for analysis, writing, research, business, and security. Each pattern is a structured prompt template (`system.md`) with optional examples (`user.md`).

### prompts.chat
**Source**: https://github.com/f/prompts.chat — CC0 1.0 (prompt content)

160+ role and task prompts (Linux Terminal, English Translator, Excel Sheet, career and business prompts). We link to the source instead of mirroring the 5.6 MB consolidated file — it dominated clone size and duplicates an actively maintained dataset.

Browse it directly: https://prompts.chat

## Usage

```bash
# Use a Fabric pattern
cat prompts/imported/fabric-patterns/extract_wisdom/system.md
```

## License

- Fabric patterns: MIT — keep the upstream attribution.
- prompts.chat prompt content: CC0 1.0 (public domain).
