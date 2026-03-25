# Component Selection Guide

**Detailed Recommendations & Alternatives for Electronics Team**

**Version 1.0 | February 2026**

---

## Document Information

| | |
|:--|:--|
| Version | 1.0 |
| Last Updated | February 2026 |
| Target Audience | Electronics Engineers, Procurement |
| Purpose | Component selection with alternatives and suppliers |

---

## 1. Selection Criteria

### 1.1 Our Priorities (In Order)

1. **Reliability** — Medical device, must work every time
2. **Availability** — No single-source components if possible
3. **Cost** — Target CHF 95 COGS at 10K units
4. **Ease of Assembly** — No exotic packages
5. **Low Power** — 48h battery backup requirement

### 1.2 Approved Manufacturers

| Category | Tier 1 (Preferred) | Tier 2 (Acceptable) | Avoid |
|:---------|:-------------------|:--------------------|:------|
| MCU | Espressif, STM | Nordic, NXP | No-name |
| Power ICs | TI, Analog Devices | Diodes Inc, ON Semi | Chinese clones |
| Passives | Murata, Samsung, Yageo | TDK, Vishay | Unknown brand |
| Sensors | Sensirion, Bosch, TI | STM, Vishay | Generic modules |
| Connectors | Molex, JST, TE | Amphenol, Hirose | No-name |

---

## 2. MCU Selection

### 2.1 Primary Choice: ESP32-S3

| Variant | Flash | PSRAM | Package | Price | Recommendation |
|:--------|------:|------:|:--------|------:|:---------------|
| ESP32-S3-WROOM-1-N4 | 4MB | None | Module | $3.50 | ❌ No PSRAM |
| ESP32-S3-WROOM-1-N8 | 8MB | None | Module | $4.00 | ❌ No PSRAM |
| **ESP32-S3-WROOM-1-N8R2** | 8MB | 2MB | Module | $4.50 | ⚠️ Minimal |
| **ESP32-S3-WROOM-1-N8R8** | 8MB | 8MB | Module | $5.00 | ✅ Good balance |
| **ESP32-S3-WROOM-1-N16R8** | 16MB | 8MB | Module | $5.50 | ✅ **Recommended** |
| ESP32-S3-WROOM-2-N32R8V | 32MB | 8MB | Module | $7.00 | ❌ Overkill |

**Why N16R8:**
- 16MB flash for OTA dual-partition (8MB each)
- 8MB PSRAM for display framebuffers + audio
- Best price/performance ratio
- Widely available

### 2.2 Alternative MCUs

#### Option A: STM32 + ESP32-C3 (WiFi)

| Component | Part Number | Purpose | Price |
|:----------|:------------|:--------|------:|
| Main MCU | STM32F407VGT6 | Application | $6.00 |
| WiFi Module | ESP32-C3-MINI-1 | Connectivity | $2.50 |
| **Total** | | | **$8.50** |

**When to use:** If you need STM32's medical certification variants

**Wiring:**
```
STM32F407 ←───UART───→ ESP32-C3
    │                      │
    │                      └── WiFi/BLE
    ├── Display
    ├── Motors
    ├── Sensors
    └── Audio
```

#### Option B: Raspberry Pi Pico W (NOT Recommended)

| Pros | Cons |
|:-----|:-----|
| Very cheap ($4) | Limited memory (264KB SRAM) |
| Easy to program | No hardware crypto |
| Good community | Not designed for IoT |
| | Poor power management |

**Verdict:** Avoid for medical device

### 2.3 MCU Supplier Comparison

| Supplier | MOQ | Lead Time | Price (1K) | Notes |
|:---------|----:|----------:|:-----------|:------|
| **DigiKey** | 1 | 1-3 days | $5.50 | Fast, reliable |
| **Mouser** | 1 | 1-3 days | $5.50 | Good stock |
| **LCSC** | 5 | 7-14 days | $4.80 | Cheaper, slower |
| **Espressif Direct** | 1000 | 4-6 weeks | $4.20 | Best for volume |
| **RS Components (CH)** | 1 | 1-2 days | $6.00 | Swiss stock |

