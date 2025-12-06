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


// Generate PDF using HTML print
async function generatePDF() {
    document.getElementById('loadingOverlay').classList.add('active');

    try {
        // Helper function to generate complete questionnaire in specific language
        const generateQuestionnaireHTML = (lang) => {
            const t = (key) => getNestedTranslation(translations[lang], key) || key;
            const getVal = (name) => {
                const el = document.querySelector(`[name="${name}"]`);
                if (!el) return '';
                if (el.type === 'checkbox') return el.checked ? '✓' : '';
                return el.value || '';
            };

            // Collect all form fields with their labels
            return `
    <div class="questionnaire-page">
        <div class="header">
            <img src="${document.getElementById('logo')?.src || ''}" class="logo" alt="Logo">
            <h1>${t('pageTitle')}</h1>
            <p><strong>${new Date().toLocaleDateString()}</strong></p>
        </div>

        <h2>${t('header.title')}</h2>
        <div class="field"><span class="field-label">${t('header.customer')}</span><span class="field-value">${getVal('customer') || '-'}</span></div>
        <div class="field"><span class="field-label">${t('header.technicalContact')}</span><span class="field-value">${getVal('technicalContact') || '-'}</span></div>
        <div class="field"><span class="field-label">${t('header.businessContact')}</span><span class="field-value">${getVal('businessContact') || '-'}</span></div>
        <div class="field"><span class="field-label">${t('header.emailPhone')}</span><span class="field-value">${getVal('emailPhone') || '-'}</span></div>
        <div class="field"><span class="field-label">${t('header.date')}</span><span class="field-value">${getVal('date') || '-'}</span></div>
        <div class="field"><span class="field-label">${t('header.projectName')}</span><span class="field-value">${getVal('projectName') || '-'}</span></div>
        <div class="field"><span class="field-label">${t('header.projectCode')}</span><span class="field-value">${getVal('projectCode') || '-'}</span></div>

        <h2>${t('section1.title')}</h2>
        <div class="field"><span class="field-label">${t('section1.ipRating')}</span><span class="field-value">${getVal('ipRatingNone') ? t('section1.ipRatingNone') : (getVal('ipRatingOther') || '-')}</span></div>
        <div class="field"><span class="field-label">${t('section1.temperature')}</span><span class="field-value">${getVal('tempStandard') ? t('section1.tempStandard') : ((getVal('tempMin') || getVal('tempMax')) ? `${getVal('tempMin') || '-'} to ${getVal('tempMax') || '-'} °C` : '-')}</span></div>
        <div class="field"><span class="field-label">${t('section1.altitude')}</span><span class="field-value">${getVal('altitudeStandard') ? t('section1.altitudeStandard') : (getVal('altitudeValue') ? getVal('altitudeValue') + ' m a.s.l.' : '-')}</span></div>

        <h2>${t('section2.title')}</h2>
        <div class="field"><span class="field-label">${t('section2.voltage')}</span><span class="field-value">${[
            getVal('voltage230') && t('section2.voltage230'),
            getVal('voltage400') && t('section2.voltage400'),
            getVal('voltage480') && t('section2.voltage480'),
            getVal('voltageDC') && `${t('section2.voltageDC')} ${getVal('voltageDC')} V`
        ].filter(Boolean).join(', ') || '-'}</span></div>
        <div class="field"><span class="field-label">${t('section2.fuse')}</span><span class="field-value">${getVal('fuseValue') ? getVal('fuseValue') + ' A' : '-'}</span></div>
        <div class="field"><span class="field-label">${t('section2.shortCircuit')}</span><span class="field-value">${getVal('shortCircuitValue') ? getVal('shortCircuitValue') + ' kA' : '-'}</span></div>
        <div class="field"><span class="field-label">${t('section2.cableLength')}</span><span class="field-value">${getVal('cableLengthValue') ? getVal('cableLengthValue') + ' m' : '-'}</span></div>
        <div class="field"><span class="field-label">${t('section2.networkType')}</span><span class="field-value">${[
            getVal('networkTNS') && t('section2.networkTNS'),
            getVal('networkTNC') && t('section2.networkTNC'),
            getVal('networkTT') && t('section2.networkTT'),
            getVal('networkIT') && t('section2.networkIT'),
            getVal('networkOther') && getVal('networkOther')
        ].filter(Boolean).join(', ') || '-'}</span></div>

        <h2>${t('section3.title')}</h2>
        <div class="field"><span class="field-label">${t('section3.standard')}</span><span class="field-value">${[
            getVal('standardCE') && t('section3.standardCE'),
            getVal('standardUL') && t('section3.standardUL'),
            getVal('standardNone') && t('section3.standardNone')
        ].filter(Boolean).join(', ') || '-'}</span></div>
        <div class="field"><span class="field-label">${t('section3.safety')}</span><span class="field-value">${
            getVal('safetyNo') ? t('section3.safetyNo') : [
                getVal('safetySIL') && `${t('section3.safetySIL')} ${getVal('safetySIL')}`,
                getVal('safetyPLr') && `${t('section3.safetyPLr')} ${getVal('safetyPLr')}`
            ].filter(Boolean).join(', ') || '-'
        }</span></div>
        <div class="field"><span class="field-label">${t('section3.installation')}</span><span class="field-value">${[
            getVal('installationFloor') && t('section3.installationFloor'),
            getVal('installationWall') && t('section3.installationWall'),
            getVal('installationOther') && getVal('installationOther')
        ].filter(Boolean).join(', ') || '-'}</span></div>

        <h2>${t('section4.title')}</h2>
        ${(() => {
            const loads = [];
            document.querySelectorAll('#loadsTableBody tr').forEach((row, idx) => {
                const inputs = row.querySelectorAll('input');
                if (inputs.length > 0 && Array.from(inputs).some(i => i.value.trim())) {
                    loads.push({
                        num: idx + 1,
                        name: inputs[0]?.value || '',
                        type: inputs[1]?.value || '',
                        voltage: inputs[2]?.value || '',
                        current: inputs[3]?.value || '',
                        protection: inputs[4]?.value || '',
                        control: inputs[5]?.value || '',
                        cableLength: inputs[6]?.value || ''
                    });
                }
            });

            const ios = [];
            document.querySelectorAll('#ioTableBody tr').forEach((row, idx) => {
                const inputs = row.querySelectorAll('input');
                if (inputs.length > 0 && Array.from(inputs).some(i => i.value.trim())) {
                    ios.push({
                        num: idx + 1,
                        name: inputs[0]?.value || '',
                        io: inputs[1]?.value || '',
                        ad: inputs[2]?.value || '',
                        type: inputs[3]?.value || '',
                        notes: inputs[4]?.value || ''
                    });
                }
            });

            return `
                ${loads.length > 0 ? `
                <h3>${t('section4.loadsSubtitle')}</h3>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>${t('section4.loadsTable.name')}</th>
                            <th>${t('section4.loadsTable.type')}</th>
                            <th>${t('section4.loadsTable.voltage')}</th>
                            <th>${t('section4.loadsTable.current')}</th>
                            <th>${t('section4.loadsTable.protection')}</th>
                            <th>${t('section4.loadsTable.control')}</th>
                            <th>${t('section4.loadsTable.cableLength')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${loads.map(l => `<tr><td>${l.num}</td><td>${l.name}</td><td>${l.type}</td><td>${l.voltage}</td><td>${l.current}</td><td>${l.protection}</td><td>${l.control}</td><td>${l.cableLength}</td></tr>`).join('')}
                    </tbody>
                </table>` : ''}

                ${ios.length > 0 ? `
                <h3>${t('section4.ioSubtitle')}</h3>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>${t('section4.ioTable.name')}</th>
                            <th>${t('section4.ioTable.io')}</th>
                            <th>${t('section4.ioTable.ad')}</th>
                            <th>${t('section4.ioTable.type')}</th>
                            <th>${t('section4.ioTable.notes')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ios.map(i => `<tr><td>${i.num}</td><td>${i.name}</td><td>${i.io}</td><td>${i.ad}</td><td>${i.type}</td><td>${i.notes}</td></tr>`).join('')}
                    </tbody>
                </table>` : ''}
            `;
        })()}

        <h2>${t('section5.title')}</h2>
        <div class="field"><span class="field-label">${t('section5.fieldbus')}</span><span class="field-value">${[
            getVal('fieldbusEthernetIP') && t('section5.fieldbusEthernetIP'),
            getVal('fieldbusProfinetIO') && t('section5.fieldbusProfinetIO'),
            getVal('fieldbusModbusTCP') && t('section5.fieldbusModbusTCP'),
            getVal('fieldbusEtherCAT') && t('section5.fieldbusEtherCAT'),
            getVal('fieldbusNone') && t('section5.fieldbusNone'),
            getVal('fieldbusOther') && getVal('fieldbusOther')
        ].filter(Boolean).join(', ') || '-'}</span></div>
        <div class="field"><span class="field-label">${t('section5.switch')}</span><span class="field-value">${
            getVal('switchYes') ? `${t('section5.switchYes')} ${getVal('switchYes')}` :
            (getVal('switchNo') ? t('section5.switchNo') : (getVal('switchNone') ? t('section5.switchNone') : '-'))
        }</span></div>

        <h2>${t('section6.title')}</h2>
        <div class="field"><span class="field-label">${t('section6.panelType')}</span><span class="field-value">${[
            getVal('panelTouch') && `${t('section6.panelTouch')} ${getVal('panelTouch')} inches`,
            getVal('panelButton') && t('section6.panelButton'),
            getVal('panelCombination') && t('section6.panelCombination'),
            getVal('panelExternal') && t('section6.panelExternal'),
            getVal('panelNone') && t('section6.panelNone'),
            getVal('panelOther') && getVal('panelOther')
        ].filter(Boolean).join(', ') || '-'}</span></div>
        <div class="field"><span class="field-label">${t('section6.location')}</span><span class="field-value">${[
            getVal('locationDoor') && t('section6.locationDoor'),
            getVal('locationSeparate') && `${t('section6.locationSeparate')} ${getVal('locationSeparate')} m`,
            getVal('locationNone') && t('section6.locationNone')
        ].filter(Boolean).join(', ') || '-'}</span></div>
        <div class="field"><span class="field-label">${t('section6.language')}</span><span class="field-value">${[
            getVal('languageCZ') && t('section6.languageCZ'),
            getVal('languageEN') && t('section6.languageEN'),
            getVal('languageDE') && t('section6.languageDE'),
            getVal('languageSymbols') && t('section6.languageSymbols'),
            getVal('languageMultiple') && getVal('languageMultiple'),
            getVal('languageOther') && getVal('languageOther')
        ].filter(Boolean).join(', ') || '-'}</span></div>

        <h2>${t('section7.title')}</h2>
        <div class="field"><span class="field-label">${t('section7.dimensions')}</span><span class="field-value">${
            (getVal('heightNone') && getVal('widthNone') && getVal('depthNone')) ? t('section7.heightNone') :
            `H: ${getVal('height') || '-'} mm, W: ${getVal('width') || '-'} mm, D: ${getVal('depth') || '-'} mm`
        }</span></div>
        <div class="field"><span class="field-label">${t('section7.color')}</span><span class="field-value">${[
            getVal('colorRAL7035') && t('section7.colorRAL7035'),
            getVal('colorRAL7032') && t('section7.colorRAL7032'),
            getVal('colorOther') && `${t('section7.colorOther')} ${getVal('colorOther')}`,
            getVal('colorNone') && t('section7.colorNone')
        ].filter(Boolean).join(', ') || '-'}</span></div>
        <div class="field"><span class="field-label">${t('section7.doorType')}</span><span class="field-value">${[
            getVal('doorSingle') && t('section7.doorSingle'),
            getVal('doorDouble') && t('section7.doorDouble')
        ].filter(Boolean).join(', ') || '-'}</span></div>
        <div class="field"><span class="field-label">${t('section7.lock')}</span><span class="field-value">${[
            getVal('lockStandard') && t('section7.lockStandard'),
            getVal('lockNo') && t('section7.lockNo'),
            getVal('lockOther') && getVal('lockOther')
        ].filter(Boolean).join(', ') || '-'}</span></div>

        <h2>${t('section8.title')}</h2>
        <div class="field"><span class="field-label">${t('section8.plcBrand')}</span><span class="field-value">${[
            getVal('plcSiemens') && t('section8.plcSiemens'),
            getVal('plcRockwell') && t('section8.plcRockwell'),
            getVal('plcSchneider') && t('section8.plcSchneider'),
            getVal('plcOmron') && t('section8.plcOmron'),
            getVal('plcNone') && t('section8.plcNone'),
            getVal('plcOther') && getVal('plcOther')
        ].filter(Boolean).join(', ') || '-'}</span></div>

        ${getVal('specialRequirements') ? `
        <h2>${t('section9.title')}</h2>
        <div class="field"><span class="field-label">${t('section9.specialRequirements')}</span></div>
        <div style="margin-top:10px; white-space: pre-wrap;">${getVal('specialRequirements')}</div>` : ''}

        <div class="footer">
            <p>${config.EMAIL || 'sales@schaltag.cz'} | ${config.PHONE || '+420 465 552 600'}</p>
            <p>${config.ADDRESS || 'Moravská 1571, CZ - 562 01, Ústí nad Orlicí'}</p>
        </div>
    </div>`;
        };

        // Generate TWO questionnaires - selected language + Czech
        const questionnaire1 = generateQuestionnaireHTML(currentLanguage);
        const questionnaire2 = currentLanguage !== 'cz' ? generateQuestionnaireHTML('cz') : '';

        // Combine into single HTML
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Engineering Questionnaire</title>
    <style>
        @page { margin: 2cm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 10pt; line-height: 1.4; color: #333; }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #d20f39; }
        .logo { max-width: 150px; margin-bottom: 10px; }
        h1 { color: #d20f39; font-size: 18pt; margin-bottom: 10px; }
        h2 { color: #d20f39; font-size: 12pt; margin: 20px 0 12px 0; padding-bottom: 5px; border-bottom: 2px solid #d20f39; }
        .field { margin: 6px 0; display: flex; }
        .field-label { font-weight: bold; min-width: 200px; font-size: 9pt; }
        .field-value { flex: 1; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 9pt; }
        th, td { border: 1px solid #666; padding: 6px; text-align: left; }
        th { background: #d20f39; color: white; font-weight: bold; font-size: 8pt; }
        tr:nth-child(even) { background: #f5f5f5; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #999; font-size: 9pt; text-align: center; color: #666; }
        .questionnaire-page { page-break-after: always; }
        .questionnaire-page:last-child { page-break-after: auto; }
    </style>
</head>
<body>
    ${questionnaire1}
    ${questionnaire2}
</body>
</html>`;

        // Open print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();

        // Wait for content to load then trigger print
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
                document.getElementById('loadingOverlay').classList.remove('active');
                document.getElementById('successModal').classList.add('active');
            }, 250);
        };

    } catch (error) {
        console.error('PDF error:', error);
        alert('Error generating PDF. Please try again.');
        document.getElementById('loadingOverlay').classList.remove('active');
    }
}
