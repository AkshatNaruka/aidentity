#!/usr/bin/env node

/**
 * AI Resources Scanner
 * 
 * Scans GitHub for new AI/agent resources, skills, prompts, and tools.
 * Creates a report with findings for PR review.
 * 
 * Usage:
 *   node scripts/scan-repos.js                    # Full scan
 *   node scripts/scan-repos.js --quick            # Quick scan (trending only)
 *   node scripts/scan-repos.js --repo owner/repo  # Check specific repo
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  minStars: 1000,
  maxAge: 180, // days
  outputDir: path.join(__dirname, '..', 'scan-results'),
  
  // GitHub topics to search
  topics: [
    'agent-skills',
    'claude-code', 
    'ai-agents',
    'llm-tools',
    'coding-agent',
    'skill-md',
    'claude-skills',
    'opencode'
  ],

  // Awesome lists to monitor
  awesomeLists: [
    'VoltAgent/awesome-agent-skills',
    'hesreallyhim/awesome-claude-code',
    'awesome-opencode/awesome-opencode',
    'michielhdoteth/awesome-ai-agent-tools',
    'ComposioHQ/awesome-claude-skills',
    'travisvn/awesome-claude-skills',
    'karanb192/awesome-claude-skills'
  ],

  // Known repos to check for updates
  knownRepos: [
    'mattpocock/skills',
    'obra/superpowers',
    'addyosmani/agent-skills',
    'anthropics/skills',
    'google/skills',
    'microsoft/skills',
    'tt-a1i/archify',
    'VoltAgent/awesome-agent-skills',
    'f/prompts.chat',
    'danielmiessler/Fabric'
  ]
};

// GitHub API helper
async function githubApi(endpoint) {
  return new Promise((resolve, reject) => {
    const token = process.env.GITHUB_TOKEN;
    const options = {
      hostname: 'api.github.com',
      path: endpoint,
      headers: {
        'User-Agent': 'ai-resources-scanner',
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `token ${token}`;
    }

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data.substring(0, 200)}`));
        }
      });
    }).on('error', reject);
  });
}

// Search GitHub for repos by topic
async function searchByTopic(topic) {
  const endpoint = `/search/repositories?q=topic:${topic}+stars:>=${CONFIG.minStars}&sort=stars&order=desc&per_page=10`;
  const result = await githubApi(endpoint);
  return result.items || [];
}

// Get repo contents
async function getRepoContents(owner, repo, path = '') {
  const endpoint = `/repos/${owner}/${repo}/contents/${path}`;
  return await githubApi(endpoint);
}

// Check if repo has SKILL.md files
async function hasSkillFiles(owner, repo) {
  try {
    const contents = await getRepoContents(owner, repo, 'skills');
    if (Array.isArray(contents)) {
      return contents.some(item => 
        item.name === 'SKILL.md' || 
        item.type === 'dir'
      );
    }
    // Check root for SKILL.md
    const rootContents = await getRepoContents(owner, repo);
    return Array.isArray(rootContents) && 
           rootContents.some(item => item.name === 'SKILL.md');
  } catch {
    return false;
  }
}

// Get repo metadata
async function getRepoMeta(owner, repo) {
  return await githubApi(`/repos/${owner}/${repo}`);
}

// Scan awesome list for new repos
async function scanAwesomeList(owner, repo) {
  try {
    const readme = await githubApi(`/repos/${owner}/${repo}/readme`);
    const content = Buffer.from(readme.content, 'base64').toString('utf-8');
    
    // Extract GitHub links
    const links = content.match(/https:\/\/github\.com\/[\w-]+\/[\w-]+/g) || [];
    const uniqueRepos = [...new Set(links)]
      .map(link => {
        const match = link.match(/github\.com\/([\w-]+\/[\w-]+)/);
        return match ? match[1] : null;
      })
      .filter(Boolean)
      .filter(repo => !repo.includes('github.com')); // Filter out invalid
    
    return uniqueRepos;
  } catch (e) {
    console.error(`Error scanning ${owner}/${repo}: ${e.message}`);
    return [];
  }
}

// Main scan function
async function scanRepos(options = {}) {
  const results = {
    newRepos: [],
    updatedRepos: [],
    scannedAt: new Date().toISOString(),
    stats: {
      topicsScanned: 0,
      awesomeListsScanned: 0,
      reposChecked: 0,
      newFindings: 0
    }
  };

  console.log('🔍 Starting AI Resources Scan...\n');

  // 1. Scan by topics
  if (!options.quick) {
    console.log('📡 Scanning GitHub topics...');
    for (const topic of CONFIG.topics) {
      try {
        const repos = await searchByTopic(topic);
        console.log(`  Found ${repos.length} repos for topic: ${topic}`);
        
        for (const repo of repos) {
          const repoId = repo.full_name;
          if (!CONFIG.knownRepos.includes(repoId)) {
            const hasSkills = await hasSkillFiles(repo.owner.login, repo.name);
            results.newRepos.push({
              owner: repo.owner.login,
              name: repo.name,
              stars: repo.stargazers_count,
              description: repo.description,
              url: repo.html_url,
              topics: repo.topics,
              hasSkillFiles: hasSkills,
              discoveredVia: `topic:${topic}`
            });
          }
        }
        results.stats.topicsScanned++;
        
        // Rate limiting
        await new Promise(r => setTimeout(r, 1000));
      } catch (e) {
        console.error(`  Error scanning topic ${topic}: ${e.message}`);
      }
    }
  }

  // 2. Scan awesome lists
  console.log('\n📚 Scanning awesome lists...');
  for (const listRepo of CONFIG.awesomeLists) {
    const [owner, repo] = listRepo.split('/');
    try {
      const repos = await scanAwesomeList(owner, repo);
      console.log(`  Found ${repos.length} repos in ${listRepo}`);
      
      for (const repoId of repos) {
        const [repoOwner, repoName] = repoId.split('/');
        if (!CONFIG.knownRepos.includes(repoId) && 
            !results.newRepos.find(r => r.owner === repoOwner && r.name === repoName)) {
          try {
            const meta = await getRepoMeta(repoOwner, repoName);
            if (meta.stargazers_count >= CONFIG.minStars) {
              const hasSkills = await hasSkillFiles(repoOwner, repoName);
              results.newRepos.push({
                owner: repoOwner,
                name: repoName,
                stars: meta.stargazers_count,
                description: meta.description,
                url: meta.html_url,
                topics: meta.topics,
                hasSkillFiles: hasSkills,
                discoveredVia: `awesome:${listRepo}`
              });
            }
          } catch (e) {
            // Skip invalid repos
          }
        }
      }
      results.stats.awesomeListsScanned++;
      
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      console.error(`  Error scanning ${listRepo}: ${e.message}`);
    }
  }

  // 3. Check known repos for updates
  console.log('\n🔄 Checking known repos for updates...');
  for (const repoId of CONFIG.knownRepos) {
    const [owner, repo] = repoId.split('/');
    try {
      const meta = await getRepoMeta(owner, repo);
      results.stats.reposChecked++;
      
      // Check if recently updated
      const updatedAt = new Date(meta.updated_at);
      const daysSinceUpdate = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceUpdate < CONFIG.maxAge) {
        results.updatedRepos.push({
          owner,
          name: repo,
          stars: meta.stargazers_count,
          lastUpdate: meta.updated_at,
          daysSinceUpdate: Math.floor(daysSinceUpdate),
          url: meta.html_url
        });
      }
      
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.error(`  Error checking ${repoId}: ${e.message}`);
    }
  }

  // Sort results
  results.newRepos.sort((a, b) => b.stars - a.stars);
  results.stats.newFindings = results.newRepos.length;

  return results;
}

// Generate markdown report
function generateReport(results) {
  let report = `# AI Resources Scan Report\n\n`;
  report += `**Scan Date:** ${results.scannedAt}\n\n`;
  report += `## Statistics\n\n`;
  report += `- Topics Scanned: ${results.stats.topicsScanned}\n`;
  report += `- Awesome Lists Scanned: ${results.stats.awesomeListsScanned}\n`;
  report += `- Known Repos Checked: ${results.stats.reposChecked}\n`;
  report += `- New Findings: ${results.stats.newFindings}\n\n`;

  if (results.newRepos.length > 0) {
    report += `## New Repos Discovered\n\n`;
    report += `| Repo | Stars | Has Skills | Discovered Via |\n`;
    report += `|------|-------|------------|----------------|\n`;
    
    for (const repo of results.newRepos.slice(0, 50)) {
      report += `| [${repo.owner}/${repo.name}](${repo.url}) | ${repo.stars} | ${repo.hasSkillFiles ? '✅' : '❌'} | ${repo.discoveredVia} |\n`;
    }
    report += '\n';
  }

  if (results.updatedRepos.length > 0) {
    report += `## Recently Updated Known Repos\n\n`;
    report += `| Repo | Stars | Last Updated |\n`;
    report += `|------|-------|--------------|\n`;
    
    for (const repo of results.updatedRepos) {
      report += `| [${repo.owner}/${repo.name}](${repo.url}) | ${repo.stars} | ${repo.daysSinceUpdate} days ago |\n`;
    }
    report += '\n';
  }

  report += `---\n\n*Generated by AI Resources Scanner*\n`;
  
  return report;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const options = {
    quick: args.includes('--quick'),
    repo: args.find((arg, i) => args[i-1] === '--repo')
  };

  try {
    const results = await scanRepos(options);
    
    // Create output directory
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }
    
    // Save JSON results
    const jsonPath = path.join(CONFIG.outputDir, 'scan-results.json');
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 JSON results saved to: ${jsonPath}`);
    
    // Generate and save markdown report
    const report = generateReport(results);
    const reportPath = path.join(CONFIG.outputDir, 'scan-report.md');
    fs.writeFileSync(reportPath, report);
    console.log(`📄 Report saved to: ${reportPath}`);
    
    // Print summary
    console.log('\n✅ Scan Complete!');
    console.log(`   Found ${results.newRepos.length} new repos`);
    console.log(`   Found ${results.updatedRepos.length} recently updated repos`);
    
  } catch (e) {
    console.error('❌ Scan failed:', e.message);
    process.exit(1);
  }
}

main();