---

## 3. Display Selection

### 3.1 Display Options Comparison

| Option | Size | Resolution | Interface | Touch | Price | Source |
|:-------|:-----|:-----------|:----------|:------|------:|:-------|
| Waveshare 4.3" RGB | 4.3" | 800×480 | RGB888 | GT911 | $28 | Waveshare |
| Generic 4.3" SPI | 4.3" | 480×272 | SPI | XPT2046 | $15 | AliExpress |
| Nextion 4.3" | 4.3" | 480×272 | UART | Integrated | $45 | Nextion |
| ILI9488 3.5" | 3.5" | 480×320 | SPI | XPT2046 | $12 | LCSC |
| **Recommended** | **4.3"** | **800×480** | **RGB888** | **GT911** | **$28** | **Waveshare** |

### 3.2 Why RGB Interface Over SPI

| Factor | RGB888 | SPI |
|:-------|:-------|:----|
| Refresh rate | 60 FPS | 10-15 FPS |
| UI smoothness | Excellent | Choppy |
| CPU usage | Low (DMA) | High |
| GPIO usage | 20+ pins | 5 pins |
| **Recommendation** | **For final product** | For prototyping only |

### 3.3 Touch Controller Options

| Controller | Interface | Multi-touch | Price | Notes |
|:-----------|:----------|:------------|------:|:------|
| **GT911** | I2C | 5-point | $2 | **Recommended**, capacitive |
| GT9147 | I2C | 5-point | $2 | Alternative to GT911 |
| FT5436 | I2C | 5-point | $2.50 | FocalTech, good quality |
| XPT2046 | SPI | Single | $0.50 | Resistive, for budget |

### 3.4 Display Procurement

| Supplier | Price | MOQ | Lead Time | Notes |
|:---------|------:|----:|----------:|:------|
| **Waveshare** | $28 | 1 | 5-7 days | Good quality, documentation |
| **Buydisplay** | $22 | 10 | 7-14 days | Cheaper, more options |
| **AliExpress (various)** | $15-25 | 1 | 7-21 days | Quality varies |
| **Winstar** | $35 | 100 | 4-6 weeks | Industrial grade |

---

## 4. Power Management Components

### 4.1 Power Path Controller

#### Primary: BQ24195 (Texas Instruments)

| Parameter | Value |
|:----------|:------|
| Part Number | BQ24195RGER |
| Input Voltage | 4.35V - 17V |
| Battery Voltage | Up to 4.4V/cell (2S = 8.8V) |
| Charge Current | Up to 2.1A |
| System Current | Up to 2.5A |
| Features | I2C, NTC, power path, OTG |
| Package | QFN-24 (4×4mm) |
| Price | $3.50 |

**Why BQ24195:**
- Single chip for charging + power path
- I2C programmable (can monitor battery)
- Used in many consumer products
- Good documentation

#### Alternative: BQ25895

| Parameter | BQ24195 | BQ25895 |
|:----------|:--------|:--------|
| Max Input | 17V | 14V |
| Charge Current | 2.1A | 3A |
| Features | Basic | More monitoring |
| Price | $3.50 | $4.50 |
| **Recommendation** | **Use for V1** | For V2 if needed |

#### Alternative: MP2639A (Monolithic Power)

| Pros | Cons |
|:-----|:-----|
| Cheaper ($2) | Less documentation |
| Single chip | No I2C |
| Small package | Fixed settings |

### 4.2 Buck Regulators

#### 5V Rail: TPS62150

| Parameter | TPS62150 | TPS62135 | LM2596 |
|:----------|:---------|:---------|:-------|
| Efficiency | 95% | 96% | 80% |
| Output Current | 1A | 4A | 3A |
| Quiescent | 17µA | 8µA | 5mA |
| Package | QFN-16 | QFN-16 | TO-220 |
| Size | 3×3mm | 3×3mm | Large |
| Price | $1.80 | $2.50 | $0.50 |
| **Recommendation** | **V1** | For V2 | Avoid (inefficient) |

