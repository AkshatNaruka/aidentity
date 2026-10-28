# Best Practices

## Prompt Engineering

### 1. Be Specific
- Include exact file paths
- Reference specific functions/variables
- Provide clear examples

### 2. Set Constraints
- Specify output format
- Define success criteria
- Limit scope

### 3. Test Prompts
- Run on sample tasks
- Verify output quality
- Iterate until reliable

## Model Selection

### 1. Start Simple
- Begin with free models
- Only upgrade if needed
- Document what works

### 2. Match Complexity
- Use the right model for the task
- Don't over-engineer
- Keep it simple

### 3. Monitor Costs
- Track model usage
- Optimize for efficiency
- Avoid unnecessary calls

## Agent Design

### 1. Single Responsibility
- Each agent does one thing well
- Clear input/output
- Minimal dependencies

### 2. Composability
- Agents should work together
- Standard interfaces
- Easy to swap

### 3. Fail Gracefully
- Handle errors
- Provide fallbacks
- Log issues

## Routing System

### 1. Default to Simple
- Start with one model call
- Only escalate on failure
- Don't over-orchestrate

### 2. Clear Thresholds
- Define complexity levels
- Document decisions
- Review regularly

### 3. Monitor Performance
- Track routing decisions
- Measure success rates
- Optimize over time

## Project Structure

### 1. Organized Config
```
.opencode/
├── agents/           # Agent definitions
├── prompts/          # Prompt templates
├── routing/          # Routing configs
└── docs/             # Documentation
```

### 2. Version Control
- Commit all configs
- Document changes
- Review regularly

### 3. Documentation
- Explain decisions
- Provide examples
- Keep updated

## Supabase MCP

### 1. Project Organization
- One config per project
- Document schemas
- Track migrations

### 2. Security
- Never commit secrets
- Use environment variables
- Rotate keys regularly

### 3. Performance
- Optimize queries
- Use indexes
- Monitor usage

## Common Patterns

### 1. Code Review
```
Task: Review code for quality
Model: free-reviewer
Output: List of issues with suggestions
```

### 2. Bug Fix
```
Task: Fix specific bug
Model: free-implementer (or higher)
Output: Fixed code with explanation
```

### 3. Feature Addition
```
Task: Add new feature
Model: free-complex (or higher)
Output: Implementation with tests
```

### 4. Refactoring
```
Task: Refactor code
Model: free-expert (for major changes)
Output: Refactored code with documentation
```

## Anti-Patterns

### 1. Over-Orchestration
- Don't use multiple agents for simple tasks
- Don't chain agents unnecessarily
- Keep it simple

### 2. Wrong Model
- Don't use expensive models for simple tasks
- Don't use weak models for complex tasks
- Match model to task

### 3. No Monitoring
- Don't ignore routing decisions
- Don't skip testing
- Don't assume everything works

## Future Improvements

- [ ] Add more routing configurations
- [ ] Create domain-specific prompts
- [ ] Build cost analysis tools
- [ ] Develop performance benchmarks
- [ ] Create integration patterns
