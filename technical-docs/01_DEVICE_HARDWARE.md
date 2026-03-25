# Device Hardware Specifications

**Smart Medication Dispenser — Complete Electronics Engineering Guide**

**Designed in Lausanne, Switzerland**

---

## Document Information

| | |
|:--|:--|
| Version | 3.0 |
| Last Updated | February 2026 |
| Classification | Confidential — Engineering Team |
| Compliance | CE Class IIa, Swissmedic |

---

## 1. System Overview

### 1.1 Product Family

| Device | Use Case | Form Factor |
|:-------|:---------|:------------|
| **SMD-100 (Home)** | Daily home use | Countertop, permanent |
| **SMD-200 (Travel)** | Portable travel | Handheld, battery-powered |

### 1.2 Key Specifications Summary

| Specification | SMD-100 (Home) | SMD-200 (Travel) |
|:--------------|:---------------|:-----------------|
| **Dimensions** | 305 × 203 × 254 mm | 152 × 102 × 76 mm |
| **Weight** | 1.6 kg (empty) | 360 g (empty) |
| **Medication slots** | 10 | 4 |
| **Capacity per slot** | 90 days | 14 days |
| **Max pill diameter** | 20 mm | 15 mm |
| **Display** | 4.3" TFT touch | 2.4" OLED touch |
| **Connectivity** | WiFi 2.4/5 GHz, BLE 5.0 | WiFi, LTE Cat-M1, BLE 5.0 |
| **Primary power** | 12V DC, 2A adapter | Li-Po 3000 mAh |
| **Backup battery** | Li-ion 5000 mAh (48h) | — (primary is battery) |
| **Operating temp** | 10-35°C | 0-40°C |
| **Storage temp** | -10-50°C | -20-60°C |
| **IP rating** | IP22 (splash resistant) | IP44 (travel protected) |
| **Certifications** | CE, FCC, Swissmedic | CE, FCC, Swissmedic |

---

## 2. SMD-100 Home Device

### 2.1 System Block Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SMD-100 HOME DEVICE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐        │
│  │   AC ADAPTER    │     │  POWER MGMT     │     │    BATTERY      │        │
│  │   12V/2A        │────▶│  BQ24195 +      │◀───▶│   18650 × 2     │        │
│  │   (Type J CH)   │     │  TPS62150       │     │   5000 mAh      │        │
│  └─────────────────┘     └────────┬────────┘     └─────────────────┘        │
│                                   │                                          │
│                          ┌────────┴────────┐                                │
│                          │   3.3V / 5V     │                                │
│                          │   Power Rails   │                                │
│                          └────────┬────────┘                                │
│                                   │                                          │
│  ┌───────────────────────────────┼───────────────────────────────┐          │
│  │                               ▼                               │          │
│  │                    ┌─────────────────────┐                    │          │
│  │                    │   ESP32-S3-WROOM-1  │                    │          │
│  │                    │   Dual-core 240MHz  │                    │          │
│  │                    │   512KB SRAM        │                    │          │
│  │                    │   8MB Flash         │                    │          │
│  │                    │   8MB PSRAM         │                    │          │
│  │                    │   WiFi + BLE 5.0    │                    │          │
│  │                    └──────────┬──────────┘                    │          │
│  │                               │                               │          │
│  │    ┌──────────────┬──────────┼──────────┬──────────────┐     │          │
│  │    ▼              ▼          ▼          ▼              ▼     │          │
│  │ ┌──────┐    ┌──────────┐ ┌──────┐  ┌──────────┐  ┌───────┐  │          │
│  │ │DISP  │    │  MOTORS  │ │SENSOR│  │  AUDIO   │  │STORAGE│  │          │
│  │ │4.3"  │    │ 10×ULN   │ │ HUB  │  │MAX98357A │  │SD Card│  │          │
│  │ │TFT   │    │ 2003A    │ │      │  │  + SPK   │  │16GB   │  │          │
│  │ └──────┘    └──────────┘ └──────┘  └──────────┘  └───────┘  │          │
│  │                                                              │          │
│  └──────────────────────────────────────────────────────────────┘          │
│                                                                              │
│  SENSOR HUB DETAIL:                                                         │
│  ┌──────────────────────────────────────────────────────────────┐          │
│  │  • 10× Optical Pill Counters (TCPT1300X01)                   │          │
│  │  • 10× Hall Effect Position Sensors (A3144)                  │          │
│  │  • 1× Load Cell + HX711 ADC (Output Tray)                    │          │
│  │  • 1× SHT40 Temp/Humidity (I2C)                              │          │
│  │  • 1× PIR Motion Sensor (AM312)                              │          │
│  │  • 1× Reed Switch (Door/Tray)                                │          │
│  │  • 1× Ambient Light Sensor (BH1750)                          │          │
│  └──────────────────────────────────────────────────────────────┘          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. MCU Selection & Recommendations

### 3.1 Primary Recommendation: ESP32-S3-WROOM-1

| Parameter | Specification |
|:----------|:--------------|
| **Chip** | ESP32-S3-WROOM-1-N16R8 |
| **CPU** | Xtensa LX7 dual-core, 240 MHz |
| **SRAM** | 512 KB |
| **Flash** | 16 MB (quad SPI) |
| **PSRAM** | 8 MB (octal SPI) |
| **GPIO** | 45 programmable |
| **ADC** | 20 channels, 12-bit |
| **PWM** | 8 channels (LEDC) |
| **SPI** | 4 interfaces |
| **I2C** | 2 interfaces |
| **I2S** | 2 interfaces |
| **UART** | 3 interfaces |
| **USB** | OTG support |
| **Operating voltage** | 3.0-3.6V (3.3V typical) |
| **Package** | 25.5 × 18.0 mm module |
| **Price** | $4-6 (volume 1K) |

**Why We Recommend ESP32-S3:**

| Advantage | Benefit |
|:----------|:--------|
| Integrated WiFi + BLE | Reduces BOM, no external module |
| Dual-core 240MHz | Handles UI + networking simultaneously |
| 8MB PSRAM | Large buffers for audio, display |
| Hardware crypto | AES, SHA, RSA acceleration for security |
| USB OTG | Direct firmware programming, diagnostics |
| ESP-IDF mature | Excellent documentation, community |
| FreeRTOS included | Real-time task management |
| Low power modes | 10µA deep sleep for battery backup |
| OTA support | Built-in dual-partition update |

### 3.2 Alternative MCU Options

| Option | Part Number | Pros | Cons | Cost |
|:-------|:------------|:-----|:-----|-----:|
| **Option A (Recommended)** | ESP32-S3-WROOM-1-N16R8 | Best balance | None significant | $5 |
| **Option B** | STM32F407VGT6 + ESP32-C3 | More GPIO, medical variants | Two chips, more complex | $12 |
| **Option C** | nRF52840 + ESP32-C3 | Ultra-low power BLE | WiFi separate, less processing | $14 |
| **Option D** | Raspberry Pi Pico W | Very cheap | Less memory, limited crypto | $4 |

**Recommendation:** Start with ESP32-S3. Only consider STM32F4 if you need medical-grade certification (STM32 has ISO 13485 variants).

### 3.3 MCU Circuit Design