#### Alternative 5V Regulators

| Part | Manufacturer | Iout | Eff. | Price | Notes |
|:-----|:-------------|-----:|-----:|------:|:------|
| **TPS62150** | TI | 1A | 95% | $1.80 | **Recommended** |
| TPS62135 | TI | 4A | 96% | $2.50 | Higher current |
| AP62150 | Diodes Inc | 1.5A | 93% | $0.80 | Budget option |
| MP2359 | MPS | 1.2A | 92% | $0.60 | Very cheap |
| AOZ1282CI | Alpha & Omega | 2A | 93% | $0.70 | Good value |

### 4.3 LDO Regulators

#### 3.3V Rail: AP2112K-3.3

| Parameter | Value |
|:----------|:------|
| Part Number | AP2112K-3.3TRG1 |
| Output | 3.3V ±2% |
| Max Current | 600mA |
| Dropout | 250mV @ 600mA |
| Quiescent | 55µA |
| Package | SOT-25 |
| Price | $0.25 |

**Why AP2112K:**
- Very cheap and widely available
- Good for low-current loads
- Simple circuit (just input/output caps)

#### Alternative LDOs

| Part | Iout | Dropout | Iq | Price | Notes |
|:-----|-----:|--------:|---:|------:|:------|
| **AP2112K-3.3** | 600mA | 250mV | 55µA | $0.25 | **Recommended** |
| AMS1117-3.3 | 1A | 1.2V | 5mA | $0.10 | Avoid (high dropout) |
| XC6220B331MR | 700mA | 100mV | 8µA | $0.40 | Very low Iq |
| TLV70233 | 300mA | 200mV | 6µA | $0.60 | Ultra-low power |
| LDL1117S33R | 1A | 350mV | 250µA | $0.35 | Higher current |

### 4.4 Battery Selection

#### 18650 Cell Comparison

| Cell | Capacity | Max Discharge | Price | Notes |
|:-----|:---------|:--------------|------:|:------|
| **Samsung INR18650-25R** | 2500mAh | 20A | $4 | **Recommended** |
| LG HG2 | 3000mAh | 20A | $5 | More capacity |
| Sony VTC6 | 3000mAh | 15A | $6 | Premium |
| Samsung 30Q | 3000mAh | 15A | $5 | Good value |
| Generic "Ultrafire" | 1500mAh? | ? | $1 | **AVOID** (dangerous) |

**Warning:** Only buy from reputable sources. Fake 18650 cells are common and dangerous.

**Trusted Suppliers:**
- IMRbatteries.com
- 18650batterystore.com
- Nkon.nl (EU)
- Direct from Samsung/LG distributors

#### Battery Pack Configuration

| Config | Voltage | Capacity | Notes |
|:-------|--------:|:---------|:------|
| **2S1P** | 7.4V nom | 2500-3000mAh | **Recommended** |
| 2S2P | 7.4V nom | 5000-6000mAh | More capacity, bigger |
| 1S2P | 3.7V nom | 5000-6000mAh | Lower voltage, easier |

---

## 5. Motor Selection

### 5.1 Stepper Motor: 28BYJ-48

| Parameter | Value |
|:----------|:------|
| Type | 5-wire unipolar |
| Voltage | 5V DC |
| Phase Resistance | 50Ω |
| Steps/Revolution | 2048 (half-step) |
| Step Angle | 5.625°/64 gear reduction |
| Holding Torque | 34.3 mN·m |
| Max Speed | 15 RPM |
| Price | $1.50-2.00 |

**Why 28BYJ-48:**
- Very cheap
- Low noise
- Sufficient torque for pills
- 5V operation (no extra regulator)
- Huge community support

#### Alternatives

