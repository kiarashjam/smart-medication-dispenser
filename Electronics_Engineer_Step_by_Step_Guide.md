# Electronics Engineer - Complete Step-by-Step Build Guide
## Smart Medication Dispenser (SMD-100 Home & SMD-200 Travel)
**Version:** 2.0 | **Date:** February 2026 | **Classification:** Confidential - Engineering Team
**Source:** Technical Documentation v4.0, Firmware `pins.h` (authoritative for GPIO)

---

## TABLE OF CONTENTS

| Phase | Title | Time Est. |
|-------|-------|-----------|
| 0 | [Before You Start: Prototyping Roadmap](#phase-0) | Planning |
| 1 | [Workspace Setup & Equipment](#phase-1) | 1 day |
| 2 | [Component Procurement & Inspection](#phase-2) | 1-3 weeks |
| 3 | [PCB Design Rules, Ordering & Inspection](#phase-3) | 3-10 days |
| 4 | [SMD-100 PCB Assembly Strategy](#phase-4) | — |
| 5 | [Power Section: Build & Verify](#phase-5) | 1 hour |
| 6 | [MCU: ESP32-S3 Assembly & First Boot](#phase-6) | 30 min |
| 7 | [Display Connection & Test](#phase-7) | 30 min |
| 8 | [Audio Section](#phase-8) | 20 min |
| 9 | [Motor Driver Section](#phase-9) | 30 min |
| 10 | [Sensor Section (I2C, Digital, Analog)](#phase-10) | 45 min |
| 11 | [SD Card Section](#phase-11) | 10 min |
| 12 | [Motor & Mechanical Sub-Assembly](#phase-12) | 1 hour |
| 13 | [Battery & BMS Installation](#phase-13) | 20 min |
| 14 | [Final Assembly & Enclosure](#phase-14) | 1 hour |
| 15 | [Firmware Flashing & Configuration](#phase-15) | 30 min |
| 16 | [Full Testing & Calibration](#phase-16) | 1-2 hours |
| 17 | [SMD-200 Travel Device Build](#phase-17) | 2-3 hours |
| 18 | [Production Testing & Quality Sign-Off](#phase-18) | Varies |
| A | [Master GPIO Reference (Authoritative)](#appendix-a) | — |
| B | [Power Consumption Budget](#appendix-b) | — |
| C | [Common Pitfalls & Solutions](#appendix-c) | — |
| D | [Troubleshooting Guide](#appendix-d) | — |
| E | [Second-Source Strategy](#appendix-e) | — |

---

<a name="phase-0"></a>
## PHASE 0: Before You Start - Prototyping Roadmap

> **Do NOT jump straight to custom PCB.** Follow this phased approach:

| Phase | Duration | Goal | What You Build |
|-------|----------|------|----------------|
| **Phase 1: Breadboard** | 2 weeks | Prove concept | Working motor + sensor on breadboard |
| **Phase 2: Dev boards** | 4 weeks | Firmware dev | Complete software on dev kits |
| **Phase 3: Custom PCB v1** | 4 weeks | Integration | First PCB prototype |
| **Phase 4: Custom PCB v2** | 2 weeks | Fix issues | Production-ready PCB |
| **Phase 5: Pilot build** | 4 weeks | DFM validation | 50 units |
| **Phase 6: Production** | Ongoing | Scale | Mass production |

### Recommended Dev Boards for Phase 1-2

| Board | MCU | Price | Use For |
|-------|-----|-------|---------|
| ESP32-S3-DevKitC-1 | ESP32-S3 | $10 | Firmware development, sensor testing |
| ESP32-S3-LCD-EV-Board | ESP32-S3 + 4.3" LCD | $60 | Display/UI development with LVGL |
| WT32-SC01 Plus | ESP32-S3 + 3.5" LCD | $35 | Compact UI testing |

**Start with the $10 DevKit + breadboard to prove motors, sensors, and API connectivity before ordering custom PCBs.**

---

<a name="phase-1"></a>
## PHASE 1: Workspace Setup & Equipment
**Estimated time: 1 day**

### Step 1.1 - ESD-Safe Workstation
- [ ] Install ESD mat on bench
- [ ] ESD wrist strap connected to ground (wear at ALL times)
- [ ] Ground all equipment
- [ ] Maintain 40-60% RH humidity

### Step 1.2 - Essential Equipment

| # | Tool | Recommended Model | Price | Purpose |
|---|------|-------------------|-------|---------|
| 1 | Soldering station (temp controlled) | Hakko FX-888D | $120 | All soldering |
| 2 | Hot air rework station | Quick 861DW | $150 | QFN packages (BQ24195, TPS62150, MAX98357A, ESP32 module) |
| 3 | Digital multimeter | Fluke 117 | $200 | Voltage/continuity checks |
| 4 | Oscilloscope (50MHz+, 4ch) | Rigol DS1054Z | $350 | Signal verification, I2C/SPI/PWM debugging |
| 5 | Variable bench power supply | Korad KA3005D | $80 | Controlled power during testing (0-30V, 0-5A) |
| 6 | USB logic analyzer | Saleae Logic 8 | $500 | I2C/SPI/UART protocol debugging |
| 7 | Stereo microscope | AmScope SM-4T | $250 | QFN/FFC solder inspection |

### Step 1.3 - Hand Tools & Consumables
- [ ] Fine ESD tweezers (for 0402/0603 placement)
- [ ] Flush cutters (lead trimming)
- [ ] Wire strippers (22-30 AWG)
- [ ] Solder wick (for rework/bridge removal)
- [ ] Solder paste (SAC305 lead-free or Sn63/Pb37)
- [ ] Solder wire 0.5mm (for hand soldering)
- [ ] Flux pen (no-clean flux for rework)
- [ ] IPA (isopropyl alcohol 99%) + lint-free wipes (post-solder cleaning)
- [ ] Kapton tape (heat protection during hot air rework)
- [ ] Heat shrink tubing assortment (2mm-10mm)
- [ ] Calibration weights: **10g, 50g, 100g** (for load cell calibration)
- [ ] Copper tape (for EMI shielding)

### Step 1.4 - Software Environment
- [ ] Install **ESP-IDF v5.1+** (official Espressif SDK)
  - Windows: `https://dl.espressif.com/dl/esp-idf/`
  - Or manually: `git clone -b v5.1.2 --recursive https://github.com/espressif/esp-idf.git`
- [ ] Install **VS Code** with ESP-IDF extension
- [ ] `esptool.py` (comes with ESP-IDF)
- [ ] Serial terminal: PuTTY / minicom / ESP-IDF monitor
- [ ] Obtain firmware binary from firmware team
- [ ] USB-to-UART adapter (CP2102 or CH340) as backup programming method

---

<a name="phase-2"></a>
## PHASE 2: Component Procurement & Incoming Inspection
**Estimated time: 1-3 weeks (depends on suppliers)**

### Step 2.1 - SMD-100 Home Device: Full Bill of Materials

**ICs & MODULES (Order first - longest lead time):**

| Ref | Component | Manufacturer | Part Number | Qty | Unit Cost | Total | Supplier |
|-----|-----------|-------------|-------------|-----|-----------|-------|----------|
| U1 | MCU Module | Espressif | ESP32-S3-WROOM-1-N16R8 | 1 | $5.50 | $5.50 | DigiKey |
| U2 | Power Path IC | TI | BQ24195RGER | 1 | $3.50 | $3.50 | Mouser |
| U3 | 5V Buck Regulator | TI | TPS62150RGTR | 1 | $1.80 | $1.80 | DigiKey |
| U4 | 3.3V LDO | Diodes Inc | AP2112K-3.3TRG1 | 2 | $0.25 | $0.50 | LCSC |
| U5-U11 | Motor Drivers | TI/ST | ULN2003AN | 7 | $0.30 | $2.10 | LCSC |
| U7 | Audio Amp | Maxim/ADI | MAX98357AETE+ | 1 | $2.50 | $2.50 | DigiKey |
| U8 | Load Cell ADC | Avia | HX711 | 1 | $0.80 | $0.80 | LCSC |
| U9 | Temp/Humidity | Sensirion | SHT40-AD1B | 1 | $2.50 | $2.50 | DigiKey |
| U10 | Light Sensor | ROHM | BH1750FVI | 1 | $1.00 | $1.00 | LCSC |
| U11 | I/O Expander | Microchip | MCP23017-E/SO | 1 | $1.50 | $1.50 | DigiKey |

**DISPLAY, MOTORS, SENSORS:**

| Ref | Component | Part | Qty | Unit Cost | Total | Supplier |
|-----|-----------|------|-----|-----------|-------|----------|
| LCD1 | 4.3" RGB TFT Display | Waveshare 4.3" RGB (GT911 touch) | 1 | $28.00 | $28.00 | Waveshare |
| M1-M10 | Stepper Motors | 28BYJ-48 5V | 10 | $1.50 | $15.00 | AliExpress |
| M11 | Gate Servo | SG90 (TowerPro) | 1 | $2.00 | $2.00 | Amazon |
| LS1 | Speaker | CUI CMS-403288-078 (40mm, 8ohm, 2W) | 1 | $1.50 | $1.50 | DigiKey |
| Q1-Q10 | Optical Pill Sensors | Vishay TCPT1300X01 | 10 | $0.80 | $8.00 | DigiKey |
| Q11-Q20 | Hall Effect Sensors | Allegro A3144 | 10 | $0.30 | $3.00 | LCSC |
| PIR1 | Motion Sensor | AM312 mini PIR | 1 | $1.50 | $1.50 | AliExpress |
| SW1 | Reed Switch + Magnet | NO reed switch + 10x5mm neodymium | 1 | $0.30 | $0.30 | LCSC |
| LC1 | Load Cell | 1kg TAL220 | 1 | $3.00 | $3.00 | Amazon |

**POWER & BATTERY:**

| Ref | Component | Part | Qty | Unit Cost | Total | Supplier |
|-----|-----------|------|-----|-----------|-------|----------|
| BAT1 | Battery Cells | Samsung INR18650-25R (2500mAh, 20A) | 2 | $4.00 | $8.00 | IMRbatteries |
| — | Battery Holder | Keystone 1042 (2x18650 series) | 1 | $2.00 | $2.00 | DigiKey |
| — | BMS Board | 2S 7.4V 5A protection (DW01A + MOSFETs) | 1 | $1.50 | $1.50 | LCSC |
| PSU1 | AC Adapter | Mean Well GST25E12-P1J (12V/2A) | 1 | $12.00 | $12.00 | Mouser |
| — | Note | **Swiss Type J plug** (SEV 1011) + include EU adapter | — | — | — | — |

**PASSIVES & CONNECTORS:**

| # | Component | Spec | Qty | Supplier |
|---|-----------|------|-----|----------|
| 1 | Ceramic caps | 100nF 0402, 16V, X7R (decoupling) | 30 | LCSC |
| 2 | Ceramic caps | 10µF 0805, 16V, X5R (bulk) | 15 | LCSC |
| 3 | Ceramic caps | 22µF 0805, 10V, X5R (regulator output) | 5 | LCSC |
| 4 | Ceramic caps | 1µF 0603, 16V, X7R | 10 | LCSC |
| 5 | Ceramic caps | 0.1µF 0402 (ESP32 EN pin RC) | 2 | LCSC |
| 6 | Resistors | 10K 0603 ±5% (pull-ups) | 20 | LCSC |
| 7 | Resistors | 4.7K 0603 ±5% (I2C pull-ups) | 4 | LCSC |
| 8 | Resistors | 100ohm 0603 ±5% (optical sensor LED current) | 10 | LCSC |
| 9 | Inductors | 2.2µH shielded, 1.5A, 4x4mm (TPS62150) | 2 | LCSC |
| 10 | Ferrite bead | 600ohm @ 100MHz, 0805, 500mA (power input) | 2 | LCSC |
| 11 | N-MOSFET | 2N7002 SOT-23 (backlight PWM driver) | 1 | LCSC |
| 12 | TVS diodes | ESD protection for USB, touch, external lines | 5 | LCSC |
| 13 | FFC connector | 40-pin, 0.5mm pitch, bottom-contact, ZIF | 1 | LCSC |
| 14 | JST-XH 5-pin | Motor connectors | 10 | LCSC |
| 15 | JST-PH 3-pin | Sensor connectors (smaller, 2.0mm pitch) | 12 | LCSC |
| 16 | JST-XH 2-pin | Battery, speaker connectors | 4 | LCSC |
| 17 | Barrel jack | 5.5x2.1mm, panel mount, center positive | 1 | LCSC |
| 18 | SD card socket | Micro SD push-push type | 1 | LCSC |
| 19 | USB connector | USB-B Mini (programming port) | 1 | LCSC |
| 20 | Pin header | 2.54mm 4-pin (UART debug) | 1 | LCSC |
| PCB1 | Main PCB | 4-layer, 150x100mm | 1 | JLCPCB ($8) |
| PCB2 | Motor PCB | 2-layer, 80x60mm (if separate) | 1 | JLCPCB ($3) |
| ENC1 | Enclosure | Custom ABS injection molded | 1 | Alibaba ($22) |
| — | SD Card | SanDisk 16GB micro SD | 1 | Amazon ($5) |
| — | Packaging | Box, manual, accessories | 1 | Alibaba ($6) |

**TOTAL BOM COST: ~$159 per unit (prototype qty)**

### Step 2.2 - Incoming Inspection
- [ ] Verify ALL part numbers match the order (cross-check with BOM above)
- [ ] Visually inspect IC packages for damage (bent/missing pins, cracks, shipping damage)
- [ ] **ESP32-S3:** Confirm module marking reads **"N16R8"** (16MB flash + 8MB PSRAM)
- [ ] **Batteries:** Verify cells are **genuine Samsung** (check holographic label, weight ~45g each)
  - **WARNING:** Fake 18650 cells are common. Buy ONLY from reputable sources (IMRbatteries, Nkon.nl, official distributors)
- [ ] **AC Adapter:** Measure output with multimeter: **12V ±5%**, check CE/UL marking
- [ ] Store moisture-sensitive ICs (QFN, BGA) in dry cabinet or sealed bag with desiccant
- [ ] Verify display FFC cable connector type matches your PCB footprint

---

<a name="phase-3"></a>
## PHASE 3: PCB Design Rules, Ordering & Inspection

### Step 3.1 - PCB Design Rules (for schematic/layout review)

**Layer Stack (4-Layer, 1.6mm total):**
```
Layer 1 (Top):    Signal + Components       — 1.0 oz copper
Prepreg:          FR-4, 0.2mm
Layer 2:          GROUND PLANE (solid)       — 1.0 oz copper  *** DO NOT SPLIT ***
Core:             FR-4, 1.0mm
Layer 3:          Power Planes (3.3V/5V/12V) — 1.0 oz copper  (split for voltages)
Prepreg:          FR-4, 0.2mm
Layer 4 (Bottom): Signal + Components        — 1.0 oz copper
```

**Trace/Space Rules:**

| Parameter | Minimum | Preferred | Notes |
|-----------|---------|-----------|-------|
| Signal trace width | 0.15mm (6mil) | 0.2mm | Standard signals |
| Power trace width | 0.3mm (12mil) | 0.5mm | 3.3V, 5V rails |
| Motor trace width | 0.5mm (20mil) | 1.0mm | Handle 500mA per motor |
| Trace spacing | 0.15mm (6mil) | 0.2mm | Minimum clearance |
| Via diameter | 0.4mm | 0.5mm | Outer diameter |
| Via drill | 0.2mm | 0.25mm | Hole diameter |
| Component spacing | 0.2mm | 0.3mm | Between pads |
| Board edge clearance | 0.3mm | 0.5mm | Keep-out zone |

**EMC Design Rules:**

| Rule | Implementation |
|------|----------------|
| Ground plane | Solid Layer 2 — **NO splits** under signal traces |
| Power plane | Split Layer 3 for different voltages, star-point connection |
| Decoupling | **100nF per power pin**, place within **3mm** of pin |
| Bulk capacitors | 10µF at power entry, 22µF at regulator outputs |
| Antenna keep-out | **15mm radius clear**, no ground plane under ESP32 antenna |
| Crystal traces | Keep <5mm, surround with ground guard ring |
| Motor isolation | **Separate ground return path**, ferrite bead at power entry to motor section |
| ESD protection | TVS diodes on ALL external connections (USB, barrel jack, touch) |

**Thermal Design:**

| Heat Source | Dissipation | Mitigation |
|-------------|------------|------------|
| ESP32-S3 | 0.5W | Exposed pad to ground plane, via array underneath |
| BQ24195 | 0.8W | **Thermal pad MUST connect to ground** via 3x3 via array (0.3mm, 1mm spacing) |
| TPS62150 | 0.2W | Ground pad, adequate copper pour |
| ULN2003A (each) | 0.5W | Thermal vias, copper pour |
| MAX98357A | 0.2W | Ground pad |

### Step 3.2 - Order PCBs
**Main PCB (150mm x 100mm, 4-layer):**
- [ ] Send Gerber files to JLCPCB (prototype, ~$8) or Eurocircuits (production, ~$80)
- [ ] Specify: 4-layer, 1.6mm, 1oz copper all layers, FR-4, ENIG finish
- [ ] Order minimum **5 pcs** (expect 1-2 for rework during bring-up)

### Step 3.3 - PCB Incoming Inspection
- [ ] Visual inspection: no scratches, copper shorts, broken traces
- [ ] Check drill holes align with pad centers
- [ ] Verify soldermask openings are correct (especially QFN thermal pads)
- [ ] Verify FFC connector footprint matches your 40-pin 0.5mm connector
- [ ] Measure board dimensions with calipers (150.0 x 100.0mm ±0.1mm)
- [ ] Continuity test: **3.3V plane NOT shorted to GND**, **5V plane NOT shorted to GND**

---

<a name="phase-4"></a>
## PHASE 4: SMD-100 PCB Assembly Strategy
**Total PCB assembly time: ~2 hours**

### Assembly Order (smallest to largest)

| Order | Component Type | Reference | Method |
|-------|---------------|-----------|--------|
| 1 | 0402 capacitors (100nF decoupling) | C1-C30 | Solder paste + hot air |
| 2 | 0603 resistors (10K, 4.7K, 100ohm) | R1-R50 | Solder paste + hot air |
| 3 | 0805 capacitors (10µF, 22µF bulk) | C31-C45 | Solder paste + hot air |
| 4 | SOT-23/SOT-25 (2N7002, AP2112K) | Q1-Q5, U4 | Hand solder or hot air |
| 5 | QFN-16 (TPS62150, 3x3mm) | U3 | **Hot air**, microscope alignment |
| 6 | QFN-24 (BQ24195, 4x4mm) | U2 | **Hot air**, thermal pad critical |
| 7 | QFN-16 (MAX98357A, 3x3mm) | U7 | **Hot air**, microscope alignment |
| 8 | ESP32-S3 module (25.5x18mm) | U1 | **Preheat + hot air** reflow |
| 9 | SOIC packages (ULN2003A x7, MCP23017, HX711) | U5-U11 | Hand solder or reflow |
| 10 | Through-hole connectors | J1-J20 | Hand solder |
| 11 | FFC connector (40-pin 0.5mm) | J_LCD | Fine tip hand solder |
| 12 | SD card socket | J_SD | Hand solder |

---

<a name="phase-5"></a>
## PHASE 5: Power Section - Build & Verify
**Estimated time: 45 min assembly + 15 min testing**

> **CRITICAL: Build and test power FIRST, before installing ESP32. If there's a voltage issue, you'll fry the $5.50 MCU.**

### Step 5.1 - Install BQ24195 Power Path Controller (QFN-24, 4x4mm)
1. [ ] Apply solder paste to all 24 QFN pads **+ center thermal pad**
2. [ ] **Thermal pad is critical** — this is the heat sink. Must have solder and thermal vias beneath
3. [ ] Place BQ24195RGER with tweezers, align pin 1 dot marking
4. [ ] Verify alignment under microscope
5. [ ] Hot air reflow: **260°C peak, 30 seconds**, nozzle 2-3mm above
6. [ ] IC will "settle" when solder melts — watch edges
7. [ ] **Inspect ALL 24 pins under microscope** — no bridges, no opens
8. [ ] Install surrounding passives:
   - Input cap: **10µF ceramic** within 3mm of VIN pin
   - Output caps: **22µF ceramic** at SYS output and BAT connection
   - NTC resistor connection (10K NTC for battery temperature monitoring)
   - Programming resistors for charge current (set to 1A via I2C or ILIM pin)

### Step 5.2 - Install TPS62150 Buck Regulator (QFN-16, 3x3mm) — 5V Rail
1. [ ] Apply solder paste to QFN-16 pads + ground pad
2. [ ] Place TPS62150RGTR, align pin 1
3. [ ] Hot air reflow at 260°C, 20-30 seconds
4. [ ] Install **2.2µH shielded inductor** (L1) — place close, keep trace short
5. [ ] Install input cap: **10µF** close to VIN
6. [ ] Install output cap: **22µF** close to VOUT
7. [ ] If adjustable output: install feedback resistor divider for 5.0V

### Step 5.3 - Install AP2112K-3.3 LDO (SOT-25) — 3.3V Rail
1. [ ] Hand solder the 5-pin SOT-25 package
2. [ ] Install input cap: **1µF** on input pin
3. [ ] Install output cap: **10µF** on output pin
4. [ ] Install **ferrite bead** (600ohm @ 100MHz) on 3.3V input from 5V rail

### Step 5.4 - Install Power Connectors
1. [ ] Solder 12V **barrel jack** (5.5x2.1mm, center positive)
2. [ ] Solder **battery connector** (JST-XH 2-pin)
3. [ ] Install power input protection (TVS diode for overvoltage, Schottky for reverse polarity if designed)

### Step 5.5 - POWER TEST (Critical Gate - DO NOT PROCEED until ALL pass)

| # | Test | How | Expected | Measured | Pass? |
|---|------|-----|----------|----------|-------|
| 1 | Apply 12V via bench supply | Set bench PSU to 12.0V, current limit 500mA | No smoke, no excessive current | ___mA | [ ] |
| 2 | SYS output voltage | Probe BQ24195 SYS pin | ~12V | ___V | [ ] |
| 3 | **5V rail** | Probe TPS62150 output | **5.0V ±2%** (4.9-5.1V) | ___V | [ ] |
| 4 | **3.3V rail** | Probe AP2112K output | **3.3V ±2%** (3.23-3.37V) | ___V | [ ] |
| 5 | Quiescent current | Read bench PSU current display | **<10mA** (no load) | ___mA | [ ] |
| 6 | Heat check | Touch ICs after 30 seconds | No excessive heat | — | [ ] |
| 7 | Short check | Measure resistance: 3.3V to GND | **>1K ohm** (not shorted) | ___ohm | [ ] |

> **If ANY test fails: STOP.** Check solder joints under microscope, verify component orientation (pin 1), check for bridges. Fix before proceeding.

---

<a name="phase-6"></a>
## PHASE 6: MCU - ESP32-S3 Assembly & First Boot
**Estimated time: 30 minutes**

### Step 6.1 - Pre-Installation
1. [ ] Verify 3.3V rail is stable at 3.3V ±2% (from Phase 5)
2. [ ] Verify no shorts between 3.3V and GND at ESP32 pad locations
3. [ ] Clean PCB pads with IPA

### Step 6.2 - Solder ESP32-S3-WROOM-1-N16R8
1. [ ] Apply **flux** generously to all module pads on PCB
2. [ ] Apply thin layer of solder paste (stencil method preferred)
3. [ ] Place module carefully with tweezers
4. [ ] **Check alignment under microscope** — pin 1 marker must match
5. [ ] **Preheat board** to 150°C on hot plate (prevents thermal shock to module)
6. [ ] Hot air reflow: focus on module at **260°C for 20-30 seconds**
7. [ ] Watch corner pins — solder flows there first
8. [ ] Let cool **naturally** — do NOT blow cold air
9. [ ] **Inspect ALL pins under microscope** — look for bridges and cold joints
10. [ ] Touch up bridges or opens with fine tip iron + flux

### Step 6.3 - Install Critical Support Components
1. [ ] **EN pin:** 10K pull-up to 3.3V **+** 0.1µF cap to GND (RC delay for clean boot)
2. [ ] **GPIO0 (BOOT):** 10K pull-up to 3.3V + tactile button to GND (for download mode)
3. [ ] **Reset button:** Tactile button between EN pin and GND
4. [ ] **Decoupling:** Place **10µF + 0.1µF** within 3mm of EACH VCC pin on module
5. [ ] **USB pins:** GPIO20 (USB_D-) and GPIO21 (USB_D+) to USB-B Mini connector or pin header

### Step 6.4 - Antenna Clearance Verification
- [ ] **15mm clearance** around antenna area (top-right of module)
- [ ] **No ground plane** under antenna on ANY layer
- [ ] **No traces** crossing antenna feed line
- [ ] No metal enclosure parts within 10mm of antenna

### Step 6.5 - ESP32 First Boot Test
1. [ ] Connect USB cable (or USB-UART adapter to TX0/RX0 pins)
2. [ ] Open serial terminal: **115200 baud, 8N1**
3. [ ] Apply 12V power → ESP32 should boot
4. [ ] **Expected serial output:** ROM bootloader messages, then "rst:0x1 (POWERON_RESET)"
5. [ ] If **no output:**
   - Hold BOOT button → press RESET → release BOOT → enters download mode
   - Check EN pin voltage = 3.3V
   - Check GPIO0 = HIGH in normal mode
6. [ ] Run `esptool.py --port COMx flash_id` → should report **16MB flash**
7. [ ] If PSRAM test firmware available: boot log should show **"8MB PSRAM initialized"**

---

<a name="phase-7"></a>
## PHASE 7: Display Connection & Test
**Estimated time: 30 minutes**

> **IMPORTANT: The ESP32-S3 uses TWO separate I2C buses:**
> - **I2C Bus 0 (Touch):** GPIO38 (SDA) + GPIO39 (SCL) — for GT911 touch controller
> - **I2C Bus 1 (Sensors):** GPIO44 (SDA) + GPIO46 (SCL) — for SHT40, BH1750, MCP23017

### Step 7.1 - Solder FFC Connector
1. [ ] Solder 40-pin, 0.5mm pitch FFC connector (bottom-contact type, ZIF latch)
2. [ ] Use fine tip iron at 300°C with flux
3. [ ] **Inspect EVERY pin under microscope** — bridges here = dead display

### Step 7.2 - Install Backlight Driver
1. [ ] Solder N-MOSFET (2N7002, SOT-23):
   - **Gate** → GPIO42 (PWM backlight control)
   - **Drain** → backlight control line
   - **Source** → GND
2. [ ] Install TVS diodes on touch I2C lines (ESD protection from user touching screen)

### Step 7.3 - Display Wiring Reference (from firmware `pins.h`)

| ESP32-S3 GPIO | Display Signal | Function |
|--------------|----------------|----------|
| GPIO1 | LCD_R0 | Red bit 0 |
| GPIO2 | LCD_R1 | Red bit 1 |
| GPIO3 | LCD_R2 | Red bit 2 |
| GPIO4 | LCD_R3 | Red bit 3 |
| GPIO5 | LCD_R4 | Red bit 4 |
| GPIO6 | LCD_G0 | Green bit 0 |
| GPIO7 | LCD_G1 | Green bit 1 |
| GPIO8 | LCD_G2 | Green bit 2 |
| GPIO9 | LCD_G3 | Green bit 3 |
| GPIO10 | LCD_G4 | Green bit 4 |
| GPIO11 | LCD_G5 | Green bit 5 |
| GPIO12 | LCD_B0 | Blue bit 0 |
| GPIO13 | LCD_B1 | Blue bit 1 |
| GPIO14 | LCD_B2 | Blue bit 2 |
| GPIO15 | LCD_B3 | Blue bit 3 |
| GPIO16 | LCD_B4 | Blue bit 4 |
| **GPIO45** | **LCD_CLK** | Pixel clock |
| **GPIO48** | **LCD_DE** | Data enable |
| **GPIO47** | **LCD_VSYNC** | Vertical sync |
| **GPIO21** | **LCD_HSYNC** | Horizontal sync |
| GPIO42 | BACKLIGHT | PWM via MOSFET |
| GPIO38 | TOUCH_SDA | I2C Bus 0 data |
| GPIO39 | TOUCH_SCL | I2C Bus 0 clock |
| GPIO40 | TOUCH_INT | Touch interrupt |
| GPIO41 | TOUCH_RST | Touch reset |

### Step 7.4 - Connect & Test Display
1. [ ] Insert FFC cable into connector — **verify orientation** (contacts face down for bottom-contact connector)
2. [ ] Close ZIF latch firmly
3. [ ] Power on → backlight should illuminate (GPIO42 HIGH)
4. [ ] Flash LVGL test firmware
5. [ ] **Verify:** All pixels working, correct colors (no swapped R/G/B), no dead lines
6. [ ] **Touch test:** Tap all 4 corners + center → verify correct coordinate mapping
7. [ ] I2C scan should find GT911 at address **0x5D**

---

<a name="phase-8"></a>
## PHASE 8: Audio Section
**Estimated time: 20 minutes**

### Step 8.1 - Install MAX98357A (QFN-16, 3x3mm)
1. [ ] Apply solder paste to QFN-16 pads
2. [ ] Place with tweezers, align under microscope
3. [ ] Hot air reflow at 260°C, 20 seconds
4. [ ] Install: **10µF** cap on VDD (bulk) + **100nF** cap on VDD (close to chip)

### Step 8.2 - I2S Audio Wiring (from firmware `pins.h`)

| ESP32-S3 GPIO | MAX98357A Pin | Function |
|--------------|---------------|----------|
| **GPIO17** | BCLK | I2S bit clock |
| **GPIO18** | LRCLK | I2S left/right clock |
| **GPIO15** | DIN | I2S audio data out |
| — | GAIN → GND | Sets 15dB gain |
| — | SD → 3.3V | Enable (always on) |
| — | VDD → 5V | Power supply |
| — | GND → GND | Ground |

> **Note:** The firmware `pins.h` defines GPIO15 for I2S_DOUT. However, GPIO15 is also listed as LCD_B3 in the display section. **Verify your PCB schematic resolves this conflict.** If using RGB565 (16-bit color) instead of RGB888, fewer blue pins are needed and GPIO15 may be freed for audio.

### Step 8.3 - Speaker Connection
1. [ ] Solder 2-pin JST or screw terminal
2. [ ] MAX98357A OUT+ → Speaker +, OUT- → Speaker -
3. [ ] Speaker: **40mm, 8ohm, 2W** (no polarity for dynamic speaker)

### Step 8.4 - Audio Test
1. [ ] Flash test firmware with 1kHz tone generator
2. [ ] Connect speaker → should hear **clean 1kHz sine tone**
3. [ ] Verify volume control works (10 levels via software)
4. [ ] Check for distortion at max volume → should be clean at 8ohm load

---

<a name="phase-9"></a>
## PHASE 9: Motor Driver Section
**Estimated time: 30 minutes**

### Step 9.1 - Install MCP23017 I/O Expander (SOIC-28)
1. [ ] Solder MCP23017-E/SO
2. [ ] Tie address pins: **A0=GND, A1=GND, A2=GND** → I2C address = **0x20**
3. [ ] Install 100nF decoupling cap on VDD pin
4. [ ] Connect to **I2C Bus 1:** SDA → GPIO44, SCL → GPIO46
5. [ ] **4.7K pull-up resistors** on SDA and SCL (if not already installed for other I2C devices on this bus)
6. [ ] **Quick test:** I2C scan → should detect device at **0x20**

### Step 9.2 - Install ULN2003A Motor Drivers (x7)
1. [ ] Solder all 7x ULN2003AN (SOIC-16 or DIP-16)
2. [ ] For **each** ULN2003A:
   - **COM pin → 5V** motor supply (critical — built-in flyback diodes need this)
   - **GND pin → ground**
   - Input pins ← MCP23017 GPIO outputs (GPA0-7, GPB0-7)
   - Output pins → motor connector pins

### Step 9.3 - Motor Connectors
1. [ ] Solder 10x JST-XH 5-pin connectors
2. [ ] Wiring per motor (28BYJ-48):
   - Pin 1 = **Red wire** (common, connect to 5V)
   - Pin 2 = **Blue wire** (coil A)
   - Pin 3 = **Pink wire** (coil B)
   - Pin 4 = **Yellow wire** (coil C)
   - Pin 5 = **Orange wire** (coil D)
3. [ ] Gate servo connector (3-pin): VCC(5V), GND, Signal → **GPIO43** (from firmware `pins.h`)

### Step 9.4 - Motor EMI Mitigation
- [ ] Add **100nF ceramic cap across EACH motor coil** (motor noise causes WiFi interference)
- [ ] Use **ferrite beads** on motor power lines entering the PCB
- [ ] Keep motor traces on separate ground return path from digital signals

### Step 9.5 - Motor Driver Test
1. [ ] Connect one 28BYJ-48 motor
2. [ ] Flash motor test firmware
3. [ ] Run half-step sequence (8-step: 2048 steps = 1 revolution)
4. [ ] Motor should rotate smoothly in both directions
5. [ ] Measure current: **~200mA active, ~0mA when off**
6. [ ] Test all 10 motor outputs

---

<a name="phase-10"></a>
## PHASE 10: Sensor Section
**Estimated time: 45 minutes**

> **Reminder: Sensor I2C Bus 1 = GPIO44 (SDA), GPIO46 (SCL)**

### Step 10.1 - I2C Sensors

**SHT40 Temp/Humidity (address 0x44):**
1. [ ] Tiny DFN 1.5x1.5mm — requires hot air station
2. [ ] Apply solder paste, place with tweezers, reflow at 260°C
3. [ ] Add 100nF decoupling cap on VDD
4. [ ] Accuracy: ±0.2°C temperature, ±1.8% humidity

**BH1750 Light Sensor (address 0x23):**
1. [ ] Small WSOF package, hot air reflow
2. [ ] ADDR pin → GND (sets address to 0x23)
3. [ ] Add 100nF decoupling cap
4. [ ] Range: 1-65535 lux, 1 lux resolution

### Step 10.2 - Load Cell + HX711 ADC

1. [ ] Solder HX711 module (or SOP-16 IC directly on PCB)
2. [ ] Wiring to ESP32 (from firmware `pins.h`):
   - **HX711 DOUT → GPIO32**
   - **HX711 SCK → GPIO33**
3. [ ] Load cell wiring (4-wire Wheatstone bridge):
   - **Red** (E+) → HX711 E+
   - **Black** (E-) → HX711 E-
   - **White** (A-) → HX711 A-
   - **Green** (A+) → HX711 A+
4. [ ] HX711 power: **VCC → 5V, GND → GND**
5. [ ] **Place HX711 physically close to load cell** (short wires = less noise)
6. [ ] **Shield from motor EMI** (use copper tape, physical distance, or ground guard ring)

### Step 10.3 - Digital Sensors

**PIR Motion Sensor (AM312):**
1. [ ] Solder 3-pin JST-PH connector (VCC, GND, OUT)
2. [ ] Signal output → **GPIO26** (from firmware `pins.h`)
3. [ ] **No pull-up needed** — AM312 has push-pull output
4. [ ] 3.3V compatible, 20µA standby current
5. [ ] Detects motion at 3-5m range, 100° angle

**Reed Switch (Door/Tray sensor):**
1. [ ] Solder 2-pin JST connector
2. [ ] One wire → **GPIO27** + **10K pull-up to 3.3V**
3. [ ] Other wire → GND
4. [ ] Mount magnet (10x5mm neodymium) on the moving part (door/tray)
5. [ ] Logic: Door **closed** (magnet near) = GPIO **LOW** / Door **open** = GPIO **HIGH**

### Step 10.4 - Optical Pill Sensor Connectors (x10)

Each TCPT1300X01 sensor circuit:
```
5V ──[100R]──►IR LED──► GND     (LED side, current ~30mA)
5V ──[10K pull-up]──┬──► MCP23017 GPIO  (phototransistor collector)
                    └──►Phototransistor──► GND (emitter)
```
1. [ ] Solder 10x 3-pin connectors (VCC, GND, Signal)
2. [ ] Route 8 sensors → MCP23017 Port B (GPB0-GPB7) with interrupt
3. [ ] Route 2 remaining → ESP32 GPIO28, GPIO29 (direct)
4. [ ] Logic: **No pill = GPIO HIGH** (light passes through) / **Pill passing = GPIO LOW** (light blocked)
5. [ ] Count **rising edges** for pill count

### Step 10.5 - Hall Effect Sensors (x10, A3144)
1. [ ] 10x A3144 sensors (one per motor position for carousel homing)
2. [ ] Each sensor: VCC (5V), GND, Output → **10K pull-up to 3.3V** → MCP23017 GPIO
3. [ ] Mount near carousel gear teeth, magnet on carousel at home position

### Step 10.6 - I2C Bus 1 Verification
Run I2C scan from ESP32 on Bus 1 (GPIO44/46):

| Address | Device | Status |
|---------|--------|--------|
| 0x20 | MCP23017 (I/O Expander) | [ ] Found |
| 0x23 | BH1750 (Light) | [ ] Found |
| 0x44 | SHT40 (Temp/Humidity) | [ ] Found |

And on Bus 0 (GPIO38/39):

| Address | Device | Status |
|---------|--------|--------|
| 0x5D | GT911 (Touch controller) | [ ] Found |

---

<a name="phase-11"></a>
## PHASE 11: SD Card Section
**Estimated time: 10 minutes**

### Step 11.1 - Install SD Card Socket
1. [ ] Solder micro SD push-push socket
2. [ ] SPI wiring (from firmware `pins.h`):

| ESP32-S3 GPIO | SD Card Signal | Function |
|--------------|---------------|----------|
| **GPIO36** | SD_CLK | SPI clock |
| **GPIO35** | SD_CMD (MOSI) | SPI data in |
| **GPIO37** | SD_DATA0 (MISO) | SPI data out |

3. [ ] Add **10K pull-up resistors** on all SD data lines (required by SD spec)
4. [ ] VCC → 3.3V, GND → GND
5. [ ] Add 100nF decoupling cap on VCC

### Step 11.2 - SD Card Test
1. [ ] Insert 16GB SanDisk micro SD card (formatted FAT32)
2. [ ] Flash test firmware that writes/reads a file
3. [ ] Verify: write speed >1MB/s, read speed >2MB/s
4. [ ] SD card will store: audio files (~5MB for 4 languages), event logs, calibration data

---

<a name="phase-12"></a>
## PHASE 12: Motor & Mechanical Sub-Assembly
**Estimated time: 1 hour**

### Step 12.1 - Mount Stepper Motors
1. [ ] Mount 10x 28BYJ-48 motors to bracket (3D printed or CNC aluminum)
2. [ ] Use M3 screws (2 per motor)
3. [ ] All shafts must point the same direction
4. [ ] Verify each motor rotates freely (no binding)

### Step 12.2 - Carousel Assembly
1. [ ] Press-fit gear onto each motor's D-shaped shaft
2. [ ] Install central carousel with 10 pill compartments
3. [ ] Ensure carousel meshes smoothly with motor gears
4. [ ] Test full 360° rotation by hand — must be smooth, no grinding

### Step 12.3 - Gate Servo (SG90)
1. [ ] Mount SG90 in gate mechanism
2. [ ] Connect: VCC(5V), GND, Signal → **GPIO43**
3. [ ] PWM: 50Hz, **1ms pulse = 0° (closed)**, **2ms pulse = 180° (open)**
4. [ ] Test full open/close motion — gate must fully seal

### Step 12.4 - Optical Sensors in Pill Chutes
1. [ ] Mount one TCPT1300X01 in each of the 10 pill chutes
2. [ ] 3mm sensor gap = where pills pass through
3. [ ] IR LED on one side, phototransistor opposite
4. [ ] Wire each sensor to its JST connector on main PCB

### Step 12.5 - Hall Sensors for Homing
1. [ ] Mount one A3144 near each motor's gear position
2. [ ] Glue small neodymium magnet to carousel at home position for each slot
3. [ ] Hall sensor triggers = motor has reached the "home" position

### Step 12.6 - Load Cell in Output Tray
1. [ ] Fix one end of load cell (TAL220 1kg) rigidly to device frame
2. [ ] Attach output tray to the free/floating end — **no mechanical contact with frame**
3. [ ] Wire to HX711 (Red→E+, Black→E-, White→A-, Green→A+)
4. [ ] Shield HX711 from motor EMI (copper tape or physical distance)

---

<a name="phase-13"></a>
## PHASE 13: Battery & BMS Installation
**Estimated time: 20 minutes**

### Step 13.1 - Battery Pack Assembly

**Configuration:** 2S1P (2 cells in series) = **7.4V nominal, 5000mAh**

**BMS Protection Requirements (DW01A + dual MOSFETs):**

| Protection | Threshold |
|-----------|-----------|
| Overvoltage cutoff | 8.4V (4.2V per cell) |
| Undervoltage cutoff | 6.0V (3.0V per cell) |
| Overcurrent cutoff | 5A |
| Short circuit | Instant cutoff |
| Balance current | 50-100mA |

### Step 13.2 - Installation
1. [ ] Insert 2x Samsung INR18650-25R cells into Keystone 1042 holder (series connection)
2. [ ] **VERIFY POLARITY** — Cell 1 positive → Cell 2 negative (series = 7.4V)
3. [ ] Connect BMS board between battery and output connector
4. [ ] Measure pack voltage: should read **7.0-8.4V** depending on charge state
5. [ ] Connect JST-XH 2-pin to PCB battery input
6. [ ] **Test BQ24195 charging:** Apply 12V, BQ24195 should start charging (monitor via I2C or LED)

### Step 13.3 - Battery Safety
- **NEVER** short battery terminals
- **NEVER** puncture or deform cells
- **NEVER** use screws through or near battery
- Secure holder with foam tape or mechanical clip only
- Store charged batteries away from flammable materials

---

<a name="phase-14"></a>
## PHASE 14: Final Assembly & Enclosure
**Estimated time: 1 hour**

### Step 14.1 - Prepare Enclosure (305 x 203 x 254mm)
1. [ ] Install heat-set brass inserts: M3 for PCB, M2.5 for display
2. [ ] Install cable clips and routing guides

### Step 14.2 - Install Components

| Order | Component | Method |
|-------|-----------|--------|
| 1 | Display | Foam gasket around edge, insert FFC cable (**check orientation!**), clip secure |
| 2 | Main PCB | M3 standoffs (10mm), screw 4 corners |
| 3 | Motor/Carousel | Mount in position, verify clearance for rotation |
| 4 | Speaker | Hot glue or foam mount in speaker cavity |
| 5 | Battery pack | Foam tape mount (NO screws near battery) |
| 6 | PIR sensor | Mount facing front, detection window clear |
| 7 | Reed switch | Mount on tray rail, magnet on tray |

### Step 14.3 - Final Wiring
1. [ ] Connect 10x motor cables to JST connectors
2. [ ] Connect 10x optical sensor cables
3. [ ] Connect 10x hall sensor cables
4. [ ] Connect load cell/HX711 cable
5. [ ] Connect PIR sensor cable
6. [ ] Connect reed switch cable
7. [ ] Connect speaker cable
8. [ ] Connect battery pack
9. [ ] Connect barrel jack for AC power
10. [ ] Insert SD card

### Step 14.4 - Pre-Close Inspection
- [ ] **No pinched or stressed wires**
- [ ] **All connectors fully seated** (tug test gently)
- [ ] **Battery polarity correct** (measure voltage at PCB connector)
- [ ] **All moving parts have clearance** (carousel, gates, tray)
- [ ] **FFC cable not under stress** (no sharp bends)
- [ ] **Antenna area clear** of metal parts
- [ ] Close enclosure with screws (do not overtighten ABS — it cracks)

---

<a name="phase-15"></a>
## PHASE 15: Firmware Flashing & Configuration
**Estimated time: 30 minutes**

### Step 15.1 - Flash Firmware

**Windows (ESP-IDF command prompt):**
```bash
cd %USERPROFILE%\esp\smart_dispenser
idf.py set-target esp32s3
idf.py build
idf.py -p COM3 flash monitor
```

**Direct flash with esptool:**
```bash
esptool.py --chip esp32s3 --port COM3 --baud 921600 write_flash ^
  0x0 bootloader.bin ^
  0x10000 firmware.bin ^
  0x8000 partition-table.bin
```

### Step 15.2 - Verify Boot
1. [ ] Serial monitor at **115200 baud**
2. [ ] Expected boot messages:
   - [ ] ESP32-S3 identified
   - [ ] 16MB Flash detected
   - [ ] 8MB PSRAM initialized
   - [ ] FreeRTOS tasks started (main, wifi, ui, dispense, sensor, audio)
   - [ ] LVGL initialized
   - [ ] Display driver OK
   - [ ] I2C devices found (0x20, 0x23, 0x44, 0x5D)
   - [ ] WiFi scanning...

### Step 15.3 - Initial Configuration
1. [ ] Configure WiFi: via touch screen setup wizard or serial command
2. [ ] Verify WiFi connects in **<30 seconds**
3. [ ] Program device serial number: **SMD-XXXXXXXX** format (stored in NVS)
4. [ ] Register device with cloud API: `POST /api/v1/devices/register`
5. [ ] Verify heartbeat received by server (every 60 seconds)

---

<a name="phase-16"></a>
## PHASE 16: Full Testing & Calibration
**Estimated time: 1-2 hours**

### Step 16.1 - Power System Tests

| Test | Expected | Measured | Pass? |
|------|----------|----------|-------|
| 12V input, idle power | <5W | ___W | [ ] |
| 5V rail under full load | 5.0V ±2% | ___V | [ ] |
| 3.3V rail under full load | 3.3V ±2% | ___V | [ ] |
| AC→Battery switchover time | <100ms (unplug AC) | ___ms | [ ] |
| Battery→AC switchover time | <100ms (plug AC) | ___ms | [ ] |
| Battery backup, idle | >48 hours | ___hrs | [ ] |
| Low battery alert | Triggers at 20% | — | [ ] |
| Critical shutdown | At 5% | — | [ ] |
| Reverse polarity protection | No damage with reversed plug | — | [ ] |

### Step 16.2 - Display & Touch Tests

| Test | Expected | Pass? |
|------|----------|-------|
| Display powers on | Screen lit in <2s | [ ] |
| Full white screen | All pixels white, no dead pixels | [ ] |
| Full black screen | All pixels black | [ ] |
| Color bars (R/G/B) | Correct colors, no channel swap | [ ] |
| Brightness control | 10 PWM levels via GPIO42 | [ ] |
| Touch: top-left corner | Responds correctly | [ ] |
| Touch: top-right corner | Responds correctly | [ ] |
| Touch: bottom-left corner | Responds correctly | [ ] |
| Touch: bottom-right corner | Responds correctly | [ ] |
| Touch: center | Responds correctly | [ ] |
| Touch response time | <50ms | [ ] |
| Viewing angle | Readable at ±45° (IPS) | [ ] |

### Step 16.3 - Motor Tests

| Test | Expected | Pass? |
|------|----------|-------|
| Motor 1: Full CW rotation | Smooth, 2048 steps = 360° | [ ] |
| Motor 2: Full CW rotation | Smooth | [ ] |
| Motor 3: Full CW rotation | Smooth | [ ] |
| Motor 4: Full CW rotation | Smooth | [ ] |
| Motor 5: Full CW rotation | Smooth | [ ] |
| Motor 6: Full CW rotation | Smooth | [ ] |
| Motor 7: Full CW rotation | Smooth | [ ] |
| Motor 8: Full CW rotation | Smooth | [ ] |
| Motor 9: Full CW rotation | Smooth | [ ] |
| Motor 10: Full CW rotation | Smooth | [ ] |
| Direction reversal (all) | No lost steps | [ ] |
| Gate servo: Open (90°) | Fully opens | [ ] |
| Gate servo: Close (0°) | Fully seals | [ ] |
| Motor noise level | <45 dB @ 1m | [ ] |
| Hall sensor homing (all 10) | Each motor finds home position | [ ] |

### Step 16.4 - Sensor Tests

| Test | Expected | Pass? |
|------|----------|-------|
| SHT40: Temperature | ±2°C of reference thermometer | [ ] |
| SHT40: Humidity | ±5% RH of reference | [ ] |
| BH1750: Light | Changes with ambient (cover/uncover) | [ ] |
| PIR: Motion at 1m | GPIO26 goes HIGH | [ ] |
| PIR: No motion 10s | GPIO26 goes LOW | [ ] |
| Reed switch: Magnet near | GPIO27 LOW (closed) | [ ] |
| Reed switch: Magnet away | GPIO27 HIGH (open) | [ ] |
| Optical sensor 1: Pass pill | Correctly counts 1 | [ ] |
| Optical sensors 2-10 | All count correctly | [ ] |
| Optical: 5 pills consecutively | Counts exactly 5 | [ ] |
| SD card: Read/write test | File created and read back | [ ] |

### Step 16.5 - Load Cell Calibration (CRITICAL)
1. [ ] Enter calibration: `Settings → Calibration → Load Cell` (or serial: `calibrate loadcell`)
2. [ ] Remove everything from output tray → press **"Zero"** → records offset
3. [ ] Place **50g calibration weight** → press **"Calibrate"** → records scale factor
4. [ ] **Verify:** Display shows **50.0g ±1g**
5. [ ] Remove weight, place **10g** → should read **10.0g ±0.5g**
6. [ ] Remove weight → should return to **0.0g ±0.1g**
7. [ ] Save calibration to NVS

### Step 16.6 - Touch Screen Calibration
1. [ ] Enter: `Settings → Calibration → Touch`
2. [ ] Tap each of 4 corner crosshair targets precisely
3. [ ] Tap center target
4. [ ] Verify touch accuracy across screen: **<5mm error everywhere**
5. [ ] Save calibration

### Step 16.7 - Motor Homing Calibration
1. [ ] Enter: `Settings → Calibration → Motors`
2. [ ] For each motor (1-10):
   - Run **"Find Home"** → motor rotates until Hall sensor triggers
   - Position saved as home (slot 1 position)
3. [ ] Verify: command to go to slot N → carousel stops at correct slot every time

### Step 16.8 - Full Dispense Integration Test
1. [ ] Load test pills into slot 1
2. [ ] Run: `dispense 1 2` (slot 1, 2 pills)
3. [ ] Verify complete sequence:
   - [ ] Carousel rotates to slot 1 (~500ms)
   - [ ] Hall sensor confirms correct position
   - [ ] Gate opens (servo to 90°)
   - [ ] Optical sensor counts exactly 2 pills falling
   - [ ] Gate closes (servo to 0°)
   - [ ] Load cell verifies weight matches expected (2 pills × pill weight)
   - [ ] DOSE_DISPENSED event sent to cloud API
4. [ ] **Repeat for ALL 10 slots**
5. [ ] Test **jam detection:** deliberately block pill chute → should generate Error E101

### Step 16.9 - Connectivity Tests

| Test | Expected | Pass? |
|------|----------|-------|
| WiFi connects (2.4GHz) | <30 seconds | [ ] |
| WiFi connects (5GHz) | <30 seconds | [ ] |
| WiFi auto-reconnect | Reconnects in <60s after AP off/on | [ ] |
| BLE advertising | Discoverable by phone | [ ] |
| API heartbeat | Every 60s ±5s | [ ] |
| Heartbeat data | Battery%, temp, WiFi RSSI, slot data | [ ] |
| HTTPS/TLS 1.3 | Certificate validated | [ ] |
| OTA update | Firmware downloads and installs | [ ] |

### Step 16.10 - Audio Tests

| Test | Expected | Pass? |
|------|----------|-------|
| 1kHz test tone | Clear, no distortion | [ ] |
| Volume: 10 levels | Each level distinguishable, 60-90 dB | [ ] |
| Alert tone | Distinct and attention-getting | [ ] |
| Voice prompt (if loaded) | Intelligible speech | [ ] |
| Quiet hours mode | Audio fully muted | [ ] |

---

<a name="phase-17"></a>
## PHASE 17: SMD-200 Travel Device Build
**Estimated time: 2-3 hours total**

### Step 17.1 - Travel Device BOM Additions

| Component | Part | Qty | Price | Notes |
|-----------|------|-----|-------|-------|
| MCU | ESP32-S3-MINI-1 | 1 | $4.00 | Smaller module, single-core 160MHz |
| Cellular | SIM7080G (SIMCom) | 1 | $12-15 | LTE Cat-M1 + GPS, 17.6x15.7mm LGA |
| Display | SSD1306 2.4" OLED (128x64, I2C) | 1 | $8.00 | Address 0x3C |
| Charge IC | TP4056 + DW01 protection | 1 | $0.50 | USB-C 5V/1A charging |
| Fuel Gauge | MAX17048 | 1 | $2.00 | I2C battery monitor |
| Battery | Li-Po 3000mAh pouch (3.7V, JST-PH) | 1 | $8.00 | 60x50x8mm |
| Servos | SG90 micro | 4 | $1.50 ea | Gate control per slot |
| Optical | TCPT1300X01 | 4 | $0.80 ea | Pill counting |
| SIM card | Nano SIM socket (push-push) | 1 | $0.80 | |
| Antennas | u.FL LTE antenna + u.FL GPS antenna | 2 | $5.00 ea | Connect LAST |
| USB-C | 16-pin connector | 1 | $0.80 | Charging + data |

### Step 17.2 - Travel PCB Assembly (80x60mm, 2-layer)

| Order | Component | Notes |
|-------|-----------|-------|
| 1 | Passives (0603) | Solder paste + hot air |
| 2 | ESP32-S3-MINI-1 | Hot air reflow |
| 3 | SIM7080G | **Large LGA (17.6x15.7mm)** — hot air at 270°C |
| 4 | TP4056 module | SOT-23-6 or breakout module |
| 5 | MAX17048 fuel gauge | Tiny package, hot air |
| 6 | Connectors | USB-C, SIM socket, u.FL — hand solder |

### Step 17.3 - SIM7080G Installation (Most Challenging)
1. [ ] Apply solder paste to ALL pads + large ground paddle
2. [ ] Place with tweezers (17.6 x 15.7mm)
3. [ ] Hot air at **270°C** from above — watch for solder to flow at edges
4. [ ] Module "settles" when solder melts
5. [ ] **Inspect under microscope** for bridges (especially ground paddle area)
6. [ ] Attach u.FL antenna connectors **LAST** (cables are fragile)

### Step 17.4 - Travel Device GPIO Map (from Section 11.2 — authoritative)

| GPIO | Function | Direction | Notes |
|------|----------|-----------|-------|
| 0 | BOOT button | Input | Pull-up |
| 1 | I2C SDA | Bidir | Display (SSD1306) + sensors |
| 2 | I2C SCL | Output | Shared bus |
| **3** | **Cellular TXD** | Output | → SIM7080G RXD |
| **4** | **Cellular RXD** | Input | ← SIM7080G TXD |
| **5** | **Cellular PWRKEY** | Output | Power control |
| **6** | **Cellular STATUS** | Input | Module status |
| 7 | Buzzer | Output | PWM alert tone |
| 8 | Vibration motor | Output | On/Off |
| 9-12 | Servo PWM 1-4 | Output | Gate control |
| 13-16 | Optical sensors 1-4 | Input | Pill counting |
| 17 | Button 1 (Confirm) | Input | Pull-up |
| 18 | Button 2 (Cancel) | Input | Pull-up |
| 19 | Battery voltage ADC | ADC | Fuel gauge backup |
| 20-21 | USB D-/D+ | Bidir | Programming |

### Step 17.5 - Battery Installation
1. [ ] Connect Li-Po 3000mAh (JST-PH 2-pin)
2. [ ] **VERIFY POLARITY** (red=+, black=-)
3. [ ] Secure with foam tape (**NEVER screws near Li-Po**)
4. [ ] TP4056 LED should light when USB-C power connected
5. [ ] Full charge time: 3-4 hours at 1A

### Step 17.6 - Travel Device Test Checklist

| Test | Expected | Pass? |
|------|----------|-------|
| USB-C charging | LED lights, battery charges | [ ] |
| Fuel gauge (MAX17048) | Accurate battery % | [ ] |
| OLED display (SSD1306) | Shows 128x64 UI | [ ] |
| Cellular (LTE Cat-M1) | Network registration <30s | [ ] |
| GPS fix | Gets coordinates (may take 1-3 min cold start) | [ ] |
| SIM card detection | SIM authenticated | [ ] |
| Servo 1-4 | All open/close | [ ] |
| Optical sensors 1-4 | All detect pills | [ ] |
| Buzzer | Beeps at set frequency | [ ] |
| Vibration motor | Vibrates | [ ] |
| API heartbeat via LTE | Sent and received by server | [ ] |
| Battery life (standby) | >14 days | [ ] |
| Battery life (4 doses/day) | >7 days | [ ] |

---

<a name="phase-18"></a>
## PHASE 18: Production Testing & Quality Sign-Off

### Step 18.1 - In-Circuit Test (ICT)

| Test Point | Expected | Min | Max | Measured | Pass? |
|-----------|----------|-----|-----|----------|-------|
| VIN (12V input) | 12.0V | 11.4V | 12.6V | ___V | [ ] |
| VSYS (BQ24195 out) | 12.0V | 11.0V | 13.0V | ___V | [ ] |
| 5V rail | 5.0V | 4.75V | 5.25V | ___V | [ ] |
| 3.3V rail | 3.3V | 3.2V | 3.4V | ___V | [ ] |
| Battery pack | 7.4V | 6.0V | 8.4V | ___V | [ ] |
| ESP32 VCC | 3.3V | 3.2V | 3.4V | ___V | [ ] |

### Step 18.2 - Functional Test (5 min/unit)

| Step | Test | Pass Criteria | Pass? |
|------|------|---------------|-------|
| 1 | Power on | Boots in <10s | [ ] |
| 2 | WiFi connect | Connects to test AP | [ ] |
| 3 | Display test | All pixels OK, colors correct | [ ] |
| 4 | Touch test | 4 corners + center | [ ] |
| 5 | Motor test (all 10) | All rotate smoothly | [ ] |
| 6 | Sensor test (all) | All respond correctly | [ ] |
| 7 | Audio test | 1kHz tone at 80dB | [ ] |
| 8 | API heartbeat | Sent and received | [ ] |
| 9 | Serial number | Programmed (SMD-XXXXXXXX) | [ ] |

### Step 18.3 - 24-Hour Burn-In

| Phase | Duration | Conditions | Monitoring |
|-------|----------|------------|------------|
| Normal | 8 hours | 25°C room temp | IC temps, power consumption |
| High temp | 8 hours | 40°C (climate chamber) | IC temps <60°C |
| Cycling | 8 hours | Dispense every 10 min | Accuracy = 100% |

### Step 18.4 - Quality Sign-Off

| Checklist Item | Check |
|----------------|-------|
| All components verified | [ ] |
| PCB visual inspection (no bridges) | [ ] |
| All power tests passed | [ ] |
| All functional tests passed | [ ] |
| All calibrations saved | [ ] |
| Serial number programmed | [ ] |
| Firmware version: ___.___.___ | [ ] |
| Enclosure sealed, labels applied | [ ] |

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Electronics Engineer | ________________ | ____________ | ____/____/____ |
| Firmware Engineer | ________________ | ____________ | ____/____/____ |
| QA Inspector | ________________ | ____________ | ____/____/____ |

---

<a name="appendix-a"></a>
## APPENDIX A: Master GPIO Reference (SMD-100)

> Source: Firmware `pins.h` (authoritative) cross-referenced with Technical Documentation Section 11.1

| GPIO | Function | Dir | Bus/Interface | Notes |
|------|----------|-----|---------------|-------|
| 0 | BOOT button | In | — | 10K pull-up, also confirm button |
| 1-5 | LCD R0-R4 | Out | RGB parallel | Red channel (5 bits) |
| 6-11 | LCD G0-G5 | Out | RGB parallel | Green channel (6 bits) |
| 12-16 | LCD B0-B4 | Out | RGB parallel | Blue channel (5 bits) |
| 17 | I2S BCLK | Out | I2S | Audio bit clock |
| 18 | I2S LRCLK | Out | I2S | Audio L/R clock |
| 15 | I2S DOUT | Out | I2S | Audio data (shared with LCD_B3 — see note) |
| 20 | USB D- | Bidir | USB | USB OTG |
| 21 | USB D+ / LCD_HSYNC | Bidir/Out | USB / RGB | Dual function |
| 26 | PIR motion | In | Digital | AM312 output |
| 27 | Door/tray reed switch | In | Digital | 10K pull-up |
| 32 | HX711 DOUT | In | Custom serial | Load cell data |
| 33 | HX711 SCK | Out | Custom serial | Load cell clock |
| 34 | Button Cancel | In | Digital | |
| 35 | SD CMD (MOSI) | Bidir | SPI | SD card |
| 36 | SD CLK | Out | SPI | SD card |
| 37 | SD DATA0 (MISO) | Bidir | SPI | SD card |
| 38 | Touch SDA | Bidir | **I2C Bus 0** | GT911 touch |
| 39 | Touch SCL | Out | **I2C Bus 0** | GT911 touch |
| 40 | Touch INT | In | Digital | Interrupt from GT911 |
| 41 | Touch RST | Out | Digital | GT911 reset |
| 42 | Backlight PWM | Out | LEDC PWM | Via MOSFET to display |
| 43 | Gate servo PWM | Out | LEDC PWM | SG90 control |
| 44 | Sensor I2C SDA | Bidir | **I2C Bus 1** | SHT40, BH1750, MCP23017 |
| 45 | LCD CLK | Out | RGB parallel | Pixel clock |
| 46 | Sensor I2C SCL | Out | **I2C Bus 1** | Sensor bus clock |
| 47 | LCD VSYNC | Out | RGB parallel | Vertical sync |
| 48 | LCD DE / LED data | Out | RGB parallel | Data enable |
| MCP23017 GPA0-7 | Motor control (motors 1-4) | Out | I2C-expanded | 4 pins per motor |
| MCP23017 GPB0-7 | Optical sensors 1-8 / Motors 5-8 | In/Out | I2C-expanded | Interrupt-capable |

> **Note on GPIO15:** The firmware defines GPIO15 as I2S_DOUT, but it is also mapped as LCD_B3. If using RGB565 (16-bit) mode, only 5+6+5=16 data pins are needed. Depending on color depth, GPIO15 may be available for audio. Verify in your specific schematic.

---

<a name="appendix-b"></a>
## APPENDIX B: Power Consumption Budget

| Component | Active Current | Sleep Current | Notes |
|-----------|---------------|---------------|-------|
| ESP32-S3 | 240mA | 10µA | WiFi TX peak |
| Display (4.3" TFT) | 150mA | 0mA | Backlight at 50% |
| Motors (1 active) | 200mA | 0mA | During dispense only |
| Sensors (all) | 20mA | 5mA | I2C polling |
| Audio (MAX98357A) | 300mA | 0mA | Peak during alert |
| Other (LEDs, misc) | 30mA | 5mA | |
| **TOTAL** | **940mA** | **20mA** | |

**Battery Life (5000mAh, 7.4V → 5V via buck):**
- Standby: 5000mAh / 20mA = **250 hours ≈ 10 days**
- With 4 dispenses/day: **~48 hours** (meets target)

---

<a name="appendix-c"></a>
## APPENDIX C: Common Pitfalls & Solutions

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Motor EMI | Stepper motors cause electromagnetic interference on WiFi | Add **100nF cap across each motor coil**, separate power paths, ferrite beads |
| WiFi interference | Motors running kills WiFi | Separate motor ground return, add LC filtering on motor power entry |
| Power brown-out | ESP32 resets when motor starts | Add **inrush current limiting** (soft-start), ensure supply can handle 940mA peak |
| Touch erratic | Random touch events | **Ground display bezel**, use shielded FFC cable |
| Battery drain | Won't last 48 hours | Implement proper **deep sleep modes**, kill power to peripherals when idle |
| Load cell drift | Readings change over time | **Temperature compensation** (read SHT40 and correct), periodic tare (re-zero) |
| Audio distortion | Clipping at high volume | Limit gain to 12dB (GAIN pin), add soft clipping in firmware |
| Optical sensor false counts | Ambient light triggers sensor | **Shield sensor** from room light, verify 100ohm LED resistor value |

---

<a name="appendix-d"></a>
## APPENDIX D: Troubleshooting Guide

### Power Issues
| Symptom | Cause | Fix |
|---------|-------|-----|
| No power | Barrel jack disconnected / blown fuse | Check connector continuity, replace fuse |
| 5V rail missing | TPS62150 not soldered / inductor open | Reflow IC, check inductor continuity |
| 3.3V rail low or absent | AP2112K bad joint / overloaded | Reflow, check load <600mA |
| BQ24195 overheating | Thermal pad not connected | Reflow — ensure thermal vias filled |
| Battery not charging | Wrong NTC resistor / BMS tripped | Check NTC value, check BMS fuse/MOSFETs |

### ESP32 Issues
| Symptom | Cause | Fix |
|---------|-------|-----|
| Won't boot | EN pin floating | Add 10K pull-up to 3.3V |
| Boot loop | Flash corrupt or brownout | Re-flash firmware, check power stability |
| Stuck in download mode | GPIO0 held LOW | Check 10K pull-up on GPIO0 |
| No serial output | Wrong baud / TX-RX swapped | Use 115200 baud, swap TX/RX wires |
| WiFi weak/disconnects | Metal near antenna area | Ensure 15mm clearance, no ground under antenna |
| PSRAM not detected | Wrong module variant | Verify marking shows "N16R8" |

### Display Issues
| Symptom | Cause | Fix |
|---------|-------|-----|
| Blank screen | FFC not seated or reversed | Reseat cable, verify contact orientation |
| No backlight | 2N7002 MOSFET dead / GPIO42 not driven | Replace MOSFET, check firmware PWM |
| Wrong colors | R/G/B channels swapped in firmware | Check `pins.h` RGB pin assignments vs FFC pinout |
| Touch not responding | I2C bus 0 not connected | Check GPIO38/39 wiring, 4.7K pull-ups |
| Touch erratic/jumpy | ESD damage or ungrounded bezel | Install TVS diodes, ground display frame |

### Motor Issues
| Symptom | Cause | Fix |
|---------|-------|-----|
| Motor doesn't turn | ULN2003A dead | Replace driver IC |
| Turns wrong direction | Coil wires swapped | Fix order: Blue-Pink-Yellow-Orange |
| Motor stalls under load | 5V not reaching motor | Check 5V at connector, ULN2003A COM to 5V |
| Generates WiFi interference | No EMI filtering | Add 100nF across coils + ferrite on power |

### Sensor Issues
| Symptom | Cause | Fix |
|---------|-------|-----|
| I2C device not found | Pull-ups missing / wrong address | Add 4.7K pull-ups, verify address pins |
| Load cell drifts | Temperature / mechanical stress | Compensate with SHT40 reading, check mount |
| Optical miscounts | Ambient light leak | Shield sensor gap, increase LED current |
| PIR false triggers | Motor EMI / heat source nearby | Add 100nF filter cap, relocate away from motors |

### Debug Serial Commands
```
> status          System overview (WiFi, battery, temp, API status)
> motor test 1    Test motor 1 rotation
> motor test all  Test all motors sequentially
> sensor test     Read all sensors and display values
> dispense 1 2    Dispense from slot 1, 2 pills
> calibrate loadcell   Enter load cell calibration
> version         Show firmware version and build date
> i2c scan 0      Scan I2C bus 0 (touch)
> i2c scan 1      Scan I2C bus 1 (sensors)
> wifi status     Show WiFi connection details
> reboot          Restart device
```

---

<a name="appendix-e"></a>
## APPENDIX E: Second-Source Strategy

> Always have a backup supplier for critical components to avoid production delays.

| Critical Component | Primary | Second Source |
|-------------------|---------|--------------|
| MCU | ESP32-S3-WROOM-1-**N16R8** | ESP32-S3-WROOM-1-**N8R8** (less flash, still works) |
| Power Path IC | BQ24195 | BQ25895 (newer, pin-compatible concept) |
| 5V Buck | TPS62150 | AP62150 (Diodes Inc, $0.80, 93% eff) |
| 3.3V LDO | AP2112K | XC6220B331MR (lower Iq, $0.40) |
| Motor Driver | ULN2003AN (TI) | ULN2003A (ST) — identical spec |
| Temp Sensor | SHT40 | SHT31 (slightly larger, $3.50) |
| Optical Sensor | TCPT1300X01 | GP1A57HRJ00F (Sharp, 5mm gap, $1.20) |
| Load Cell ADC | HX711 | NAU7802 (I2C, $1.50, smaller) |

---

## CONTACTS

| Issue | Contact |
|-------|---------|
| Hardware questions | hardware@[company].ch |
| Firmware questions | firmware@[company].ch |
| Component sourcing | procurement@[company].ch |
| Quality issues | qa@[company].ch |

**Slack:** #hardware, #firmware, #production

---

*Derived from Smart Medication Dispenser Technical Documentation v4.0, February 2026*
*GPIO mappings verified against firmware `pins.h` (authoritative source)*
*Classification: Confidential - Engineering Team*
