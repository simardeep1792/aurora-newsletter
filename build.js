#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Aurora Newsletter Template Builder
 * 
 * Builds newsletter HTML from template and content JSON
 * Usage: node build.js [content-file] [output-file]
 * 
 * Example: node build.js content/2024-12-gc-artifacts.json output/newsletter.html
 */

class NewsletterBuilder {
    constructor() {
        this.templatePath = './template.html';
    }

    /**
     * Load and parse JSON content file
     */
    loadContent(contentPath) {
        try {
            const content = fs.readFileSync(contentPath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            console.error(`Error loading content file: ${error.message}`);
            process.exit(1);
        }
    }

    /**
     * Load template file
     */
    loadTemplate() {
        try {
            return fs.readFileSync(this.templatePath, 'utf8');
        } catch (error) {
            console.error(`Error loading template: ${error.message}`);
            process.exit(1);
        }
    }

    /**
     * Generate content sections from JSON data
     */
    generateContentSections(sections) {
        return sections.map(section => {
            switch (section.type) {
                case 'main_announcement':
                    return this.generateMainAnnouncement(section);
                case 'technology_stack':
                    return this.generateTechnologyStack(section);
                case 'container_images':
                    return this.generateContainerImages(section);
                case 'implementation':
                    return this.generateImplementation(section);
                case 'support':
                    return this.generateSupport(section);
                case 'cta':
                    return this.generateCTA(section);
                case 'aurora':
                    return this.generateAurora(section);
                default:
                    return this.generateGenericSection(section);
            }
        }).join('\n\n');
    }

    /**
     * Generate main announcement section
     */
    generateMainAnnouncement(section) {
        let html = `<div class="content-section">
    <h2>${section.title}</h2>
    <p>${section.content}</p>`;

        if (section.highlight_box) {
            html += `\n\n    <div class="highlight-box">
        <h3>${section.highlight_box.title}</h3>
        <ul>
            ${section.highlight_box.items.map(item => `<li>${item}</li>`).join('\n            ')}
        </ul>
    </div>`;
        }

        if (section.stats) {
            html += `\n\n    <div class="stats-section">
        <h3>${section.stats.title}</h3>
        <div class="stats-grid">
            ${section.stats.items.map(stat => 
                `<div class="stat-item">
                <span class="stat-number">${stat.number}</span>
                <span class="stat-label">${stat.label}</span>
            </div>`
            ).join('\n            ')}
        </div>
    </div>`;
        }

        html += `\n</div>`;
        return html;
    }

    /**
     * Generate technology stack section
     */
    generateTechnologyStack(section) {
        let html = `<div class="content-section">
    <h2>${section.title}</h2>`;

        section.subsections.forEach(subsection => {
            html += `\n\n    <h3>${subsection.title}</h3>
    <p>${subsection.content}</p>

    <div class="feature-grid">
        ${subsection.feature_cards.map(card => 
            `<div class="feature-card">
            <h4>${card.title}</h4>
            <p>${card.content}</p>
        </div>`
        ).join('\n        ')}
    </div>`;
        });

        html += `\n</div>`;
        return html;
    }

    /**
     * Generate container images section
     */
    generateContainerImages(section) {
        return `<div class="content-section">
    <h2>${section.title}</h2>
    <p>${section.content}</p>

    <div class="code-block">
        ${section.code_block.map(code => `<p>${code}</p>`).join('\n        ')}
    </div>
</div>`;
    }

    /**
     * Generate implementation section
     */
    generateImplementation(section) {
        let html = `<div class="content-section">
    <h2>${section.title}</h2>
    <p>${section.content}</p>`;

        section.phases.forEach(phase => {
            html += `\n\n    <h4>${phase.title}</h4>
    <p>${phase.content}</p>`;
        });

        html += `\n</div>`;
        return html;
    }

    /**
     * Generate support section
     */
    generateSupport(section) {
        let html = `<div class="content-section">
    <h2>${section.title}</h2>
    <p>${section.content}</p>

    <ul>
        ${section.list_items.map(item => `<li>${item}</li>`).join('\n        ')}
    </ul>`;

        if (section.contact) {
            html += `\n\n    <p><strong>Contact:</strong> ${section.contact.text} <a href="mailto:${section.contact.email}">${section.contact.email}</a></p>`;
        }

        html += `\n</div>`;
        return html;
    }

    /**
     * Generate CTA section
     */
    generateCTA(section) {
        return `<div class="cta-section">
    <h3>${section.title}</h3>
    <p>${section.content}</p>
    ${section.buttons.map(button => 
        `<a href="${button.url}" class="cta-button">${button.text}</a>`
    ).join('\n    ')}
</div>`;
    }

    /**
     * Generate Aurora section
     */
    generateAurora(section) {
        let html = `<!-- Aurora Section -->
<div class="aurora-section">
    <h2>${section.title}</h2>
    <p>${this.processMarkdownLinks(section.content)}</p>
    
    <h3>${section.involvement.title}</h3>
    <ul>
        ${section.involvement.items.map(item => `<li>${item}</li>`).join('\n        ')}
    </ul>
    
    <p>${this.processMarkdownLinks(section.community)}</p>
    
    <div class="aurora-cta">
        <p><strong>${section.feedback.text}</strong></p>
        ${section.feedback.buttons.map(button => 
            `<a href="${button.url}" target="_blank">${button.text}</a>`
        ).join('\n        ')}
    </div>
</div>`;
        return html;
    }

    /**
     * Generate generic section
     */
    generateGenericSection(section) {
        return `<div class="content-section">
    <h2>${section.title}</h2>
    <p>${section.content}</p>
</div>`;
    }

    /**
     * Convert markdown-style links to HTML
     */
    processMarkdownLinks(text) {
        return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    }

    /**
     * Replace placeholders in template
     */
    replacePlaceholders(template, data) {
        let result = template;

        // Basic replacements matching template placeholders
        const replacements = {
            'TITLE': data.meta.title,
            'SUBTITLE': data.header.sub_title,
            'TAGLINE': data.header.subtitle,
            'HERO_TITLE': data.hero.title,
            'HERO_DESCRIPTION': data.hero.description
        };

        // Replace simple placeholders
        Object.entries(replacements).forEach(([key, value]) => {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });

        // Replace content sections
        if (data.english && data.english.sections) {
            const englishContent = this.generateContentSections(data.english.sections);
            result = result.replace('{{ENGLISH_CONTENT}}', englishContent);
        }

        if (data.french && data.french.sections) {
            const frenchContent = this.generateContentSections(data.french.sections);
            result = result.replace('{{FRENCH_CONTENT}}', frenchContent);
        } else {
            // If no French content, use placeholder
            result = result.replace('{{FRENCH_CONTENT}}', '<div class="content-section"><p>French content coming soon...</p></div>');
        }

        return result;
    }


    /**
     * Main build function
     */
    build(contentPath, outputPath) {
        console.log('🚀 Building Aurora Newsletter...');
        
        // Load content and template
        const data = this.loadContent(contentPath);
        const template = this.loadTemplate();
        
        console.log(`📄 Loaded content: ${data.meta.edition}`);
        
        // Generate newsletter
        const newsletter = this.replacePlaceholders(template, data);
        
        // Write output to root directory to maintain asset paths
        const finalOutputPath = outputPath || `${data.meta.edition}.html`;
        fs.writeFileSync(finalOutputPath, newsletter);
        
        console.log(`✅ Newsletter built successfully: ${finalOutputPath}`);
        
        // Generate summary
        const stats = {
            'Edition': data.meta.edition,
            'Title': data.meta.title,
            'English Sections': data.english?.sections?.length || 0,
            'French Sections': data.french?.sections?.length || 0,
            'Output Size': `${Math.round(newsletter.length / 1024)}KB`
        };
        
        console.log('\n📊 Build Summary:');
        Object.entries(stats).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
        });
    }
}

// CLI Usage
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        console.log(`
Aurora Newsletter Builder

Usage:
  node build.js <content-file> [output-file]
  node build.js --help

Examples:
  node build.js content/2024-12-gc-artifacts.json
  node build.js content/2024-12-gc-artifacts.json output/newsletter.html

Options:
  --help, -h    Show this help message
`);
        process.exit(0);
    }
    
    const contentPath = args[0];
    const outputPath = args[1];
    
    if (!fs.existsSync(contentPath)) {
        console.error(`❌ Content file not found: ${contentPath}`);
        process.exit(1);
    }
    
    const builder = new NewsletterBuilder();
    builder.build(contentPath, outputPath);
}

module.exports = NewsletterBuilder;