| Motor | Type | Torque | Speed | Price | Notes |
|:------|:-----|:-------|:------|------:|:------|
| **28BYJ-48** | Stepper | 34mN·m | 15 RPM | $2 | **Recommended** |
| 17HS4401 | NEMA 17 | 400mN·m | 100+ RPM | $10 | Overkill |
| N20 Gearmotor | DC+Encoder | 50mN·m | 60 RPM | $5 | Needs encoder |
| MG996R | Servo | 100mN·m | 0.15s/60° | $4 | For gate only |

### 5.2 Motor Driver: ULN2003A

| Parameter | Value |
|:----------|:------|
| Part Number | ULN2003AN |
| Channels | 7 Darlington pairs |
| Output Current | 500mA per channel |
| Saturation Voltage | 1.0V @ 350mA |
| Package | DIP-16 or SOIC-16 |
| Price | $0.30 |

**Why ULN2003A:**
- Perfectly matched to 28BYJ-48
- Built-in flyback diodes
- Very cheap
- Easy to hand solder

#### Alternatives

| Driver | Channels | Iout | Features | Price | Notes |
|:-------|:--------:|-----:|:---------|------:|:------|
| **ULN2003A** | 7 | 500mA | Basic | $0.30 | **Recommended** |
| L293D | 4 | 600mA | H-bridge | $1.50 | For DC motors |
| A4988 | 2 | 2A | Microstepping | $2.00 | For NEMA 17 |
| TMC2209 | 2 | 2A | Silent | $4.00 | Very quiet |

### 5.3 Servo: SG90

| Parameter | Value |
|:----------|:------|
| Type | Micro servo |
| Torque | 1.8 kg·cm @ 5V |
| Speed | 0.1s / 60° |
| Rotation | 180° |
| Voltage | 4.8-6V |
| Control | PWM (50Hz) |
| Price | $1.50-2.00 |

#### Alternatives

| Servo | Torque | Speed | Price | Notes |
|:------|:-------|:------|------:|:------|
| **SG90** | 1.8 kg·cm | 0.1s/60° | $1.50 | **Recommended** |
| MG90S | 2.2 kg·cm | 0.1s/60° | $3.00 | Metal gear, more durable |
| MG996R | 10 kg·cm | 0.2s/60° | $4.00 | High torque |
| ES08MA | 1.8 kg·cm | 0.1s/60° | $2.00 | Metal gear micro |

---

## 6. Sensor Selection

### 6.1 Temperature & Humidity: SHT40

| Parameter | SHT40 | DHT22 | BME280 |
|:----------|:------|:------|:-------|
| Temp Accuracy | ±0.2°C | ±0.5°C | ±1.0°C |
| Humidity Accuracy | ±1.8% | ±2% | ±3% |
| Interface | I2C | 1-wire | I2C/SPI |
| Size | 1.5×1.5mm | 15×25mm | 2.5×2.5mm |
| Response Time | 8s | 30s | 1s |
| Price | $2.50 | $4.00 | $3.50 |
| **Recommendation** | **Best** | Avoid | Good alternative |

**Why SHT40:**
- Tiny (perfect for PCB integration)
- Very accurate
- Factory calibrated
- Standard I2C

### 6.2 Motion Detection: PIR Options

| Part | Size | Range | Power | Price | Notes |
|:-----|:-----|:------|------:|------:|:------|
| **AM312** | 10mm | 3-5m | 20µA | $1.50 | **Recommended** |
| HC-SR501 | 32mm | 7m | 65µA | $1.00 | Too big, adjustable |
| HC-SR505 | 10mm | 3m | 60µA | $1.00 | Mini, but higher power |
| AS312 | 10mm | 3m | 15µA | $2.00 | Ultra-low power |

### 6.3 Optical Pill Sensors

| Part | Type | Gap | Response | Price | Notes |
|:-----|:-----|:---:|:---------|------:|:------|
| **TCPT1300X01** | Transmissive | 3mm | 10µs | $0.80 | **Recommended** |
| GP1A57HRJ00F | Transmissive | 5mm | 4µs | $1.20 | Larger gap |
| QRD1114 | Reflective | N/A | 10µs | $0.60 | Alternative design |
| TCPT1000 | Transmissive | 3mm | 10µs | $0.70 | Budget option |

