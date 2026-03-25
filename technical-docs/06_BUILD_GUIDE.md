# Complete Build Guide

**Step-by-Step Assembly Instructions for Electronics Team**

**Version 3.0 | February 2026**

---

## Document Information

| | |
|:--|:--|
| Version | 3.0 |
| Last Updated | February 2026 |
| Target Audience | Electronics Engineers, Technicians |
| Products | SMD-100 (Home), SMD-200 (Travel) |

---

## 1. Overview

### 1.1 What We're Building

| Device | Complexity | Build Time | Skill Level |
|:-------|:-----------|:-----------|:------------|
| **SMD-100 Home Device** | High | 4-6 hours | Intermediate |
| **SMD-200 Travel Device** | Medium | 2-3 hours | Intermediate |

### 1.2 Prerequisites

**Required Skills:**
- Surface mount soldering (0603, QFN packages)
- Through-hole soldering
- Basic oscilloscope use
- Firmware flashing via USB
- Basic 3D printing (for prototypes)

**Required Equipment:**
- Soldering station (temperature controlled)
- Hot air rework station
- Multimeter
- Oscilloscope (at least 50MHz)
- USB-to-UART adapter
- Power supply (variable, 0-15V, 3A)
- ESD-safe workstation

---

## 2. Tools & Equipment List

### 2.1 Essential Tools

| Tool | Model Recommendation | Price | Notes |
|:-----|:--------------------|------:|:------|
| Soldering station | Hakko FX-888D | $120 | Temperature control essential |
| Hot air station | Quick 861DW | $150 | For QFN packages |
| Multimeter | Fluke 117 | $200 | True RMS |
| Oscilloscope | Rigol DS1054Z | $350 | 4-channel, 50MHz |
| Power supply | Korad KA3005D | $80 | 0-30V, 0-5A |
| USB logic analyzer | Saleae Logic 8 | $500 | I2C/SPI debugging |
| Microscope | AmScope SM-4T | $250 | For inspection |

### 2.2 Hand Tools

| Tool | Purpose |
|:-----|:--------|
| Fine tweezers (ESD) | Component placement |
| Flush cutters | Lead trimming |
| Wire strippers | 22-30 AWG |
| Solder wick | Rework |
| Solder paste | SMD soldering |
| Flux pen | Rework |
| IPA + lint-free wipes | Cleaning |
| Kapton tape | Heat protection |
| Heat shrink assortment | Wire insulation |

### 2.3 Test Equipment

| Equipment | Purpose | Required |
|:----------|:--------|:---------|
| Bench power supply | Controlled power during development | Yes |
| Current probe | Measure consumption | Recommended |
| Serial terminal | Debug output | Yes |
| WiFi AP (test) | Connectivity testing | Yes |
| Calibration weights | Load cell calibration | Yes (10g, 50g, 100g) |

---

## 3. SMD-100 Home Device Assembly

### 3.1 Assembly Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ASSEMBLY SEQUENCE                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Step 1          Step 2          Step 3          Step 4                │
│   ┌─────┐         ┌─────┐         ┌─────┐         ┌─────┐              │
│   │ PCB │   ───▶  │Motor│   ───▶  │Final│   ───▶  │Test │              │
│   │Assem│         │ Sub │         │Assem│         │  +  │              │
│   │     │         │Assem│         │     │         │Calib│              │
│   └─────┘         └─────┘         └─────┘         └─────┘              │
│   2 hours         1 hour          1 hour          1 hour               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Step 1: Main PCB Assembly

#### 3.2.1 PCB Overview

```
Main PCB Layout (150mm × 100mm):

    ┌───────────────────────────────────────────────────────────┐
    │                                                           │
    │  ┌─────────┐   ┌─────────┐   ┌───────────────────────┐   │
    │  │ Power   │   │ ESP32   │   │   Motor Driver        │   │
    │  │ Section │   │   S3    │   │   Section             │   │
    │  │         │   │         │   │   (ULN2003 × 7)       │   │
    │  │ BQ24195 │   │ WiFi    │   │                       │   │
    │  │ TPS6215 │   │ Antenna │   │                       │   │
    │  │ AP2112K │   │ ↙       │   │                       │   │
    │  └─────────┘   └─────────┘   └───────────────────────┘   │
    │                                                           │
    │  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐  │
    │  │  Audio  │   │ Sensors │   │ SD Card │   │ Battery │  │
    │  │ MAX98357│   │ I2C     │   │ Slot    │   │ Connect │  │
    │  └─────────┘   └─────────┘   └─────────┘   └─────────┘  │
    │                                                           │
    │  [FFC] Display Connector (40-pin)                        │
    │                                                           │
    └───────────────────────────────────────────────────────────┘
```