```
                                  ESP32-S3-WROOM-1
                              ┌──────────────────────┐
                              │                      │
        3.3V ────────────────▶│ VCC (3.3V)          │
                              │                      │
        GND ─────────────────▶│ GND                 │
                              │                      │
        EN (10K pull-up) ────▶│ EN                  │
                              │                      │
        BOOT (10K pull-up) ──▶│ GPIO0 (BOOT)       │
                              │                      │
        USB D+ ──────────────▶│ GPIO19 (USB_D+)    │
        USB D- ──────────────▶│ GPIO20 (USB_D-)    │
                              │                      │
                              │         GPIO1-18   ├──▶ Peripherals
                              │         GPIO21-48  │
                              │                      │
                              │         ANTENNA    ├──▶ PCB Antenna
                              │                      │
                              └──────────────────────┘
```

**Critical Design Rules:**

1. **Power Supply:**
   - Place 10µF + 0.1µF capacitors within 3mm of VCC pins
   - Use ferrite bead (600Ω @ 100MHz) on power input
   - Ensure 3.3V supply can provide 500mA peak (WiFi TX)

2. **Reset/Boot:**
   - EN pin: 10K pull-up to 3.3V, 0.1µF to GND (RC delay)
   - GPIO0: 10K pull-up, button to GND for boot mode
   - Add external reset button connected to EN

3. **Antenna:**
   - Keep 15mm clearance around antenna area
   - No ground plane under antenna
   - No traces crossing antenna feed

4. **Crystal (if external):**
   - 40MHz crystal with 10pF load capacitors
   - Keep traces short (<5mm)
   - Guard with ground ring

---

## 4. Display Subsystem

### 4.1 Recommended Display: 4.3" TFT with Capacitive Touch

| Parameter | Specification |
|:----------|:--------------|
| **Type** | TFT LCD with IPS viewing angles |
| **Size** | 4.3" diagonal (105.5 × 67.2 mm active) |
| **Resolution** | 800 × 480 pixels |
| **Interface** | RGB888 (24-bit parallel) or SPI |
| **Touch** | Capacitive, multi-touch (GT911) |
| **Driver IC** | ST7262 or ILI9806 |
| **Backlight** | LED, PWM dimmable |
| **Viewing angle** | 170° H / 170° V |
| **Brightness** | 400 cd/m² |
| **Connector** | 40-pin FFC, 0.5mm pitch |

### 4.2 Display Options Comparison

| Option | Part | Interface | Touch | Price | Notes |
|:-------|:-----|:----------|:------|------:|:------|
| **Recommended** | Waveshare 4.3" RGB | RGB888 | GT911 (I2C) | $28 | Best for ESP32-S3 |
| Alternative A | Generic 4.3" SPI | SPI | XPT2046 (SPI) | $18 | Slower refresh |
| Alternative B | Nextion 4.3" | UART | Integrated | $45 | Easy but proprietary |
| Alternative C | 5" HDMI | HDMI | USB | $35 | Requires Pi |

**Why RGB Interface (Recommended):**
- 60 FPS refresh rate (vs 15 FPS for SPI)
- Smooth UI animations
- ESP32-S3 has native LCD controller
- Better user experience for elderly

### 4.3 Display Wiring

```
ESP32-S3                    4.3" TFT Display
─────────────               ──────────────────
GPIO45 ────────────────────▶ LCD_CLK
GPIO48 ────────────────────▶ LCD_DE
GPIO47 ────────────────────▶ LCD_VSYNC
GPIO21 ────────────────────▶ LCD_HSYNC

GPIO1  ────────────────────▶ LCD_R0
GPIO2  ────────────────────▶ LCD_R1
GPIO3  ────────────────────▶ LCD_R2
GPIO4  ────────────────────▶ LCD_R3
GPIO5  ────────────────────▶ LCD_R4

GPIO6  ────────────────────▶ LCD_G0
GPIO7  ────────────────────▶ LCD_G1
GPIO8  ────────────────────▶ LCD_G2
GPIO9  ────────────────────▶ LCD_G3
GPIO10 ────────────────────▶ LCD_G4
GPIO11 ────────────────────▶ LCD_G5

GPIO12 ────────────────────▶ LCD_B0
GPIO13 ────────────────────▶ LCD_B1
GPIO14 ────────────────────▶ LCD_B2
GPIO15 ────────────────────▶ LCD_B3
GPIO16 ────────────────────▶ LCD_B4

GPIO38 ────────────────────▶ TOUCH_SDA (I2C)
GPIO39 ────────────────────▶ TOUCH_SCL (I2C)
GPIO40 ────────────────────▶ TOUCH_INT
GPIO41 ────────────────────▶ TOUCH_RST

3.3V   ────────────────────▶ VCC
GND    ────────────────────▶ GND
GPIO42 ─────[PWM]──────────▶ BACKLIGHT (via MOSFET)
```

### 4.4 Display Software: LVGL

**Recommended UI Framework:** LVGL v8.3+

| Feature | Value |
|:--------|:------|
| Library | LVGL (Light and Versatile Graphics Library) |
| Version | 8.3.x or 9.x |
| Color depth | 16-bit (RGB565) or 24-bit |
| Font | Built-in + custom (Montserrat recommended) |
| Theme | Default dark theme for elderly visibility |
| Refresh | Double-buffered, DMA transfer |

**LVGL Configuration Recommendations:**

```c
// lv_conf.h key settings
#define LV_COLOR_DEPTH 16          // RGB565 for performance
#define LV_DPI_DEF 130             // Match display DPI
#define LV_USE_GPU_ESP32_S3 1      // Hardware acceleration
#define LV_MEM_SIZE (48 * 1024)    // 48KB for LVGL
#define LV_FONT_MONTSERRAT_24 1    // Large readable font
#define LV_FONT_MONTSERRAT_32 1    // Even larger for elderly
#define LV_THEME_DEFAULT_DARK 1    // High contrast
```

---

## 5. Power System Design

### 5.1 Power Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           POWER SYSTEM ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  AC INPUT                        POWER PATH                    BATTERY       │
│  ┌──────────┐                   ┌──────────┐                 ┌──────────┐   │
│  │ 100-240V │                   │ BQ24195  │                 │ 2× 18650 │   │
│  │ AC       │──▶ 12V/2A ──────▶│ Power    │◀───────────────▶│ 7.4V     │   │
│  │          │    Adapter        │ Path IC  │ Charge/         │ 5000mAh  │   │
│  └──────────┘                   └────┬─────┘ Discharge       └──────────┘   │
│                                      │                                       │
│                                      │ VSYS (4.5-12V)                       │
│                                      ▼                                       │
│                              ┌──────────────┐                               │
│                              │  TPS62150    │                               │
│                              │  5V @ 1A     │                               │
│                              │  Buck        │                               │
│                              └──────┬───────┘                               │
│                                     │                                        │
│               ┌─────────────────────┼─────────────────────┐                 │
│               │                     │                     │                 │
│               ▼                     ▼                     ▼                 │
│       ┌──────────────┐     ┌──────────────┐     ┌──────────────┐           │
│       │  AP2112K     │     │   Direct     │     │  Direct      │           │
│       │  3.3V @ 600mA│     │   5V         │     │  12V (input) │           │
│       │  LDO         │     │              │     │              │           │
│       └──────┬───────┘     └──────┬───────┘     └──────┬───────┘           │
│              │                    │                     │                   │
│              ▼                    ▼                     ▼                   │
│       ┌──────────────┐    ┌──────────────┐     ┌──────────────┐            │
│       │ ESP32-S3     │    │ Sensors      │     │ Motors       │            │
│       │ Display Logic│    │ Audio Amp    │     │ (via drivers)│            │
│       │ SD Card      │    │ USB          │     │              │            │
│       └──────────────┘    └──────────────┘     └──────────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Power Component Recommendations

