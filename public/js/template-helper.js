// Template Helper JS - Dynamic Navbar Injection, Database Persistence & PDF Printing

(function() {
    // Standalone Authentication Gate Check
    const hasCookieToken = document.cookie.split(';').some(c => c.trim().startsWith('token='));
    const localUser = localStorage.getItem('currentUser');
    const isStandalone = window.location.protocol === 'file:' || !hasCookieToken;
    if (isStandalone && !localUser) {
        window.location.href = 'login page.html';
        return;
    }

    // 1. Determine Template ID from URL
    const pathname = window.location.pathname;
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1) || 'template1.html';
    const templateId = filename.replace(/\.html$/i, '').toLowerCase();

    console.log(`[Resume Spark Helper] Initialized for template: ${templateId}`);

    // 2. Load FontAwesome if not already present on the page
    if (!document.querySelector('link[href*="font-awesome"]') && !document.querySelector('link[href*="all.min.css"]')) {
        const faLink = document.createElement('link');
        faLink.rel = 'stylesheet';
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        document.head.appendChild(faLink);
    }

    // 3. Helper functions for saving and loading
    async function loadSavedResume() {
        const resumeRoot = document.getElementById('resume');
        if (!resumeRoot) {
            console.error('[Resume Spark Helper] Error: No element with id="resume" found.');
            return;
        }

        try {
            const response = await fetch(`/api/resumes/load?templateId=${templateId}`);
            const data = await response.json();
            
            if (data.success && data.htmlContent) {
                console.log('[Resume Spark Helper] Saved resume content found, loading...');
                // Temporarily disable contenteditable if active, to prevent focus jumps
                resumeRoot.innerHTML = data.htmlContent;
                
                // Dispatch custom event to notify other scripts that content is ready
                const event = new CustomEvent('resumeContentLoaded', { detail: { templateId } });
                document.dispatchEvent(event);
            } else {
                console.log('[Resume Spark Helper] No saved resume found on server for this template.');
                loadLocalFallback();
            }
        } catch (err) {
            console.warn('[Resume Spark Helper] Server load failed, falling back to LocalStorage:', err);
            loadLocalFallback();
        }

        function loadLocalFallback() {
            try {
                let currentUsername = 'guest';
                const localUser = localStorage.getItem('currentUser');
                if (localUser) {
                    const parsed = JSON.parse(localUser);
                    if (parsed && parsed.username) {
                        currentUsername = parsed.username.toLowerCase();
                    }
                }
                const localContent = localStorage.getItem('resume_' + currentUsername + '_' + templateId);
                if (localContent) {
                    console.log('[Resume Spark Helper] Local content found, loading...');
                    resumeRoot.innerHTML = localContent;
                    
                    const event = new CustomEvent('resumeContentLoaded', { detail: { templateId } });
                    document.dispatchEvent(event);
                }
            } catch (lsErr) {
                console.error('LocalStorage load error:', lsErr);
            }
        }
    }

    async function saveResume() {
        const resumeRoot = document.getElementById('resume');
        if (!resumeRoot) {
            alert('Cannot save: resume container not found!');
            return;
        }

        // Hide inputs/checkboxes class list checks or state pre-saves if needed
        // Prepare HTML content
        const htmlContent = resumeRoot.innerHTML;

        try {
            const response = await fetch('/api/resumes/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    templateId,
                    htmlContent
                })
            });

            const data = await response.json();
            if (data.success) {
                showToast('Resume saved successfully!', 'success');
            } else {
                showToast(`Failed to save: ${data.message}`, 'error');
            }
        } catch (err) {
            console.warn('[Resume Spark Helper] Server save failed, saving to LocalStorage:', err);
            try {
                let currentUsername = 'guest';
                const localUser = localStorage.getItem('currentUser');
                if (localUser) {
                    const parsed = JSON.parse(localUser);
                    if (parsed && parsed.username) {
                        currentUsername = parsed.username.toLowerCase();
                    }
                }
                localStorage.setItem('resume_' + currentUsername + '_' + templateId, htmlContent);
                showToast('Resume saved locally!', 'success');
            } catch (lsErr) {
                console.error('LocalStorage save error:', lsErr);
                showToast('Failed to save to local storage.', 'error');
            }
        }
    }

    function downloadPDF() {
        const element = document.getElementById('resume');
        if (!element) {
            showToast('Resume container not found!', 'error');
            return;
        }

        showToast('Generating PDF, please wait...', 'success');

        const executeDownload = () => {
            const opt = {
                margin:       0,
                filename:     `${templateId}_resume.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, logging: false },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            const worker = html2pdf().from(element).set(opt);
            
            worker.save()
                .then(() => {
                    showToast('PDF downloaded successfully!', 'success');
                    return worker.output('blob');
                })
                .then((blob) => {
                    const blobURL = URL.createObjectURL(blob);
                    showDownloadSuccessModal(opt.filename, blobURL);
                })
                .catch(err => {
                    console.error('PDF generation error:', err);
                    showToast('Failed to generate PDF. Retrying via browser print...', 'error');
                    window.print();
                });
        };

        if (typeof html2pdf === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.onload = executeDownload;
            script.onerror = () => {
                showToast('Failed to load PDF library, using browser print instead.', 'error');
                window.print();
            };
            document.head.appendChild(script);
        } else {
            executeDownload();
        }
    }

    function showDownloadSuccessModal(filename, blobURL) {
        const existingModal = document.getElementById('pdf-success-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'pdf-success-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(8px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 100000;
            font-family: 'Inter', 'Montserrat', sans-serif;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        modal.innerHTML = `
            <div style="
                background: #ffffff;
                padding: 35px;
                border-radius: 20px;
                box-shadow: 0 15px 35px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1);
                max-width: 420px;
                width: 90%;
                text-align: center;
                transform: translateY(20px);
                transition: transform 0.3s ease;
                border: 1px solid rgba(0, 0, 0, 0.05);
            ">
                <div style="
                    width: 60px;
                    height: 60px;
                    background: #e0f2fe;
                    color: #0284c7;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 28px;
                    margin: 0 auto 20px auto;
                ">
                    <i class="fas fa-file-pdf"></i>
                </div>
                <h3 style="margin: 0 0 10px 0; font-size: 1.25rem; font-weight: 800; color: #0f172a;">PDF Downloaded!</h3>
                <p style="margin: 0 0 8px 0; font-size: 0.9rem; color: #475569; font-weight: 500; word-break: break-all;">
                    Saved as: <strong>${filename}</strong>
                </p>
                <p style="margin: 0 0 25px 0; font-size: 0.85rem; color: #64748b; line-height: 1.5;">
                    The file has been saved to your browser's default <strong>Downloads</strong> folder. Click the button below to view it.
                </p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <a href="${blobURL}" target="_blank" style="
                        background: linear-gradient(135deg, #0284c7, #0369a1);
                        color: #ffffff;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-weight: 700;
                        font-size: 0.9rem;
                        text-decoration: none;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        box-shadow: 0 4px 6px rgba(2, 132, 199, 0.15);
                        transition: all 0.2s ease;
                    " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 12px rgba(2, 132, 199, 0.25)';" onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px rgba(2, 132, 199, 0.15)';">
                        <i class="fas fa-external-link-alt"></i> Open PDF
                    </a>
                    <button id="close-modal-btn" style="
                        background: #f1f5f9;
                        color: #475569;
                        border: 1px solid #e2e8f0;
                        padding: 12px 20px;
                        border-radius: 8px;
                        font-weight: 700;
                        font-size: 0.9rem;
                        cursor: pointer;
                        transition: background 0.2s ease;
                    " onmouseover="this.style.background='#e2e8f0';" onmouseout="this.style.background='#f1f5f9';">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        setTimeout(() => {
            modal.style.opacity = '1';
            modal.children[0].style.transform = 'translateY(0)';
        }, 50);

        const closeModal = () => {
            modal.style.opacity = '0';
            modal.children[0].style.transform = 'translateY(20px)';
            setTimeout(() => {
                modal.remove();
                URL.revokeObjectURL(blobURL);
            }, 300);
        };

        document.getElementById('close-modal-btn').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    function goHome() {
        window.location.href = 'templates.html';
    }

    async function logoutUser() {
        try {
            await saveResume();
        } catch (e) {
            console.warn('Final save failed during logout:', e);
        }
        try {
            const response = await fetch('/api/auth/logout', { method: 'POST' });
            const data = await response.json();
            localStorage.removeItem('currentUser');
            window.location.href = 'login page.html';
        } catch (err) {
            console.warn('Logout server error, falling back to local logout:', err);
            localStorage.removeItem('currentUser');
            window.location.href = 'login page.html';
        }
    }

    // 4. Inject Unified Sidebar Navigation
    function injectSidebar() {
        const sidebar = document.createElement('div');
        sidebar.className = 'nav-helper-container no-print';
        
        sidebar.innerHTML = `
            <button class="nav-helper-btn" id="helper-btn-save" data-tooltip="Save Resume">
                <i class="fas fa-save"></i>
            </button>
            <button class="nav-helper-btn" id="helper-btn-pdf" data-tooltip="Download PDF">
                <i class="fas fa-download"></i>
            </button>
            <button class="nav-helper-btn" id="helper-btn-home" data-tooltip="Select Template">
                <i class="fas fa-home"></i>
            </button>
            <button class="nav-helper-btn" id="helper-btn-logout" data-tooltip="Logout">
                <i class="fas fa-sign-out-alt"></i>
            </button>
        `;

        document.body.appendChild(sidebar);

        // Bind events
        document.getElementById('helper-btn-save').addEventListener('click', saveResume);
        document.getElementById('helper-btn-pdf').addEventListener('click', downloadPDF);
        document.getElementById('helper-btn-home').addEventListener('click', goHome);
        document.getElementById('helper-btn-logout').addEventListener('click', logoutUser);
    }

    // Toast Notification System
    function showToast(message, type = 'success') {
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                font-family: Arial, sans-serif;
            `;
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.style.cssText = `
            background: ${type === 'success' ? '#2ec4b6' : '#e71d36'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        toast.textContent = message;
        toastContainer.appendChild(toast);

        // Trigger slide in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);

        // Slide out and remove
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // Debounce helper
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Auto-save logic
    const debouncedAutoSave = debounce(async () => {
        console.log('[Resume Spark Helper] Auto-saving...');
        const resumeRoot = document.getElementById('resume');
        if (!resumeRoot) return;

        const htmlContent = resumeRoot.innerHTML;
        try {
            const response = await fetch('/api/resumes/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    templateId,
                    htmlContent
                })
            });
            const data = await response.json();
            if (data.success) {
                console.log('[Resume Spark Helper] Auto-save complete.');
            }
        } catch (err) {
            console.warn('[Resume Spark Helper] Auto-save fetch failed, using local storage:', err);
            try {
                let currentUsername = 'guest';
                const localUser = localStorage.getItem('currentUser');
                if (localUser) {
                    const parsed = JSON.parse(localUser);
                    if (parsed && parsed.username) {
                        currentUsername = parsed.username.toLowerCase();
                    }
                }
                localStorage.setItem('resume_' + currentUsername + '_' + templateId, htmlContent);
            } catch (lsErr) {
                console.error('LocalStorage auto-save failed:', lsErr);
            }
        }
    }, 2500);

    // Responsive scaling check for mobile / tablet
    function adjustResumeScale() {
        const resumeRoot = document.getElementById('resume');
        if (!resumeRoot) return;

        if (window.matchMedia('print').matches) {
            resumeRoot.style.transform = 'none';
            resumeRoot.style.transformOrigin = 'initial';
            resumeRoot.style.marginBottom = '0';
            return;
        }

        const viewportWidth = window.innerWidth;
        
        // Reset transform to measure actual width
        resumeRoot.style.transform = 'none';
        resumeRoot.style.transformOrigin = 'initial';
        resumeRoot.style.marginBottom = '0';

        let targetWidth = resumeRoot.offsetWidth;
        if (targetWidth === 0 || targetWidth > 1200) {
            targetWidth = 800; // default template width fallback
        }

        if (viewportWidth < (targetWidth + 40)) {
            const scaleFactor = (viewportWidth - 20) / targetWidth;
            resumeRoot.style.transform = `scale(${scaleFactor})`;
            resumeRoot.style.transformOrigin = 'top center';
            
            // Reclaim bottom gap space
            const naturalHeight = resumeRoot.offsetHeight;
            const scaledHeight = naturalHeight * scaleFactor;
            const heightDiff = naturalHeight - scaledHeight;
            resumeRoot.style.marginBottom = `-${heightDiff}px`;
        } else {
            resumeRoot.style.transform = 'none';
            resumeRoot.style.transformOrigin = 'initial';
            resumeRoot.style.marginBottom = '40px';
        }
    }

    // 5. Initialize helper on load
    document.addEventListener('DOMContentLoaded', async () => {
        // Load save data first, then inject sidebar
        await loadSavedResume();
        injectSidebar();

        // Setup scaling
        adjustResumeScale();
        window.addEventListener('resize', adjustResumeScale);

        // Setup Auto-save listeners
        const resumeRoot = document.getElementById('resume');
        if (resumeRoot) {
            const handleUpdate = () => {
                debouncedAutoSave();
            };

            resumeRoot.addEventListener('input', handleUpdate);
            resumeRoot.addEventListener('change', handleUpdate);
            resumeRoot.addEventListener('blur', handleUpdate, true);

            // Observe programmatic changes (e.g. add/remove buttons modifying DOM)
            const observer = new MutationObserver(handleUpdate);
            observer.observe(resumeRoot, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }
    });
})();