#### 3.2.2 SMD Soldering Order (Small to Large)

| Order | Component Type | Parts | Notes |
|:-----:|:---------------|:------|:------|
| 1 | 0402 capacitors | C1-C30 | Use paste + hot air |
| 2 | 0603 resistors | R1-R50 | Use paste + hot air |
| 3 | 0805 capacitors | C31-C45 | Bulk caps |
| 4 | SOT-23 | Q1-Q5, U4 | Transistors, LDO |
| 5 | QFN-16 | U3 (TPS62150) | Hot air, careful alignment |
| 6 | QFN-24 | U2 (BQ24195) | Hot air, thermal pad |
| 7 | ESP32-S3 module | U1 | Reflow or careful hot air |
| 8 | SOIC-16 | U5-U11 (ULN2003A) | Hand solder or reflow |
| 9 | Connectors | J1-J10 | Motor, sensor, battery |

**Soldering Tips for QFN Packages:**

1. **Stencil Method (Recommended):**
   - Apply solder paste using stencil
   - Place component with tweezers
   - Reflow in oven or with hot air (260°C peak, 30s)

2. **Hand Soldering Method:**
   - Pre-tin pads with thin solder layer
   - Apply flux generously
   - Place component, align under microscope
   - Hot air from above (350°C, 2-3mm distance)
   - Watch for solder flowing under edges

3. **Thermal Pad Connection:**
   - For BQ24195: thermal pad must connect to ground
   - Use 0.3mm thermal vias (3×3 array under pad)
   - Pre-tin thermal pad area

#### 3.2.3 Power Section Assembly

```
Power Section Schematic:

         12V Input        BQ24195              TPS62150
            │         ┌───────────┐         ┌───────────┐
    J1 ─────┤         │           │         │           │
    (Barrel)│     ┌───│VIN    SYS │─────────│VIN    OUT │──┬── 5V Rail
            │     │   │           │         │           │  │
           ┌┴┐    │   │     BAT   │──┬──────└───────────┘  │
         10│u│    │   │           │  │                     │
           └┬┘    │   │           │  │   ┌───────────┐     │
            │     │   │    CE/CHG │  │   │ AP2112K   │     │
           GND    │   └───────────┘  │   │           │     │
                  │                  │   │ IN    OUT │─────┼── 3.3V Rail
                  │              ┌───┴───│           │     │
                  │              │       └───────────┘     │
                  │         ┌────┴────┐                    │
                  │         │ Battery │                    │
                  │         │ 7.4V    │                    │
                  │         │ 5000mAh │                    │
                  │         └─────────┘                    │
                  │                                        │
                  └─── To Motors (12V direct) ─────────────┘
```

**Assembly Steps:**

1. **Install BQ24195:**
   - Align carefully (thermal pad down)
   - Hot air reflow at 260°C
   - Check all pins with microscope

2. **Install surrounding passives:**
   - Input caps: 10µF ceramic (C1) near VIN
   - Output caps: 22µF ceramic (C2, C3) near SYS and BAT
   - Inductor: 2.2µH for buck (L1)
   - Resistors for voltage setting (if programmable)

3. **Install TPS62150:**
   - Apply solder paste
   - Place with tweezers
   - Hot air reflow
   - Install 2.2µH inductor (L2)
   - Install input/output caps

4. **Install AP2112K:**
   - Simple SOT-25 package
   - Hand solder or hot air
   - Input/output caps (1µF, 10µF)

5. **Power Test (Before ESP32):**
   - Apply 12V to J1
   - Measure: SYS should be ~12V
   - Measure: 5V rail should be 5.0V ±2%
   - Measure: 3.3V rail should be 3.3V ±2%
   - Current draw (no load): <10mA

#### 3.2.4 ESP32-S3 Module Assembly

```
ESP32-S3-WROOM-1 Pinout (Bottom View):

    ┌─────────────────────────────────────┐
    │   ESP32-S3-WROOM-1-N16R8            │
    │                                      │
    │  ┌──────────────────────────────┐   │
    │  │                              │   │
    │  │         Antenna              │   │  ◀── Keep clear!
    │  │          Area                │   │
    │  │                              │   │
    │  └──────────────────────────────┘   │
    │                                      │
 1  │ GND                          3V3   │ 44
 2  │ 3V3                          GND   │ 43
 3  │ EN                           IO43  │ 42
 4  │ IO4                          IO44  │ 41
 5  │ IO5                          IO1   │ 40
 6  │ IO6                          IO2   │ 39
    │ ...                          ...   │
    │                                      │
    └─────────────────────────────────────┘
```

