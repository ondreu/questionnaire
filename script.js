// Global variables
let currentLanguage = 'en';
let translations = {};
let config = {};
let formData = {};
let autoSaveInterval;
let saveDebounceTimer;
let lastSaveTime = 0;

// Initialize app on DOM load
document.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();
    await loadTranslations();
    initializeLanguage();
    initializeTheme();
    initializeForm();
    initializeTables();
    initializeEventListeners();
    loadFormData();
    startAutoSave();
    updateProgress();
});

// Load configuration from config.txt
async function loadConfig() {
    try {
        const response = await fetch('config.txt');
        const text = await response.text();
        const lines = text.split('\n');

        lines.forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                config[key.trim()] = valueParts.join('=').trim();
            }
        });

        // Update contact information in footer and modal
        if (config.EMAIL) {
            const footerEmail = document.getElementById('footer-email');
            const modalEmail = document.getElementById('modal-email');
            footerEmail.textContent = config.EMAIL;
            footerEmail.href = `mailto:${config.EMAIL}`;
            modalEmail.textContent = config.EMAIL;
            modalEmail.href = `mailto:${config.EMAIL}`;
        }
        if (config.PHONE) {
            document.getElementById('footer-phone').textContent = `📞 ${config.PHONE}`;
            document.getElementById('modal-phone').textContent = `📞 ${config.PHONE}`;
        }
        if (config.ADDRESS) {
            document.getElementById('footer-address').textContent = `📍 ${config.ADDRESS}`;
            document.getElementById('modal-address').textContent = `📍 ${config.ADDRESS}`;
        }
        if (config.DEFAULT_LANGUAGE) {
            currentLanguage = config.DEFAULT_LANGUAGE;
        }
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

// Load translation files
async function loadTranslations() {
    const languages = ['en', 'de', 'cz', 'fr'];

    for (const lang of languages) {
        try {
            const response = await fetch(`translations/${lang}.json`);
            translations[lang] = await response.json();
        } catch (error) {
            console.error(`Error loading ${lang} translations:`, error);
        }
    }
}

// Initialize language
function initializeLanguage() {
    setLanguage(currentLanguage);

    // Set active language button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLanguage);
    });
}

// Set language
function setLanguage(lang) {
    currentLanguage = lang;
    const t = translations[lang];

    if (!t) return;

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getNestedTranslation(t, key);

        if (translation) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        }
    });

    // Update page title
    document.title = t.pageTitle + ' - Schaltag';

    // Update active language button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

// Get nested translation
function getNestedTranslation(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Initialize theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

// Toggle theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Initialize form
function initializeForm() {
    // Set default date to today
    const dateInput = document.querySelector('input[name="date"]');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
}

// Initialize tables
function initializeTables() {
    // Initialize loads table
    const loadsTableBody = document.getElementById('loadsTableBody');
    for (let i = 0; i < 5; i++) {
        addTableRow('loads', i);
    }

    // Initialize I/O table
    const ioTableBody = document.getElementById('ioTableBody');
    for (let i = 0; i < 5; i++) {
        addTableRow('io', i);
    }
}

// Add table row
function addTableRow(tableType, index) {
    const tbody = tableType === 'loads' ? document.getElementById('loadsTableBody') : document.getElementById('ioTableBody');
    const row = document.createElement('tr');
    row.dataset.index = index;

    if (tableType === 'loads') {
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><input type="text" name="loads_${index}_name" data-table="loads" data-index="${index}"></td>
            <td><input type="text" name="loads_${index}_type" data-table="loads" data-index="${index}"></td>
            <td><input type="text" name="loads_${index}_voltage" data-table="loads" data-index="${index}"></td>
            <td><input type="text" name="loads_${index}_current" data-table="loads" data-index="${index}"></td>
            <td><input type="text" name="loads_${index}_protection" data-table="loads" data-index="${index}"></td>
            <td><input type="text" name="loads_${index}_control" data-table="loads" data-index="${index}"></td>
            <td><input type="text" name="loads_${index}_cableLength" data-table="loads" data-index="${index}"></td>
        `;
    } else {
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><input type="text" name="io_${index}_name" data-table="io" data-index="${index}"></td>
            <td><input type="text" name="io_${index}_io" data-table="io" data-index="${index}"></td>
            <td><input type="text" name="io_${index}_ad" data-table="io" data-index="${index}"></td>
            <td><input type="text" name="io_${index}_type" data-table="io" data-index="${index}"></td>
            <td><input type="text" name="io_${index}_notes" data-table="io" data-index="${index}"></td>
        `;
    }

    tbody.appendChild(row);

    // Add event listeners to inputs for auto-save and row addition
    row.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            debouncedSave();
            updateProgress();
            checkAndAddTableRow(tableType);
        });
    });
}

