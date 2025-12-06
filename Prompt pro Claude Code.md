## Cíl projektu
Vytvoř interaktivní webový formulář pro engineering dotazník, který bude hostovaný na GitHub Pages. Formulář umožní zákazníkům vyplnit dotazník a stáhnout výsledek jako PDF.

## Technické požadavky

### Technologie
- HTML5, CSS3, vanilla JavaScript (žádné frameworky)
- GitHub Pages kompatibilní (statické HTML)
- PDF generování pomocí jsPDF nebo podobné knihovny
- Responsive design (desktop + tablet + mobile)

### Struktura projektu
```
/
├── index.html
├── styles.css
├── script.js
├── config.txt (konfigurace - editovatelná)
├── logo.png (Schaltag logo)
├── questionnaire.md (obsah dotazníku)
└── translations/
    ├── de.json
    ├── en.json
    ├── cz.json
    └── fr.json
```

## Design

### Barevné schéma
- **Light mode (default):** Catppuccin Latte Red
  - Použij Catppuccin Latte paletu s červeným akcentem
- **Dark mode:** Catppuccin Mocha Mauve
  - Použij Catppuccin Mocha paletu s fialovým akcentem
- Toggle dark/light mode v pravém horním rohu

### Layout
```
┌─────────────────────────────────────┐
│  [Logo Schaltag]    [DE|EN|CZ|FR] 🌓│
├─────────────────────────────────────┤
│                                     │
│  [Formulář - interaktivní]          │
│                                     │
│  Sekce 1: Prostředí                 │
│  Sekce 2: Napájení                  │
│  ...                                │
│                                     │
│  [Stáhnout PDF]                     │
│                                     │
├─────────────────────────────────────┤
│  Instrukce:                         │
│  Prosím odešlete vyplněný dotazník  │
│  na: sales@schaltag.cz              │
├─────────────────────────────────────┤
│  Kontakt:                           │
│  sales@schaltag.cz                  │
│  +420 XXX XXX XXX                   │
│  Adresa XYZ                         │
└─────────────────────────────────────┘
```

## Funkcionality

### 1. Vícejazyčnost
- **Defaultní jazyk:** Angličtina (EN)
- **Další jazyky:** Němčina (DE), Čeština (CZ), Francouzština (FR)
- Jazykový přepínač v pravém horním rohu
- Překlad všech labelů, placeholderů a instrukcí

### 2. Formulář
- Vytvoř interaktivní formulář podle `questionnaire.md`
- Typy inputů:
  - Checkboxy (s možností multi-select)
  - Text inputy (krátké i dlouhé)
  - Tabulky (editovatelné buňky)
  - Radio buttony
- Validace:
  - Povinná pole označená červenou hvězdičkou
  - Real-time validace e-mailu a telefonního čísla
- Progress bar zobrazující % vyplnění
- Možnost uložit rozdělaný formulář do localStorage (auto-save každých 30s)

### 3. PDF Export
- **Generování PDF:**
  - Po kliknutí na "Stáhnout PDF" se vygeneruje PDF
  - PDF obsahuje:
    1. Logo Schaltag nahoře
    2. Všechny vyplněné údaje
    3. Tabulky formátované přehledně
    4. Footer s kontaktními údaji
- **Dvoujazyčné PDF:**
  - Vždy ve vybraném jazyce + čeština vedle sebe
  - Layout: Levý sloupec = vybraný jazyk, Pravý sloupec = čeština
  - Pokud je vybraná čeština, pouze jeden sloupec

### 4. Instrukce po dokončení
Po stažení PDF zobrazit modal/popup s instrukcemi:
```
✅ Dotazník byl úspěšně vygenerován!

Prosím odešlete vyplněný dotazník na:
📧 sales@schaltag.cz

Kontaktujte nás v případě dotazů:
📞 +420 XXX XXX XXX
📍 Adresa XYZ
```