**Assembly Steps:**

1. **Apply flux** to all module pads
2. **Apply solder paste** (thin layer)
3. **Place module** carefully with tweezers
4. **Check alignment** under microscope
5. **Reflow** with hot air:
   - Preheat board to 150°C
   - Focus on module at 260°C for 20-30s
   - Watch for solder to flow on corner pins
6. **Inspect** all pins under microscope
7. **Touch up** any bridges or opens

**Critical Checks:**
- No shorts between adjacent pins
- EN pin has 10K pull-up to 3.3V
- GPIO0 has 10K pull-up (boot mode)
- GND connected solid

#### 3.2.5 Motor Driver Section

```
Motor Driver Array (7× ULN2003A for 10 motors):

    ESP32-S3 GPIO                ULN2003A #1             Motors 1-2
    (via MCP23017)           ┌───────────────┐
                             │ IN1      OUT1 │─────────▶ Motor 1 Coils
    GPIO_EXP_A0 ────────────▶│ IN2      OUT2 │
    GPIO_EXP_A1 ────────────▶│ IN3      OUT3 │
    GPIO_EXP_A2 ────────────▶│ IN4      OUT4 │─────────▶ Motor 2 Coils
    GPIO_EXP_A3 ────────────▶│ IN5      OUT5 │
    GPIO_EXP_A4 ────────────▶│ IN6      OUT6 │
    GPIO_EXP_A5 ────────────▶│ IN7      OUT7 │
                             │               │
                             │ COM      GND  │
                             └───┬───────┬───┘
                                 │       │
                                5V      GND

    (Repeat for ULN2003A #2 through #7)
```

**Assembly Steps:**

1. **Install MCP23017** (I/O Expander):
   - SOIC-28 package
   - I2C address set by A0-A2 pins (tie to GND for 0x20)

2. **Install ULN2003A ICs** (×7):
   - SOIC-16 or DIP-16 packages
   - Place in a row for easy routing

3. **Install motor connectors**:
   - JST-XH 5-pin connectors
   - One per motor (10 total)
   - Pin 1 = common (5V)
   - Pins 2-5 = coils A, B, C, D

4. **Install flyback protection**:
   - ULN2003A has internal diodes
   - COM pin must connect to 5V motor supply
   - This protects from motor kickback

#### 3.2.6 Sensor Section

```
Sensor Connections:

    I2C Bus (shared)
    ┌─────────────────────────────────────────────────────────┐
    │                                                         │
    │  ESP32-S3                                               │
    │  GPIO44 (SDA) ──────┬──────┬──────┬──────┬─────────    │
    │  GPIO45 (SCL) ──────┼──────┼──────┼──────┼─────────    │
    │                     │      │      │      │             │
    │                ┌────┴───┐ ┌┴────┐ ┌┴────┐ ┌┴────────┐  │
    │                │ SHT40  │ │GT911│ │BH175│ │MCP23017 │  │
    │                │ 0x44   │ │0x5D │ │0x23 │ │  0x20   │  │
    │                │Temp/Hum│ │Touch│ │Light│ │I/O Exp  │  │
    │                └────────┘ └─────┘ └─────┘ └─────────┘  │
    │                                                         │
    │  Digital GPIO                                           │
    │  GPIO26 ◀──────────────────── PIR Motion (AM312)       │
    │  GPIO27 ◀──────────────────── Reed Switch (Door)       │
    │                                                         │
    │  Load Cell (HX711)                                      │
    │  GPIO32 ◀──────────────────── HX711 DOUT               │
    │  GPIO33 ─────────────────────▶ HX711 SCK               │
    │                                                         │
    │  Optical Pill Sensors (×10)                            │
    │  MCP23017 Port B (GPB0-7) ◀── Optical 1-8 (interrupt)  │
    │  ESP32 GPIO28-29 ◀─────────── Optical 9-10             │
    │                                                         │
    └─────────────────────────────────────────────────────────┘
```

**Assembly Steps:**

1. **Install I2C devices:**
   - SHT40: Tiny DFN package, needs hot air
   - BH1750: Small WSOF package
   - Add 4.7K pull-ups on SDA/SCL

2. **Install HX711 ADC:**
   - Can use pre-made module
   - Or solder SOP-16 IC directly
   - Connect to load cell pads