#### AC Adapter

| Specification | Requirement |
|:--------------|:------------|
| Input | 100-240V AC, 50/60Hz |
| Output | 12V DC, 2A (24W) |
| Connector | 5.5mm × 2.1mm barrel, center positive |
| Efficiency | >85% (Level VI) |
| Safety | CE, UL, GS certified |
| Cable length | 1.8m minimum |

**Recommended Suppliers:**
- Mean Well (GST25E12-P1J) — Industrial quality, CHF 12
- CUI Inc (SDI24-12-UD-P5) — Good value, CHF 8
- Traco Power (TXL025-12S) — Premium, CHF 18

**Plug Type:** Swiss Type J (SEV 1011) for Switzerland, include EU adapter

#### Power Path Controller: BQ24195

| Parameter | Value |
|:----------|:------|
| Part | BQ24195RGER (TI) |
| Input voltage | 4.35-17V |
| Battery voltage | 7.4V (2S Li-ion) |
| Charge current | Up to 2.1A (set to 1A) |
| System current | Up to 2.5A |
| Features | I2C control, NTC monitoring |
| Package | QFN-24 (4×4mm) |
| Price | $3.50 |

**Why BQ24195:**
- Single-chip solution for charging + power path
- I2C programmable (charge current, voltage)
- Automatic switchover AC ↔ battery
- Thermal regulation
- Status reporting to MCU

**Alternative:** BQ25895 (newer, more features, $4.50)

#### 5V Buck Regulator: TPS62150

| Parameter | Value |
|:----------|:------|
| Part | TPS62150RGTR (TI) |
| Input voltage | 3-17V |
| Output voltage | 5V fixed |
| Output current | 1A continuous |
| Efficiency | 95% typical |
| Switching freq | 2.5MHz (small inductor) |
| Package | QFN-16 (3×3mm) |
| Price | $1.80 |

**Why TPS62150:**
- High efficiency = less heat
- Small footprint
- 2.5MHz = tiny inductor (2.2µH)
- Auto-PFM for light load efficiency

**Alternative:** TPS62135 (lower quiescent current for battery mode)

#### 3.3V LDO: AP2112K-3.3

| Parameter | Value |
|:----------|:------|
| Part | AP2112K-3.3TRG1 (Diodes Inc) |
| Input voltage | 2.5-6V |
| Output voltage | 3.3V ±2% |
| Output current | 600mA |
| Dropout | 250mV @ 600mA |
| Quiescent | 55µA |
| Package | SOT-25 |
| Price | $0.25 |

**Why AP2112K:**
- Very low cost
- Low dropout
- Built-in thermal protection
- Widely available

### 5.3 Battery Backup Design

#### Battery Selection

| Option | Capacity | Size | Weight | Price | Recommendation |
|:-------|:---------|:-----|:-------|------:|:---------------|
| 2× 18650 (2S1P) | 5000mAh | 65×37mm | 96g | $8 | **Recommended** |
| 2× 21700 (2S1P) | 8000mAh | 70×42mm | 140g | $14 | More capacity |
| Li-Po pouch | 5000mAh | Custom | 90g | $12 | Compact but fragile |

**Recommended 18650 Cells:**
- Samsung INR18650-25R (2500mAh, 20A) — $4 each
- LG HG2 (3000mAh, 20A) — $5 each
- Sony VTC6 (3000mAh, 15A) — $6 each

#### Battery Protection

```
Battery Pack with BMS:

┌─────────────────────────────────────────────────┐
│                  BMS Board                       │
│                                                  │
│  18650 Cell 1    18650 Cell 2                   │
│  ┌─────────┐     ┌─────────┐                    │
│  │  (+)    │     │  (+)    │                    │
│  │ 3.7V    │     │ 3.7V    │                    │
│  │  (-)    │     │  (-)    │                    │
│  └────┬────┘     └────┬────┘                    │
│       │               │                          │
│       └───────┬───────┘                         │
│               │ Series Connection                │
│               │ = 7.4V nominal                   │
│               │                                  │
│        ┌──────┴──────┐                          │
│        │ Protection  │                          │
│        │ IC (DW01A)  │                          │
│        │ + MOSFETs   │                          │
│        └──────┬──────┘                          │
│               │                                  │
│        B+ ────┴──── B-                          │
│                                                  │
└─────────────────────────────────────────────────┘
```

**BMS Requirements:**
- Overvoltage: 8.4V cutoff (4.2V per cell)
- Undervoltage: 6.0V cutoff (3.0V per cell)
- Overcurrent: 5A cutoff
- Short circuit: Instant cutoff
- Balance current: 50-100mA

### 5.4 Power Consumption Budget

| Component | Active | Sleep | Notes |
|:----------|-------:|------:|:------|
| ESP32-S3 | 240mA | 10µA | WiFi TX peak |
| Display | 150mA | 0mA | Backlight at 50% |
| Motors (1 active) | 200mA | 0mA | During dispense |
| Sensors | 20mA | 5mA | I2C polling |
| Audio | 300mA | 0mA | Peak during alert |
| Other | 30mA | 5mA | LEDs, misc |
| **Total** | **940mA** | **20mA** | |

**Battery Life Calculation:**
- Standby: 5000mAh / 20mA = 250 hours ≈ 10 days
- With 4 dispenses/day: ~48 hours (target met ✓)

---

## 6. Motor & Dispensing System

### 6.1 Motor Options Comparison

| Motor Type | Part | Torque | Speed | Cost | Best For |
|:-----------|:-----|:-------|:------|-----:|:---------|
| **28BYJ-48** | Generic | 34mN·m | 15 RPM | $2 | **Recommended** for slots |
| NEMA 17 | 17HS4401 | 400mN·m | 300 RPM | $10 | Heavy carousel |
| Micro Servo | SG90 | 18mN·m | 0.1s/60° | $2 | Gate control |
| DC Gearmotor | GA12-N20 | 50mN·m | 100 RPM | $4 | Alternative |

### 6.2 Recommended: 28BYJ-48 Stepper

| Parameter | Specification |
|:----------|:--------------|
| Type | Unipolar 5-wire stepper |
| Voltage | 5V DC |
| Phase resistance | 50Ω |
| Steps/revolution | 2048 (half-step) |
| Step angle | 5.625°/64 = 0.088° |
| Max speed | 15 RPM |
| Holding torque | 34.3 mN·m |
| Weight | 30g |
| Price | $1.50-2.00 |

**Why 28BYJ-48:**
- Very cheap and widely available
- Low noise (important for home device)
- Sufficient torque for pill dispensing
- 5V compatible (no extra regulator)
- Well-documented

### 6.3 Motor Driver: ULN2003A