**Design Note:** Transmissive sensors work best for pill counting (pill breaks the beam)

### 6.4 Load Cell & ADC

| Load Cell | Range | Accuracy | Price | Notes |
|:----------|:------|:---------|------:|:------|
| **TAL220** | 1kg | ±0.05% | $3 | **Recommended** |
| TAL221 | 500g | ±0.03% | $4 | Higher precision |
| Generic 1kg | 1kg | ±0.1% | $2 | Budget |

| ADC | Resolution | Sample Rate | Price | Notes |
|:----|:-----------|:------------|------:|:------|
| **HX711** | 24-bit | 10/80 SPS | $0.80 | **Recommended** |
| ADS1232 | 24-bit | 10-1200 SPS | $3.00 | Faster |
| NAU7802 | 24-bit | 10-320 SPS | $1.50 | I2C, smaller |

### 6.5 Ambient Light Sensor

| Part | Range | Resolution | Interface | Price | Notes |
|:-----|:------|:-----------|:----------|------:|:------|
| **BH1750** | 1-65535 lux | 1 lux | I2C | $1.00 | **Recommended** |
| TSL2561 | 0.1-40000 lux | 0.1 lux | I2C | $2.00 | More sensitive |
| VEML7700 | 0-120000 lux | 0.0036 lux | I2C | $1.50 | High dynamic range |

---

## 7. Audio Components

### 7.1 Amplifier: MAX98357A

| Parameter | Value |
|:----------|:------|
| Part | MAX98357AETE+ |
| Type | I2S Class D |
| Output | 3.2W @ 4Ω |
| THD+N | 0.03% |
| Efficiency | 92% |
| Gain | 3/6/9/12/15 dB (pin-selectable) |
| Package | QFN-16 (3×3mm) |
| Price | $2.50 |

**Why MAX98357A:**
- No external codec needed
- I2S direct from ESP32
- Filterless (no inductor)
- Small package

#### Alternatives

| Amplifier | Type | Power | Interface | Price | Notes |
|:----------|:-----|------:|:----------|------:|:------|
| **MAX98357A** | Class D | 3W | I2S | $2.50 | **Recommended** |
| PAM8403 | Class D | 3W | Analog | $0.30 | Needs DAC |
| NS4150 | Class D | 5W | Analog | $0.40 | Needs DAC |
| PCM5102A | DAC | N/A | I2S | $3.00 | Add external amp |

### 7.2 Speaker Selection

| Speaker | Size | Impedance | Power | SPL | Price | Notes |
|:--------|:-----|----------:|------:|----:|------:|:------|
| **40mm round** | 40mm | 8Ω | 2W | 85dB | $1.50 | **Recommended** |
| 28mm round | 28mm | 8Ω | 1W | 82dB | $1.00 | Smaller, quieter |
| 50mm round | 50mm | 4Ω | 3W | 88dB | $2.50 | Louder |
| 30×50mm oval | 30×50mm | 8Ω | 2W | 85dB | $2.00 | Fits tight spaces |

---

## 8. Connectivity Components

### 8.1 Cellular Module (Travel Device)

| Module | Networks | Bands (EU) | GNSS | Price | Notes |
|:-------|:---------|:-----------|:-----|------:|:------|
| **SIM7080G** | Cat-M1, NB-IoT | B1/3/5/8/20/28 | Yes | $12 | **Recommended** |
| SIM7000E | Cat-M1, NB-IoT | B3/8/20/28 | Yes | $15 | Previous gen |
| Quectel BG96 | Cat-M1, NB-IoT | All | Yes | $18 | Higher quality |
| u-blox SARA-R4 | Cat-M1, NB-IoT | All | No | $20 | Industrial |

### 8.2 SIM Card Options

| Provider | Type | Coverage | Data Cost | Notes |
|:---------|:-----|:---------|:----------|:------|
| **Hologram** | M2M | Global | $0.60/MB | Easy activation |
| **1NCE** | IoT | Europe | €10/10yr/500MB | Very cheap |
| Twilio | M2M | Global | $0.10/MB | Programmable |
| Swisscom M2M | Enterprise | CH+EU | Quote | Swiss provider |

