const fs = require('fs').promises;
const path = require('path');

const TEAM_WORK_FILE = path.join(__dirname, '..', 'team-work-data.json');
const TEAM_MEMBERS_FILE = path.join(__dirname, '..', 'TEAM_MEMBERS.txt');
const DIST_DIR = path.join(__dirname, '..', 'dist');
const SRC_FILES = ['index.html', 'styles.css', 'app.js'];

async function generateWorkItemsHTML(workItems) {
    // Sort work items by date (newest first)
    const sortedItems = [...workItems].sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
    });
    
    return sortedItems.map((item, index) => {
        // Format date as Month/Year
        let dateDisplay = '';
        if (item.date) {
            const date = new Date(item.date);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            dateDisplay = `${months[date.getMonth()]}/${date.getFullYear()}`;
        }

        return `
        <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="work-item ${index >= 6 ? 'work-item-hidden' : ''}" data-label="${item.label}" data-date="${item.date || ''}" data-author="${item.author || ''}">
            <div class="work-header">
                <h3 class="work-title">${escapeHtml(item.title)}</h3>
                <span class="work-label label-${item.label}">${item.label}</span>
            </div>
            <p class="work-description">${escapeHtml(item.description)}</p>
            <div class="work-footer">
                <div class="work-author">
                    <img src="${item.authorAvatar || `https://github.com/${item.author}.png?size=40`}" alt="${item.authorDisplay || item.author}" class="author-avatar">
                    <span>${escapeHtml(item.authorDisplay || item.author)}</span>
                </div>
                ${dateDisplay ? `<span class="work-date">${dateDisplay}</span>` : ''}
            </div>
        </a>
    `;
    }).join('');
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function generateAuthorOptionsHTML(teamMembers) {
    return teamMembers.map(member =>
        `<option value="${member.github}">${escapeHtml(member.name)}</option>`
    ).join('');
}

async function generateTeamMembersHTML(teamMembers) {
    return teamMembers.map(member => `
        <div class="team-member">
            <div class="team-member-avatar-container">
                <img src="${member.avatar}" alt="${member.name}" class="team-member-avatar">
            </div>
            <h4 class="team-member-name">${escapeHtml(member.name)}</h4>
            <div class="team-member-links">
                <a href="https://github.com/${member.github}" target="_blank" rel="noopener noreferrer" class="team-member-link" title="GitHub">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                </a>
                <a href="https://twitter.com/${member.twitter}" target="_blank" rel="noopener noreferrer" class="team-member-link" title="X (Twitter)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                </a>
            </div>
        </div>
    `).join('');
}

async function parseTeamMembers() {
    try {
        const content = await fs.readFile(TEAM_MEMBERS_FILE, 'utf-8');
        const members = content
            .split('\n')
            .filter(line => line.trim() && !line.startsWith('#'))
            .map(line => {
                const parts = line.trim().split('/');
                if (parts.length >= 4) {
                    return {
                        name: parts[2],
                        github: parts[0],
                        twitter: parts[3],
                        avatar: `https://github.com/${parts[0]}.png?size=100`
                    };
                }
                return null;
            })
            .filter(member => member !== null);
        return members;
    } catch (error) {
        console.log('⚠ No TEAM_MEMBERS.txt file found.');
        return [];
    }
}

async function build() {
    console.log('Building static site...\n');
    
    try {
        // Create dist directory
        await fs.mkdir(DIST_DIR, { recursive: true });
        
        // Read team work data
        let teamWork = [];
        try {
            const data = await fs.readFile(TEAM_WORK_FILE, 'utf-8');
            teamWork = JSON.parse(data);
            console.log(`✓ Loaded ${teamWork.length} work items`);
        } catch (error) {
            console.log('⚠ No team work data found. Building empty site.');
        }
        
        // Read team members from TEAM_MEMBERS.txt
        const teamMembers = await parseTeamMembers();
        console.log(`✓ Loaded ${teamMembers.length} team members`);
        
        // Generate work items HTML
        const workItemsHTML = await generateWorkItemsHTML(teamWork);

        // Add show more button if there are more than 6 items
        const showMoreButton = teamWork.length > 6 ? `
            <div class="show-more-container">
                <button class="show-more-btn" id="show-more-btn">
                    Show ${teamWork.length - 6} more
                </button>
            </div>
        ` : '';

        // Generate team members HTML
        const teamMembersHTML = await generateTeamMembersHTML(teamMembers);

        // Generate author filter options
        const authorOptionsHTML = generateAuthorOptionsHTML(teamMembers);
        
        // Process and copy files
        for (const file of SRC_FILES) {
            const srcPath = path.join(__dirname, '..', file);
            const distPath = path.join(DIST_DIR, file);
            
            let content = await fs.readFile(srcPath, 'utf-8');
            
            // Inject work items and team members into HTML
            if (file === 'index.html') {
                content = content.replace(
                    '<!-- Work items will be dynamically inserted here -->',
                    workItemsHTML + showMoreButton
                );

                // Only inject team members if we have any
                if (teamMembers.length > 0) {
                    content = content.replace(
                        '<!-- Team members will be dynamically inserted here -->',
                        teamMembersHTML
                    );

                    // Inject author filter options
                    content = content.replace(
                        '<!-- Team member options will be dynamically inserted here -->',
                        authorOptionsHTML
                    );
                }
                
                // Update last updated date
                const date = new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                content = content.replace(
                    '<span id="last-updated"></span>',
                    `<span id="last-updated">${date}</span>`
                );
            }
            
            await fs.writeFile(distPath, content);
            console.log(`✓ Processed ${file}`);
        }
        
        // Create .nojekyll file for GitHub Pages
        await fs.writeFile(path.join(DIST_DIR, '.nojekyll'), '');
        console.log('✓ Created .nojekyll file');
        
        // Create CNAME file for custom domain
        await fs.writeFile(path.join(DIST_DIR, 'CNAME'), 'prototyping.ethereum.foundation');
        console.log('✓ Created CNAME file for custom domain');
        
        console.log('\n✨ Build complete! Output in dist/');
        
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    build();
}