| Parameter | Specification |
|:----------|:--------------|
| Part | ULN2003AN (TI, ST) |
| Channels | 7 Darlington pairs |
| Output current | 500mA per channel |
| Output voltage | Up to 50V |
| Input | 3.3V or 5V logic |
| Package | DIP-16 or SOIC-16 |
| Price | $0.30 |

**Wiring (per motor):**

```
ESP32-S3                ULN2003A              28BYJ-48
──────────              ─────────              ─────────
GPIO (IN1) ───────────▶ IN1 ── OUT1 ────────▶ Blue (coil 1)
GPIO (IN2) ───────────▶ IN2 ── OUT2 ────────▶ Pink (coil 2)
GPIO (IN3) ───────────▶ IN3 ── OUT3 ────────▶ Yellow (coil 3)
GPIO (IN4) ───────────▶ IN4 ── OUT4 ────────▶ Orange (coil 4)

                        COM ─────────────────▶ 5V
                        GND ─────────────────▶ GND

                        Motor Red wire ──────▶ 5V (common)
```

**Half-Step Sequence:**

| Step | IN1 | IN2 | IN3 | IN4 |
|:----:|:---:|:---:|:---:|:---:|
| 1 | 1 | 0 | 0 | 0 |
| 2 | 1 | 1 | 0 | 0 |
| 3 | 0 | 1 | 0 | 0 |
| 4 | 0 | 1 | 1 | 0 |
| 5 | 0 | 0 | 1 | 0 |
| 6 | 0 | 0 | 1 | 1 |
| 7 | 0 | 0 | 0 | 1 |
| 8 | 1 | 0 | 0 | 1 |

### 6.4 Gate Servo: SG90

| Parameter | Specification |
|:----------|:--------------|
| Part | SG90 or MG90S |
| Type | Micro servo |
| Torque | 1.8 kg·cm @ 5V |
| Speed | 0.1s / 60° |
| Rotation | 180° |
| Control | PWM (50Hz, 1-2ms pulse) |
| Voltage | 4.8-6V |
| Price | $1.50-3.00 |

**PWM Control:**

```
Servo Position Control:

1ms pulse ─────▶ 0° (closed)
1.5ms pulse ───▶ 90° (middle)
2ms pulse ─────▶ 180° (open)

Period = 20ms (50Hz)

ESP32 LEDC channel can generate this PWM
```

### 6.5 Dispensing Mechanism Design

```
                    CAROUSEL TOP VIEW
                    
                         ┌─────┐
                     ┌───┤Slot1├───┐
                    ┌┤   └─────┘   ├┐
                   ┌┤│             │├┐
              Slot10│ │     ●     │ │Slot2
                   └┤│   Motor    │├┘
                    └┤   Shaft    ├┘
                     │ ┌─────────┐│
                Slot9├─┤         ├┤Slot3
                     │ │  ▼      ││
                     │ │ Output  ││
                Slot8├─┤  Chute  ├┤Slot4
                     │ │         ││
                     │ └─────────┘│
                Slot7├─┐       ┌─┤Slot5
                     └─┤Slot6  ├─┘
                       └───────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Output Tray │
                    │ (Load Cell) │
                    └─────────────┘


                    SIDE VIEW (Cross Section)
                    
                    ┌───────────────────┐
                    │    Pill Storage   │
                    │    ○ ○ ○ ○ ○      │
                    │    ○ ○ ○ ○ ○      │
                    │    ○ ○ ○ ○ ○      │
                    ├───────────────────┤
                    │ Gate (Servo)      │◀── SG90 Servo
                    ├───────────────────┤
                    │ Optical Sensor    │◀── TCPT1300 counts pills
                    │     │             │
                    │     ▼             │
                    │ Output Chute      │
                    │     │             │
                    │     ▼             │
                    ├───────────────────┤
                    │ Output Tray       │◀── Load Cell verifies
                    └───────────────────┘
```

### 6.6 Dispensing Sequence (Code Flow)

```c
// Pseudo-code for dispensing
esp_err_t dispense_medication(uint8_t slot, uint8_t pill_count) {
    // 1. Rotate carousel to slot
    rotate_carousel_to_slot(slot);  // ~500ms
    
    // 2. Verify position with Hall sensor
    if (!verify_carousel_position(slot)) {
        return ESP_ERR_INVALID_STATE;  // Position error
    }
    
    // 3. Open gate
    servo_set_angle(GATE_SERVO, 90);  // Open
    vTaskDelay(200 / portTICK_PERIOD_MS);
    
    // 4. Count pills through optical sensor
    uint8_t counted = 0;
    uint32_t timeout = xTaskGetTickCount() + pdMS_TO_TICKS(5000);
    
    while (counted < pill_count && xTaskGetTickCount() < timeout) {
        if (optical_sensor_triggered()) {
            counted++;
            vTaskDelay(100 / portTICK_PERIOD_MS);  // Debounce
        }
    }
    
    // 5. Close gate
    servo_set_angle(GATE_SERVO, 0);  // Closed
    vTaskDelay(200 / portTICK_PERIOD_MS);
    
    // 6. Verify with load cell
    float weight = load_cell_read_grams();
    float expected = pill_count * PILL_WEIGHT_GRAMS;
    
    if (fabs(weight - expected) > WEIGHT_TOLERANCE) {
        return ESP_ERR_INVALID_SIZE;  // Weight mismatch
    }
    
    // 7. Send DOSE_DISPENSED event
    send_event(EVENT_DOSE_DISPENSED, slot, counted);
    
    return ESP_OK;
}
```

---

## 7. Sensor Subsystem

### 7.1 Pill Counting: TCPT1300X01

| Parameter | Specification |
|:----------|:--------------|
| Part | TCPT1300X01 (Vishay) |
| Type | Transmissive optical sensor |
| Gap | 3mm |
| Wavelength | 950nm (IR) |
| Output | Phototransistor (NPN) |
| Response time | 10µs |
| Package | Through-hole |
| Price | $0.80 |

**Circuit:**

```
        5V                          5V
         │                           │
         │                           │
        ┌┴┐                         ┌┴┐
        │ │ 100Ω                    │ │ 10K
        │ │ (LED current limit)     │ │ (Pull-up)
        └┬┘                         └┬┘
         │                           │
         ▼                           ├──────▶ GPIO (to ESP32)
    ┌─────────┐                      │
    │ IR LED  │   GAP    ┌─────────┐│
    │   ├─────│──────────│Phototran├┘
    │         │   ↑      │   sistor│
    └─────────┘  Pill    └────┬────┘
         │      passes        │
         │                    │
        GND                  GND
```

**Reading Logic:**
- No pill: GPIO HIGH (light passes through)
- Pill passes: GPIO LOW (light blocked)
- Count rising edges for pill count

**Alternative:** GP1A57HRJ00F (Sharp) — smaller, $1.20

### 7.2 Weight Sensor: Load Cell + HX711

| Component | Specification |
|:----------|:--------------|
| Load cell | 1kg rated, 4-wire Wheatstone bridge |
| ADC | HX711 24-bit |
| Sensitivity | 0.1g resolution |
| Interface | 2-wire serial (DOUT, SCK) |
| Sample rate | 10 or 80 SPS |
| Price | $5 (load cell + HX711 module) |

**Wiring:**

