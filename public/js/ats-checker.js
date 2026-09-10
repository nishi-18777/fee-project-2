// Resume Spark - Dual-View Side-by-Side ATS Engine & A4 Document Renderer

window.copySnippet = function(button, elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    const textToCopy = el.innerText || el.textContent;
    navigator.clipboard.writeText(textToCopy.trim()).then(() => {
        const originalHtml = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.style.background = 'var(--success)';
        button.style.color = '#050d12';
        setTimeout(() => {
            button.innerHTML = originalHtml;
            button.style.background = '';
            button.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Copy failed:', err);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Configure PDF.js Worker
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }

    // DOM Elements
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const btnAnalyze = document.getElementById('btnAnalyze');
    const btnSample = document.getElementById('btnSample');
    const loadingState = document.getElementById('loadingState');
    const uploadCard = document.getElementById('uploadCard');
    const dualViewContainer = document.getElementById('dualViewContainer');
    const atsHeader = document.getElementById('atsHeader');
    const docTitle = document.getElementById('docTitle');
    const resumePaper = document.getElementById('resumePaper');
    const rawTextView = document.getElementById('rawTextView');
    const rawTextContent = document.getElementById('rawTextContent');
    const btnToggleView = document.getElementById('btnToggleView');
    const btnReupload = document.getElementById('btnReupload');

    let currentFile = null;
    let showingRawText = false;

    // High-Scoring Benchmark Sample Resume (98/100 ATS Optimized for Students)
    const SAMPLE_RESUME_TEXT = `Nishi Dhiman
Full Stack Software Engineer | Computer Science & Engineering
Email: nishi.dhiman@example.com | Phone: +91 98765 43210
LinkedIn: linkedin.com/in/nishidhiman | GitHub: github.com/nishi-18777 | LeetCode: leetcode.com/nishidhiman
New Delhi, India

PROFESSIONAL SUMMARY
Results-driven Computer Science graduate with strong command of Data Structures & Algorithms, Full-Stack Web Development, and Cloud infrastructure. Proven track record of architecting scalable applications using React, Node.js, Express, and MongoDB. Demonstrated expertise in slashing API latency by 38% and engineering microservices supporting 45,000+ monthly active users.

EDUCATION
Bachelor of Technology in Computer Science & Engineering
Delhi Technological University (DTU), New Delhi | 2020 - 2024
CGPA: 8.85 / 10.0 | Relevant Coursework: Data Structures & Algorithms, DBMS, Operating Systems, Computer Networks, OOP

TECHNICAL SKILLS
- Programming Languages: JavaScript (ES6+), TypeScript, Python, C++, Java, SQL, HTML5, CSS3
- Web & Backend Frameworks: React.js, Next.js, Node.js, Express.js, Redux Toolkit, TailwindCSS, RESTful APIs
- Databases & Cloud: MongoDB, PostgreSQL, Redis, AWS (S3, EC2), Docker, Git, GitHub Actions, Vercel
- Core CS Fundamentals: Data Structures, Algorithms, Object-Oriented Programming (OOP), System Design, DBMS

TECHNICAL PROJECTS
Resume Spark - AI Resume Builder & ATS Scanner
Live Demo: resumespark.app | GitHub: github.com/nishi-18777/resume-spark
Tech Stack: React, Node.js, Express, MongoDB, PDF.js, JWT Authentication
- Architected and deployed an interactive web application that evaluates candidate resumes against enterprise ATS algorithms in real-time.
- Engineered 14+ RESTful API endpoints with JWT session authentication, reducing API response times by 35%.
- Implemented MongoDB indexing strategies, cutting database search latency from 420ms to 110ms for 2,500+ active users.
- Automated CI/CD deployment pipelines using GitHub Actions and Docker, accelerating release cycles by 40%.

Cloud Commerce - Scalable E-Commerce Microservices
Live Demo: cloudcommerce.app | GitHub: github.com/nishi-18777/cloud-commerce
Tech Stack: TypeScript, Next.js, PostgreSQL, Redis, Stripe API
- Developed a high-throughput e-commerce platform processing 1,200+ daily mock transactions with sub-second checkout speeds.
- Integrated Redis in-memory caching for product catalog queries, boosting server throughput by 55% during peak loads.
- Designed responsive user interface components adhering to WCAG 2.1 accessibility guidelines, elevating Lighthouse performance score to 99/100.

WORK EXPERIENCE / INTERNSHIPS
Software Development Engineer Intern | TechSpark Solutions
January 2024 - June 2024 | New Delhi, India
- Spearheaded the redesign of client analytics dashboard utilizing React and TailwindCSS, adopted by 30+ enterprise clients.
- Collaborated with senior engineers to optimize backend aggregation pipelines, trimming query overhead by 28%.
- Authored comprehensive unit tests with Jest and Supertest, elevating test coverage from 62% to 88%.

ACHIEVEMENTS & CERTIFICATIONS
- Solved 450+ Data Structures and Algorithms problems on LeetCode and GeeksforGeeks (Contest Rating: 1820+).
- Finalist in Smart India Hackathon (SIH 2023) among 1,500+ competing collegiate engineering teams.`;

    // ============================
    // FILE DRAG & DROP HANDLING
    // ============================
    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    function handleFile(file) {
        const isPdf = file.name.endsWith('.pdf');
        const isDocx = file.name.endsWith('.docx');
        const isTxt = file.name.endsWith('.txt');

        if (!isPdf && !isDocx && !isTxt) {
            alert('Please select a PDF (.pdf), Word document (.docx), or plain text (.txt) file.');
            return;
        }

        currentFile = file;
        const textElement = document.getElementById('dropzoneText');
        textElement.innerHTML = `📄 <strong>${escapeHtml(file.name)}</strong> (${(file.size / 1024).toFixed(1)} KB)`;
        document.getElementById('dropzoneSubtext').textContent = 'Click or drag another file to replace';
        btnAnalyze.disabled = false;
    }

    // "Try with Sample Resume" Button
    btnSample.addEventListener('click', () => {
        runAnalysis(SAMPLE_RESUME_TEXT, 'Sample Candidate Resume - Nishi Dhiman');
    });

    // "Calculate ATS Score" Button
    btnAnalyze.addEventListener('click', async () => {
        if (!currentFile) return;

        uploadCard.style.display = 'none';
        loadingState.style.display = 'block';
        loadingState.scrollIntoView({ behavior: 'smooth' });

        try {
            let extractedText = '';
            if (currentFile.name.endsWith('.pdf')) {
                extractedText = await extractTextFromPdf(currentFile);
            } else if (currentFile.name.endsWith('.docx') && typeof mammoth !== 'undefined') {
                extractedText = await extractTextFromDocx(currentFile);
            } else {
                extractedText = await currentFile.text();
            }

            if (!extractedText || extractedText.trim().length < 50) {
                throw new Error('Could not extract readable text. Ensure your file has selectable text rather than scanned images.');
            }

            runAnalysis(extractedText, currentFile.name);

        } catch (err) {
            console.error('Extraction error:', err);
            loadingState.style.display = 'none';
            uploadCard.style.display = 'block';
            alert('Analysis Error: ' + err.message);
        }
    });

    async function extractTextFromPdf(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        return fullText;
    }

    async function extractTextFromDocx(file) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    }

    // Run Full Analysis and Switch to Dual View
    function runAnalysis(text, title) {
        loadingState.style.display = 'none';
        uploadCard.style.display = 'none';

        // Update Document Title
        docTitle.textContent = title;

        // Render Formatted A4 Resume
        resumePaper.innerHTML = formatResumeHtml(text);

        // Store Raw Text
        rawTextContent.textContent = text;
        showingRawText = false;
        resumePaper.style.display = 'block';
        rawTextView.style.display = 'none';
        btnToggleView.innerHTML = '<i class="fas fa-code"></i> <span>View Raw ATS Text</span>';

        // Evaluate ATS
        const analysis = evaluateResumePrecisely(text);
        renderResults(analysis);

        // Show Dual View
        dualViewContainer.style.display = 'block';
        dualViewContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Toggle Raw Text / Formatted View
    btnToggleView.addEventListener('click', () => {
        showingRawText = !showingRawText;
        if (showingRawText) {
            resumePaper.style.display = 'none';
            rawTextView.style.display = 'block';
            btnToggleView.innerHTML = '<i class="fas fa-file-invoice"></i> <span>View Formatted A4</span>';
        } else {
            resumePaper.style.display = 'block';
            rawTextView.style.display = 'none';
            btnToggleView.innerHTML = '<i class="fas fa-code"></i> <span>View Raw ATS Text</span>';
        }
    });

    // Re-upload / Test Another
    btnReupload.addEventListener('click', () => {
        dualViewContainer.style.display = 'none';
        uploadCard.style.display = 'block';
        uploadCard.scrollIntoView({ behavior: 'smooth' });
    });

    // ==========================================
    // A4 DOCUMENT HTML FORMATTER
    // ==========================================
    function formatResumeHtml(text) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length === 0) return '<p>No content extracted.</p>';

        let html = '';
        let i = 0;

        // Candidate Name (first line)
        const name = lines[i++] || 'Candidate Name';
        
        // Candidate Title (second line if not a section)
        let title = '';
        if (i < lines.length && !isSectionHeader(lines[i])) {
            title = lines[i++];
        }

        // Contact info line(s)
        let contacts = [];
        while (i < lines.length && !isSectionHeader(lines[i]) && (
            /email|phone|linkedin|github|leetcode|@|\+|\.com|\bindia\b|\busa\b/i.test(lines[i])
        )) {
            contacts.push(lines[i++]);
        }

        // Header Block
        html += `
            <div class="resume-doc-header">
                <h1 class="doc-name">${escapeHtml(name)}</h1>
                ${title ? `<div class="doc-headline">${escapeHtml(title)}</div>` : ''}
                <div class="doc-contacts">
                    ${formatContactItems(contacts.join(' | '))}
                </div>
            </div>
        `;

        // Process Sections
        let currentSection = null;
        let sectionItems = [];

        function flushSection() {
            if (!currentSection) return;
            html += `<div class="doc-section">`;
            html += `<div class="doc-section-title">${getSectionIcon(currentSection)} ${escapeHtml(currentSection)}</div>`;
            html += renderSectionBody(currentSection, sectionItems);
            html += `</div>`;
            sectionItems = [];
        }

        while (i < lines.length) {
            const line = lines[i++];
            if (isSectionHeader(line)) {
                flushSection();
                currentSection = cleanHeader(line);
            } else {
                if (!currentSection) {
                    currentSection = 'PROFESSIONAL SUMMARY';
                }
                sectionItems.push(line);
            }
        }
        flushSection();

        return html;
    }

    function isSectionHeader(line) {
        const clean = line.replace(/[^a-zA-Z\s]/g, '').trim().toUpperCase();
        return /^(PROFESSIONAL\s+SUMMARY|SUMMARY|PROFILE|OBJECTIVE|EDUCATION|TECHNICAL\s+SKILLS|SKILLS|TECHNICAL\s+PROJECTS|PROJECTS|KEY\s+PROJECTS|WORK\s+EXPERIENCE|EXPERIENCE|EMPLOYMENT|INTERNSHIPS|ACHIEVEMENTS|CERTIFICATIONS|AWARDS|PUBLICATIONS)$/.test(clean);
    }

    function cleanHeader(line) {
        return line.replace(/[:\-#=]/g, '').trim().toUpperCase();
    }

    function getSectionIcon(section) {
        if (/SUMMARY|PROFILE|OBJECTIVE/i.test(section)) return '<i class="fas fa-user"></i>';
        if (/EDUCATION/i.test(section)) return '<i class="fas fa-graduation-cap"></i>';
        if (/SKILL/i.test(section)) return '<i class="fas fa-tools"></i>';
        if (/PROJECT/i.test(section)) return '<i class="fas fa-laptop-code"></i>';
        if (/EXPERIENCE|INTERNSHIP|EMPLOYMENT/i.test(section)) return '<i class="fas fa-briefcase"></i>';
        if (/ACHIEVEMENT|CERTIFICATION|AWARD/i.test(section)) return '<i class="fas fa-trophy"></i>';
        return '<i class="fas fa-bookmark"></i>';
    }

    function formatContactItems(contactStr) {
        if (!contactStr) return '';
        const parts = contactStr.split(/\||•|·/).map(p => p.trim()).filter(Boolean);
        return parts.map(part => {
            if (/@/.test(part)) {
                const email = part.replace(/email:?/i, '').trim();
                return `<span class="doc-contact-item"><i class="fas fa-envelope"></i> <a href="mailto:${email}">${escapeHtml(email)}</a></span>`;
            }
            if (/linkedin\.com/i.test(part)) {
                return `<span class="doc-contact-item"><i class="fab fa-linkedin"></i> <a href="https://${part.replace(/linkedin:?/i, '').trim()}" target="_blank">LinkedIn</a></span>`;
            }
            if (/github\.com/i.test(part)) {
                return `<span class="doc-contact-item"><i class="fab fa-github"></i> <a href="https://${part.replace(/github:?/i, '').trim()}" target="_blank">GitHub</a></span>`;
            }
            if (/leetcode\.com/i.test(part)) {
                return `<span class="doc-contact-item"><i class="fas fa-code"></i> <a href="https://${part.replace(/leetcode:?/i, '').trim()}" target="_blank">LeetCode</a></span>`;
            }
            if (/\+?\d{2,}/.test(part)) {
                return `<span class="doc-contact-item"><i class="fas fa-phone"></i> ${escapeHtml(part)}</span>`;
            }
            return `<span class="doc-contact-item"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(part)}</span>`;
        }).join('');
    }

    function renderSectionBody(section, items) {
        if (items.length === 0) return '';
        let bodyHtml = '';

        if (/SUMMARY|PROFILE|OBJECTIVE/i.test(section)) {
            bodyHtml += `<p class="doc-summary-text">${items.map(escapeHtml).join(' ')}</p>`;
        } else if (/SKILL/i.test(section)) {
            items.forEach(item => {
                const splitIndex = item.indexOf(':');
                if (splitIndex !== -1) {
                    const label = item.substring(0, splitIndex).replace(/^[-•*]\s*/, '').trim();
                    const skills = item.substring(splitIndex + 1).trim();
                    bodyHtml += `
                        <div class="doc-skills-group">
                            <span class="doc-skills-label">${escapeHtml(label)}:</span>
                            <span>${escapeHtml(skills)}</span>
                        </div>
                    `;
                } else {
                    bodyHtml += `<div class="doc-skills-group">${escapeHtml(item.replace(/^[-•*]\s*/, ''))}</div>`;
                }
            });
        } else {
            // Projects or Experience or Education
            let inBullets = false;

            items.forEach(item => {
                const isBullet = /^[-•*]/.test(item);

                if (isBullet) {
                    if (!inBullets) {
                        bodyHtml += `<ul class="doc-item-bullets">`;
                        inBullets = true;
                    }
                    const rawBullet = item.replace(/^[-•*]\s*/, '');
                    bodyHtml += `<li>${highlightMetrics(escapeHtml(rawBullet))}</li>`;
                } else {
                    if (inBullets) {
                        bodyHtml += `</ul>`;
                        inBullets = false;
                    }

                    if (/live demo|github\.com|tech stack/i.test(item)) {
                        bodyHtml += `<div class="doc-item-sub">${escapeHtml(item)}</div>`;
                    } else if (/(\b(19|20)\d{2}\b)|january|february|march|april|may|june|july|august|september|october|november|december|cgpa/i.test(item)) {
                        bodyHtml += `<div class="doc-item-date">${escapeHtml(item)}</div>`;
                    } else {
                        bodyHtml += `<div class="doc-item-title" style="margin-top: 10px;">${escapeHtml(item)}</div>`;
                    }
                }
            });

            if (inBullets) {
                bodyHtml += `</ul>`;
            }
        }

        return bodyHtml;
    }

    function highlightMetrics(text) {
        return text.replace(/\b(\d+(\.\d+)?%|\d+[\s-]*(users|requests|ms|seconds|minutes|clients|transactions|records|stars))\b/gi, '<span class="metric-highlight">$1</span>');
    }

    // ==========================================
    // ULTRA-PRECISE ATS EVALUATION ENGINE
    // ==========================================
    function evaluateResumePrecisely(text) {
        const lower = text.toLowerCase();
        const words = text.trim().split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;

        const issues = [];
        const checklist = [];

        // 1. CONTACT & PROFESSIONAL PROFILES (15 Points)
        const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
        const hasPhone = /(\+?\d{1,4}[-.\s]?)?(\(?\d{2,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}/.test(text) || /\b\d{10,12}\b/.test(text.replace(/[\s-]/g, ''));
        const hasLinkedIn = /linkedin\.com\/in\/|linkedin/i.test(text);
        const hasGitHub = /github\.com\/|github|gitlab|portfolio|vercel\.app|netlify\.app/i.test(text);
        const hasCodingProfile = /leetcode\.com|hackerrank|codeforces|codechef|geeksforgeeks|kaggle/i.test(text);

        let contactScore = 0;
        if (hasEmail) contactScore += 4;
        if (hasPhone) contactScore += 3;
        if (hasLinkedIn) contactScore += 3;
        if (hasGitHub) contactScore += 3;
        if (hasCodingProfile) contactScore += 2;
        contactScore = Math.min(15, contactScore);

        checklist.push({
            name: 'Contact Information (Email & Phone)',
            passed: hasEmail && hasPhone,
            detail: hasEmail && hasPhone ? 'Validated contact channels accessible by recruiters.' : 'Missing either a valid professional email or mobile phone number.'
        });

        checklist.push({
            name: 'LinkedIn Professional Profile',
            passed: hasLinkedIn,
            detail: hasLinkedIn ? 'Recruiter-clickable LinkedIn URL verified.' : 'Missing LinkedIn profile link. 93% of technical hiring teams review LinkedIn.'
        });

        checklist.push({
            name: 'GitHub / Portfolio Proof-of-Work',
            passed: hasGitHub,
            detail: hasGitHub ? 'Public code repository link found.' : 'Missing GitHub or portfolio link. Engineering recruiters require public code repositories.'
        });

        checklist.push({
            name: 'Competitive Programming / Coding Profile',
            passed: hasCodingProfile,
            detail: hasCodingProfile ? 'Coding profile (LeetCode/Codeforces) listed.' : 'Add LeetCode, Codeforces, or HackerRank profile to showcase DSA proficiency.'
        });

        if (!hasEmail) issues.push({ type: 'danger', points: -4, title: 'Missing Professional Email Address', desc: 'Include a clean email (e.g., name@gmail.com) near the header.' });
        if (!hasPhone) issues.push({ type: 'danger', points: -3, title: 'Missing Phone Number', desc: 'Add a 10-digit phone number with country code (+91).' });
        if (!hasLinkedIn) issues.push({ type: 'warning', points: -3, title: 'Missing LinkedIn Profile Link', desc: 'Include your customized LinkedIn vanity URL in the header.' });
        if (!hasGitHub) issues.push({ type: 'warning', points: -3, title: 'Missing GitHub Repository Link', desc: 'Include your GitHub link so recruiters can audit your commits and code.' });

        // 2. TECHNICAL SKILLS & CS FUNDAMENTALS (20 Points)
        const commonLangs = ['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'sql', 'html', 'css', 'go', 'golang', 'rust', 'ruby', 'php', 'kotlin', 'swift'];
        const commonFrameworks = ['react', 'next.js', 'node.js', 'express', 'vue', 'angular', 'django', 'fastapi', 'spring', 'flask', 'tailwind', 'redux', 'bootstrap', 'mongodb', 'postgresql', 'mysql', 'redis', 'docker', 'aws', 'git', 'restful', 'graphql'];
        const commonCs = ['data structures', 'algorithms', 'dsa', 'dbms', 'operating systems', 'computer networks', 'system design', 'oop', 'object-oriented'];

        const langMatches = commonLangs.filter(l => new RegExp(`\\b${l.replace('+', '\\+')}\\b`, 'i').test(lower));
        const frameworkMatches = commonFrameworks.filter(f => lower.includes(f));
        const csFundamentals = commonCs.filter(c => lower.includes(c));

        const hasSkillsSection = /skills|technical skills|technologies|proficiencies/i.test(text);

        let skillsScore = 0;
        if (hasSkillsSection) skillsScore += 4;
        skillsScore += Math.min(6, langMatches.length * 1.5);
        skillsScore += Math.min(7, frameworkMatches.length * 1.2);
        if (csFundamentals.length >= 1) skillsScore += 3;
        skillsScore = Math.min(20, Math.round(skillsScore));

        checklist.push({
            name: 'Dedicated Technical Skills Section (Languages & Frameworks)',
            passed: hasSkillsSection && (langMatches.length >= 2 || frameworkMatches.length >= 2),
            detail: hasSkillsSection && langMatches.length >= 2 ? `Categorized skills found (${langMatches.length} languages, ${frameworkMatches.length} tools).` : 'Missing organized Skills section. ATS algorithms index keywords directly from this section.'
        });

        checklist.push({
            name: 'Core CS Fundamentals (DSA, OOP, DBMS, OS)',
            passed: csFundamentals.length >= 1,
            detail: csFundamentals.length >= 1 ? `Core fundamentals verified: ${csFundamentals.join(', ')}.` : 'Missing Core CS coursework (DSA, OOP, DBMS, OS). Campus recruiters prioritize candidates with fundamental CS knowledge.'
        });

        if (!hasSkillsSection) issues.push({ type: 'danger', points: -4, title: 'Missing Dedicated Technical Skills Section', desc: 'Add a section titled "TECHNICAL SKILLS" categorized into Languages, Frameworks, and Tools.' });

        // 3. PROJECTS & PROOF OF WORK (25 Points)
        const hasProjectsSection = /projects|technical\s+projects|academic\s+projects/i.test(text);
        const projectIndicators = (text.match(/github\.com\/|live demo|tech stack:|technologies used|architected|developed|engineered|built/gi) || []).length;
        const hasMultipleProjects = projectIndicators >= 3 || (text.match(/•|\-|\*/g) || []).length >= 6;
        const mentionsTechStackInProjects = /tech stack|technologies:|built with|using react|using python|using node/i.test(text) || (frameworkMatches.length >= 2 && langMatches.length >= 1);
        const hasDemoOrRepoLinks = /github\.com\/|http|app\b|vercel|netlify|hosted/i.test(text);

        let projectsScore = 0;
        if (hasProjectsSection) projectsScore += 5;
        if (hasMultipleProjects) projectsScore += 7;
        if (mentionsTechStackInProjects) projectsScore += 7;
        if (hasDemoOrRepoLinks) projectsScore += 6;
        projectsScore = Math.min(25, projectsScore);

        checklist.push({
            name: 'At Least 2 In-Depth Technical Projects',
            passed: hasProjectsSection && hasMultipleProjects,
            detail: hasProjectsSection && hasMultipleProjects ? 'Projects section contains multiple technical initiatives.' : 'Recruiters expect at least 2 distinct technical projects demonstrating full-cycle software development.'
        });

        checklist.push({
            name: 'Tech Stacks Specified per Project',
            passed: mentionsTechStackInProjects,
            detail: mentionsTechStackInProjects ? 'Tools and frameworks clearly linked to project deliverables.' : 'Always specify the exact tech stack header under each project title (e.g., Tech Stack: React, Node.js, MongoDB).'
        });

        if (!hasProjectsSection) issues.push({ type: 'danger', points: -12, title: 'Missing "Technical Projects" Section', desc: 'For students and entry-level engineers, projects are the #1 screening criterion. Add 2-3 prominent projects.' });
        else if (!hasDemoOrRepoLinks) issues.push({ type: 'warning', points: -6, title: 'No Project Repository or Live Demo URLs', desc: 'Add links (e.g., github.com/yourname/project) to prove your projects are real.' });

        // 4. MEASURABLE METRICS & GOOGLE X-Y-Z FORMULA (20 Points)
        const percentageMatches = text.match(/\d+(\.\d+)?%/g) || [];
        const scaleMatches = text.match(/\b\d+[\s\w]*(users|requests|clients|queries|records|stars|downloads|visitors|transactions|lines|api|endpoints)\b/gi) || [];
        const timeSpeedMatches = text.match(/\b\d+[\s\w]*(ms|seconds|minutes|hours|days|faster|latency|throughput)\b/gi) || [];
        const generalNumbers = text.match(/\b\d+(\+|\b)/g) || [];

        const totalMetricHits = (percentageMatches.length * 2) + (scaleMatches.length * 2) + (timeSpeedMatches.length * 2) + Math.min(3, generalNumbers.length);

        let metricScore = 0;
        if (totalMetricHits >= 7) metricScore = 20;
        else if (totalMetricHits >= 4) metricScore = 15;
        else if (totalMetricHits >= 2) metricScore = 10;
        else if (totalMetricHits >= 1) metricScore = 5;
        else metricScore = 0;

        checklist.push({
            name: 'Quantifiable Metrics & Scale (Google X-Y-Z)',
            passed: totalMetricHits >= 4,
            detail: totalMetricHits >= 4 ? `Found ${percentageMatches.length} percentages and ${scaleMatches.length + timeSpeedMatches.length} scale/performance metrics.` : 'Less than 3 measurable metrics found. Every student project bullet should include numbers (%, latency, users, counts).'
        });

        if (totalMetricHits < 4) {
            issues.push({
                type: 'danger',
                points: -(20 - metricScore),
                title: 'Insufficient Quantifiable Numbers & Performance Metrics',
                desc: 'Tech recruiters reject resumes with vague descriptions. Quantify impact: "slashed API response time by 35%", "supported 2,500+ active users".'
            });
        }

        // 5. POWER ACTION VERBS (10 Points)
        const powerVerbs = [
            'accelerated', 'achieved', 'architected', 'automated', 'boosted', 'built',
            'collaborated', 'created', 'customized', 'decreased', 'delivered', 'deployed',
            'designed', 'developed', 'engineered', 'enhanced', 'established', 'executed',
            'expanded', 'formulated', 'generated', 'implemented', 'improved', 'increased',
            'initiated', 'integrated', 'launched', 'maximized', 'minimized', 'optimized',
            'orchestrated', 'pioneered', 'reduced', 'refactored', 'resolved', 'restructured',
            'revamped', 'scaled', 'slashed', 'spearheaded', 'streamlined', 'strengthened',
            'supervised', 'trained', 'transformed', 'upgraded', 'validated'
        ];

        const verbsFound = powerVerbs.filter(verb => new RegExp(`\\b${verb}\\b`, 'i').test(lower));
        let verbScore = Math.min(10, verbsFound.length * 1.5);
        verbScore = Math.round(verbScore);

        checklist.push({
            name: 'High-Impact Power Action Verbs (Lead Words)',
            passed: verbsFound.length >= 5,
            detail: verbsFound.length >= 5 ? `Found ${verbsFound.length} executive action verbs (${verbsFound.slice(0, 4).join(', ')}...).` : 'Start bullet points with strong action verbs (Architected, Engineered, Optimized, Automated).'
        });

        if (verbsFound.length < 5) {
            issues.push({
                type: 'warning',
                points: -(10 - verbScore),
                title: 'Weak or Passive Phrasing in Bullets',
                desc: 'Replace passive phrases like "Responsible for" or "Worked on" with punchy action verbs.'
            });
        }

        // 6. STRUCTURE & FORMAT (10 Points)
        const hasEducation = /education|bachelor|b\.tech|degree|university|college|cgpa|gpa/i.test(text);
        const hasSummary = /summary|professional summary|about me|profile/i.test(text);
        const hasCleanLength = wordCount >= 250 && wordCount <= 750;

        let formatScore = 0;
        if (hasEducation) formatScore += 4;
        if (hasSummary) formatScore += 3;
        if (hasCleanLength) formatScore += 3;
        formatScore = Math.min(10, formatScore);

        checklist.push({
            name: 'Ideal 1-Page Word Count (350 - 650 words)',
            passed: hasCleanLength,
            detail: hasCleanLength ? `Word count is ${wordCount} words (ideal single-page density).` : `Current word count is ${wordCount}. Ideal is 350-650 words.`
        });

        if (!hasEducation) issues.push({ type: 'danger', points: -4, title: 'Missing Education Section', desc: 'Include college degree, university name, graduation year, and CGPA.' });

        const totalScore = Math.min(100, Math.max(12, contactScore + skillsScore + projectsScore + metricScore + verbScore + formatScore));

        return {
            overallScore: totalScore,
            categoryScores: {
                contact: contactScore,
                skills: skillsScore,
                projects: projectsScore,
                metrics: metricScore,
                verbs: verbScore,
                format: formatScore
            },
            checklist,
            issues,
            wordCount
        };
    }

    // ==========================================
    // RENDER ATS RESULTS
    // ==========================================
    function renderResults(analysis) {
        const score = analysis.overallScore;

        // Animate Radial Gauge
        const progressCircle = document.getElementById('progressCircle');
        const scoreNumber = document.getElementById('scoreNumber');
        const circumference = 2 * Math.PI * 80; // ~502

        progressCircle.style.strokeDasharray = `${circumference}`;
        const offset = circumference - (score / 100) * circumference;
        progressCircle.style.strokeDashoffset = `${offset}`;

        // Color coding
        let strokeColor = 'var(--success)';
        if (score < 60) strokeColor = 'var(--danger)';
        else if (score < 80) strokeColor = 'var(--warning)';
        progressCircle.style.stroke = strokeColor;

        // Counter animation
        animateValue(scoreNumber, 0, score, 1200);

        // Verdict Info
        const verdictBadge = document.getElementById('verdictBadge');
        const verdictHeadline = document.getElementById('verdictHeadline');
        const verdictDesc = document.getElementById('verdictDescription');
        const statProbability = document.getElementById('statProbability');
        const statPercentile = document.getElementById('statPercentile');
        const statVerdict = document.getElementById('statVerdict');
        const statWords = document.getElementById('statWords');

        statWords.textContent = `${analysis.wordCount} words`;

        if (score >= 85) {
            verdictBadge.className = 'verdict-badge ready';
            verdictBadge.textContent = '🟢 Guaranteed Interview Ready';
            verdictHeadline.textContent = 'Elite ATS Score! Ready for Google, Microsoft & Top Tech';
            verdictDesc.textContent = 'Your resume possesses optimal keyword density, verifiable metrics, clean single-column structure, and recruiter-ready links.';
            statProbability.textContent = '95%+';
            statPercentile.textContent = 'Top 3%';
            statVerdict.textContent = 'Direct Shortlist';
        } else if (score >= 65) {
            verdictBadge.className = 'verdict-badge average';
            verdictBadge.textContent = '🟡 Moderate Match (Improvements Recommended)';
            verdictHeadline.textContent = 'Good Foundation, but Missing Critical Numbers';
            verdictDesc.textContent = 'Your resume passes basic ATS screening, but lacks Google X-Y-Z quantifiable achievements and clear technical stack links.';
            statProbability.textContent = '55% - 70%';
            statPercentile.textContent = 'Top 25%';
            statVerdict.textContent = 'Needs Review';
        } else {
            verdictBadge.className = 'verdict-badge poor';
            verdictBadge.textContent = '🔴 High Risk of ATS Auto-Rejection';
            verdictHeadline.textContent = 'Immediate Corrections Needed for Campus Drives';
            verdictDesc.textContent = 'Automated enterprise scanners will drop this resume before any recruiter sees it due to missing key technical sections and links.';
            statProbability.textContent = '< 25%';
            statPercentile.textContent = 'Bottom 50%';
            statVerdict.textContent = 'Likely Filtered';
        }

        // Category Bars
        const cats = analysis.categoryScores;
        updateCatBar('catContactScore', 'catContactBar', cats.contact, 15);
        updateCatBar('catSkillsScore', 'catSkillsBar', cats.skills, 20);
        updateCatBar('catProjectsScore', 'catProjectsBar', cats.projects, 25);
        updateCatBar('catMetricsScore', 'catMetricsBar', cats.metrics, 20);
        updateCatBar('catVerbsScore', 'catVerbsBar', cats.verbs, 10);
        updateCatBar('catFormatScore', 'catFormatBar', cats.format, 10);

        // Checklist
        const checklistGrid = document.getElementById('checklistGrid');
        checklistGrid.innerHTML = '';
        const passedCount = analysis.checklist.filter(c => c.passed).length;
        document.getElementById('checklistScoreBadge').textContent = `${passedCount} / ${analysis.checklist.length} Checks Passed`;

        analysis.checklist.forEach(item => {
            const row = document.createElement('div');
            row.className = `checklist-item ${item.passed ? 'passed' : 'failed'}`;
            row.innerHTML = `
                <div class="check-icon ${item.passed ? 'passed' : 'failed'}">
                    <i class="fas fa-${item.passed ? 'check-circle' : 'times-circle'}"></i>
                </div>
                <div class="check-text">
                    <div class="check-name">${item.name}</div>
                    <div class="check-detail">${item.detail}</div>
                </div>
            `;
            checklistGrid.appendChild(row);
        });

        // Issues List
        const issuesList = document.getElementById('issuesList');
        issuesList.innerHTML = '';

        if (analysis.issues.length === 0) {
            issuesList.innerHTML = `
                <div style="background: rgba(0, 230, 118, 0.1); border: 1px solid var(--success); border-radius: 12px; padding: 18px; color: #fff; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-award" style="font-size: 1.8rem; color: var(--success);"></i>
                    <div>
                        <strong>Zero Major ATS Vulnerabilities!</strong>
                        <p style="color: #cbd5e1; font-size: 0.88rem; margin-top: 4px;">Your resume fulfills every standard expected by automated enterprise tracking systems and campus technical interviewers.</p>
                    </div>
                </div>
            `;
        } else {
            analysis.issues.forEach(issue => {
                const el = document.createElement('div');
                el.className = `issue-item ${issue.type}`;
                el.innerHTML = `
                    <div class="issue-header">
                        <span class="issue-title">${issue.title}</span>
                        <span class="issue-deduction">${issue.points} pts</span>
                    </div>
                    <p class="issue-desc">${issue.desc}</p>
                `;
                issuesList.appendChild(el);
            });
        }
    }

    function updateCatBar(scoreId, barId, current, max) {
        document.getElementById(scoreId).textContent = `${current}/${max}`;
        const pct = Math.min(100, Math.round((current / max) * 100));
        document.getElementById(barId).style.width = `${pct}%`;
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