### 5. Konfigurace (config.txt)
Vytvořit jednoduchý textový soubor s proměnnými:
```
EMAIL=sales@schaltag.cz
PHONE=+420 465 552 600
ADDRESS=Moravská 1571  
CZ - 562 01 Ústí nad Orlicí
DEFAULT_LANGUAGE=en
```

JavaScript načte tento soubor a použije hodnoty v celé aplikaci.

## Obsah dotazníku (questionnaire.md)

### **HLAVIČKA - Identifikace**

- Zákazník (firma):
- Kontaktní osoba pro technické dotazy:
- Kontaktní osoba pro obchodní záležitosti:
- E-mail / Telefon:
- Datum vyplnění:
- Název projektu / stroje:
- Označení projektu:

---

## 1. PROSTŘEDÍ A PODMÍNKY PROVOZU

### 1.1 Ochrana a prostředí

- **Požadovaný stupeň krytí (IP):**
    - [ ] Bez požadavku (standardní)
	- Jiné: IP___

- **Znečištění prostředí:**
    - [ ] Čisté prostředí (kanceláře, laboratoře)
    - [ ] Lehké znečištění (běžný provoz)
    - [ ] Střední znečištění (dřevozpracující, textil)
    - [ ] Vysoké znečištění (pila, brusky, prach)
    -  Jiné: ___

- **Agresivní látky:**
    - [ ] Ne
    - [ ] Ano - korozivní
    - [ ] Ano - oleje/maziva
    - [ ] Ano - vlhkost/kondenzace
    - Jiné: ___

### 1.2 Teplota a nadmořská výška

- **Okolní teplota:**
    - Min: ___ °C
    - Max: ___ °C
    - [ ] Bez požadavku - Standardní (-5°C až +40°C)

- **Nadmořská výška:**
    - ___ m n.m.
    - [ ] Bez požadavku - Standardní (< 2000 m n.m.)

---

## 2. NAPÁJENÍ

### 2.1 Zdroj

- **Napětí a frekvence:**
    - [ ] 1x 230 V AC / 50 Hz
    - [ ] 3x 400 V AC / 50 Hz
    - [ ] 3x 480 V AC / 60 Hz (USA)
    - [ ] DC napájení: ___ V
    - Jiné: ___ 

- **Typ sítě:**
    - [ ] TN-S
    - [ ] TN-C
    - [ ] TT
    - [ ] IT
    - Jiné:___

- **Jištění zdroje:**
    - ___ A
    
- **Zkratový proud v místě instalace (Ik):**
    - ___ kA

### 2.2 Přívod do rozvaděče

- **Délka přívodu:**
    - ___ m

- **Způsob připojení:**
	- Přívod:
	    - [ ] Zdola
	    - [ ] Shora
	    - [ ] Ze strany
	    - [ ] Bez požadavku
	    - Jiné:___

    - Způsob připojení do rozvaděče:
	    - [ ] Svorkovnice
	    - [ ] Konektor
	    - [ ] Bez požadavku
	    - Jiné:___

-  **Kabel bude součástí dodávky:**
	- [ ]  Ano - poslední 2 otázky můžete vynechat
	- [ ]  Ne

- **Materiál kabelu:**
    - [ ] Cu (měď)
    - [ ] Al (hliník)
    - Jiné:___

- **Průřez přívodu:**
    - ___ mm²

---

## 3. ROZVADĚČ - OBECNÉ POŽADAVKY

### 3.1 Normy a certifikace

- **Požadované normy:**
    - [ ] CE
    - [ ] UL / CSA
    - [ ] EAC
    - [ ] ATEX
    - [ ] Jiné: ___
    - [ ] Bez požadavku

- **Funkční bezpečnost:**
    - [ ] Ne
    - [ ] Ano - SIL ___
    - [ ] Ano - PLr ___

### 3.2 Umístění a montáž