3. **Install digital sensor connectors:**
   - PIR: 3-pin JST (VCC, GND, OUT)
   - Reed: 2-pin JST (NO, GND)
   - Add 10K pull-ups on signal lines

4. **Install optical sensor connectors:**
   - 10× 3-pin connectors (VCC, GND, OUT)
   - Route to MCP23017 GPIO pins

#### 3.2.7 Audio Section

```
Audio Circuit:

    ESP32-S3              MAX98357A                  Speaker
    ────────              ──────────                 ────────
    GPIO17 (BCLK) ───────▶ BCLK
    GPIO18 (LRCK) ───────▶ LRCLK
    GPIO15 (DOUT) ───────▶ DIN
    
                          GAIN ─────▶ GND (15dB)
                          SD ───────▶ 3.3V (enable)
                          VDD ──────▶ 5V
                          GND ──────▶ GND
                          OUT+ ─────────────────────▶ SPK+
                          OUT- ─────────────────────▶ SPK-
    
    Add 10µF cap on VDD
    Add 100nF cap on VDD (close to chip)
```

**Assembly Steps:**

1. **Install MAX98357A:**
   - QFN-16 package (3×3mm)
   - Careful alignment under microscope
   - Hot air reflow

2. **Install passives:**
   - 10µF + 100nF on VDD pin
   - No external filter needed (Class D)

3. **Install speaker connector:**
   - 2-pin JST or screw terminal
   - 8Ω speaker, no polarity

4. **Audio Test:**
   - Flash test firmware with tone generator
   - Should hear clean 1kHz tone
   - Verify volume control works (software PWM)

#### 3.2.8 Display Connection

```
40-Pin FFC Connector Pinout (Display):

    Pin 1-5:   R0-R4 (Red)
    Pin 6-11:  G0-G5 (Green)
    Pin 12-16: B0-B4 (Blue)
    Pin 17:    LCD_CLK
    Pin 18:    LCD_HSYNC
    Pin 19:    LCD_VSYNC
    Pin 20:    LCD_DE
    Pin 21-22: GND
    Pin 23:    3.3V
    Pin 24:    BACKLIGHT+ (5V via MOSFET)
    Pin 25:    BACKLIGHT- (GND)
    Pin 26:    TOUCH_SDA
    Pin 27:    TOUCH_SCL
    Pin 28:    TOUCH_INT
    Pin 29:    TOUCH_RST
    Pin 30-40: GND/NC
```

**Assembly Steps:**

1. **Install FFC connector:**
   - 40-pin, 0.5mm pitch
   - Bottom-contact type
   - Solder with fine tip iron

2. **Install backlight driver:**
   - N-MOSFET (2N7002)
   - Gate to ESP32 PWM GPIO
   - Drain to backlight transistor
   - Source to GND

3. **Install ESD protection:**
   - TVS diode on touch data lines
   - Protects from user static

### 3.3 Step 2: Motor Sub-Assembly

#### 3.3.1 Motor Mount Preparation

```
Motor Mount (3D Printed or CNC):

    Top View:
    ┌─────────────────────────────────────┐
    │  ○    ○    ○    ○    ○    ○    ○   │  ◀── Motor mount holes
    │  │    │    │    │    │    │    │   │
    │ [M1] [M2] [M3] [M4] [M5] [M6] [M7] │  ◀── 28BYJ-48 motors
    │  │    │    │    │    │    │    │   │
    │  ●    ●    ●    ●    ●    ●    ●   │  ◀── Shaft through holes
    └─────────────────────────────────────┘

    Side View:
    ┌──────────┐
    │  Motor   │
    │ 28BYJ-48 │
    │    │     │
    └────┼─────┘
         │
         ▼ Shaft (5mm, D-shape)
    ┌────┴────┐
    │  Gear   │  ◀── Connects to pill carousel
    └─────────┘
```

**Assembly Steps:**

1. **Mount motors to bracket:**
   - Use M3 screws (2 per motor)
   - Motors should turn freely
   - Shafts all pointing same direction

2. **Attach gears:**
   - Press-fit gear onto D-shaft
   - Or use set screw collar
   - Ensure gear meshes with carousel

3. **Wire motors:**
   - 5-pin connector to each motor
   - Route wires neatly
   - Use cable ties every 50mm

4. **Add Hall sensors:**
   - One A3144 per motor position
   - Mount near gear teeth
   - Detects home position

#### 3.3.2 Carousel Assembly

