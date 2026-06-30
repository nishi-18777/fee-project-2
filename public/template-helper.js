// Template Helper JS - Dynamic Navbar Injection, Database Persistence & PDF Printing

(function() {
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
            }
        } catch (err) {
            console.error('[Resume Spark Helper] Failed to load resume:', err);
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
            console.error('[Resume Spark Helper] Save error:', err);
            showToast('Network error while saving resume.', 'error');
        }
    }

    function downloadPDF() {
        // Trigger standard high-fidelity browser print
        window.print();
    }

    function goHome() {
        window.location.href = '/templates.html';
    }

    async function logoutUser() {
        try {
            const response = await fetch('/api/auth/logout', { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                window.location.href = '/login page.html';
            } else {
                alert('Logout failed: ' + data.message);
            }
        } catch (err) {
            console.error('Logout error:', err);
            window.location.href = '/login page.html';
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

    // 5. Initialize helper on load
    document.addEventListener('DOMContentLoaded', async () => {
        // Load save data first, then inject sidebar
        await loadSavedResume();
        injectSidebar();
    });
})();