- **Typ instalace:**
    - [ ] Volně stojící na podlaze
    - [ ] Nástěnná montáž
    - [ ] Vestavěný do stroje
    - [ ] Konzole/stojan
    - [ ] Jiné: ___

- **Přístupnost:**
    - [ ] Přístupná jen přední strana
    - [ ] Přístupné všechny strany
    - [ ] Omezený prostor (rozměry: ___ )

### 3.3 Připojení k rozvaděči

- **Kabelové vstupy/výstupy:**
    
    - [ ] Zdola (kabelový kanál)
    - [ ] Shora
    - [ ] Ze strany
    - [ ] Kombinace
    - [ ] Bez požadavku

- **Typ připojení:**
    - [ ] Svorkovnice
    - [ ] Konektory:___
    - [ ] Kombinace:___
    - [ ] Bez požadavku

- **Značení vodičů:**    
    - [ ] Štítky
    - [ ] Bužírky s popisem
    - [ ] Bez požadavku
	- Jiné:___
### 3.4 Kabelové svazky

- **Výroba kabelových svazků mimo rozvaděč:**
    - [ ] Ano (prosíme o více informací přílohou)
    - [ ] Ne

---
## 4. VÝSTUPY A ZATÍŽENÍ

### Zátěže

| #   | Název | Typ zátěže | Napětí | Proud (A) | Typ ochrany | Typ řízení | Délka přívodu (m) |
| --- | ----- | ---------- | ------ | --------- | ----------- | ---------- | ----------------- |
| 1   |       |            |        |           |             |            |                   |
| 2   |       |            |        |           |             |            |                   |
| 3   |       |            |        |           |             |            |                   |
| 4   |       |            |        |           |             |            |                   |
| 5   |       |            |        |           |             |            |                   |
| 6   |       |            |        |           |             |            |                   |
| 7   |       |            |        |           |             |            |                   |
| 8   |       |            |        |           |             |            |                   |
| 9   |       |            |        |           |             |            |                   |
| 10  |       |            |        |           |             |            |                   |
| 11  |       |            |        |           |             |            |                   |
| 12  |       |            |        |           |             |            |                   |
| 13  |       |            |        |           |             |            |                   |
| 14  |       |            |        |           |             |            |                   |
| 15  |       |            |        |           |             |            |                   |
**Legenda:**
- **Typ zátěže:** Motor / Topení / Ventil / Relé / Kontrolka / Jiné
- **Typ ochrany:** Jistič / Motorový jistič / Stykač / Pojistka / RCD/ Odpojovač/ Jiné
- **Typ řízení:** Přímý start / Frekvenční měnič / Hvězda-trojúhelník / Soft-start / Relé / Jiné
- **Délka přívodu:** Vzdálenost od rozvaděče k zátěži

### Ovládací výstupy a vstupy

| #   | Název | I/O | A/D | Typ | Poznámky |
| --- | ----- | --- | --- | --- | -------- |
| 1   |       |     |     |     |          |
| 2   |       |     |     |     |          |
| 3   |       |     |     |     |          |
| 4   |       |     |     |     |          |
| 5   |       |     |     |     |          |
| 6   |       |     |     |     |          |
| 7   |       |     |     |     |          |
| 8   |       |     |     |     |          |
| 9   |       |     |     |     |          |
| 10  |       |     |     |     |          |
| 11  |       |     |     |     |          |
| 12  |       |     |     |     |          |
| 13  |       |     |     |     |          |
| 14  |       |     |     |     |          |
| 15  |       |     |     |     |          |
**Legenda:**
- **I/O:** I = Vstup (Input) / O = Výstup (Output)
- **A/D:** A = Analogový / D = Digitální

**Poznámky:** 
  - Pro vstupy: Typ senzoru (indukční, Koncový spínač, tlačítko...), napětí (24V DC, 230V AC...)
  - Pro výstupy: Typ (relé, ventil...), napětí, proud
  - Pro analogové: Rozsah signálu (4-20mA, 0-10V, Pt100...)

