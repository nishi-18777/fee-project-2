// Resume Spark - Ultra-Precise ATS Score & Student Interview Readiness Engine

// Global copy utility for templates
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
        }, 2200);
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

    // High-Scoring Showcase Sample Resume (98/100 ATS Optimized for Students)
    btnSample.addEventListener('click', () => {
        activeMode = 'paste';
        tabPaste.classList.add('active');
        tabUpload.classList.remove('active');
        dropzone.style.display = 'none';
        pasteZone.classList.add('active');

        pasteInput.value = `Nishi Dhiman
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

            // Run Ultra-Precise ATS evaluation
            const analysis = evaluateResumePrecisely(extractedText);

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

    // ==========================================
    // ULTRA-PRECISE ATS EVALUATION ENGINE
    // ==========================================
    function evaluateResumePrecisely(text) {
        const lower = text.toLowerCase();
        const words = text.trim().split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;

        const issues = [];
        const checklist = [];

        // -------------------------------------------------------------
        // 1. CONTACT & PROFESSIONAL PROFILES (15 Points)
        // -------------------------------------------------------------
        const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
        const hasPhone = /(\+?\d{1,4}[-.\s]?)?(\(?\d{2,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}/.test(text) || /\b\d{10,12}\b/.test(text.replace(/[\s-]/g, ''));
        const hasLinkedIn = /linkedin\.com\/in\/|linkedin/i.test(text);
        const hasGitHub = /github\.com\/|github|gitlab|portfolio|vercel\.app|netlify\.app/i.test(text);
        const hasCodingProfile = /leetcode|hackerrank|codeforces|codechef|geeksforgeeks/i.test(text);

        let contactScore = 0;
        if (hasEmail) contactScore += 4;
        if (hasPhone) contactScore += 3;
        if (hasLinkedIn) contactScore += 4;
        if (hasGitHub || hasCodingProfile) contactScore += 4;

        checklist.push({
            name: 'Contact Information (Email & Phone)',
            passed: hasEmail && hasPhone,
            detail: hasEmail && hasPhone ? 'Clean professional email & phone number detected.' : 'Missing email or telephone number. Recruiter parsers will drop the candidate.'
        });

        checklist.push({
            name: 'LinkedIn Profile Link',
            passed: hasLinkedIn,
            detail: hasLinkedIn ? 'LinkedIn profile URL identified.' : 'Missing LinkedIn URL. 87% of tech recruiters check candidate LinkedIn profiles.'
        });

        checklist.push({
            name: 'GitHub / Coding Profile (Proof of Work)',
            passed: hasGitHub || hasCodingProfile,
            detail: (hasGitHub || hasCodingProfile) ? 'GitHub, LeetCode, or live portfolio link found.' : 'Crucial for students! Recruiters require GitHub / LeetCode links to verify coding ability.'
        });

        if (!hasEmail || !hasPhone) {
            issues.push({
                type: 'danger',
                points: -7,
                title: 'Missing Direct Contact Coordinates',
                desc: 'Ensure your email and telephone number are formatted plainly at the very top of your resume.'
            });
        }
        if (!hasLinkedIn) {
            issues.push({
                type: 'warning',
                points: -4,
                title: 'Missing LinkedIn Profile Link',
                desc: 'Include your customized LinkedIn profile (e.g. linkedin.com/in/yourname) in the contact banner.'
            });
        }
        if (!hasGitHub && !hasCodingProfile) {
            issues.push({
                type: 'danger',
                points: -4,
                title: 'No GitHub or LeetCode Proof of Work',
                desc: 'Students without public GitHub repositories or LeetCode profiles suffer high initial screening drop-offs.'
            });
        }

        // -------------------------------------------------------------
        // 2. TECH SKILLS & CS FUNDAMENTALS (20 Points)
        // -------------------------------------------------------------
        const hasSkillsSection = /technical\s+skills|skills|technologies|proficiencies|tools/i.test(text);

        // Core Languages
        const langMatches = [
            'javascript', 'typescript', 'python', 'java', 'c\\+\\+', 'c#', 'golang', 'go\\b', 'rust', 'ruby', 'php', 'sql', 'html', 'css'
        ].filter(lang => new RegExp('\\b' + lang + '\\b', 'i').test(text));

        // Frameworks & Libraries
        const frameworkMatches = [
            'react', 'next\\.js|nextjs', 'angular', 'vue', 'node\\.js|nodejs', 'express', 'django', 'flask', 'fastapi',
            'spring', 'tailwind', 'redux', 'flutter', 'react native'
        ].filter(fw => new RegExp('\\b' + fw + '\\b', 'i').test(text));

        // Databases & Cloud/DevOps
        const dbCloudMatches = [
            'mongodb', 'postgresql|postgres', 'mysql', 'redis', 'firebase', 'sqlite', 'aws', 'docker', 'git', 'kubernetes', 'ci/cd', 'vercel'
        ].filter(tool => new RegExp('\\b' + tool + '\\b', 'i').test(text));

        // Core CS Fundamentals (Crucial for campus placements & technical rounds)
        const csFundamentals = [
            'data structures', 'dsa', 'algorithms', 'object-oriented|oop', 'dbms|database management',
            'operating systems', 'computer networks', 'system design', 'rest api|restful'
        ].filter(cs => new RegExp('\\b' + cs + '\\b', 'i').test(text));

        let skillsScore = 0;
        if (hasSkillsSection) skillsScore += 4;
        if (langMatches.length >= 2) skillsScore += 5;
        else if (langMatches.length === 1) skillsScore += 3;

        if (frameworkMatches.length >= 2) skillsScore += 5;
        else if (frameworkMatches.length === 1) skillsScore += 3;

        if (dbCloudMatches.length >= 2) skillsScore += 3;
        else if (dbCloudMatches.length === 1) skillsScore += 2;

        if (csFundamentals.length >= 1) skillsScore += 3;

        skillsScore = Math.min(20, skillsScore);

        checklist.push({
            name: 'Dedicated Technical Skills Section',
            passed: hasSkillsSection && (langMatches.length >= 2 || frameworkMatches.length >= 2),
            detail: (hasSkillsSection && langMatches.length >= 2) ? `Categorized skills found (${langMatches.length} languages, ${frameworkMatches.length} frameworks).` : 'Missing organized Skills section. ATS algorithms index keywords directly from this section.'
        });

        checklist.push({
            name: 'Core CS Fundamentals (DSA, OOP, DBMS, OS)',
            passed: csFundamentals.length >= 1,
            detail: csFundamentals.length >= 1 ? `Core fundamentals verified: ${csFundamentals.join(', ')}.` : 'Missing Core CS coursework (DSA, OOP, DBMS, OS). Campus recruiters prioritize candidates with fundamental CS knowledge.'
        });

        if (!hasSkillsSection) {
            issues.push({
                type: 'danger',
                points: -4,
                title: 'Missing Dedicated Technical Skills Section',
                desc: 'Add a section titled "TECHNICAL SKILLS" categorized into Languages, Frameworks, Databases, and Developer Tools.'
            });
        }
        if (langMatches.length < 2) {
            issues.push({
                type: 'warning',
                points: -2,
                title: 'Few Programming Languages Listed',
                desc: 'List primary programming languages (e.g. Python, Java, C++, JavaScript) with which you can solve coding interview problems.'
            });
        }
        if (csFundamentals.length === 0) {
            issues.push({
                type: 'warning',
                points: -3,
                title: 'Core Computer Science Fundamentals Not Mentioned',
                desc: 'Add mention of Data Structures & Algorithms, OOP, DBMS, or Computer Networks in your coursework or skills list.'
            });
        }

        // -------------------------------------------------------------
        // 3. PROJECTS & PROOF OF WORK (25 Points)
        // -------------------------------------------------------------
        const hasProjectsSection = /projects|technical\s+projects|academic\s+projects|key\s+projects/i.test(text);
        
        // Count project items or bullets
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
            detail: (hasProjectsSection && hasMultipleProjects) ? 'Projects section contains multiple technical initiatives.' : 'Recruiters expect at least 2 distinct technical projects demonstrating full-cycle software development.'
        });

        checklist.push({
            name: 'Tech Stacks Specified per Project',
            passed: mentionsTechStackInProjects,
            detail: mentionsTechStackInProjects ? 'Tools, frameworks, and databases clearly linked to project deliverables.' : 'Always specify the exact tech stack header under each project title (e.g., Tech Stack: React, Node.js, MongoDB).'
        });

        if (!hasProjectsSection) {
            issues.push({
                type: 'danger',
                points: -12,
                title: 'Missing "Technical Projects" Section',
                desc: 'For college students and entry-level engineers, projects are the #1 screening criterion. Add 2-3 prominent projects.'
            });
        } else if (!hasDemoOrRepoLinks) {
            issues.push({
                type: 'warning',
                points: -6,
                title: 'No Project Repository or Live Demo URLs',
                desc: 'Add links (e.g., github.com/yourname/project or live demo link) to prove your projects are real and functional.'
            });
        }

        // -------------------------------------------------------------
        // 4. MEASURABLE METRICS & GOOGLE X-Y-Z FORMULA (20 Points)
        // -------------------------------------------------------------
        // Look for numbers paired with %, ms, speedups, user counts, requests, transactions, scale
        const percentageMatches = text.match(/\d+(\.\d+)?%/g) || [];
        const scaleMatches = text.match(/\b\d+[\s\w]*(users|requests|clients|queries|records|stars|downloads|visitors|transactions|lines|api|endpoints)\b/gi) || [];
        const timeSpeedMatches = text.match(/\b\d+[\s\w]*(ms|seconds|minutes|hours|days|faster|latency|throughput)\b/gi) || [];
        const generalNumbers = text.match(/\b\d+(\+|\b)/g) || [];

        const totalMetricHits = (percentageMatches.length * 2) + (scaleMatches.length * 2) + (timeSpeedMatches.length * 2) + Math.min(3, generalNumbers.length);

        let metricScore = 0;
        if (totalMetricHits >= 7) {
            metricScore = 20;
        } else if (totalMetricHits >= 4) {
            metricScore = 15;
        } else if (totalMetricHits >= 2) {
            metricScore = 10;
        } else if (totalMetricHits >= 1) {
            metricScore = 5;
        } else {
            metricScore = 0;
        }

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
                desc: 'Tech recruiters reject resumes with vague descriptions. Quantify impact: "slashed API response time by 35%", "supported 1,500+ active users", "indexed 10,000+ database records".'
            });
        }

        // -------------------------------------------------------------
        // 5. POWER ACTION VERBS & TONE (10 Points)
        // -------------------------------------------------------------
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

        const matchedVerbs = powerVerbs.filter(verb => new RegExp('\\b' + verb + '\\b', 'i').test(text));

        // Weak passive filler phrases to penalize
        const weakPhrases = [
            'responsible for', 'duties included', 'helped with', 'worked on', 'assisted in',
            'tasked with', 'handled daily', 'tried to', 'hard worker', 'team player'
        ];
        const matchedWeak = weakPhrases.filter(phrase => lower.includes(phrase));

        let verbsScore = 0;
        if (matchedVerbs.length >= 6) verbsScore = 10;
        else if (matchedVerbs.length >= 4) verbsScore = 8;
        else if (matchedVerbs.length >= 2) verbsScore = 5;
        else verbsScore = 2;

        // Penalty for passive phrases (-2 pts each, max -4)
        verbsScore = Math.max(0, verbsScore - (matchedWeak.length * 2));

        checklist.push({
            name: 'Assertive Action-Oriented Language',
            passed: matchedVerbs.length >= 5 && matchedWeak.length === 0,
            detail: (matchedVerbs.length >= 5 && matchedWeak.length === 0) ? `Identified ${matchedVerbs.length} high-impact engineering action verbs.` : `Detected passive phrases or few action verbs (${matchedVerbs.length} verbs found). Start bullets with words like "Architected", "Engineered", "Optimized".`
        });

        if (matchedWeak.length > 0) {
            issues.push({
                type: 'warning',
                points: -(matchedWeak.length * 2),
                title: `Passive Phrasing Detected ("${matchedWeak.slice(0, 2).join('", "')}")`,
                desc: 'Replace passive phrases like "worked on" or "responsible for" with strong verbs: "Engineered", "Architected", or "Automated".'
            });
        }
        if (matchedVerbs.length < 4) {
            issues.push({
                type: 'warning',
                points: -3,
                title: 'Low Power Verb Variety',
                desc: 'Recruiter scanners favor action verbs at the beginning of each bullet point to clearly attribute your contributions.'
            });
        }

        // -------------------------------------------------------------
        // 6. STRUCTURE & 1-PAGE STUDENT FORMAT (10 Points)
        // -------------------------------------------------------------
        const hasEducation = /education|bachelor|b\.tech|b\.e\.|degree|university|college|cgpa|gpa/i.test(text);
        const hasStandardHeaders = hasEducation && hasSkillsSection && hasProjectsSection;

        let formatScore = 0;
        if (hasStandardHeaders) formatScore += 4;

        // Student 1-page word count target: 320 to 750 words
        let lengthStatus = 'perfect';
        if (wordCount >= 320 && wordCount <= 750) {
            formatScore += 4;
        } else if ((wordCount >= 250 && wordCount < 320) || (wordCount > 750 && wordCount <= 900)) {
            formatScore += 2;
            lengthStatus = wordCount < 320 ? 'slightly short' : 'slightly long';
        } else {
            lengthStatus = wordCount < 250 ? 'too short' : 'too long';
        }

        // Education details (degree + GPA or Year)
        const hasGpaOrYear = /\b(cgpa|gpa|202\d|201\d)\b/i.test(text);
        if (hasGpaOrYear) formatScore += 2;

        formatScore = Math.min(10, formatScore);

        checklist.push({
            name: 'Student 1-Page Industry Length',
            passed: wordCount >= 300 && wordCount <= 800,
            detail: `Current word count: ${wordCount} words (Ideal for college students: 350 - 700 words).`
        });

        if (wordCount < 280) {
            issues.push({
                type: 'danger',
                points: -4,
                title: `Resume is Too Brief (${wordCount} words)`,
                desc: 'Campus recruiters will view this as an incomplete resume. Expand with 2-3 detailed project bullet points and coursework.'
            });
        } else if (wordCount > 850) {
            issues.push({
                type: 'warning',
                points: -3,
                title: `Resume Exceeds 1 Page (${wordCount} words)`,
                desc: 'College freshers should strictly maintain a 1-page resume. Trim repetitive descriptions and condense sentences.'
            });
        }

        // -------------------------------------------------------------
        // AGGREGATE TOTAL & PROBABILITY CALCULATION
        // -------------------------------------------------------------
        const totalScore = Math.max(10, Math.min(100,
            contactScore + skillsScore + projectsScore + metricScore + verbsScore + formatScore
        ));

        // Interview Probability and Percentile stats
        let probabilityText = '98%+';
        let percentileText = 'Top 2%';
        let screeningVerdict = 'Guaranteed Pass';
        let verdictBadgeClass = 'ready';
        let verdictBadgeText = '🟢 Interview Guaranteed';
        let headline = 'Exceptional! 100% Ready for Tier-1 Tech Interviews';
        let description = 'Your resume meets all enterprise ATS keyword parsing algorithms, recruiter impact standards, and student placement criteria. You will not get filtered out by automated screening.';
        let strokeColor = '#00e676';

        if (totalScore < 65) {
            probabilityText = '< 20%';
            percentileText = 'Bottom 40%';
            screeningVerdict = 'High Rejection Risk';
            verdictBadgeClass = 'needs-work';
            verdictBadgeText = '🔴 High Risk of Rejection';
            headline = 'Critical Rejection Risk in Automated ATS Screening';
            description = 'Your resume lacks essential quantifiable metrics, technical proof-of-work, or organized skill categories. In automated screening, this resume will likely be discarded before a human recruiter sees it.';
            strokeColor = '#ff5252';
        } else if (totalScore < 80) {
            probabilityText = '55%';
            percentileText = 'Top 35%';
            screeningVerdict = 'Moderate Chance';
            verdictBadgeClass = 'almost';
            verdictBadgeText = '🟡 Needs Optimization';
            headline = 'Good Foundation, but Vulnerable in Competitive Pools';
            description = 'Your resume is parseable, but lacks sufficient measurable metrics, GitHub proof-of-work, or power verbs. Follow the point fixes below to reach the 95+ threshold.';
            strokeColor = '#ffab00';
        } else if (totalScore < 92) {
            probabilityText = '85%';
            percentileText = 'Top 10%';
            screeningVerdict = 'Likely Shortlist';
            verdictBadgeClass = 'ready';
            verdictBadgeText = '🟢 Highly Competitive';
            headline = 'Strong Resume! Minor Tweaks to Guarantee Interviews';
            description = 'Your resume passes major ATS parsers cleanly. Adding 1-2 more quantifiable numbers or demo URLs will elevate your score into the Top 2% tier.';
            strokeColor = '#00f2fe';
        }

        // Earned positive highlights if score is high
        if (metricScore >= 15) {
            issues.unshift({
                type: 'success',
                points: `+${metricScore}`,
                title: 'High-Impact Quantifiable Metrics Detected',
                desc: `Excellent job featuring measurable metrics (${percentageMatches.length} percentages, ${scaleMatches.length + timeSpeedMatches.length} scale markers).`
            });
        }

        if (matchedVerbs.length >= 6) {
            issues.unshift({
                type: 'success',
                points: `+${verbsScore}`,
                title: 'Dynamic Engineering Power Verbs Identified',
                desc: `Strong assertive phrasing using verbs like: ${matchedVerbs.slice(0, 5).join(', ')}.`
            });
        }

        return {
            totalScore,
            wordCount,
            contactScore,
            skillsScore,
            projectsScore,
            metricScore,
            verbsScore,
            formatScore,
            probabilityText,
            percentileText,
            screeningVerdict,
            verdictBadgeClass,
            verdictBadgeText,
            headline,
            description,
            strokeColor,
            checklist,
            issues
        };
    }

    // ==========================================
    // RENDER RESULTS TO DOM
    // ==========================================
    function renderResults(data) {
        // 1. Radial Progress Circle
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
        progressCircle.style.stroke = data.strokeColor;

        scoreNumber.style.color = data.strokeColor;
        scoreNumber.textContent = data.totalScore;

        verdictBadge.className = 'verdict-badge ' + data.verdictBadgeClass;
        verdictBadge.textContent = data.verdictBadgeText;
        verdictHeadline.textContent = data.headline;
        verdictDescription.textContent = data.description;

        // 2. Stats Banner
        const statProbability = document.getElementById('statProbability');
        const statPercentile = document.getElementById('statPercentile');
        const statVerdict = document.getElementById('statVerdict');
        const statWords = document.getElementById('statWords');

        if (statProbability) {
            statProbability.textContent = data.probabilityText;
            statProbability.className = 'stat-value ' + (data.totalScore >= 80 ? 'highlight-green' : (data.totalScore >= 65 ? 'highlight-yellow' : 'highlight-red'));
        }
        if (statPercentile) statPercentile.textContent = data.percentileText;
        if (statVerdict) {
            statVerdict.textContent = data.screeningVerdict;
            statVerdict.className = 'stat-value ' + (data.totalScore >= 80 ? 'highlight-green' : (data.totalScore >= 65 ? 'highlight-yellow' : 'highlight-red'));
        }
        if (statWords) statWords.textContent = `${data.wordCount} words`;

        // 3. Category Breakdown (6 Categories)
        renderCategory('catContact', data.contactScore, 15);
        renderCategory('catSkills', data.skillsScore, 20);
        renderCategory('catProjects', data.projectsScore, 25);
        renderCategory('catMetrics', data.metricScore, 20);
        renderCategory('catVerbs', data.verbsScore, 10);
        renderCategory('catFormat', data.formatScore, 10);

        // 4. Student 10-Point Checklist
        const checklistGrid = document.getElementById('checklistGrid');
        const checklistScoreBadge = document.getElementById('checklistScoreBadge');
        if (checklistGrid) {
            checklistGrid.innerHTML = '';
            let passedCount = 0;

            data.checklist.forEach(item => {
                if (item.passed) passedCount++;
                const itemDiv = document.createElement('div');
                itemDiv.className = `checklist-item ${item.passed ? 'pass' : 'fail'}`;
                itemDiv.innerHTML = `
                    <div class="checklist-status-icon">
                        <i class="fas ${item.passed ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                    </div>
                    <div class="checklist-content">
                        <h5>${escapeHtml(item.name)}</h5>
                        <p>${escapeHtml(item.detail)}</p>
                    </div>
                `;
                checklistGrid.appendChild(itemDiv);
            });

            if (checklistScoreBadge) {
                checklistScoreBadge.textContent = `${passedCount} / ${data.checklist.length} Checks Passed`;
                checklistScoreBadge.style.color = passedCount >= 8 ? 'var(--success)' : (passedCount >= 6 ? 'var(--warning)' : 'var(--danger)');
                checklistScoreBadge.style.borderColor = checklistScoreBadge.style.color;
            }
        }

        // 5. Diagnosed Point Deductions & Fixes
        const issuesList = document.getElementById('issuesList');
        if (issuesList) {
            issuesList.innerHTML = '';
            data.issues.forEach(issue => {
                const item = document.createElement('div');
                item.className = 'issue-item ' + issue.type;

                let iconHtml = '⚠️';
                let pointPill = '';
                if (issue.type === 'danger') {
                    iconHtml = '❌';
                    pointPill = `<span class="deduction-pill danger">${issue.points} pts</span>`;
                } else if (issue.type === 'warning') {
                    iconHtml = '⚠️';
                    pointPill = `<span class="deduction-pill warning">${issue.points} pts</span>`;
                } else if (issue.type === 'success') {
                    iconHtml = '✅';
                    pointPill = `<span class="deduction-pill success">${issue.points} pts</span>`;
                }

                item.innerHTML = `
                    <div class="issue-icon">${iconHtml}</div>
                    <div class="issue-content">
                        <h4>${pointPill} ${escapeHtml(issue.title)}</h4>
                        <p>${escapeHtml(issue.desc)}</p>
                    </div>
                `;
                issuesList.appendChild(item);
            });
        }
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

