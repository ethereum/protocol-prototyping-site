const https = require('https');
const fs = require('fs').promises;
const path = require('path');

// Configuration
async function getTeamMembers() {
    // Try to read from TEAM_MEMBERS.txt first
    try {
        const teamFile = path.join(__dirname, '..', 'TEAM_MEMBERS.txt');
        const content = await fs.readFile(teamFile, 'utf-8');
        const members = content
            .split('\n')
            .filter(line => line.trim() && !line.startsWith('#'))
            .map(line => line.trim());
        
        if (members.length > 0) {
            return members;
        }
    } catch (error) {
        // Fall back to environment variable
    }
    
    return process.env.TEAM_MEMBERS ? process.env.TEAM_MEMBERS.split(',') : [];
}
const OUTPUT_FILE = path.join(__dirname, '..', 'team-work-data.json');

async function fetchGitHubFile(username, repo, filepath) {
    const options = {
        hostname: 'api.github.com',
        path: `/repos/${username}/${repo}/contents/${filepath}`,
        headers: {
            'User-Agent': 'Protocol-Prototyping-Site',
            'Accept': 'application/vnd.github.v3+json'
        }
    };

    if (process.env.GITHUB_TOKEN) {
        options.headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    return new Promise((resolve, reject) => {
        https.get(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(data);
                        const content = Buffer.from(response.content, 'base64').toString('utf-8');
                        resolve(JSON.parse(content));
                    } catch (error) {
                        reject(new Error(`Failed to parse content from ${username}: ${error.message}`));
                    }
                } else if (res.statusCode === 404) {
                    resolve(null); // Repository or file not found
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        }).on('error', reject);
    });
}

async function fetchAllTeamWork(TEAM_MEMBERS) {
    console.log('Fetching team work from GitHub...');
    const allWork = [];
    
    for (const member of TEAM_MEMBERS) {
        console.log(`Fetching work from ${member}...`);
        try {
            // Parse username/repo/displayName format
            const parts = member.split('/');
            const username = parts[0];
            const repo = parts[1] || 'prototyping_work';
            const displayName = parts.slice(2).join('/') || username; // Handle names with slashes
            
            const data = await fetchGitHubFile(username, repo, 'work.json');
            
            if (data && Array.isArray(data)) {
                const memberWork = data
                    .filter(item => item && item.title) // Filter out invalid items
                    .map(item => ({
                        ...item,
                        author: username,
                        authorDisplay: displayName,
                        authorAvatar: `https://github.com/${username}.png?size=40`
                    }));
                allWork.push(...memberWork);
                console.log(`  ✓ Found ${memberWork.length} items from ${username}/${repo}`);
            } else {
                console.log(`  ⚠ No work found for ${username}/${repo}`);
            }
        } catch (error) {
            console.error(`  ✗ Error fetching from ${member}: ${error.message}`);
        }
    }
    
    // Sort by date (newest first)
    allWork.sort((a, b) => {
        // If both have dates, sort by date
        if (a.date && b.date) {
            return new Date(b.date) - new Date(a.date);
        }
        // Items with dates come before items without dates
        if (a.date && !b.date) return -1;
        if (!a.date && b.date) return 1;
        // If neither has a date, maintain original order
        return 0;
    });
    
    console.log(`\nTotal work items collected: ${allWork.length}`);
    return allWork;
}

async function main() {
    try {
        const TEAM_MEMBERS = await getTeamMembers();
        
        if (TEAM_MEMBERS.length === 0) {
            console.error('No team members found. Add members to TEAM_MEMBERS.txt or set TEAM_MEMBERS environment variable.');
            process.exit(1);
        }
        
        console.log(`Team members: ${TEAM_MEMBERS.join(', ')}\n`);
        
        const teamWork = await fetchAllTeamWork(TEAM_MEMBERS);
        
        // Save to file
        await fs.writeFile(OUTPUT_FILE, JSON.stringify(teamWork, null, 2));
        console.log(`\nData saved to ${OUTPUT_FILE}`);
        
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}