```
Pill Carousel (10 Slots):

    Top View:
                    ┌─────┐
                ┌───┤Slot1├───┐
               ┌┤   └─────┘   ├┐
              ┌┤│   ┌─────┐   │├┐
         Slot10│ │  │Center│  │ │Slot2
              └┤│  │ Gear │  │├┘
               └┤  └─────┘  ├┘
                │  ┌─────┐  │
           Slot9├──┤     ├──┤Slot3
                │  │Gate │  │
                │  │     │  │
           Slot8├──┤     ├──┤Slot4
                │  └─────┘  │
                │           │
           Slot7├───┐   ┌───┤Slot5
                └───┤   ├───┘
                    │Slot6│
                    └─────┘

    Each slot has:
    - Pill reservoir (holds 30 pills)
    - Gate (servo-controlled)
    - Optical sensor (counts pills)
```

**Assembly Steps:**

1. **Assemble carousel frame:**
   - 10 pill compartments
   - Central gear hub
   - Gate mechanism per slot

2. **Install gate servos:**
   - SG90 servo per gate (or shared mechanism)
   - Servo horn connected to gate arm
   - Test full open/close motion

3. **Install optical sensors:**
   - TCPT1300 in pill chute
   - LED side = 5V through 100Ω
   - Phototransistor side = 10K pull-up, signal out

4. **Connect to main gear:**
   - Carousel meshes with motor gear
   - Smooth rotation (no binding)
   - Full 360° rotation possible

#### 3.3.3 Output Tray Assembly

```
Output Tray with Load Cell:

    Side View:
    ┌───────────────────────────┐
    │       Pill Chute          │
    │           ↓               │
    │    ┌─────────────┐        │
    │    │  Load Cell  │        │  ◀── TAL220 1kg load cell
    │    │  (strain    │        │
    │    │   gauge)    │        │
    │    └──────┬──────┘        │
    │           │               │
    │    ┌──────┴──────┐        │
    │    │ Output Tray │        │  ◀── User takes pills from here
    │    └─────────────┘        │
    └───────────────────────────┘
```

**Assembly Steps:**

1. **Mount load cell:**
   - Fix one end to frame
   - Tray attached to other end (floating)
   - No mechanical contact with frame

2. **Wire load cell:**
   - Red = E+ (excitation+)
   - Black = E- (excitation-)
   - White = A- (signal-)
   - Green = A+ (signal+)
   - Connect to HX711 module

3. **Install HX711:**
   - Close to load cell (short wires)
   - Shield from motor EMI
   - Connect to ESP32

4. **Calibrate load cell:**
   ```c
   // Calibration procedure
   // 1. Empty tray, record zero offset
   float offset = hx711_read_average(20);
   
   // 2. Place known weight (50g)
   float reading = hx711_read_average(20);
   float scale = 50.0 / (reading - offset);
   
   // 3. Save calibration
   nvs_set_float("hx711_offset", offset);
   nvs_set_float("hx711_scale", scale);
   ```

### 3.4 Step 3: Final Assembly

#### 3.4.1 Enclosure Preparation

```
Enclosure Layout:

    Front View:
    ┌────────────────────────────────┐
    │  ┌──────────────────────────┐  │
    │  │                          │  │
    │  │       Display            │  │  ◀── 4.3" TFT
    │  │       Window             │  │
    │  │                          │  │
    │  └──────────────────────────┘  │
    │                                │
    │  [●]  [●]  [●]                 │  ◀── Status LEDs
    │                                │
    │  ┌────────────────────────┐   │
    │  │     Output Tray         │   │  ◀── Pull-out tray
    │  └────────────────────────┘   │
    └────────────────────────────────┘

    Rear View:
    ┌────────────────────────────────┐
    │                                │
    │  ○  ○  ○  ○  ○  ○  ○  ○  ○  ○ │  ◀── Ventilation
    │                                │
    │  [Power]  [USB]  [Reset]       │  ◀── Connectors
    │                                │
    └────────────────────────────────┘
```

**Assembly Steps:**

1. **Install inserts:**
   - Heat-set brass inserts for screws
   - M3 inserts at PCB mount points
   - M2.5 inserts for display

2. **Prepare cable routing:**
   - Identify paths for all cables
   - Install cable clips/guides
   - Plan for serviceability

3. **Install display:**
   - Apply foam gasket around edge
   - Connect FFC cable (check orientation)
   - Secure with clips or screws

4. **Install main PCB:**
   - Use M3 standoffs (10mm)
   - Screw in 4 corners
   - Verify clearance below