```
Load Cell (4-wire)          HX711 Module           ESP32-S3
─────────────────           ────────────           ─────────
Red (E+) ────────────────▶ E+
Black (E-) ──────────────▶ E-
White (A-) ──────────────▶ A-
Green (A+) ──────────────▶ A+
                            
                            VCC ◀────────────────── 5V
                            GND ◀────────────────── GND
                            DOUT ─────────────────▶ GPIO33
                            SCK ◀─────────────────  GPIO32
```

**Calibration Procedure:**

```c
// 1. Zero calibration (empty tray)
float offset = hx711_read_average(10);

// 2. Known weight calibration
float known_weight = 50.0;  // grams
float reading_with_weight = hx711_read_average(10);
float scale = known_weight / (reading_with_weight - offset);

// 3. Read weight
float weight = (hx711_read_raw() - offset) * scale;
```

### 7.3 Temperature & Humidity: SHT40

| Parameter | Specification |
|:----------|:--------------|
| Part | SHT40-AD1B (Sensirion) |
| Temperature range | -40 to +125°C |
| Temperature accuracy | ±0.2°C |
| Humidity range | 0-100% RH |
| Humidity accuracy | ±1.8% RH |
| Interface | I2C (up to 1MHz) |
| Address | 0x44 |
| Package | DFN 1.5×1.5mm |
| Price | $2.50 |

**Why SHT40 (vs DHT22):**
- Much smaller (1.5mm vs 15mm)
- Factory calibrated
- I2C (multi-device bus) vs proprietary 1-wire
- Better accuracy
- Faster response (8s vs 30s)

**Alternative:** SHT31 ($3.50, slightly larger)

### 7.4 Motion Detection: AM312 PIR

| Parameter | Specification |
|:----------|:--------------|
| Part | AM312 (Mini PIR) |
| Detection range | 3-5m |
| Detection angle | 100° |
| Output | Digital HIGH when motion |
| Voltage | 2.7-12V |
| Current | 20µA |
| Delay | ~2s |
| Size | 10mm diameter |
| Price | $1.50 |

**Why AM312 (vs HC-SR501):**
- Tiny (10mm vs 32mm)
- Lower power (20µA vs 65µA)
- 3.3V compatible
- No adjustment pots needed

### 7.5 Door/Tray Sensor: Reed Switch

| Parameter | Specification |
|:----------|:--------------|
| Type | Normally Open (NO) reed switch |
| Activation | 10-15 AT (ampere-turns) |
| Magnet | 10×5mm neodymium |
| Gap | Up to 15mm |
| Price | $0.30 |

**Circuit:**

```
        3.3V
         │
        ┌┴┐
        │ │ 10K (Pull-up)
        │ │
        └┬┘
         │
         ├──────▶ GPIO (to ESP32)
         │
    ┌────┴────┐
    │  Reed   │       ┌─────┐
    │  Switch │◀──────│Magnet│
    └────┬────┘       └─────┘
         │            (on door)
        GND
```

**Logic:**
- Door closed: Magnet near → Switch closed → GPIO LOW
- Door open: Magnet away → Switch open → GPIO HIGH (pull-up)

### 7.6 Ambient Light: BH1750

| Parameter | Specification |
|:----------|:--------------|
| Part | BH1750FVI |
| Range | 1-65535 lux |
| Resolution | 1 lux |
| Interface | I2C |
| Address | 0x23 or 0x5C |
| Package | 3.0×1.6mm |
| Price | $1.00 |

**Use Case:** Auto-adjust display brightness based on room lighting

---

## 8. Audio System

### 8.1 Amplifier: MAX98357A

| Parameter | Specification |
|:----------|:--------------|
| Part | MAX98357AETE+ (Analog Devices/Maxim) |
| Type | I2S Class D amplifier |
| Output power | 3.2W @ 4Ω, 1.8W @ 8Ω |
| THD+N | 0.03% |
| Sample rates | 8-96 kHz |
| Interface | I2S (BCK, LRCK, DIN) |
| Voltage | 2.5-5.5V |
| Package | QFN-16 (3×3mm) |
| Price | $2.50 |

**Why MAX98357A:**
- No external codec needed
- I2S direct from ESP32
- Filterless (no output inductor)
- Built-in gain control

### 8.2 I2S Wiring

```
ESP32-S3                    MAX98357A               Speaker
──────────                  ──────────              ─────────
GPIO17 (I2S_BCLK) ────────▶ BCLK
GPIO18 (I2S_LRCK) ────────▶ LRCLK
GPIO15 (I2S_DOUT) ────────▶ DIN

                            GAIN ───▶ GND (15dB gain)
                            SD ─────▶ 3.3V (enable)
                            VDD ────▶ 5V
                            GND ────▶ GND
                            OUT+ ───────────────────▶ Speaker +
                            OUT- ───────────────────▶ Speaker -
```

### 8.3 Speaker Selection

| Parameter | Specification |
|:----------|:--------------|
| Type | Full-range dynamic |
| Size | 40mm diameter |
| Impedance | 8Ω |
| Power | 2W |
| Frequency | 300Hz - 10kHz |
| SPL | 85dB @ 1W/1m |
| Price | $1.50 |

**Recommended:** CUI CMS-403288-078 or similar 40mm speaker

### 8.4 Audio Software

**ESP-IDF I2S Configuration:**

```c
i2s_config_t i2s_config = {
    .mode = I2S_MODE_MASTER | I2S_MODE_TX,
    .sample_rate = 16000,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .dma_buf_count = 8,
    .dma_buf_len = 1024,
    .use_apll = false,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1
};

i2s_pin_config_t pin_config = {
    .bck_io_num = GPIO_NUM_17,
    .ws_io_num = GPIO_NUM_16,
    .data_out_num = GPIO_NUM_15,
    .data_in_num = I2S_PIN_NO_CHANGE
};
```

**Audio Files:**
- Store as WAV (16-bit, 16kHz mono) on SD card
- Convert MP3 to WAV with ffmpeg
- Total audio: ~5MB for all alerts (4 languages)

---

## 9. SMD-200 Travel Device

### 9.1 System Block Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SMD-200 TRAVEL DEVICE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────┐     ┌────────────────┐     ┌───────────────┐            │
│  │ Li-Po Battery │     │  ESP32-S3-MINI │     │   SIM7080G    │            │
│  │ 3000mAh       │────▶│  Single-core   │────▶│   LTE Cat-M1  │            │
│  │ + BMS         │     │  160MHz        │     │   + GPS       │            │
│  │ + TP4056      │     └────────┬───────┘     └───────────────┘            │
│  └───────────────┘              │                                           │
│        │                        │                                           │
│        │ USB-C                  │                                           │
│        ▼                        │                                           │
│  ┌───────────────┐              │                                           │
│  │ USB-C Port    │              │                                           │
│  │ (Charge only) │              │                                           │
│  └───────────────┘              │                                           │
│                                 │                                           │
│      ┌──────────────────────────┼──────────────────────────┐               │
│      │                          │                          │               │
│      ▼                          ▼                          ▼               │
│ ┌──────────┐            ┌──────────────┐           ┌──────────────┐        │
│ │ 2.4"OLED │            │ 4× SG90      │           │ Sensors      │        │
│ │ SSD1306  │            │ Micro Servos │           │ + Buzzer     │        │
│ │ + Touch  │            │              │           │ + Vibration  │        │
│ └──────────┘            └──────────────┘           └──────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Cellular Module: SIM7080G

