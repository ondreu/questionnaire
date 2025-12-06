// Global variables
let currentLanguage = 'en';
let translations = {};
let config = {};
let formData = {};
let autoSaveInterval;

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
            document.getElementById('footer-email').textContent = `📧 ${config.EMAIL}`;
            document.getElementById('modal-email').textContent = `📧 ${config.EMAIL}`;
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
            saveFormData();
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
            saveFormData();
        });

        cableSuppliedNo.addEventListener('change', function() {
            if (this.checked) {
                cableSuppliedYes.checked = false;
                cableMaterialGroup.classList.add('visible');
                cableSectionGroup.classList.add('visible');
            }
            saveFormData();
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
            saveFormData();
            updateProgress();
        });
        element.addEventListener('change', () => {
            saveFormData();
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
        saveFormData();
    }, 30000); // Auto-save every 30 seconds
}

// Save form data to localStorage
function saveFormData() {
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
    showSaveIndicator();
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
    const allInputs = document.querySelectorAll('input:not([type="checkbox"]), textarea, select');
    const filledInputs = Array.from(allInputs).filter(input => input.value.trim() !== '');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const checkedBoxes = Array.from(checkboxes).filter(cb => cb.checked);

    const totalFields = allInputs.length + checkboxes.length;
    const filledFields = filledInputs.length + checkedBoxes.length;

    const progress = totalFields > 0 ? (filledFields / totalFields) * 100 : 0;

    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('progress-percent').textContent = `${Math.round(progress)}%`;
}