**Recommendation:** 1NCE for Europe-only, Hologram for global travel

### 8.3 Antennas

| Type | Part | Gain | Size | Price | Notes |
|:-----|:-----|-----:|:-----|------:|:------|
| WiFi PCB | Trace antenna | 2dBi | 20×3mm | $0 | Free (PCB) |
| WiFi Chip | 2.4G ceramic | 2dBi | 3×2mm | $0.30 | Backup option |
| WiFi External | u.FL whip | 5dBi | 100mm | $2.00 | Extended range |
| LTE Ceramic | Taoglas CAF95381 | 2dBi | 5×4mm | $3.00 | Compact |
| LTE PCB | Trace antenna | 1dBi | 80×10mm | $0 | Free (PCB) |
| LTE External | u.FL whip | 5dBi | 100mm | $5.00 | Best range |

---

## 9. Connectors

### 9.1 Internal Connectors

| Application | Connector Type | Part | Pitch | Price | Notes |
|:------------|:---------------|:-----|:------|------:|:------|
| Motor | JST XH | XH-5P | 2.5mm | $0.15 | **Recommended** |
| Sensor | JST PH | PH-3P | 2.0mm | $0.10 | Smaller |
| Power | JST VH | VH-2P | 3.96mm | $0.20 | Higher current |
| Battery | JST XH | XH-2P | 2.5mm | $0.10 | Standard |
| Display | FFC | 40P 0.5mm | 0.5mm | $0.50 | ZIF connector |

### 9.2 External Connectors

| Application | Connector | Part | Price | Notes |
|:------------|:----------|:-----|------:|:------|
| DC Power | Barrel jack | 5.5×2.1mm | $0.30 | Standard |
| USB (Home) | USB-B Mini | Mini-B | $0.50 | Programming |
| USB (Travel) | USB-C | 16P | $0.80 | Charging + data |
| Debug | Pin header | 2.54mm 4P | $0.05 | UART debug |
| SIM | Nano SIM | Push-push | $0.80 | Travel device |

### 9.3 Connector Suppliers

| Supplier | MOQ | Lead Time | Notes |
|:---------|----:|----------:|:------|
| **LCSC** | 10 | 7-14 days | Cheapest |
| DigiKey | 1 | 1-3 days | Fast |
| Mouser | 1 | 1-3 days | Wide selection |
| **JST Direct** | 100 | 4-6 weeks | OEM quality |

---

## 10. Passive Components

### 10.1 Capacitor Selection

| Application | Value | Voltage | Package | Type | Notes |
|:------------|------:|--------:|:--------|:-----|:------|
| Decoupling | 100nF | 16V | 0402 | MLCC X7R | Close to IC |
| Bulk power | 10µF | 16V | 0805 | MLCC X5R | Power rails |
| Large bulk | 100µF | 16V | 6.3×5.4mm | Electrolytic | Near regulators |
| Battery | 22µF | 10V | 0805 | MLCC X5R | Charge circuit |

**Brand Recommendations:**
- Samsung CL series (MLCC)
- Murata GRM series (MLCC)
- Panasonic EEE series (Electrolytic)
- Nichicon UWT series (Electrolytic)

### 10.2 Resistor Selection

| Application | Tolerance | Package | Notes |
|:------------|----------:|:--------|:------|
| General | ±5% | 0603 | Standard |
| Current sense | ±1% | 0805 | Higher power |
| Precision divider | ±0.1% | 0603 | Voltage monitoring |
| High power | N/A | 2512 | Motor current |

**Brand Recommendations:**
- Yageo RC series
- Samsung RC series
- Vishay CRCW series

### 10.3 Inductor Selection

| Application | Value | Current | Package | Notes |
|:------------|------:|--------:|:--------|:------|
| Buck 5V | 2.2µH | 1.5A | 4×4mm | Shielded |
| Buck 3.3V | 4.7µH | 1A | 3×3mm | Shielded |
| EMI filter | 600Ω @ 100MHz | 500mA | 0805 | Ferrite bead |

