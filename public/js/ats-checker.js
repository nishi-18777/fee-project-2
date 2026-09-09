// Resume Spark - ATS Checker & Interview Readiness Analyzer

document.addEventListener('DOMContentLoaded', () => {
    // 1. Configure PDF.js Worker
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }

    // DOM Elements
    const tabUpload = document.getElementById('tabUpload');
    const tabPaste = document.getElementById('tabPaste');
    const dropzone = document.getElementById('dropzone');
    const pasteZone = document.getElementById('pasteZone');
    const fileInput = document.getElementById('fileInput');
    const pasteInput = document.getElementById('pasteInput');
    const btnAnalyze = document.getElementById('btnAnalyze');
    const btnSample = document.getElementById('btnSample');
    const loadingState = document.getElementById('loadingState');
    const resultsSection = document.getElementById('resultsSection');

    let currentFile = null;
    let activeMode = 'upload'; // 'upload' or 'paste'

    // ============================
    // TAB TOGGLE
    // ============================
    tabUpload.addEventListener('click', () => {
        activeMode = 'upload';
        tabUpload.classList.add('active');
        tabPaste.classList.remove('active');
        dropzone.style.display = 'block';
        pasteZone.classList.remove('active');
        updateAnalyzeButton();
    });

    tabPaste.addEventListener('click', () => {
        activeMode = 'paste';
        tabPaste.classList.add('active');
        tabUpload.classList.remove('active');
        dropzone.style.display = 'none';
        pasteZone.classList.add('active');
        updateAnalyzeButton();
    });

    // ============================
    // DRAG & DROP & FILE SELECTION
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

    pasteInput.addEventListener('input', updateAnalyzeButton);

    function handleFile(file) {
        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        const isPdf = file.name.endsWith('.pdf');
        const isDocx = file.name.endsWith('.docx');
        const isTxt = file.name.endsWith('.txt');

        if (!isPdf && !isDocx && !isTxt) {
            alert('Please upload a PDF (.pdf), Word document (.docx), or plain text (.txt) file.');
            return;
        }

        currentFile = file;
        const textElement = dropzone.querySelector('.dropzone-text');
        textElement.innerHTML = `📄 <strong>${escapeHtml(file.name)}</strong> (${(file.size / 1024).toFixed(1)} KB)`;
        dropzone.querySelector('.dropzone-subtext').textContent = 'Click or drag another file to replace';
        updateAnalyzeButton();
    }

    function updateAnalyzeButton() {
        if (activeMode === 'upload') {
            btnAnalyze.disabled = !currentFile;
        } else {
            btnAnalyze.disabled = !pasteInput.value.trim();
        }
    }

    // Sample Resume loader
    btnSample.addEventListener('click', () => {
        activeMode = 'paste';
        tabPaste.classList.add('active');
        tabUpload.classList.remove('active');
        dropzone.style.display = 'none';
        pasteZone.classList.add('active');

        pasteInput.value = `Nishi Dhiman
Full Stack Software Engineer
Email: nishi.dhiman@example.com | Phone: +91 98765 43210
LinkedIn: linkedin.com/in/nishidhiman | GitHub: github.com/nishi-18777
New Delhi, India

PROFESSIONAL SUMMARY
Results-driven Full Stack Engineer with 3+ years of experience engineering scalable web applications. Proficient in JavaScript, React, Node.js, Express, and MongoDB. Proven track record of boosting system performance by 35% and delivering robust microservices.

WORK EXPERIENCE
Full Stack Developer | TechSpark Solutions
July 2023 - Present | New Delhi, India
- Architected and deployed 8+ RESTful microservices using Node.js and Express, reducing server response time by 40%.
- Engineered responsive React UI dashboard utilized by over 45,000 monthly active users.
- Optimized MongoDB indexing strategies, cutting database read latency by 28%.
- Spearheaded CI/CD pipeline automation with Docker and GitHub Actions, slashing deployment cycle times by 50%.

Software Engineer Intern | Innovate Labs
January 2023 - June 2023 | Remote
- Developed automated resume parsing algorithms improving data extraction accuracy by 22%.
- Collaborated with a cross-functional team of 6 engineers to launch client-facing analytics portal ahead of deadline.
- Refactored legacy codebase, resolving 40+ critical bug tickets and elevating automated test coverage to 85%.

EDUCATION
Bachelor of Technology in Computer Science & Engineering
Delhi Technological University (DTU), 2019 - 2023 | GPA: 8.8/10

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, HTML5, CSS3, SQL
Frameworks & Libraries: React, Node.js, Express.js, Redux, TailwindCSS
Databases & Cloud: MongoDB, PostgreSQL, Redis, AWS (S3, EC2), Vercel
Tools & Practices: Git, Docker, Agile/Scrum, REST APIs, Jest

KEY PROJECTS
Resume Spark - AI Resume Builder & ATS Scanner
- Built an interactive web platform enabling candidates to create ATS-compliant resumes with real-time PDF generation.
- Implemented Google OAuth 2.0 and JWT authentication for over 2,000 active test users.`;

        updateAnalyzeButton();
        btnAnalyze.scrollIntoView({ behavior: 'smooth' });
    });

    // ============================
    // PARSING & EXTRACTION
    // ============================
    btnAnalyze.addEventListener('click', async () => {
        resultsSection.style.display = 'none';
        loadingState.style.display = 'block';
        loadingState.scrollIntoView({ behavior: 'smooth' });

        try {
            let extractedText = '';

            if (activeMode === 'paste') {
                extractedText = pasteInput.value;
            } else if (currentFile) {
                if (currentFile.name.endsWith('.pdf')) {
                    extractedText = await extractTextFromPdf(currentFile);
                } else if (currentFile.name.endsWith('.docx') && typeof mammoth !== 'undefined') {
                    extractedText = await extractTextFromDocx(currentFile);
                } else {
                    extractedText = await currentFile.text();
                }
            }

            if (!extractedText || extractedText.trim().length < 50) {
                throw new Error('Could not extract readable text. Please make sure the resume contains readable text rather than scanned images.');
            }

            // Run ATS evaluation
            const analysis = evaluateResume(extractedText);

            // Render results
            renderResults(analysis);

            loadingState.style.display = 'none';
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth' });

        } catch (err) {
            console.error('Analysis error:', err);
            loadingState.style.display = 'none';
            alert('Failed to analyze resume: ' + err.message);
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

    // ============================
    // ATS HEURISTIC ENGINE
    // ============================
    function evaluateResume(text) {
        const lower = text.toLowerCase();
        const words = text.trim().split(/\s+/);
        const wordCount = words.length;

        // 1. Contact Information Check (15 pts)
        const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
        const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10}/.test(text);
        const hasLinkedIn = /linkedin\.com\/in\/|linkedin/i.test(text);
        const hasGitHub = /github\.com\/|github/i.test(text) || /portfolio|website/i.test(text);

        let contactScore = 0;
        if (hasEmail) contactScore += 5;
        if (hasPhone) contactScore += 4;
        if (hasLinkedIn) contactScore += 3;
        if (hasGitHub) contactScore += 3;

        // 2. Standard ATS Sections Check (25 pts)
        const sections = {
            summary: /summary|objective|profile|about\s+me/i.test(text),
            experience: /experience|employment|work\s+history|career\s+history/i.test(text),
            education: /education|academic|university|degree|college/i.test(text),
            skills: /skills|technologies|proficiencies|competencies/i.test(text),
            projects: /projects|portfolio|personal\s+projects|open\s+source/i.test(text)
        };

        let sectionScore = 0;
        if (sections.experience) sectionScore += 8;
        if (sections.skills) sectionScore += 6;
        if (sections.education) sectionScore += 5;
        if (sections.projects) sectionScore += 3;
        if (sections.summary) sectionScore += 3;

        // 3. Strong Action Verbs Check (20 pts)
        const powerVerbs = [
            'accelerated', 'achieved', 'architected', 'automated', 'boosted', 'built',
            'championed', 'collaborated', 'created', 'decreased', 'delivered', 'deployed',
            'designed', 'developed', 'devised', 'directed', 'engineered', 'enhanced',
            'established', 'executed', 'facilitated', 'formulated', 'generated', 'guided',
            'headed', 'implemented', 'improved', 'increased', 'initiated', 'innovated',
            'installed', 'integrated', 'invented', 'launched', 'led', 'managed', 'mentored',
            'migrated', 'negotiated', 'optimized', 'orchestrated', 'overhauled', 'pioneered',
            'produced', 'reduced', 'refactored', 'resolved', 'restructured', 'revamped',
            'saved', 'scaled', 'simplified', 'slashed', 'spearheaded', 'standardized',
            'streamlined', 'strengthened', 'supervised', 'surpassed', 'trained', 'transformed'
        ];

        const matchedVerbs = powerVerbs.filter(verb => {
            const regex = new RegExp('\\b' + verb + '\\b', 'i');
            return regex.test(text);
        });

        const actionVerbScore = Math.min(20, Math.round((matchedVerbs.length / 8) * 20));

        // 4. Measurable Achievements & Metrics (20 pts)
        const metricsMatches = text.match(/\d+[\s\w]*(%|\$|k|million|billion|users|clients|hours|days|x\b|\+)/gi) || [];
        const numberMatches = text.match(/\b\d+(\.\d+)?\b/g) || [];
        const totalMetricHits = metricsMatches.length + Math.min(5, numberMatches.length);

        const metricScore = Math.min(20, Math.round((totalMetricHits / 6) * 20));

        // 5. Length & Formatting & Weak Words Check (20 pts)
        let formattingScore = 20;

        // Ideal length: 300 to 900 words
        if (wordCount < 250) {
            formattingScore -= 7;
        } else if (wordCount > 1100) {
            formattingScore -= 5;
        }

        // Check for weak filler words
        const weakPhrases = [
            'responsible for', 'duties included', 'helped with', 'worked on', 'assisted in',
            'tasked with', 'handled daily'
        ];
        const matchedWeak = weakPhrases.filter(phrase => lower.includes(phrase));
        formattingScore -= Math.min(8, matchedWeak.length * 2);

        // Overall Aggregate (0 - 100)
        const totalScore = Math.max(10, Math.min(100, contactScore + sectionScore + actionVerbScore + metricScore + formattingScore));

        // Generate issues and suggestions
        const issues = [];

        if (!hasEmail || !hasPhone) {
            issues.push({
                type: 'danger',
                title: 'Missing Direct Contact Information',
                desc: 'Every ATS requires a clear email address and phone number at the top of your resume.'
            });
        }

        if (!hasLinkedIn) {
            issues.push({
                type: 'warning',
                title: 'No LinkedIn Profile Link Found',
                desc: '87% of recruiters check LinkedIn before scheduling an interview. Add your profile URL.'
            });
        }

        if (!sections.experience) {
            issues.push({
                type: 'danger',
                title: 'Missing Clear "Work Experience" Section',
                desc: 'ATS parsers look for standard headers like "Work Experience" or "Professional Experience".'
            });
        }

        if (!sections.skills) {
            issues.push({
                type: 'danger',
                title: 'Missing Dedicated "Technical Skills" Section',
                desc: 'ATS algorithms match candidate keywords directly from a concise Skills section.'
            });
        }

        if (matchedVerbs.length < 5) {
            issues.push({
                type: 'warning',
                title: 'Low Action Verb Usage (Found ' + matchedVerbs.length + ')',
                desc: 'Use strong power verbs (e.g., "Spearheaded", "Architected", "Engineered") at the start of bullet points.'
            });
        }

        if (totalMetricHits < 3) {
            issues.push({
                type: 'danger',
                title: 'Insufficient Quantifiable Impact',
                desc: 'Recruiters want to see numbers, percentages, and metrics (e.g. "increased speed by 35%", "managed 10+ projects").'
            });
        }

        if (matchedWeak.length > 0) {
            issues.push({
                type: 'warning',
                title: 'Passive Phrasing Detected ("' + matchedWeak.slice(0, 2).join('", "') + '")',
                desc: 'Replace passive phrases like "responsible for" with assertive impact verbs.'
            });
        }

        if (wordCount < 280) {
            issues.push({
                type: 'warning',
                title: 'Resume is Too Short (' + wordCount + ' words)',
                desc: 'Add more detail to your key projects, responsibilities, and technical achievements.'
            });
        } else if (wordCount > 1000) {
            issues.push({
                type: 'warning',
                title: 'Resume is Overly Long (' + wordCount + ' words)',
                desc: 'Condense into high-impact bullets. Aim for 400 - 800 words for maximum ATS readability.'
            });
        }

        // Add success issue if in good shape
        if (matchedVerbs.length >= 6) {
            issues.push({
                type: 'success',
                title: 'Strong Action Verbs Present',
                desc: 'Great job including dynamic verbs like ' + matchedVerbs.slice(0, 4).join(', ') + '.'
            });
        }

        return {
            totalScore,
            wordCount,
            contactScore,
            sectionScore,
            actionVerbScore,
            metricScore,
            formattingScore,
            matchedVerbs,
            matchedWeak,
            issues
        };
    }

    // ============================
    // RENDER RESULTS
    // ============================
    function renderResults(data) {
        // 1. Radial Score Animation
        const scoreNumber = document.getElementById('scoreNumber');
        const progressCircle = document.getElementById('progressCircle');
        const verdictBadge = document.getElementById('verdictBadge');
        const verdictHeadline = document.getElementById('verdictHeadline');
        const verdictDescription = document.getElementById('verdictDescription');

        const radius = 80;
        const circumference = 2 * Math.PI * radius;
        progressCircle.style.strokeDasharray = `${circumference}`;

        const offset = circumference - (data.totalScore / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;

        let strokeColor = '#00e676';
        let badgeClass = 'ready';
        let badgeText = '🟢 Interview Ready';
        let headline = 'Outstanding! Highly Optimized for ATS Systems';
        let description = 'Your resume contains robust keyword density, recognizable section headers, and impactful phrasing. Recruiters and ATS scanners will parse this with high confidence.';

        if (data.totalScore < 60) {
            strokeColor = '#ff5252';
            badgeClass = 'needs-work';
            badgeText = '🔴 High Risk of Rejection';
            headline = 'Needs Significant Optimization for ATS';
            description = 'Your resume lacks critical quantifiable metrics, standard section tags, or strong action verbs. Automated screening software may discard this before a human recruiter sees it.';
        } else if (data.totalScore < 80) {
            strokeColor = '#ffab00';
            badgeClass = 'almost';
            badgeText = '🟡 Almost Ready (Needs Polish)';
            headline = 'Good Foundation, but Missing Key Metrics';
            description = 'Your resume has good readability, but needs more quantifiable results (numbers, percentages) and stronger action verbs to stand out in top percentile applicant pools.';
        }

        progressCircle.style.stroke = strokeColor;
        scoreNumber.style.color = strokeColor;
        scoreNumber.textContent = data.totalScore;

        verdictBadge.className = 'verdict-badge ' + badgeClass;
        verdictBadge.textContent = badgeText;
        verdictHeadline.textContent = headline;
        verdictDescription.textContent = description;

        // 2. Category Breakdown
        renderCategory('catContact', data.contactScore, 15);
        renderCategory('catSections', data.sectionScore, 25);
        renderCategory('catVerbs', data.actionVerbScore, 20);
        renderCategory('catMetrics', data.metricScore, 20);
        renderCategory('catFormatting', data.formattingScore, 20);

        // 3. Issues & Fixes
        const issuesList = document.getElementById('issuesList');
        issuesList.innerHTML = '';

        data.issues.forEach(issue => {
            const item = document.createElement('div');
            item.className = 'issue-item ' + issue.type;

            let iconHtml = '⚠️';
            if (issue.type === 'danger') iconHtml = '❌';
            if (issue.type === 'success') iconHtml = '✅';

            item.innerHTML = `
                <div class="issue-icon">${iconHtml}</div>
                <div class="issue-content">
                    <h4>${escapeHtml(issue.title)}</h4>
                    <p>${escapeHtml(issue.desc)}</p>
                </div>
            `;
            issuesList.appendChild(item);
        });
    }

    function renderCategory(idPrefix, score, max) {
        const percent = Math.round((score / max) * 100);
        const scoreElem = document.getElementById(idPrefix + 'Score');
        const barElem = document.getElementById(idPrefix + 'Bar');

        if (scoreElem) scoreElem.textContent = `${score}/${max} (${percent}%)`;
        if (barElem) {
            barElem.style.width = `${percent}%`;
            if (percent >= 80) {
                barElem.style.background = 'var(--success)';
            } else if (percent >= 60) {
                barElem.style.background = 'var(--warning)';
            } else {
                barElem.style.background = 'var(--danger)';
            }
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag));
    }
});
