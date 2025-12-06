# Engineering Questionnaire - Schaltag

Interactive web questionnaire for engineering projects, hosted on GitHub Pages. Allows customers to fill out a questionnaire and download the results as PDF.

## Features

- **Multilingual Support**: English (default), German, Czech, French
- **Dark/Light Mode**: Catppuccin Latte Red (light) and Catppuccin Mocha Mauve (dark) themes
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Auto-save**: Automatically saves progress every 30 seconds to localStorage
- **Progress Tracking**: Visual progress bar showing completion percentage
- **PDF Export**: Generate and download filled questionnaire as PDF
- **Dynamic Tables**: Automatically adds rows as needed
- **Conditional Fields**: Smart form logic (e.g., cable supply options)

## Technology Stack

- HTML5, CSS3, vanilla JavaScript
- [jsPDF](https://github.com/parallax/jsPDF) for PDF generation
- [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) for table formatting
- No frameworks or build tools required
- GitHub Pages compatible

## Project Structure

```
/
├── index.html              # Main HTML file
├── styles.css              # CSS with Catppuccin themes
├── script.js               # JavaScript functionality
├── config.txt              # Configuration file (editable)
├── logo.png                # Schaltag logo
├── questionnaire.md        # Questionnaire content reference
└── translations/           # Translation files
    ├── de.json            # German translations
    ├── en.json            # English translations
    ├── cz.json            # Czech translations
    └── fr.json            # French translations
```

## Installation

### For GitHub Pages

1. Fork or clone this repository
2. Enable GitHub Pages in repository settings:
   - Go to Settings → Pages
   - Select "main" branch as source
   - Save
3. Your questionnaire will be available at `https://yourusername.github.io/repository-name/`

### For Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd questionnaire
```

2. Serve the files using a local web server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js with http-server
npx http-server

# Using PHP
php -S localhost:8000
```

3. Open `http://localhost:8000` in your browser

## Configuration

### Editing Contact Information (config.txt)

The `config.txt` file contains editable configuration values:

```
EMAIL=sales@schaltag.cz
PHONE=+420 465 552 600
ADDRESS=Moravská 1571, CZ - 562 01, Ústí nad Orlicí
DEFAULT_LANGUAGE=en
```

**How to edit:**

1. Open `config.txt` in any text editor
2. Modify the values after the `=` sign
3. Save the file
4. Refresh the page to see changes

**Available options:**

- `EMAIL`: Contact email address
- `PHONE`: Phone number
- `ADDRESS`: Company address (can span multiple lines)
- `DEFAULT_LANGUAGE`: Default language (`en`, `de`, `cz`, or `fr`)

## Adding a New Language

1. Create a new JSON file in the `translations/` folder:
```bash
cp translations/en.json translations/es.json
```

2. Translate all strings in the new file:
```json
{
  "pageTitle": "Cuestionario de Ingeniería",
  "downloadPdf": "Descargar PDF",
  ...
}
```

3. Add the language button to `index.html`:
```html
<button class="lang-btn" data-lang="es">ES</button>
```

4. Add the language to the `loadTranslations()` function in `script.js`:
```javascript
const languages = ['en', 'de', 'cz', 'fr', 'es'];
```

## Usage

### Filling Out the Questionnaire

1. **Select Language**: Click on DE, EN, CZ, or FR in the top-right corner
2. **Toggle Theme**: Click the 🌓 button to switch between light/dark mode
3. **Fill the Form**: Complete all relevant sections
   - Red asterisk (*) indicates required fields
   - Form auto-saves every 30 seconds
   - Progress bar shows completion percentage
4. **Download PDF**: Click "Download PDF" button when finished
5. **Send Email**: Email the generated PDF to the address shown in the success message

### Understanding the Form Sections

1. **Identification**: Basic customer and project information
2. **Environment and Operating Conditions**: IP rating, pollution, temperature, altitude
3. **Power Supply**: Voltage, frequency, network type, cable specifications
4. **Cabinet Requirements**: Standards, mounting, connections
5. **Outputs and Loads**: Tables for electrical loads and I/O points
6. **Control**: Control type and communication protocols
7. **HMI**: Operator panel specifications
8. **Mechanical Construction**: Dimensions, color, doors
9. **PLC Software**: Programming and testing requirements
10. **Notes and Attachments**: Special requirements and attached documents

### Working with Tables

- **Loads Table**: Enter electrical loads (motors, heaters, valves, etc.)
- **I/O Table**: Enter control inputs and outputs
- **Auto-add Rows**: New rows automatically appear when filling the last row
- **Legend**: Refer to the legend below each table for field descriptions

## PDF Export

### Features

- **Bilingual PDF**: If language is not Czech, PDF includes both selected language and Czech side-by-side
- **Logo**: Company logo appears at the top
- **Complete Data**: All filled fields are included
- **Formatted Tables**: Tables are properly formatted and readable
- **Footer**: Contact information on every page
- **Page Numbers**: Automatic page numbering

### Customizing PDF Layout

To modify PDF generation, edit the `generatePDF()` function in `script.js`:

```javascript
// Change colors
doc.setTextColor(220, 15, 57); // RGB values

// Change fonts
doc.setFontSize(12);
doc.setFont(undefined, 'bold');

// Modify margins
const margin = 20;
```

## Browser Compatibility

Tested and working on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Minimum requirements:
- JavaScript enabled
- LocalStorage support
- Modern CSS support (CSS Grid, Flexbox, CSS Variables)

## Mobile Responsiveness

- **Desktop**: Full layout with all features
- **Tablet** (768px - 1024px): Optimized layout
- **Mobile** (< 768px): Stacked layout, horizontal scrolling for tables
- Minimum supported width: 320px

## Accessibility

- ✅ Keyboard navigation (Tab, Enter)
- ✅ ARIA labels for screen readers
- ✅ High contrast mode support
- ✅ Focus indicators
- ✅ Reduced motion support (for users with motion sensitivity)

## Troubleshooting

### PDF Not Generating

**Problem**: PDF download button doesn't work

**Solutions**:
1. Check browser console for errors (F12 → Console)
2. Ensure jsPDF libraries are loaded (check Network tab)
3. Try a different browser
4. Disable browser extensions that might block downloads

### Form Data Not Saving

**Problem**: Progress is lost on page refresh

**Solutions**:
1. Check if localStorage is enabled in browser settings
2. Clear browser cache and try again
3. Ensure you're not in incognito/private mode (localStorage disabled)

### Translations Not Loading

**Problem**: Page shows only English or broken text

**Solutions**:
1. Check that translation JSON files exist in `translations/` folder
2. Verify JSON syntax is valid (use a JSON validator)
3. Check browser console for fetch errors
4. Ensure files are served over HTTP/HTTPS (not `file://`)

### Logo Not Appearing

**Problem**: Logo missing in header or PDF

**Solutions**:
1. Verify `logo.png` exists in root directory
2. Check file name is exactly `logo.png` (case-sensitive)
3. Ensure image format is PNG
4. Try clearing browser cache

### Config Not Loading

**Problem**: Contact information shows placeholders

**Solutions**:
1. Verify `config.txt` exists
2. Check file format (each line: `KEY=value`)
3. Ensure no extra spaces around `=` sign
4. Refresh the page after editing config

## Performance Optimization

- **Auto-save**: Throttled to every 30 seconds to avoid excessive writes
- **Lazy Loading**: Sections loaded progressively (if implemented)
- **Debouncing**: Input events debounced for better performance
- **PDF Generation**: Optimized to complete in < 5 seconds

## Customization

### Changing Theme Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --accent: #d20f39;  /* Main accent color */
    --accent-hover: #e64553;  /* Hover state */
    /* ... other variables */
}
```

### Modifying Form Fields

1. Edit `index.html` to add/remove fields
2. Update translation files with new field labels
3. Update PDF generation in `script.js` if needed

### Adding Custom Validation

Add validation in `script.js`:

```javascript
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
```

## Security Considerations

- **No Server-Side Code**: All processing happens in the browser
- **No Data Collection**: Form data stays on user's device (localStorage)
- **No External Requests**: Except for loading external libraries (jsPDF from CDN)
- **PDF Generated Locally**: No data sent to external services