**Brand Recommendations:**
- Murata LQH series
- Coilcraft XFL series
- Wurth WE-MAPI series

---

## 11. Procurement Strategy

### 11.1 Order Quantities

| Phase | Quantity | Strategy |
|:------|:---------|:---------|
| Prototype | 5-10 | Order from DigiKey/Mouser (fast) |
| Pilot | 50-100 | Mix of DigiKey + LCSC |
| Production | 1000+ | LCSC + Direct from manufacturers |
| Scale | 10000+ | Direct + Contract manufacturer |

### 11.2 Lead Time Planning

| Component Type | Typical Lead Time | Buffer Stock |
|:---------------|------------------:|-------------:|
| Passives | 2-4 weeks | 4 weeks |
| ICs (common) | 4-8 weeks | 8 weeks |
| ICs (specialty) | 8-16 weeks | 12 weeks |
| Connectors | 2-4 weeks | 4 weeks |
| Displays | 4-6 weeks | 6 weeks |
| Motors | 4-6 weeks | 6 weeks |
| Batteries | 4-8 weeks | 8 weeks |

### 11.3 Second Source Strategy

| Critical Component | Primary | Second Source |
|:-------------------|:--------|:--------------|
| MCU | ESP32-S3-WROOM-1-N16R8 | ESP32-S3-WROOM-1-N8R8 |
| Power IC | BQ24195 | BQ25895 |
| Buck regulator | TPS62150 | AP62150 |
| LDO | AP2112K | XC6220B331MR |
| Motor driver | ULN2003AN (TI) | ULN2003A (ST) |
| Temp sensor | SHT40 | SHT31 |

---

## 12. Cost Summary

### 12.1 SMD-100 Home Device

| Category | Qty 100 | Qty 1000 | Qty 10000 |
|:---------|--------:|---------:|----------:|
| MCU & Memory | $7.00 | $6.00 | $5.00 |
| Power Components | $12.00 | $10.00 | $8.00 |
| Display | $28.00 | $24.00 | $20.00 |
| Motors & Drivers | $18.00 | $15.00 | $12.00 |
| Sensors | $12.00 | $10.00 | $8.00 |
| Audio | $4.00 | $3.50 | $3.00 |
| Connectors & Cables | $6.00 | $5.00 | $4.00 |
| Passives | $5.00 | $4.00 | $3.00 |
| PCBs | $12.00 | $8.00 | $5.00 |
| Battery Pack | $12.00 | $10.00 | $8.00 |
| Enclosure | $25.00 | $20.00 | $14.00 |
| Assembly | $15.00 | $12.00 | $10.00 |
| **Total** | **$156.00** | **$127.50** | **$100.00** |

### 12.2 SMD-200 Travel Device

| Category | Qty 100 | Qty 1000 | Qty 10000 |
|:---------|--------:|---------:|----------:|
| MCU & Memory | $6.00 | $5.00 | $4.00 |
| Cellular Module | $15.00 | $12.00 | $10.00 |
| Power Components | $8.00 | $6.00 | $5.00 |
| Display (OLED) | $10.00 | $8.00 | $6.00 |
| Motors (Servos) | $8.00 | $6.00 | $4.00 |
| Sensors | $5.00 | $4.00 | $3.00 |
| Connectors | $4.00 | $3.00 | $2.00 |
| Passives | $3.00 | $2.50 | $2.00 |
| PCB | $8.00 | $6.00 | $4.00 |
| Battery | $10.00 | $8.00 | $6.00 |
| Enclosure | $15.00 | $12.00 | $10.00 |
| Assembly | $10.00 | $8.00 | $6.00 |
| **Total** | **$102.00** | **$80.50** | **$62.00** |

---

## Revision History

| Version | Date | Changes |
|:--------|:-----|:--------|
| 1.0 | Feb 2026 | Initial release |