// Generate PDF
async function generatePDF() {
    // Show loading overlay
    document.getElementById('loadingOverlay').classList.add('active');

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let yPos = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - (2 * margin);

        // Add logo
        try {
            const logoImg = document.getElementById('logo');
            if (logoImg && logoImg.complete) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = logoImg.naturalWidth;
                canvas.height = logoImg.naturalHeight;
                ctx.drawImage(logoImg, 0, 0);
                const logoData = canvas.toDataURL('image/png');
                doc.addImage(logoData, 'PNG', margin, yPos, 40, 15);
            }
        } catch (error) {
            console.error('Error adding logo:', error);
        }

        // Title
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        const title = translations[currentLanguage]?.pageTitle || 'Engineering Questionnaire';
        doc.text(title, pageWidth / 2, yPos + 10, { align: 'center' });

        yPos += 30;

        // Helper function to add section
        const addSection = (sectionTitle, fields) => {
            // Check if we need a new page
            if (yPos > pageHeight - 40) {
                doc.addPage();
                yPos = 20;
            }

            // Section title
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(220, 15, 57); // Catppuccin Latte Red
            doc.text(sectionTitle, margin, yPos);
            yPos += 8;

            // Reset color
            doc.setTextColor(76, 79, 105); // Catppuccin Latte Text
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');

            // Add fields
            fields.forEach(field => {
                if (yPos > pageHeight - 20) {
                    doc.addPage();
                    yPos = 20;
                }

                if (field.value) {
                    const text = `${field.label}: ${field.value}`;
                    const lines = doc.splitTextToSize(text, contentWidth);
                    doc.text(lines, margin, yPos);
                    yPos += lines.length * 5 + 2;
                }
            });

            yPos += 5;
        };

        // Helper function to get field value
        const getFieldValue = (name) => {
            const element = document.querySelector(`[name="${name}"]`);
            if (!element) return '';

            if (element.type === 'checkbox') {
                return element.checked ? '✓' : '';
            }
            return element.value || '';
        };

        // Helper function to get translation
        const t = (key) => {
            return getNestedTranslation(translations[currentLanguage], key) || key;
        };

        // Header Section
        const headerFields = [
            { label: t('header.customer'), value: getFieldValue('customer') },
            { label: t('header.technicalContact'), value: getFieldValue('technicalContact') },
            { label: t('header.businessContact'), value: getFieldValue('businessContact') },
            { label: t('header.emailPhone'), value: getFieldValue('emailPhone') },
            { label: t('header.date'), value: getFieldValue('date') },
            { label: t('header.projectName'), value: getFieldValue('projectName') },
            { label: t('header.projectCode'), value: getFieldValue('projectCode') }
        ];
        addSection(t('header.title'), headerFields);

        // Section 1
        const section1Fields = [
            { label: t('section1.ipRating'), value: getFieldValue('ipRatingNone') ? t('section1.ipRatingNone') : getFieldValue('ipRatingOther') },
            { label: t('section1.pollution'), value: [
                getFieldValue('pollutionClean') ? t('section1.pollutionClean') : '',
                getFieldValue('pollutionLight') ? t('section1.pollutionLight') : '',
                getFieldValue('pollutionMedium') ? t('section1.pollutionMedium') : '',
                getFieldValue('pollutionHigh') ? t('section1.pollutionHigh') : '',
                getFieldValue('pollutionOther')
            ].filter(v => v).join(', ') },
            { label: t('section1.temperature'), value: `${getFieldValue('tempMin')} - ${getFieldValue('tempMax')}` },
            { label: t('section1.altitude'), value: getFieldValue('altitudeValue') || (getFieldValue('altitudeStandard') ? t('section1.altitudeStandard') : '') }
        ];
        addSection(t('section1.title'), section1Fields);

        // Add tables
        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 20;
        }

        // Loads table
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(t('section4.loadsSubtitle'), margin, yPos);
        yPos += 8;

        const loadsData = [];
        const loadsRows = document.querySelectorAll('#loadsTableBody tr');
        loadsRows.forEach((row, index) => {
            const inputs = row.querySelectorAll('input');
            const rowData = Array.from(inputs).map(input => input.value);
            if (rowData.some(val => val.trim() !== '')) {
                loadsData.push([index + 1, ...rowData]);
            }
        });

        if (loadsData.length > 0) {
            doc.autoTable({
                startY: yPos,
                head: [[
                    t('section4.loadsTable.number'),
                    t('section4.loadsTable.name'),
                    t('section4.loadsTable.type'),
                    t('section4.loadsTable.voltage'),
                    t('section4.loadsTable.current'),
                    t('section4.loadsTable.protection'),
                    t('section4.loadsTable.control'),
                    t('section4.loadsTable.cableLength')
                ]],
                body: loadsData,
                theme: 'grid',
                headStyles: { fillColor: [220, 15, 57] },
                margin: { left: margin, right: margin }
            });
            yPos = doc.lastAutoTable.finalY + 10;
        }

        // I/O table
        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(t('section4.ioSubtitle'), margin, yPos);
        yPos += 8;

        const ioData = [];
        const ioRows = document.querySelectorAll('#ioTableBody tr');
        ioRows.forEach((row, index) => {
            const inputs = row.querySelectorAll('input');
            const rowData = Array.from(inputs).map(input => input.value);
            if (rowData.some(val => val.trim() !== '')) {
                ioData.push([index + 1, ...rowData]);
            }
        });

        if (ioData.length > 0) {
            doc.autoTable({
                startY: yPos,
                head: [[
                    t('section4.ioTable.number'),
                    t('section4.ioTable.name'),
                    t('section4.ioTable.io'),
                    t('section4.ioTable.ad'),
                    t('section4.ioTable.type'),
                    t('section4.ioTable.notes')
                ]],
                body: ioData,
                theme: 'grid',
                headStyles: { fillColor: [220, 15, 57] },
                margin: { left: margin, right: margin }
            });
            yPos = doc.lastAutoTable.finalY + 10;
        }

        // Footer on last page
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(100);
            doc.text(
                `${config.EMAIL || 'sales@schaltag.cz'} | ${config.PHONE || '+420 465 552 600'} | Page ${i}/${totalPages}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
        }

        // Save PDF
        const fileName = `Engineering_Questionnaire_${getFieldValue('customer') || 'Form'}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);

        // Hide loading overlay
        setTimeout(() => {
            document.getElementById('loadingOverlay').classList.remove('active');
            document.getElementById('successModal').classList.add('active');
        }, 500);

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
        document.getElementById('loadingOverlay').classList.remove('active');
    }
}