// Check if we need to add a new table row
function checkAndAddTableRow(tableType) {
    const tbody = tableType === 'loads' ? document.getElementById('loadsTableBody') : document.getElementById('ioTableBody');
    const rows = tbody.querySelectorAll('tr');
    const lastRow = rows[rows.length - 1];

    // Check if last row has any filled input
    const inputs = lastRow.querySelectorAll('input');
    const hasValue = Array.from(inputs).some(input => input.value.trim() !== '');

    if (hasValue) {
        const newIndex = rows.length;
        addTableRow(tableType, newIndex);
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Language selector
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
        });
    });

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    // Conditional field for cable supply
    const cableSuppliedYes = document.getElementById('cableSuppliedYes');
    const cableSuppliedNo = document.getElementById('cableSuppliedNo');
    const cableMaterialGroup = document.getElementById('cableMaterialGroup');
    const cableSectionGroup = document.getElementById('cableSectionGroup');

    if (cableSuppliedYes && cableSuppliedNo) {
        cableSuppliedYes.addEventListener('change', function() {
            if (this.checked) {
                cableSuppliedNo.checked = false;
                cableMaterialGroup.classList.remove('visible');
                cableSectionGroup.classList.remove('visible');
            }
            debouncedSave();
        });

        cableSuppliedNo.addEventListener('change', function() {
            if (this.checked) {
                cableSuppliedYes.checked = false;
                cableMaterialGroup.classList.add('visible');
                cableSectionGroup.classList.add('visible');
            }
            debouncedSave();
        });
    }

    // Download PDF button
    document.getElementById('downloadPDF').addEventListener('click', generatePDF);

    // Close modal
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('successModal').classList.remove('active');
    });

    // Form change listeners for auto-save and progress
    document.querySelectorAll('input, textarea, select').forEach(element => {
        element.addEventListener('input', () => {
            debouncedSave();
            updateProgress();
        });
        element.addEventListener('change', () => {
            debouncedSave();
            updateProgress();
        });
    });

    // Warn before leaving with unsaved changes
    window.addEventListener('beforeunload', (e) => {
        const hasData = Object.keys(formData).length > 0;
        if (hasData) {
            e.preventDefault();
            e.returnValue = translations[currentLanguage]?.confirmLeave || 'You have unsaved changes. Are you sure you want to leave?';
        }
    });
}

// Start auto-save
function startAutoSave() {
    autoSaveInterval = setInterval(() => {
        saveFormData(true); // Show indicator only for interval saves
    }, 30000); // Auto-save every 30 seconds
}

// Save form data to localStorage
function saveFormData(showIndicator = false) {
    formData = {};

    // Save all inputs, textareas, and selects
    document.querySelectorAll('input, textarea, select').forEach(element => {
        if (element.name) {
            if (element.type === 'checkbox') {
                formData[element.name] = element.checked;
            } else {
                formData[element.name] = element.value;
            }
        }
    });

    localStorage.setItem('questionnaireData', JSON.stringify(formData));

    // Only show indicator if explicitly requested and enough time has passed
    if (showIndicator) {
        const now = Date.now();
        if (now - lastSaveTime > 5000) { // At least 5 seconds between toasts
            showSaveIndicator();
            lastSaveTime = now;
        }
    }
}

// Debounced save function
function debouncedSave() {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(() => {
        saveFormData(false); // Save without showing indicator
    }, 1000);
}