| Parameter | Specification |
|:----------|:--------------|
| Part | SIM7080G (SIMCom) |
| Networks | LTE Cat-M1, Cat-NB1, NB-IoT |
| Bands (ALL) | B1/B2/B3/B4/B5/B8/B12/B13/B14/B18/B19/B20/B25/B26/B27/B28/B66/B71/B85 (19 bands) |
| Bands (EU Primary) | B1/B3/B8/B20/B28 |
| Data rate (Cat-M1) | 589 kbps DL, 1119 kbps UL |
| Data rate (NB-IoT) | 136 kbps DL, 150 kbps UL |
| GNSS | GPS, GLONASS, BeiDou, Galileo (multi-constellation) |
| Protocols | TCP/UDP, HTTP/S, MQTT, CoAP, TLS/DTLS, LWM2M |
| Interface | UART (115200 default, up to 921600 baud), GPIO, SPI, I2C |
| Voltage | 2.7–4.8V (direct from Li-Po) |
| Current (idle) | 7mA |
| Current (TX peak) | 400mA |
| Current (standby) | ~46mA @ DC5V |
| Operating Temp | -40°C to +85°C (industrial grade) |
| Package | LCC+LGA (17.6 × 15.7 × 2.4 mm) |
| Certifications | CE/RED, FCC, GCF, AT&T, Verizon, T-Mobile, RoHS |
| Price | $12-15 |

**Why SIM7080G:**
- LTE Cat-M1 optimized for IoT (low latency, low power)
- 19 frequency bands covering 50+ countries globally
- GPS/GNSS built-in (multi-constellation: GPS, GLONASS, BeiDou, Galileo)
- Direct Li-Po voltage (2.7–4.8V, no external regulator needed)
- Full European + US band coverage for global roaming
- Native MQTT support (ideal for IoT cloud communication)
- TLS/DTLS for secure medical data transmission
- Industrial temperature range (-40°C to +85°C)
- Pre-certified with major carriers (AT&T, Verizon, T-Mobile, CE/RED)
- Cheaper than Quectel BG96 ($18) and u-blox SARA-R4 ($20)

**Recommended SIM Providers:**

| Provider | Type | Coverage | Cost | Best For |
|:---------|:-----|:---------|:-----|:---------|
| **1NCE** | IoT | Europe | €10/10yr/500MB | EU-only, ultra-cheap |
| **Hologram** | M2M | Global 50+ | $0.60/MB | Global travel feature |
| Twilio | M2M | Global | $0.10/MB | Programmable API |
| Swisscom M2M | Enterprise | CH+EU | Quote | Swiss carrier support |

### 9.3 Cellular Wiring

```
ESP32-S3-MINI                SIM7080G                    Antenna
─────────────                ─────────                   ─────────
GPIO4 (TXD) ────────────────▶ RXD
GPIO5 (RXD) ◀──────────────── TXD
GPIO6 (PWRKEY) ─────────────▶ PWRKEY
GPIO7 (STATUS) ◀───────────── STATUS
GND ────────────────────────▶ GND

                              VBAT ◀────────────────── Battery (3.7V)
                              
                              ANT_MAIN ───────────────▶ LTE Antenna (u.FL)
                              ANT_GNSS ───────────────▶ GPS Antenna (u.FL)

                              SIM_VDD ──┬── SIM Card Socket
                              SIM_DATA ─┤
                              SIM_CLK ──┤
                              SIM_RST ──┘
```

### 9.4 Travel Device Display: SSD1306 OLED

| Parameter | Specification |
|:----------|:--------------|
| Part | SSD1306 2.4" OLED |
| Resolution | 128 × 64 pixels |
| Color | Monochrome (white or yellow/blue) |
| Interface | I2C (address 0x3C) |
| Voltage | 3.3V |
| Current | 10mA typical |
| Price | $8 |

**Alternative:** SSD1309 2.4" (same pinout, better contrast)

### 9.5 Travel Device Battery

| Parameter | Specification |
|:----------|:--------------|
| Type | Li-Po pouch cell |
| Capacity | 3000mAh |
| Nominal voltage | 3.7V |
| Dimensions | 60×50×8mm |
| Weight | 55g |
| Protection | Built-in PCM |
| Connector | JST-PH 2-pin |
| Price | $8 |

**Charging IC:** TP4056 with DW01 protection

**USB-C Charging:**
- Input: 5V/2A
- Charge current: 1A (set by resistor)
- Full charge: 3-4 hours

---

## 10. PCB Design Guidelines

### 10.1 Layer Stack (4-Layer)

```
┌─────────────────────────────────────────────┐
│ Layer 1 (Top): Signal + Components          │  1.0 oz copper
├─────────────────────────────────────────────┤
│ Prepreg: FR-4, 0.2mm                        │
├─────────────────────────────────────────────┤
│ Layer 2: Ground Plane (solid)               │  1.0 oz copper
├─────────────────────────────────────────────┤
│ Core: FR-4, 1.0mm                           │
├─────────────────────────────────────────────┤
│ Layer 3: Power Planes (3.3V, 5V, 12V)       │  1.0 oz copper
├─────────────────────────────────────────────┤
│ Prepreg: FR-4, 0.2mm                        │
├─────────────────────────────────────────────┤
│ Layer 4 (Bottom): Signal + Components       │  1.0 oz copper
└─────────────────────────────────────────────┘

Total thickness: ~1.6mm
```

### 10.2 Design Rules

| Parameter | Minimum | Preferred | Notes |
|:----------|--------:|----------:|:------|
| Trace width (signal) | 0.15mm | 0.2mm | 6 mil minimum |
| Trace width (power) | 0.3mm | 0.5mm | 12-20 mil |
| Trace width (motor) | 0.5mm | 1.0mm | Handle 500mA |
| Trace spacing | 0.15mm | 0.2mm | 6 mil minimum |
| Via diameter | 0.4mm | 0.5mm | Outer diameter |
| Via drill | 0.2mm | 0.25mm | Hole diameter |
| Via current | — | 1A max | Use multiple for power |
| Annular ring | 0.15mm | 0.2mm | |
| Component spacing | 0.2mm | 0.3mm | |
| Board edge | 0.3mm | 0.5mm | Keep-out |

### 10.3 EMC Design Guidelines

| Guideline | Implementation |
|:----------|:---------------|
| **Ground plane** | Solid L2 layer, NO splits under signals |
| **Power plane** | Split L3 for different voltages, connect at star point |
| **Decoupling** | 100nF per power pin, place within 3mm |
| **Bulk capacitors** | 10µF at power entry, 22µF at regulators |
| **Antenna keep-out** | 15mm radius clear, no ground under antenna |
| **Crystal traces** | < 5mm, surrounded by ground guard |
| **High-speed signals** | Controlled impedance (50Ω for RF) |
| **Motor isolation** | Separate ground return, ferrite at entry |
| **ESD protection** | TVS diodes on all external connections |

### 10.4 Thermal Guidelines