---

## 5. ŘÍZENÍ

### 5.1 Typ řízení

- **Způsob řízení:**
    - [ ] Relé logika 
    - [ ] PLC
    - [ ] Kombinace (relé +  PLC)
    - [ ] Frekvenční měnič s vestavěným PLC
    - [ ] Bez požadavku
    -  Jiné: ___

### 5.2 Komunikace

- **Průmyslová sběrnice:**
    
    - [ ] PROFINET
    - [ ] EtherNet/IP
    - [ ] EtherCAT
    - [ ] Modbus TCP
    - [ ] Modbus RTU
    - [ ] CANopen
    - [ ] PROFIBUS
    - [ ] Bez požadavku
    - [ ] Jiné: ___

- **Ethernet switch:**
    - [ ] Ano - počet portů: ___
    - [ ] Ne
    - [ ] Bez požadavku

---

## 6. HMI A OVLÁDÁNÍ

### 6.1 Operátorský panel (HMI)

- **Typ panelu:**
    - [ ] Dotykový panel - velikost: ___ palců
    - [ ] Tlačítkový panel
    - [ ] Kombinace (Panel + tlačítka)
    - [ ] Bez panelu (ovládání externě)
    - [ ] Bez požadavku
    - Jiné:___

- **Umístění HMI:**
    - [ ] Na dveřích rozvaděče
    - [ ] Samostatný panel (délka kabelu: ___ m)
    - [ ] Bez požadavku

- **Jazyk HMI:**
    - [ ] Čeština
    - [ ] Angličtina
    - [ ] Němčina
    - [ ] Pouze symboly (bez textu)
    - [ ] Více jazyků: ___
    - Jiné:___

---

## 7. MECHANICKÁ KONSTRUKCE

### 7.1 Rozměry

- **Požadované rozměry:**
    
    - Výška: ___ mm
	    - [ ] Bez požadavku
    - Šířka: ___ mm
	    - [ ] Bez požadavku
    - Hloubka: ___ mm
	    - [ ] Bez požadavku

### 7.2 Barva

- **Barva skříně:**
    - [ ] RAL 7035
    - [ ] RAL 7032
    - [ ] Jiná RAL: ___
    - [ ] Bez požadavku

### 7.3 Dveře a přístup

- **Typ dveří:**
    
    - [ ] Jednokřídlé
    - [ ] Dvoukřídlé
    - [ ] Bez požadavku

- **Zámek:**
    - [ ] Standardní zámek s klíčem
    - [ ] Bez zámku
    - [ ] Jiné: ___

---

## 8. PLC Software

- **Programování PLC:**
    - [ ] Ano - Schaltag CZ vytvoří kompletní program
    - [ ] Částečně - Schaltag CZ vytvoří základ
    - [ ] Ne - zákazník dodá program
    - [ ] Není potřeba (Relé logika)

- **HMI vizualizace:**
    - [ ] Ano - Schaltag CZ vytvoří
    - [ ] Ne - zákazník vytvoří
    - [ ] Není potřeba

- **Zdrojové kódy:**
    - [ ] Ano, požadovány
    - [ ] Ne

### 8.1 Testování

- **FAT (Factory Acceptance Test):**
    - [ ] Ano - v závodě Schaltag CZ
    - [ ] Ano - v místě instalace či závodě zákazníka
    - [ ] Ne
    - [ ] Bez požadavku

---
## 9. POZNÁMKY A PŘÍLOHY

**Speciální požadavky:**
- 
- 
- 
- 
- 

**Přiložené dokumenty:**
- [ ] Stávající schéma:___
- [ ] Fotografie:___
- [ ] Technické listy:___
- [ ] Jiné: ___

## Specifické požadavky na formulář