// Load form data from localStorage
function loadFormData() {
    const savedData = localStorage.getItem('questionnaireData');
    if (savedData) {
        formData = JSON.parse(savedData);

        // Restore form values
        Object.keys(formData).forEach(name => {
            const element = document.querySelector(`[name="${name}"]`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = formData[name];
                } else {
                    element.value = formData[name];
                }
            }
        });

        // Check conditional fields
        const cableSuppliedNo = document.getElementById('cableSuppliedNo');
        if (cableSuppliedNo && cableSuppliedNo.checked) {
            document.getElementById('cableMaterialGroup').classList.add('visible');
            document.getElementById('cableSectionGroup').classList.add('visible');
        }
    }
}

// Show save indicator
function showSaveIndicator() {
    let indicator = document.querySelector('.save-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'save-indicator';
        indicator.textContent = translations[currentLanguage]?.saveProgress || 'Auto-saved';
        document.body.appendChild(indicator);
    }

    indicator.classList.add('show');
    setTimeout(() => {
        indicator.classList.remove('show');
    }, 2000);
}

// Update progress bar
function updateProgress() {
    // Progress bar removed - function kept for compatibility
    return;
}


// Generate PDF
async function generatePDF() {
    document.getElementById('loadingOverlay').classList.add('active');
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let yPos = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - (2 * margin);

        // Add logo with aspect ratio
        try {
            const logoImg = document.getElementById('logo');
            if (logoImg && logoImg.complete) {
                const canvas = document.createElement('canvas');
                canvas.width = logoImg.naturalWidth;
                canvas.height = logoImg.naturalHeight;
                canvas.getContext('2d').drawImage(logoImg, 0, 0);
                const logoWidth = 40;
                const logoHeight = logoWidth * (logoImg.naturalHeight / logoImg.naturalWidth);
                doc.addImage(canvas.toDataURL('image/png'), 'PNG', margin, yPos, logoWidth, logoHeight);
            }
        } catch (error) {}

        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(translations[currentLanguage]?.pageTitle || 'Engineering Questionnaire', pageWidth / 2, yPos + 10, { align: 'center' });
        yPos += 30;

        const t = (key) => getNestedTranslation(translations[currentLanguage], key) || key;
        const getVal = (name) => {
            const el = document.querySelector(`[name="${name}"]`);
            return el ? (el.type === 'checkbox' ? (el.checked ? '✓' : '') : el.value || '') : '';
        };

        const addSec = (title, fields) => {
            if (yPos > pageHeight - 40) { doc.addPage(); yPos = 20; }
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(220, 15, 57);
            doc.text(title, margin, yPos);
            yPos += 8;
            doc.setTextColor(76, 79, 105);
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            fields.forEach(f => {
                if (yPos > pageHeight - 20) { doc.addPage(); yPos = 20; }
                if (f.value && f.value.trim()) {
                    const label = f.label.endsWith(':') ? f.label.slice(0, -1) : f.label;
                    doc.text(doc.splitTextToSize(`${label}: ${f.value}`, contentWidth), margin, yPos);
                    yPos += 7;
                }
            });
            yPos += 5;
        };

        addSec(t('header.title'), [
            { label: t('header.customer'), value: getVal('customer') },
            { label: t('header.date'), value: getVal('date') },
            { label: t('header.projectName'), value: getVal('projectName') }
        ]);

        addSec(t('section1.title'), [
            { label: t('section1.ipRating'), value: getVal('ipRatingOther') },
            { label: t('section1.temperature'), value: `${getVal('tempMin')} - ${getVal('tempMax')}` }
        ]);

        addSec(t('section9.title'), [
            { label: t('section9.specialRequirements'), value: getVal('specialRequirements') }
        ]);

        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(`${config.EMAIL || 'sales@schaltag.cz'} | Page ${i}/${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }

        doc.save(`Questionnaire_${getVal('customer') || 'Form'}_${new Date().toISOString().split('T')[0]}.pdf`);
        setTimeout(() => {
            document.getElementById('loadingOverlay').classList.remove('active');
            document.getElementById('successModal').classList.add('active');
        }, 500);
    } catch (error) {
        console.error('PDF error:', error);
        alert('Error generating PDF');
        document.getElementById('loadingOverlay').classList.remove('active');
    }
}