| Heat Source | Power | Mitigation |
|:------------|------:|:-----------|
| ESP32-S3 | 0.5W | Exposed pad to ground plane, via array |
| BQ24195 | 0.8W | Thermal pad, via array to L2 |
| TPS62150 | 0.2W | Ground pad, adequate copper pour |
| ULN2003A (each) | 0.5W | Thermal vias, copper pour |
| MAX98357A | 0.2W | Ground pad |

**Thermal Via Pattern:**

```
    ┌───────────────────┐
    │                   │
    │  ●  ●  ●  ●  ●   │
    │  ●  ●  ●  ●  ●   │  ● = 0.3mm via
    │  ●  ● [PAD] ●  ●   │
    │  ●  ●  ●  ●  ●   │
    │  ●  ●  ●  ●  ●   │
    │                   │
    └───────────────────┘
    
    Grid: 1mm spacing
    Connects to ground plane (L2)
```

---

## 11. Complete GPIO Mapping

### 11.1 SMD-100 Home Device

| GPIO | Function | Direction | Notes |
|:-----|:---------|:----------|:------|
| 0 | BOOT button | Input | Pull-up, boot mode |
| 1-5 | LCD R0-R4 | Output | Red channel |
| 6-11 | LCD G0-G5 | Output | Green channel |
| 12-16 | LCD B0-B4 | Output | Blue channel |
| 17 | I2S BCLK | Output | Audio |
| 18 | I2S LRCLK | Output | Audio |
| 19 | I2S DOUT | Output | Audio |
| 20 | USB D- | Bidir | USB OTG |
| 21 | USB D+ | Bidir | USB OTG |
| 22 | LCD HSYNC | Output | Display |
| 23 | LCD VSYNC | Output | Display |
| 24 | LCD DE | Output | Display |
| 25 | LCD CLK | Output | Display |
| 26 | TOUCH INT | Input | Interrupt |
| 27 | TOUCH RST | Output | Reset |
| 32 | HX711 DOUT | Input | Load cell |
| 33 | HX711 SCK | Output | Load cell |
| 34-43 | Motor IN1-IN10 | Output | Via I/O expander |
| 44 | I2C SDA | Bidir | Sensors |
| 45 | I2C SCL | Output | Sensors |
| 46 | SD CLK | Output | SD card |
| 47 | SD CMD | Bidir | SD card |
| 48 | SD DATA | Bidir | SD card |

**I/O Expander:** Use MCP23017 (I2C) for motor control (16 extra GPIO)

### 11.2 SMD-200 Travel Device

| GPIO | Function | Direction | Notes |
|:-----|:---------|:----------|:------|
| 0 | BOOT button | Input | |
| 1 | I2C SDA | Bidir | Display + sensors |
| 2 | I2C SCL | Output | |
| 3 | Cellular TXD | Output | To SIM7080G RXD |
| 4 | Cellular RXD | Input | From SIM7080G TXD |
| 5 | Cellular PWRKEY | Output | Power control |
| 6 | Cellular STATUS | Input | Status |
| 7 | Buzzer | Output | PWM |
| 8 | Vibration | Output | On/Off |
| 9-12 | Servo PWM 1-4 | Output | Gate servos |
| 13-16 | Optical sensors | Input | Pill count |
| 17 | Button 1 | Input | Confirm |
| 18 | Button 2 | Input | Cancel |
| 19 | Battery voltage | ADC | Fuel gauge backup |
| 20-21 | USB | Bidir | Programming |

---

## 12. Complete Bill of Materials

### 12.1 SMD-100 Home Device (Detailed)

| Ref | Part | Manufacturer | Part Number | Qty | Unit Cost | Total | Supplier |
|:----|:-----|:-------------|:------------|----:|----------:|------:|:---------|
| U1 | MCU | Espressif | ESP32-S3-WROOM-1-N16R8 | 1 | $5.50 | $5.50 | DigiKey |
| U2 | Power Path | TI | BQ24195RGER | 1 | $3.50 | $3.50 | Mouser |
| U3 | Buck 5V | TI | TPS62150RGTR | 1 | $1.80 | $1.80 | DigiKey |
| U4 | LDO 3.3V | Diodes | AP2112K-3.3TRG1 | 2 | $0.25 | $0.50 | LCSC |
| U5-U6 | Motor Driver | TI | ULN2003AN | 7 | $0.30 | $2.10 | LCSC |
| U7 | Audio Amp | Maxim | MAX98357AETE+ | 1 | $2.50 | $2.50 | DigiKey |
| U8 | Load Cell ADC | Avia | HX711 | 1 | $0.80 | $0.80 | LCSC |
| U9 | Temp/Humidity | Sensirion | SHT40-AD1B | 1 | $2.50 | $2.50 | DigiKey |
| U10 | Light Sensor | ROHM | BH1750FVI | 1 | $1.00 | $1.00 | LCSC |
| U11 | I/O Expander | Microchip | MCP23017-E/SO | 1 | $1.50 | $1.50 | DigiKey |
| | | | | | | | |
| LCD1 | Display | Waveshare | 4.3" RGB LCD | 1 | $28.00 | $28.00 | Waveshare |
| | | | | | | | |
| M1-M10 | Stepper Motor | Generic | 28BYJ-48 5V | 10 | $1.50 | $15.00 | AliExpress |
| M11 | Servo | TowerPro | SG90 | 1 | $2.00 | $2.00 | Amazon |
| | | | | | | | |
| LS1 | Speaker | CUI | CMS-403288-078 | 1 | $1.50 | $1.50 | DigiKey |
| | | | | | | | |
| Q1-Q10 | Optical Sensor | Vishay | TCPT1300X01 | 10 | $0.80 | $8.00 | DigiKey |
| Q11-Q20 | Hall Sensor | Allegro | A3144 | 10 | $0.30 | $3.00 | LCSC |
| PIR1 | Motion Sensor | Generic | AM312 | 1 | $1.50 | $1.50 | AliExpress |
| SW1 | Reed Switch | Generic | N/A | 1 | $0.30 | $0.30 | LCSC |
| | | | | | | | |
| LC1 | Load Cell | Generic | 1kg TAL220 | 1 | $3.00 | $3.00 | Amazon |
| | | | | | | | |
| BAT1 | Battery | Samsung | INR18650-25R | 2 | $4.00 | $8.00 | IMRbatteries |
| | Battery Holder | Keystone | 1042 (2×18650) | 1 | $2.00 | $2.00 | DigiKey |
| | | | | | | | |
| PSU1 | AC Adapter | Mean Well | GST25E12-P1J | 1 | $12.00 | $12.00 | Mouser |
| | | | | | | | |
| PCB1 | Main PCB | JLCPCB | 4-layer, 150×100mm | 1 | $8.00 | $8.00 | JLCPCB |
| PCB2 | Motor PCB | JLCPCB | 2-layer, 80×60mm | 1 | $3.00 | $3.00 | JLCPCB |
| | | | | | | | |
| ENC1 | Enclosure | Custom | ABS injection | 1 | $22.00 | $22.00 | Alibaba |
| | | | | | | | |
| | Passives | Various | Caps, resistors | 1 | $5.00 | $5.00 | LCSC |
| | Connectors | Various | JST, FFC, barrel | 1 | $4.00 | $4.00 | LCSC |
| | SD Card | SanDisk | 16GB | 1 | $5.00 | $5.00 | Amazon |
| | Packaging | Custom | Box, manual | 1 | $6.00 | $6.00 | Alibaba |
| | | | | | | | |
| | **TOTAL COGS** | | | | | **$159.00** | |