### Sekce 2.2 - Přívod do rozvaděče
- Implementuj podmíněné zobrazení:
  - Pokud je zaškrtnuto "Kabel bude součástí dodávky: Ne"
    → Zobraz "Materiál kabelu" a "Průřez přívodu"
  - Pokud je zaškrtnuto "Ano"
    → Skryj "Materiál kabelu" a "Průřez přívodu"

### Sekce 4 - Tabulky
- **Tabulka "Zátěže":**
  - 5 řádků, editovatelné buňky
  - Automatické číslování (#)
  - Automatické přidávání řádků při zaplnění všech
  - Pod tabulkou legenda (ne-editovatelná)
  
- **Tabulka "Ovládací výstupy a vstupy":**
  - 5 řádků, editovatelné buňky
  - Automatické číslování (#)
  - - Automatické přidávání řádků při zaplnění všech
  - Pod tabulkou legenda (ne-editovatelná)

### Styling tabulek
- Střídavé barvy řádků (zebra striping)
- Hover efekt na řádky
- Responsive (na mobile scrollovatelné horizontálně)

## PDF Export - Detailní specifikace

### Struktura PDF:
```
┌─────────────────────────────────────┐
│  [Logo]         Engineering Dotazník│
│                                     │
│  Zákazník: [vyplněno]               │
│  Datum: [vyplněno]                  │
├─────────────────────────────────────┤
│                                     │
│  1. PROSTŘEDÍ A PODMÍNKY PROVOZU    │
│     --------------------------------│
│     Stupeň krytí: IP54              │
│     ...                             │
│                                     │
│  2. NAPÁJENÍ                        │
│     --------------------------------│
│     ...                             │
│                                     │
│  [Všechny sekce...]                 │
│                                     │
├─────────────────────────────────────┤
│  Footer:                            │
│  Kontakt: sales@schaltag.cz         │
│  Tel: +420 XXX XXX XXX              │
│  Adresa: XYZ                        │
│                                     │
│  Strana 1/X                         │
└─────────────────────────────────────┘
```

### Dvoujazyčné PDF (pokud není CZ):
```
┌──────────────────┬──────────────────┐
│  Deutsch         │  Čeština         │
├──────────────────┼──────────────────┤
│  Kunde: ABC      │  Zákazník: ABC   │
│  Temperatur: 40°C│  Teplota: 40°C   │
│  ...             │  ...             │
└──────────────────┴──────────────────┘
```

## Další požadavky

### UX vylepšení:
- Smooth scroll při přepínání sekcí
- Tooltips s vysvětlivkami u složitějších polí (např. "SIL", "PLr")
- Loading spinner při generování PDF
- Konfirmační dialog před opuštěním stránky s nevyplněným formulářem

### Accessibility:
- Správné ARIA labely
- Keyboard navigace (Tab, Enter)
- High contrast mode support

### Performance:
- Lazy loading sekcí (načíst sekce postupně při scrollování)
- Optimalizace PDF generování (max 5s pro generování)

## Testování
Ujisti se, že:
- [ ] Formulář funguje na Chrome, Firefox, Safari, Edge
- [ ] Mobile responsive (min. 320px šířka)
- [ ] PDF se generuje správně se všemi daty
- [ ] Dvoujazyčné PDF má správný layout
- [ ] Config.txt se načítá a hodnoty se používají správně
- [ ] Dark mode funguje ve všech sekcích
- [ ] Auto-save do localStorage funguje

## Dokumentace
Vytvoř README.md s:
- Instalačními instrukcemi
- Návod na editaci config.txt
- Návod na přidání nového jazyka
- Troubleshooting

---

## Soubory v repu:

1. **questionnaire.md** - Obsah dotazníku
2. **logo.png** - Logo Schaltag
3. **config.txt** - Kontaktní údaje:

**Poznámka:** Upřednostni čistý, čitelný kód s komentáři. Používej moderní JavaScript (ES6+) a sémantické HTML5 tagy.