5. **Install motor assembly:**
   - Mount carousel mechanism
   - Connect motor cables
   - Test rotation clearance

6. **Install speakers:**
   - Hot glue or foam mount
   - Route wire to PCB

7. **Final wiring:**
   - Connect all sensors
   - Connect battery
   - Connect power input jack

8. **Close enclosure:**
   - Check all cable routing
   - No pinched wires
   - Screws to close (don't overtighten)

### 3.5 Step 4: Testing & Calibration

#### 3.5.1 Initial Power-On Test

| Test | Expected | Pass | Fail |
|:-----|:---------|:----:|:----:|
| Apply 12V, measure current | <100mA (no firmware) | ☐ | ☐ |
| 5V rail | 5.0V ±2% | ☐ | ☐ |
| 3.3V rail | 3.3V ±2% | ☐ | ☐ |
| ESP32 boots (USB serial) | Boot log visible | ☐ | ☐ |
| Display backlight on | Screen illuminated | ☐ | ☐ |

#### 3.5.2 Firmware Flashing

```bash
# Using ESP-IDF
cd ~/esp/smart-dispenser-firmware
idf.py build
idf.py -p /dev/ttyUSB0 flash monitor

# Using esptool directly
esptool.py --chip esp32s3 --port /dev/ttyUSB0 \
    --baud 921600 write_flash \
    0x0 bootloader.bin \
    0x10000 firmware.bin \
    0x8000 partition-table.bin
```

#### 3.5.3 Functional Test Checklist

| Test | Procedure | Expected | Pass | Fail |
|:-----|:----------|:---------|:----:|:----:|
| WiFi connection | Enter credentials | Connects <30s | ☐ | ☐ |
| Display touch | Touch all corners | All responsive | ☐ | ☐ |
| Motor 1 | Run test routine | Rotates smoothly | ☐ | ☐ |
| Motor 2-10 | Run test routine | All rotate | ☐ | ☐ |
| Optical sensor 1 | Pass pill through | Counts correctly | ☐ | ☐ |
| Optical sensor 2-10 | Pass pills | All count | ☐ | ☐ |
| Load cell | Place 50g weight | Shows 50g ±5g | ☐ | ☐ |
| Temperature | Read ambient | ±2°C of reference | ☐ | ☐ |
| Humidity | Read ambient | ±5% of reference | ☐ | ☐ |
| PIR motion | Wave hand | Triggers | ☐ | ☐ |
| Door switch | Open/close tray | Detects both | ☐ | ☐ |
| Audio alert | Play test tone | Clear sound | ☐ | ☐ |
| Battery backup | Unplug AC | Runs >10 min | ☐ | ☐ |
| API heartbeat | Check server | Received | ☐ | ☐ |

#### 3.5.4 Calibration Procedures

**Load Cell Calibration:**

1. Enter calibration mode (Settings → Calibration → Load Cell)
2. Remove all items from tray, press "Zero"
3. Place 50g calibration weight, press "Calibrate"
4. Verify reading shows 50.0g ±1g
5. Save calibration

**Touch Screen Calibration:**

1. Enter calibration mode (Settings → Calibration → Touch)
2. Touch each of 4 corner targets precisely
3. Touch center target
4. Verify touch accuracy across screen
5. Save calibration

**Motor Homing:**

1. Enter calibration mode (Settings → Calibration → Motors)
2. Run "Find Home" for each motor
3. Motor rotates until Hall sensor triggers
4. Position saved as home (slot 1)
5. Repeat for all 10 motors

---

## 4. SMD-200 Travel Device Assembly

### 4.1 Assembly Overview

```
Travel Device Assembly (2-3 hours):

    Step 1           Step 2           Step 3
    ┌─────┐          ┌─────┐          ┌─────┐
    │ PCB │   ───▶   │Mech │   ───▶   │Test │
    │Assem│          │Assem│          │     │
    └─────┘          └─────┘          └─────┘
    1.5 hours        1 hour           0.5 hour
```

### 4.2 PCB Assembly

#### 4.2.1 Component Layout

```
Travel Device PCB (80mm × 60mm):

    ┌─────────────────────────────────┐
    │                                 │
    │  ┌──────────┐   ┌──────────┐   │
    │  │ ESP32-S3 │   │ SIM7080G │   │
    │  │  MINI    │   │ Cellular │   │
    │  └──────────┘   └──────────┘   │
    │                                 │
    │  ┌─────┐  ┌─────┐  ┌─────┐    │
    │  │TP405│  │Fuel │  │Servo│    │
    │  │6+BMS│  │Gauge│  │Driv │    │
    │  └─────┘  └─────┘  └─────┘    │
    │                                 │
    │  [Battery Connector]           │
    │  [USB-C]  [SIM]  [Antenna]     │
    │                                 │
    └─────────────────────────────────┘
```

#### 4.2.2 SMD Assembly Order

| Order | Component | Notes |
|:-----:|:----------|:------|
| 1 | Passives (0603) | Caps, resistors |
| 2 | ESP32-S3-MINI | Reflow or hot air |
| 3 | SIM7080G | Large LGA, hot air |
| 4 | TP4056 | SOT-23-6 or module |
| 5 | MAX17048 | Fuel gauge IC |
| 6 | Connectors | USB-C, SIM, antenna |

#### 4.2.3 Cellular Module Tips

**SIM7080G Installation:**

1. Module is large (17.6×15.7mm) — needs careful placement
2. Apply paste to all pads (including ground paddle)
3. Place module with tweezers
4. Hot air at 270°C from above
5. Watch for solder to flow at edges
6. Module will "settle" when solder melts
7. Inspect under microscope — look for bridges

**Antenna Connections:**

- Main LTE antenna: u.FL connector, connect last
- GPS antenna: u.FL connector (if used)
- Check antenna cables not pinched

### 4.3 Mechanical Assembly

#### 4.3.1 Pill Compartments

```
4-Slot Compartment Layout:

    Top View:
    ┌─────────────────────┐
    │ ┌────┐    ┌────┐   │
    │ │Slot│    │Slot│   │
    │ │ 1  │    │ 2  │   │
    │ └────┘    └────┘   │
    │                     │
    │ ┌────┐    ┌────┐   │
    │ │Slot│    │Slot│   │
    │ │ 3  │    │ 4  │   │
    │ └────┘    └────┘   │
    └─────────────────────┘

    Each slot:
    - Hinged lid (servo opens)
    - Optical sensor underneath
    - 14-day capacity
```

**Assembly Steps:**

1. Install 4× SG90 servos in lid mechanism
2. Install 4× optical sensors (TCPT1300 or QRD1114)
3. Route wires to PCB connectors
4. Test lid open/close before final assembly

### 4.4 Battery Installation

**Battery Safety Warning:**
- Li-Po batteries can catch fire if punctured
- Never short terminals
- Use proper BMS protection
- Charge only with appropriate charger

**Assembly Steps:**

1. Connect battery to JST connector
2. Verify polarity (red = +, black = -)
3. Secure battery with foam tape (no screws through battery!)
4. Verify TP4056 charging indicator works

### 4.5 Final Assembly & Test

| Test | Expected | Pass |
|:-----|:---------|:----:|
| USB-C charging | LED lights, charges | ☐ |
| Battery fuel gauge | Shows percentage | ☐ |
| Cellular connection | Registers on network | ☐ |
| OLED display | Shows UI | ☐ |
| Servo 1-4 | All open/close | ☐ |
| Optical sensors | All detect | ☐ |
| Buzzer | Beeps | ☐ |
| Vibration motor | Vibrates | ☐ |
| GPS fix | Gets location | ☐ |
| API connection (LTE) | Heartbeat sent | ☐ |

---

## 5. Troubleshooting Guide

### 5.1 Common Problems & Solutions

| Problem | Possible Cause | Solution |
|:--------|:---------------|:---------|
| No power | Power jack not connected | Check barrel connector |
| | Blown fuse | Check/replace fuse |
| | BQ24195 not soldered | Reflow IC |
| ESP32 won't boot | Missing pull-up on EN | Add 10K to 3.3V |
| | Flash corrupt | Re-flash firmware |
| | Wrong boot mode | Check GPIO0 pull-up |
| Display blank | FFC not seated | Reseat connector |
| | Backlight MOSFET dead | Replace MOSFET |
| | Wrong firmware config | Check display init |
| Touch not working | I2C not connected | Check SDA/SCL |
| | GT911 address wrong | Check I2C scan |
| | RST pin floating | Add pull-up |
| Motor not turning | ULN2003A dead | Replace driver |
| | Wiring wrong | Check coil order |
| | Power not reaching motor | Check 5V at motor |
| WiFi won't connect | Antenna area blocked | Check PCB layout |
| | Wrong credentials | Re-enter SSID/password |
| | Weak signal | Move closer to AP |
| Audio distorted | Speaker wrong impedance | Use 8Ω |
| | Gain too high | Connect GAIN to GND |
| Load cell drifts | Temperature change | Add compensation |
| | Mechanical stress | Check mounting |
| | ADC noise | Add filtering |

### 5.2 Debug Commands

```c
// Serial debug commands (UART, 115200 baud)

// System status
> status
System: OK
WiFi: Connected (192.168.1.105)
API: Connected (last heartbeat 45s ago)
Battery: 78%, not charging
Temperature: 22.5°C
Humidity: 45%

// Motor test
> motor test 1
Motor 1: Rotating...
Motor 1: Home position found
Motor 1: OK

// Sensor test
> sensor test
SHT40: 22.5°C, 45% RH - OK
BH1750: 350 lux - OK
PIR: No motion - OK
Door: Closed - OK
HX711: 0.0g - OK
Optical 1-10: All clear - OK

// Dispense test
> dispense 1 2
Dispensing slot 1, 2 pills...
Carousel: Rotating to slot 1
Gate: Opening
Optical: Counted 2 pills
Gate: Closing
Load cell: 1.2g detected
Dispense complete

// Firmware info
> version
Firmware: 1.2.0
Build: 2026-02-06 14:30:00
ESP-IDF: 5.1.2
```

---

## 6. Production Testing

### 6.1 In-Circuit Test (ICT)

| Test Point | Expected | Min | Max |
|:-----------|:---------|----:|----:|
| VIN (12V input) | 12.0V | 11.4V | 12.6V |
| VSYS (after BQ24195) | 12.0V | 11.0V | 13.0V |
| 5V rail | 5.0V | 4.75V | 5.25V |
| 3.3V rail | 3.3V | 3.2V | 3.4V |
| Battery voltage | 7.4V | 6.0V | 8.4V |
| ESP32 VCC | 3.3V | 3.2V | 3.4V |

### 6.2 Functional Test (FCT)

**Duration:** 5 minutes per unit

| Step | Test | Pass Criteria |
|:----:|:-----|:--------------|
| 1 | Power on | Boots in <10s |
| 2 | WiFi connect | Connects to test AP |
| 3 | Display test | All pixels OK |
| 4 | Touch test | 4 corners + center |
| 5 | Motor test (all) | All 10 rotate |
| 6 | Sensor test (all) | All respond |
| 7 | Audio test | 1kHz tone, 80dB |
| 8 | API test | Heartbeat sent |
| 9 | Serial number | Programmed |

### 6.3 Burn-In Test

**Duration:** 24 hours

| Condition | Duration | Purpose |
|:----------|:---------|:--------|
| Room temp (25°C) | 8 hours | Normal operation |
| High temp (40°C) | 8 hours | Thermal stress |
| Cycling | 8 hours | Dispense every 10 min |

**Monitoring:**
- Temperature
- Power consumption
- Error log
- Dispense accuracy

---

## 7. Quality Checklist

### 7.1 Pre-Assembly Checklist

| Item | Check |
|:-----|:-----:|
| All components received | ☐ |
| PCBs inspected (no defects) | ☐ |
| Enclosure parts complete | ☐ |
| Calibration weights available | ☐ |
| Test firmware loaded on PC | ☐ |
| Soldering station calibrated | ☐ |

### 7.2 Post-Assembly Checklist

| Item | Check |
|:-----|:-----:|
| Visual inspection (no bridges) | ☐ |
| Power test passed | ☐ |
| All functional tests passed | ☐ |
| Calibration complete | ☐ |
| Serial number programmed | ☐ |
| Enclosure closed properly | ☐ |
| Packaging complete | ☐ |

### 7.3 Sign-Off

| Role | Name | Signature | Date |
|:-----|:-----|:----------|:-----|
| Assembler | | | |
| Tester | | | |
| QA Inspector | | | |

---

## 8. Contact & Support

| Issue | Contact |
|:------|:--------|
| Hardware questions | hardware@smartdispenser.ch |
| Firmware questions | firmware@smartdispenser.ch |
| Component sourcing | procurement@smartdispenser.ch |
| Quality issues | qa@smartdispenser.ch |

**Slack Channels:**
- #hardware — General hardware discussion
- #firmware — Firmware development
- #production — Manufacturing issues

---

## Revision History

| Version | Date | Changes |
|:--------|:-----|:--------|
| 1.0 | Jan 2026 | Initial release |
| 2.0 | Feb 2026 | Added detailed steps |
| 3.0 | Feb 2026 | Complete expansion with schematics, troubleshooting, production testing |