### 12.2 Volume Pricing (10,000 units)

| Category | Qty 100 | Qty 1,000 | Qty 10,000 |
|:---------|--------:|----------:|-----------:|
| Components | $90 | $75 | $62 |
| PCBs | $11 | $8 | $5 |
| Enclosure | $22 | $18 | $14 |
| Assembly | $15 | $12 | $10 |
| Packaging | $8 | $6 | $4 |
| **Total COGS** | **$146** | **$119** | **$95** |

---

## 13. Supplier Recommendations

### 13.1 Component Distributors

| Supplier | Region | Strengths | Lead Time |
|:---------|:-------|:----------|:----------|
| **DigiKey** | US/EU | Large stock, fast ship | 1-3 days |
| **Mouser** | US/EU | Wide selection, datasheets | 1-3 days |
| **LCSC** | China | Very cheap, good quality | 7-14 days |
| **Arrow** | Global | Volume pricing | 2-4 weeks |
| **RS Components** | EU | Swiss stock (CH) | 1-2 days |

### 13.2 PCB Manufacturers

| Supplier | Min Order | 4-Layer Price | Quality | Lead Time |
|:---------|----------:|--------------:|:--------|:----------|
| **JLCPCB** | 5 pcs | $8 | Good | 3-5 days |
| **PCBWay** | 5 pcs | $10 | Good | 5-7 days |
| **Eurocircuits** | 1 pc | $80 | Excellent | 5-7 days |
| **Würth** | 10 pcs | $60 | Excellent | 7-10 days |

**Recommendation:** JLCPCB for prototypes, Eurocircuits for production (better quality)

### 13.3 Assembly Services

| Supplier | Region | Min Order | PCBA Price | Notes |
|:---------|:-------|----------:|-----------:|:------|
| **JLCPCB** | China | 2 pcs | $20 + parts | SMT only |
| **PCBWay** | China | 1 pc | $30 + parts | SMT + THT |
| **MacroFab** | US | 10 pcs | $100 + parts | Turnkey |
| **Beta Layout** | DE | 5 pcs | $150 + parts | EU-based |

### 13.4 Enclosure Manufacturers

| Supplier | Type | MOQ | Tooling | Notes |
|:---------|:-----|----:|--------:|:------|
| **Alibaba (various)** | Injection molding | 500 | $3,000-8,000 | Best price |
| **Protolabs** | 3D print/injection | 1 | $0-1,500 | Fast prototypes |
| **Xometry** | CNC/3D print | 1 | $0 | Prototype only |
| **HLH Prototypes** | Low-volume injection | 50 | $2,000 | Good quality |

---

## 14. Development & Prototyping

### 14.1 Development Board Recommendations

| Board | MCU | Price | Use For |
|:------|:----|------:|:--------|
| ESP32-S3-DevKitC-1 | ESP32-S3 | $10 | Firmware development |
| ESP32-S3-LCD-EV-Board | ESP32-S3 + 4.3" LCD | $60 | Display/UI development |
| WT32-SC01 Plus | ESP32-S3 + 3.5" LCD | $35 | Compact UI testing |

### 14.2 Prototyping Roadmap

| Phase | Duration | Goal | Deliverable |
|:------|:---------|:-----|:------------|
| **Phase 1: Breadboard** | 2 weeks | Prove concept | Working motor + sensor |
| **Phase 2: Dev boards** | 4 weeks | Firmware development | Complete software |
| **Phase 3: Custom PCB v1** | 4 weeks | Integration test | First PCB prototype |
| **Phase 4: Custom PCB v2** | 2 weeks | Fix issues | Production-ready PCB |
| **Phase 5: Pilot build** | 4 weeks | DFM validation | 50 units |
| **Phase 6: Production** | Ongoing | Scale | Mass production |

### 14.3 Common Pitfalls & Solutions

| Pitfall | Problem | Solution |
|:--------|:--------|:---------|
| **Motor noise** | Stepper causes EMI | Add 100nF across each coil |
| **WiFi interference** | Motors affect WiFi | Separate power paths, filtering |
| **Power sequencing** | Brown-out on motor start | Add inrush current limiting |
| **Touch sensitivity** | Erratic touch | Ground display bezel, shielded FFC |
| **Battery drain** | Won't last 48h | Proper sleep modes, kill power to peripherals |
| **Sensor drift** | Load cell readings vary | Temperature compensation, periodic tare |
| **Audio distortion** | Clipping at high volume | Limit PWM duty, add soft clipping |

---

## 15. Firmware Development Guide

### 15.1 Recommended Toolchain

| Tool | Version | Purpose |
|:-----|:--------|:--------|
| ESP-IDF | v5.1+ | Official SDK |
| VS Code | Latest | IDE |
| PlatformIO | Latest | Build system (alternative) |
| LVGL | v8.3 or v9.0 | UI framework |
| FreeRTOS | Included | RTOS |

### 15.2 Firmware Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION LAYER                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Schedule │ │   UI     │ │ API Sync │ │ Settings │ │   OTA    │      │
│  │ Manager  │ │ Manager  │ │ Client   │ │ Manager  │ │ Updater  │      │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘      │
│       │            │            │            │            │             │
├───────┴────────────┴────────────┴────────────┴────────────┴─────────────┤
│                          MIDDLEWARE LAYER                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Event   │ │  Task    │ │  Queue   │ │  Timer   │ │  NVS     │      │
│  │  Bus     │ │  Manager │ │  Manager │ │  Service │ │  Storage │      │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘      │
│       │            │            │            │            │             │
├───────┴────────────┴────────────┴────────────┴────────────┴─────────────┤
│                            DRIVER LAYER                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Motor   │ │ Display  │ │  Sensor  │ │  WiFi    │ │  Audio   │      │
│  │  Driver  │ │  Driver  │ │  Driver  │ │  Driver  │ │  Driver  │      │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘      │
│       │            │            │            │            │             │
├───────┴────────────┴────────────┴────────────┴────────────┴─────────────┤
│                              HAL LAYER                                   │
│                           ESP-IDF + FreeRTOS                             │
└─────────────────────────────────────────────────────────────────────────┘
```

### 15.3 Task Allocation

| Task | Core | Priority | Stack | Purpose |
|:-----|:----:|:--------:|------:|:--------|
| main_task | 0 | 5 | 4KB | System coordination |
| wifi_task | 1 | 5 | 4KB | WiFi + API communication |
| ui_task | 1 | 4 | 8KB | LVGL rendering |
| dispense_task | 0 | 6 | 4KB | Motor control (high priority) |
| sensor_task | 0 | 3 | 2KB | Sensor polling |
| audio_task | 0 | 4 | 4KB | Sound playback |

---

## 16. Revision History

| Version | Date | Changes |
|:--------|:-----|:--------|
| 1.0 | Jan 2026 | Initial release |
| 2.0 | Feb 2026 | Added BOM, PCB guidelines |
| 3.0 | Feb 2026 | Complete expansion with component recommendations, wiring diagrams, firmware guide |
