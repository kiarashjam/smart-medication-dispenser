# Firmware Development Guide

**ESP32-S3 Firmware Implementation for Smart Medication Dispenser**

**Version 2.0 | February 2026**

---

## Document Information

| | |
|:--|:--|
| Version | 2.0 |
| Last Updated | February 2026 |
| Target Audience | Firmware Engineers |
| Platform | ESP32-S3 / ESP-IDF v5.1+ |

---

> **API Note:** The firmware communicates with the backend via the **Device API** (`/api/v1/`).
> This is separate from the User/App API (`/api/`) used by the mobile and web apps.
> See [02_API_INTEGRATION.md](./02_API_INTEGRATION.md) for the complete API reference.

---

## 1. Development Environment Setup

### 1.1 Prerequisites

| Tool | Version | Installation |
|:-----|:--------|:-------------|
| ESP-IDF | v5.1+ | [Espressif docs](https://docs.espressif.com/projects/esp-idf/en/latest/esp32s3/get-started/) |
| VS Code | Latest | [code.visualstudio.com](https://code.visualstudio.com/) |
| ESP-IDF Extension | Latest | VS Code marketplace |
| Python | 3.8+ | Required by ESP-IDF |
| Git | Latest | Version control |

### 1.2 ESP-IDF Installation (Windows)

```powershell
# Download ESP-IDF Tools Installer
# https://dl.espressif.com/dl/esp-idf/

# Or manually:
mkdir %USERPROFILE%\esp
cd %USERPROFILE%\esp
git clone -b v5.1.2 --recursive https://github.com/espressif/esp-idf.git
cd esp-idf
install.bat esp32s3
```

### 1.3 VS Code Configuration

`.vscode/settings.json`:

```json
{
    "idf.espIdfPath": "${env:USERPROFILE}/esp/esp-idf",
    "idf.toolsPath": "${env:USERPROFILE}/.espressif",
    "idf.port": "COM3",
    "idf.flashBaudRate": "921600",
    "terminal.integrated.env.windows": {
        "IDF_PATH": "${env:USERPROFILE}/esp/esp-idf"
    },
    "C_Cpp.default.includePath": [
        "${workspaceFolder}/**",
        "${env:USERPROFILE}/esp/esp-idf/components/**"
    ]
}
```

### 1.4 Create New Project

```bash
# From ESP-IDF command prompt
idf.py create-project smart_dispenser
cd smart_dispenser

# Set target
idf.py set-target esp32s3

# Build
idf.py build

# Flash and monitor
idf.py -p COM3 flash monitor
```

---

## 2. Project Structure

### 2.1 Recommended Directory Layout

```
smart_dispenser/
├── CMakeLists.txt              # Root CMake
├── sdkconfig                   # Configuration (generated)
├── sdkconfig.defaults          # Default configuration
├── partitions.csv              # Partition table
│
├── main/
│   ├── CMakeLists.txt
│   ├── main.c                  # Entry point
│   ├── app_main.c              # Application logic
│   │
│   ├── config/
│   │   ├── config.h            # Configuration
│   │   └── pins.h              # GPIO definitions
│   │
│   ├── drivers/
│   │   ├── motor_driver.c/h    # Stepper motor control
│   │   ├── servo_driver.c/h    # Servo control
│   │   ├── display_driver.c/h  # LCD + touch
│   │   ├── audio_driver.c/h    # I2S audio
│   │   └── sensor_driver.c/h   # All sensors
│   │
│   ├── services/
│   │   ├── wifi_service.c/h    # WiFi management
│   │   ├── api_client.c/h      # HTTP client
│   │   ├── schedule_service.c/h # Schedule management
│   │   ├── dispense_service.c/h # Dispensing logic
│   │   ├── event_service.c/h   # Event queue
│   │   └── storage_service.c/h # NVS + SD card
│   │
│   ├── ui/
│   │   ├── ui.c/h              # LVGL UI manager
│   │   ├── screens/            # Screen implementations
│   │   │   ├── home_screen.c
│   │   │   ├── schedule_screen.c
│   │   │   ├── settings_screen.c
│   │   │   └── alert_screen.c
│   │   └── assets/             # Images, fonts
│   │
│   └── utils/
│       ├── json_utils.c/h      # JSON helpers
│       ├── time_utils.c/h      # Time handling
│       └── crypto_utils.c/h    # Encryption
│
├── components/                  # External components
│   ├── lvgl/                   # UI library
│   ├── esp_lvgl_port/          # LVGL ESP port
│   └── hx711/                  # Load cell driver
│
└── resources/
    ├── audio/                  # Sound files
    └── images/                 # UI images
```

### 2.2 Partition Table

`partitions.csv`:

```csv
# Name,   Type, SubType, Offset,   Size,     Flags
nvs,      data, nvs,     0x9000,   0x6000,
otadata,  data, ota,     0xf000,   0x2000,
phy_init, data, phy,     0x11000,  0x1000,
factory,  app,  factory, 0x20000,  0x200000,
ota_0,    app,  ota_0,   0x220000, 0x200000,
ota_1,    app,  ota_1,   0x420000, 0x200000,
storage,  data, spiffs,  0x620000, 0x180000,
```

| Partition | Size | Purpose |
|:----------|-----:|:--------|
| nvs | 24KB | Settings, calibration |
| factory | 2MB | Factory firmware |
| ota_0 | 2MB | OTA slot A |
| ota_1 | 2MB | OTA slot B |
| storage | 1.5MB | Audio files, logs |

---

## 3. GPIO Configuration

### 3.1 Pin Definitions

`config/pins.h`:

```c
#ifndef PINS_H
#define PINS_H

// ============================================================
// SMD-100 Home Device Pin Configuration
// ============================================================

// ----- Display (RGB888) -----
#define PIN_LCD_CLK         GPIO_NUM_45
#define PIN_LCD_DE          GPIO_NUM_48
#define PIN_LCD_VSYNC       GPIO_NUM_47
#define PIN_LCD_HSYNC       GPIO_NUM_21

#define PIN_LCD_R0          GPIO_NUM_1
#define PIN_LCD_R1          GPIO_NUM_2
#define PIN_LCD_R2          GPIO_NUM_3
#define PIN_LCD_R3          GPIO_NUM_4
#define PIN_LCD_R4          GPIO_NUM_5

#define PIN_LCD_G0          GPIO_NUM_6
#define PIN_LCD_G1          GPIO_NUM_7
#define PIN_LCD_G2          GPIO_NUM_8
#define PIN_LCD_G3          GPIO_NUM_9
#define PIN_LCD_G4          GPIO_NUM_10
#define PIN_LCD_G5          GPIO_NUM_11

#define PIN_LCD_B0          GPIO_NUM_12
#define PIN_LCD_B1          GPIO_NUM_13
#define PIN_LCD_B2          GPIO_NUM_14
#define PIN_LCD_B3          GPIO_NUM_15
#define PIN_LCD_B4          GPIO_NUM_16

#define PIN_LCD_BL          GPIO_NUM_42     // Backlight PWM

// ----- Touch (I2C) -----
#define PIN_TOUCH_SDA       GPIO_NUM_38
#define PIN_TOUCH_SCL       GPIO_NUM_39
#define PIN_TOUCH_INT       GPIO_NUM_40
#define PIN_TOUCH_RST       GPIO_NUM_41
#define TOUCH_I2C_ADDR      0x5D            // GT911

// ----- Audio (I2S) -----
#define PIN_I2S_BCLK        GPIO_NUM_17
#define PIN_I2S_LRCK        GPIO_NUM_18
#define PIN_I2S_DOUT        GPIO_NUM_15

// ----- Load Cell (HX711) -----
#define PIN_HX711_DOUT      GPIO_NUM_32
#define PIN_HX711_SCK       GPIO_NUM_33

// ----- I2C Bus (Sensors) -----
#define PIN_I2C_SDA         GPIO_NUM_44
#define PIN_I2C_SCL         GPIO_NUM_46
#define I2C_FREQ_HZ         400000

// Sensor addresses
#define SHT40_I2C_ADDR      0x44
#define BH1750_I2C_ADDR     0x23
#define MCP23017_I2C_ADDR   0x20

// ----- Motion & Door -----
#define PIN_PIR             GPIO_NUM_26
#define PIN_DOOR_SWITCH     GPIO_NUM_27

// ----- SD Card (SPI) -----
#define PIN_SD_CLK          GPIO_NUM_36
#define PIN_SD_CMD          GPIO_NUM_35
#define PIN_SD_DATA0        GPIO_NUM_37

// ----- Motor Control (via MCP23017 I/O Expander) -----
// Motors connected through I/O expander
// GPA0-7: Motors 1-4 (4 pins each)
// GPB0-7: Motors 5-8 (4 pins each)
// Additional motors on ESP32 GPIO

#define PIN_GATE_SERVO      GPIO_NUM_43

// ----- Status LEDs (WS2812B) -----
#define PIN_LED_DATA        GPIO_NUM_48
#define LED_COUNT           8

// ----- Buttons -----
#define PIN_BTN_CONFIRM     GPIO_NUM_0      // Also boot button
#define PIN_BTN_CANCEL      GPIO_NUM_34
#define PIN_BTN_EMERGENCY   GPIO_NUM_35

#endif // PINS_H
```

---

## 4. Core Drivers

### 4.1 Motor Driver

`drivers/motor_driver.h`:

```c
#ifndef MOTOR_DRIVER_H
#define MOTOR_DRIVER_H

#include "esp_err.h"

#define NUM_SLOTS           10
#define STEPS_PER_REV       2048    // 28BYJ-48 half-step
#define STEPS_PER_SLOT      (STEPS_PER_REV / NUM_SLOTS)

typedef enum {
    MOTOR_DIR_CW = 0,
    MOTOR_DIR_CCW = 1
} motor_direction_t;

typedef enum {
    MOTOR_STATE_IDLE = 0,
    MOTOR_STATE_RUNNING,
    MOTOR_STATE_HOMING,
    MOTOR_STATE_ERROR
} motor_state_t;

// Initialize motor system
esp_err_t motor_driver_init(void);

// Move carousel to specific slot
esp_err_t motor_move_to_slot(uint8_t slot);

// Home the carousel (find slot 1)
esp_err_t motor_home(void);

// Get current slot position
uint8_t motor_get_current_slot(void);

// Get motor state
motor_state_t motor_get_state(void);

// Open/close gate servo
esp_err_t motor_gate_open(void);
esp_err_t motor_gate_close(void);

#endif // MOTOR_DRIVER_H
```

`drivers/motor_driver.c`:

```c
#include "motor_driver.h"
#include "driver/gpio.h"
#include "driver/ledc.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "pins.h"

static const char *TAG = "MOTOR";

// Half-step sequence for 28BYJ-48
static const uint8_t STEP_SEQUENCE[8][4] = {
    {1, 0, 0, 0},
    {1, 1, 0, 0},
    {0, 1, 0, 0},
    {0, 1, 1, 0},
    {0, 0, 1, 0},
    {0, 0, 1, 1},
    {0, 0, 0, 1},
    {1, 0, 0, 1}
};

static uint8_t current_slot = 1;
static int32_t current_position = 0;
static motor_state_t motor_state = MOTOR_STATE_IDLE;

// MCP23017 register addresses
#define MCP23017_IODIRA     0x00
#define MCP23017_IODIRB     0x01
#define MCP23017_GPIOA      0x12
#define MCP23017_GPIOB      0x13

// Forward declarations
static esp_err_t mcp23017_write(uint8_t reg, uint8_t value);
static esp_err_t step_motor(uint8_t motor_num, int steps);

esp_err_t motor_driver_init(void) {
    ESP_LOGI(TAG, "Initializing motor driver");
    
    // Initialize MCP23017 - all outputs
    ESP_ERROR_CHECK(mcp23017_write(MCP23017_IODIRA, 0x00));
    ESP_ERROR_CHECK(mcp23017_write(MCP23017_IODIRB, 0x00));
    
    // Initialize gate servo PWM
    ledc_timer_config_t timer_config = {
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .timer_num = LEDC_TIMER_0,
        .duty_resolution = LEDC_TIMER_13_BIT,
        .freq_hz = 50,  // 50Hz for servo
        .clk_cfg = LEDC_AUTO_CLK
    };
    ESP_ERROR_CHECK(ledc_timer_config(&timer_config));
    
    ledc_channel_config_t channel_config = {
        .gpio_num = PIN_GATE_SERVO,
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .channel = LEDC_CHANNEL_0,
        .timer_sel = LEDC_TIMER_0,
        .duty = 0,
        .hpoint = 0
    };
    ESP_ERROR_CHECK(ledc_channel_config(&channel_config));
    
    // Close gate initially
    motor_gate_close();
    
    ESP_LOGI(TAG, "Motor driver initialized");
    return ESP_OK;
}

esp_err_t motor_move_to_slot(uint8_t slot) {
    if (slot < 1 || slot > NUM_SLOTS) {
        ESP_LOGE(TAG, "Invalid slot number: %d", slot);
        return ESP_ERR_INVALID_ARG;
    }
    
    if (motor_state != MOTOR_STATE_IDLE) {
        ESP_LOGW(TAG, "Motor busy");
        return ESP_ERR_INVALID_STATE;
    }
    
    motor_state = MOTOR_STATE_RUNNING;
    
    // Calculate shortest path
    int8_t diff = slot - current_slot;
    int steps = diff * STEPS_PER_SLOT;
    
    // Handle wrap-around (shortest path)
    if (diff > NUM_SLOTS / 2) {
        steps = (diff - NUM_SLOTS) * STEPS_PER_SLOT;
    } else if (diff < -NUM_SLOTS / 2) {
        steps = (diff + NUM_SLOTS) * STEPS_PER_SLOT;
    }
    
    ESP_LOGI(TAG, "Moving from slot %d to slot %d (%d steps)", 
             current_slot, slot, steps);
    
    // Step the motor
    esp_err_t ret = step_motor(0, steps);  // Motor 0 is carousel
    
    if (ret == ESP_OK) {
        current_slot = slot;
        current_position += steps;
    }
    
    motor_state = MOTOR_STATE_IDLE;
    return ret;
}

esp_err_t motor_home(void) {
    ESP_LOGI(TAG, "Homing carousel...");
    motor_state = MOTOR_STATE_HOMING;
    
    // Rotate until hall sensor triggers
    // For simplicity, assume we start at slot 1
    // In production, implement actual homing with sensor
    
    current_slot = 1;
    current_position = 0;
    motor_state = MOTOR_STATE_IDLE;
    
    ESP_LOGI(TAG, "Homing complete");
    return ESP_OK;
}

uint8_t motor_get_current_slot(void) {
    return current_slot;
}

motor_state_t motor_get_state(void) {
    return motor_state;
}

esp_err_t motor_gate_open(void) {
    ESP_LOGI(TAG, "Opening gate");
    // Servo: 1ms = 0°, 1.5ms = 90°, 2ms = 180°
    // At 50Hz (20ms period), 13-bit resolution:
    // 1ms = 409, 1.5ms = 614, 2ms = 819
    uint32_t duty = 819;  // 180° (open)
    ledc_set_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, duty);
    ledc_update_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0);
    vTaskDelay(pdMS_TO_TICKS(300));  // Wait for servo
    return ESP_OK;
}

esp_err_t motor_gate_close(void) {
    ESP_LOGI(TAG, "Closing gate");
    uint32_t duty = 409;  // 0° (closed)
    ledc_set_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, duty);
    ledc_update_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0);
    vTaskDelay(pdMS_TO_TICKS(300));
    return ESP_OK;
}

static esp_err_t step_motor(uint8_t motor_num, int steps) {
    motor_direction_t dir = (steps >= 0) ? MOTOR_DIR_CW : MOTOR_DIR_CCW;
    int abs_steps = abs(steps);
    
    static uint8_t step_index = 0;
    
    for (int i = 0; i < abs_steps; i++) {
        if (dir == MOTOR_DIR_CW) {
            step_index = (step_index + 1) % 8;
        } else {
            step_index = (step_index + 7) % 8;  // -1 with wrap
        }
        
        // Write step pattern to MCP23017
        // Assuming motor 0 uses GPA0-3
        uint8_t pattern = 0;
        for (int p = 0; p < 4; p++) {
            if (STEP_SEQUENCE[step_index][p]) {
                pattern |= (1 << (motor_num * 4 + p));
            }
        }
        
        if (motor_num < 2) {
            mcp23017_write(MCP23017_GPIOA, pattern);
        } else {
            mcp23017_write(MCP23017_GPIOB, pattern);
        }
        
        // Delay for motor speed (15 RPM = ~2ms per step)
        vTaskDelay(pdMS_TO_TICKS(2));
    }
    
    // Turn off motor coils
    mcp23017_write(MCP23017_GPIOA, 0x00);
    mcp23017_write(MCP23017_GPIOB, 0x00);
    
    return ESP_OK;
}

static esp_err_t mcp23017_write(uint8_t reg, uint8_t value) {
    // I2C write implementation
    // ... (use ESP-IDF I2C driver)
    return ESP_OK;
}
```

### 4.2 Sensor Driver

`drivers/sensor_driver.h`:

```c
#ifndef SENSOR_DRIVER_H
#define SENSOR_DRIVER_H

#include "esp_err.h"

// Temperature & Humidity
typedef struct {
    float temperature_c;
    float humidity_percent;
} sht40_reading_t;

// Load cell
typedef struct {
    float weight_grams;
    bool stable;
} loadcell_reading_t;

// Initialize all sensors
esp_err_t sensor_driver_init(void);

// Read SHT40 temperature & humidity
esp_err_t sensor_read_sht40(sht40_reading_t *reading);

// Read load cell weight
esp_err_t sensor_read_loadcell(loadcell_reading_t *reading);

// Calibrate load cell (call with empty tray)
esp_err_t sensor_calibrate_loadcell_zero(void);

// Calibrate load cell (call with known weight)
esp_err_t sensor_calibrate_loadcell_weight(float known_weight_g);

// Read ambient light (lux)
esp_err_t sensor_read_light(float *lux);

// Read PIR motion sensor
bool sensor_read_motion(void);

// Read door switch
bool sensor_read_door_open(void);

// Read optical pill sensor
bool sensor_read_optical(uint8_t slot);

// Count pills passing through optical sensor
esp_err_t sensor_count_pills(uint8_t slot, uint8_t *count, uint32_t timeout_ms);

#endif // SENSOR_DRIVER_H
```

`drivers/sensor_driver.c`:

```c
#include "sensor_driver.h"
#include "driver/i2c.h"
#include "driver/gpio.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "pins.h"

static const char *TAG = "SENSOR";

// HX711 state
static float hx711_offset = 0;
static float hx711_scale = 1.0;

// I2C bus handle
static i2c_master_bus_handle_t i2c_bus = NULL;

esp_err_t sensor_driver_init(void) {
    ESP_LOGI(TAG, "Initializing sensors");
    
    // Initialize I2C
    i2c_master_bus_config_t bus_config = {
        .i2c_port = I2C_NUM_0,
        .sda_io_num = PIN_I2C_SDA,
        .scl_io_num = PIN_I2C_SCL,
        .clk_source = I2C_CLK_SRC_DEFAULT,
        .glitch_ignore_cnt = 7,
        .flags.enable_internal_pullup = true,
    };
    ESP_ERROR_CHECK(i2c_new_master_bus(&bus_config, &i2c_bus));
    
    // Initialize HX711 pins
    gpio_config_t hx711_conf = {
        .pin_bit_mask = (1ULL << PIN_HX711_DOUT),
        .mode = GPIO_MODE_INPUT,
        .pull_up_en = GPIO_PULLUP_DISABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
    };
    gpio_config(&hx711_conf);
    
    gpio_set_direction(PIN_HX711_SCK, GPIO_MODE_OUTPUT);
    gpio_set_level(PIN_HX711_SCK, 0);
    
    // Initialize PIR and door switch
    gpio_config_t input_conf = {
        .pin_bit_mask = (1ULL << PIN_PIR) | (1ULL << PIN_DOOR_SWITCH),
        .mode = GPIO_MODE_INPUT,
        .pull_up_en = GPIO_PULLUP_ENABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
    };
    gpio_config(&input_conf);
    
    ESP_LOGI(TAG, "Sensors initialized");
    return ESP_OK;
}

esp_err_t sensor_read_sht40(sht40_reading_t *reading) {
    if (reading == NULL) return ESP_ERR_INVALID_ARG;
    
    // SHT40 command: measure high precision (0xFD)
    uint8_t cmd = 0xFD;
    uint8_t data[6];
    
    i2c_device_config_t dev_cfg = {
        .dev_addr_length = I2C_ADDR_BIT_LEN_7,
        .device_address = SHT40_I2C_ADDR,
        .scl_speed_hz = I2C_FREQ_HZ,
    };
    
    i2c_master_dev_handle_t dev_handle;
    ESP_ERROR_CHECK(i2c_master_bus_add_device(i2c_bus, &dev_cfg, &dev_handle));
    
    // Send command
    ESP_ERROR_CHECK(i2c_master_transmit(dev_handle, &cmd, 1, 100));
    
    // Wait for measurement (10ms for high precision)
    vTaskDelay(pdMS_TO_TICKS(10));
    
    // Read data
    ESP_ERROR_CHECK(i2c_master_receive(dev_handle, data, 6, 100));
    
    i2c_master_bus_rm_device(dev_handle);
    
    // Convert temperature: -45 + 175 * (raw / 65535)
    uint16_t t_raw = (data[0] << 8) | data[1];
    reading->temperature_c = -45.0f + 175.0f * ((float)t_raw / 65535.0f);
    
    // Convert humidity: -6 + 125 * (raw / 65535)
    uint16_t h_raw = (data[3] << 8) | data[4];
    reading->humidity_percent = -6.0f + 125.0f * ((float)h_raw / 65535.0f);
    
    // Clamp humidity to 0-100
    if (reading->humidity_percent < 0) reading->humidity_percent = 0;
    if (reading->humidity_percent > 100) reading->humidity_percent = 100;
    
    return ESP_OK;
}

// HX711 read function
static int32_t hx711_read_raw(void) {
    // Wait for data ready (DOUT goes low)
    uint32_t timeout = 0;
    while (gpio_get_level(PIN_HX711_DOUT) && timeout < 100) {
        vTaskDelay(pdMS_TO_TICKS(1));
        timeout++;
    }
    
    if (timeout >= 100) {
        ESP_LOGE(TAG, "HX711 timeout");
        return 0;
    }
    
    int32_t value = 0;
    
    // Read 24 bits
    for (int i = 0; i < 24; i++) {
        gpio_set_level(PIN_HX711_SCK, 1);
        esp_rom_delay_us(1);
        value = (value << 1) | gpio_get_level(PIN_HX711_DOUT);
        gpio_set_level(PIN_HX711_SCK, 0);
        esp_rom_delay_us(1);
    }
    
    // One more pulse for gain 128 (channel A)
    gpio_set_level(PIN_HX711_SCK, 1);
    esp_rom_delay_us(1);
    gpio_set_level(PIN_HX711_SCK, 0);
    
    // Sign extend 24-bit to 32-bit
    if (value & 0x800000) {
        value |= 0xFF000000;
    }
    
    return value;
}

esp_err_t sensor_read_loadcell(loadcell_reading_t *reading) {
    if (reading == NULL) return ESP_ERR_INVALID_ARG;
    
    // Average multiple readings for stability
    int32_t sum = 0;
    const int num_readings = 10;
    
    for (int i = 0; i < num_readings; i++) {
        sum += hx711_read_raw();
        vTaskDelay(pdMS_TO_TICKS(10));
    }
    
    float raw = (float)sum / num_readings;
    reading->weight_grams = (raw - hx711_offset) * hx711_scale;
    reading->stable = true;  // TODO: Check variance
    
    return ESP_OK;
}

esp_err_t sensor_calibrate_loadcell_zero(void) {
    ESP_LOGI(TAG, "Calibrating load cell zero point...");
    
    int32_t sum = 0;
    const int num_readings = 20;
    
    for (int i = 0; i < num_readings; i++) {
        sum += hx711_read_raw();
        vTaskDelay(pdMS_TO_TICKS(50));
    }
    
    hx711_offset = (float)sum / num_readings;
    ESP_LOGI(TAG, "Zero offset: %.0f", hx711_offset);
    
    // Save to NVS
    // ... nvs_set_float("hx711_offset", hx711_offset);
    
    return ESP_OK;
}

esp_err_t sensor_calibrate_loadcell_weight(float known_weight_g) {
    ESP_LOGI(TAG, "Calibrating load cell with %.1fg weight", known_weight_g);
    
    int32_t sum = 0;
    const int num_readings = 20;
    
    for (int i = 0; i < num_readings; i++) {
        sum += hx711_read_raw();
        vTaskDelay(pdMS_TO_TICKS(50));
    }
    
    float raw = (float)sum / num_readings;
    hx711_scale = known_weight_g / (raw - hx711_offset);
    ESP_LOGI(TAG, "Scale factor: %f", hx711_scale);
    
    // Save to NVS
    // ... nvs_set_float("hx711_scale", hx711_scale);
    
    return ESP_OK;
}

bool sensor_read_motion(void) {
    return gpio_get_level(PIN_PIR) == 1;
}

bool sensor_read_door_open(void) {
    // Reed switch: closed = low (magnet present = door closed)
    return gpio_get_level(PIN_DOOR_SWITCH) == 1;
}

esp_err_t sensor_count_pills(uint8_t slot, uint8_t *count, uint32_t timeout_ms) {
    if (count == NULL) return ESP_ERR_INVALID_ARG;
    
    *count = 0;
    bool last_state = false;
    uint32_t start_time = xTaskGetTickCount();
    
    while ((xTaskGetTickCount() - start_time) < pdMS_TO_TICKS(timeout_ms)) {
        bool current = sensor_read_optical(slot);
        
        // Count rising edges (pill passing through)
        if (current && !last_state) {
            (*count)++;
            ESP_LOGD(TAG, "Pill counted: %d", *count);
        }
        
        last_state = current;
        vTaskDelay(pdMS_TO_TICKS(10));  // 10ms debounce
    }
    
    return ESP_OK;
}
```

### 4.3 Display Driver with LVGL

`drivers/display_driver.c`:

```c
#include "display_driver.h"
#include "esp_lcd_panel_io.h"
#include "esp_lcd_panel_ops.h"
#include "esp_lcd_panel_rgb.h"
#include "driver/i2c.h"
#include "esp_lvgl_port.h"
#include "lvgl.h"
#include "pins.h"

static const char *TAG = "DISPLAY";

// Display resolution
#define LCD_H_RES           800
#define LCD_V_RES           480

// LVGL handle
static lv_disp_t *disp = NULL;
static lv_indev_t *touch_indev = NULL;

esp_err_t display_driver_init(void) {
    ESP_LOGI(TAG, "Initializing display");
    
    // RGB panel configuration
    esp_lcd_rgb_panel_config_t panel_config = {
        .clk_src = LCD_CLK_SRC_DEFAULT,
        .timings = {
            .pclk_hz = 16000000,
            .h_res = LCD_H_RES,
            .v_res = LCD_V_RES,
            .hsync_pulse_width = 4,
            .hsync_back_porch = 8,
            .hsync_front_porch = 8,
            .vsync_pulse_width = 4,
            .vsync_back_porch = 8,
            .vsync_front_porch = 8,
        },
        .data_width = 16,
        .psram_trans_align = 64,
        .hsync_gpio_num = PIN_LCD_HSYNC,
        .vsync_gpio_num = PIN_LCD_VSYNC,
        .de_gpio_num = PIN_LCD_DE,
        .pclk_gpio_num = PIN_LCD_CLK,
        .disp_gpio_num = -1,
        .data_gpio_nums = {
            PIN_LCD_B0, PIN_LCD_B1, PIN_LCD_B2, PIN_LCD_B3, PIN_LCD_B4,
            PIN_LCD_G0, PIN_LCD_G1, PIN_LCD_G2, PIN_LCD_G3, PIN_LCD_G4, PIN_LCD_G5,
            PIN_LCD_R0, PIN_LCD_R1, PIN_LCD_R2, PIN_LCD_R3, PIN_LCD_R4,
        },
        .flags = {
            .fb_in_psram = true,
        },
    };
    
    esp_lcd_panel_handle_t panel_handle = NULL;
    ESP_ERROR_CHECK(esp_lcd_new_rgb_panel(&panel_config, &panel_handle));
    ESP_ERROR_CHECK(esp_lcd_panel_reset(panel_handle));
    ESP_ERROR_CHECK(esp_lcd_panel_init(panel_handle));
    
    // Initialize LVGL
    const lvgl_port_cfg_t lvgl_cfg = ESP_LVGL_PORT_INIT_CONFIG();
    ESP_ERROR_CHECK(lvgl_port_init(&lvgl_cfg));
    
    // Add display
    const lvgl_port_display_cfg_t disp_cfg = {
        .io_handle = NULL,
        .panel_handle = panel_handle,
        .buffer_size = LCD_H_RES * 50,
        .double_buffer = true,
        .hres = LCD_H_RES,
        .vres = LCD_V_RES,
        .monochrome = false,
        .rotation = {
            .swap_xy = false,
            .mirror_x = false,
            .mirror_y = false,
        },
    };
    
    disp = lvgl_port_add_disp(&disp_cfg);
    
    // Add touch input (GT911)
    // ... touch initialization code
    
    ESP_LOGI(TAG, "Display initialized");
    return ESP_OK;
}

lv_disp_t *display_get_disp(void) {
    return disp;
}

lv_indev_t *display_get_touch(void) {
    return touch_indev;
}
```

---

## 5. API Client Service

`services/api_client.h`:

```c
#ifndef API_CLIENT_H
#define API_CLIENT_H

#include "esp_err.h"
#include "cJSON.h"

// API configuration
// Device API uses /api/v1/ prefix — separate from User API (/api/)
#define API_BASE_URL        "https://api.smartdispenser.ch/api/v1"
#define API_TIMEOUT_MS      30000

// Callback types
typedef void (*api_response_cb_t)(esp_err_t err, cJSON *response);

// Initialize API client
esp_err_t api_client_init(void);

// Authentication
esp_err_t api_register_device(const char *device_id, const char *device_type);
esp_err_t api_refresh_token(void);

// Get authentication token
const char *api_get_token(void);

// Heartbeat
esp_err_t api_send_heartbeat(void);

// Events
esp_err_t api_send_event(const char *event_type, cJSON *data);

// Schedule
esp_err_t api_get_schedule(cJSON **schedule);
esp_err_t api_confirm_schedule(const char *version);

// Firmware
esp_err_t api_check_firmware(cJSON **firmware_info);

#endif // API_CLIENT_H
```

`services/api_client.c`:

```c
#include "api_client.h"
#include "esp_http_client.h"
#include "esp_crt_bundle.h"
#include "esp_log.h"
#include "nvs_flash.h"
#include "nvs.h"
#include "cJSON.h"
#include <string.h>

static const char *TAG = "API";

// Stored credentials
static char device_token[512] = {0};
static char refresh_token[256] = {0};
static char device_id[32] = {0};

// HTTP response buffer
static char response_buffer[4096];
static int response_len = 0;

// HTTP event handler
static esp_err_t http_event_handler(esp_http_client_event_t *evt) {
    switch (evt->event_id) {
        case HTTP_EVENT_ON_DATA:
            if (response_len + evt->data_len < sizeof(response_buffer)) {
                memcpy(response_buffer + response_len, evt->data, evt->data_len);
                response_len += evt->data_len;
            }
            break;
        default:
            break;
    }
    return ESP_OK;
}

esp_err_t api_client_init(void) {
    ESP_LOGI(TAG, "Initializing API client");
    
    // Load stored credentials from NVS
    nvs_handle_t nvs;
    if (nvs_open("api", NVS_READONLY, &nvs) == ESP_OK) {
        size_t len;
        
        len = sizeof(device_token);
        nvs_get_str(nvs, "token", device_token, &len);
        
        len = sizeof(refresh_token);
        nvs_get_str(nvs, "refresh", refresh_token, &len);
        
        len = sizeof(device_id);
        nvs_get_str(nvs, "device_id", device_id, &len);
        
        nvs_close(nvs);
    }
    
    return ESP_OK;
}

esp_err_t api_register_device(const char *id, const char *type) {
    ESP_LOGI(TAG, "Registering device: %s", id);
    
    // Build request body
    // Matches: POST /api/v1/devices/register (DeviceApiController)
    cJSON *body = cJSON_CreateObject();
    cJSON_AddStringToObject(body, "device_id", id);
    cJSON_AddStringToObject(body, "device_type", type);       // "main" or "portable"
    cJSON_AddStringToObject(body, "firmware_version", "1.0.0");
    cJSON_AddStringToObject(body, "hardware_version", "1.0");
    cJSON_AddStringToObject(body, "mac_address", get_mac_address());
    
    char *body_str = cJSON_PrintUnformatted(body);
    
    // HTTP client config
    // Device API endpoint (NOT the user API /api/devices)
    char url[256];
    snprintf(url, sizeof(url), "%s/devices/register", API_BASE_URL);
    
    esp_http_client_config_t config = {
        .url = url,
        .method = HTTP_METHOD_POST,
        .timeout_ms = API_TIMEOUT_MS,
        .event_handler = http_event_handler,
        .crt_bundle_attach = esp_crt_bundle_attach,
    };
    
    esp_http_client_handle_t client = esp_http_client_init(&config);
    
    esp_http_client_set_header(client, "Content-Type", "application/json");
    esp_http_client_set_post_field(client, body_str, strlen(body_str));
    
    response_len = 0;
    esp_err_t err = esp_http_client_perform(client);
    
    int status = esp_http_client_get_status_code(client);
    
    if (err == ESP_OK && status == 201) {
        response_buffer[response_len] = '\0';
        
        cJSON *resp = cJSON_Parse(response_buffer);
        if (resp) {
            // Extract token
            cJSON *token = cJSON_GetObjectItem(resp, "device_token");
            cJSON *refresh = cJSON_GetObjectItem(resp, "refresh_token");
            
            if (token && token->valuestring) {
                strncpy(device_token, token->valuestring, sizeof(device_token) - 1);
                strncpy(device_id, id, sizeof(device_id) - 1);
                
                if (refresh && refresh->valuestring) {
                    strncpy(refresh_token, refresh->valuestring, sizeof(refresh_token) - 1);
                }
                
                // Save to NVS
                nvs_handle_t nvs;
                if (nvs_open("api", NVS_READWRITE, &nvs) == ESP_OK) {
                    nvs_set_str(nvs, "token", device_token);
                    nvs_set_str(nvs, "refresh", refresh_token);
                    nvs_set_str(nvs, "device_id", device_id);
                    nvs_commit(nvs);
                    nvs_close(nvs);
                }
                
                ESP_LOGI(TAG, "Device registered successfully");
            }
            cJSON_Delete(resp);
        }
    } else {
        ESP_LOGE(TAG, "Registration failed: %d", status);
        err = ESP_FAIL;
    }
    
    esp_http_client_cleanup(client);
    cJSON_Delete(body);
    free(body_str);
    
    return err;
}

esp_err_t api_send_heartbeat(void) {
    if (strlen(device_token) == 0) {
        ESP_LOGW(TAG, "Not authenticated");
        return ESP_ERR_INVALID_STATE;
    }
    
    // Build heartbeat body
    // Matches: POST /api/v1/devices/{deviceId}/heartbeat (DeviceApiController)
    cJSON *body = cJSON_CreateObject();
    
    // Get current time
    time_t now;
    time(&now);
    char timestamp[32];
    strftime(timestamp, sizeof(timestamp), "%Y-%m-%dT%H:%M:%SZ", gmtime(&now));
    cJSON_AddStringToObject(body, "timestamp", timestamp);
    
    // Add device status
    cJSON_AddNumberToObject(body, "battery_level", 85);  // Get from battery driver
    cJSON_AddNumberToObject(body, "wifi_signal", -55);   // Get from WiFi driver
    cJSON_AddStringToObject(body, "firmware", "1.0.0");
    
    // Add slot status
    cJSON *slots = cJSON_CreateArray();
    for (int i = 1; i <= 10; i++) {
        cJSON *slot = cJSON_CreateObject();
        cJSON_AddNumberToObject(slot, "slot", i);
        cJSON_AddNumberToObject(slot, "pills_count", 50);  // Get from storage
        cJSON_AddItemToArray(slots, slot);
    }
    cJSON_AddItemToObject(body, "slots", slots);
    
    char *body_str = cJSON_PrintUnformatted(body);
    
    // Build URL
    char url[256];
    snprintf(url, sizeof(url), "%s/devices/%s/heartbeat", API_BASE_URL, device_id);
    
    esp_http_client_config_t config = {
        .url = url,
        .method = HTTP_METHOD_POST,
        .timeout_ms = API_TIMEOUT_MS,
        .event_handler = http_event_handler,
        .crt_bundle_attach = esp_crt_bundle_attach,
    };
    
    esp_http_client_handle_t client = esp_http_client_init(&config);
    
    // Set headers
    char auth_header[600];
    snprintf(auth_header, sizeof(auth_header), "Bearer %s", device_token);
    esp_http_client_set_header(client, "Authorization", auth_header);
    esp_http_client_set_header(client, "Content-Type", "application/json");
    esp_http_client_set_header(client, "X-Device-ID", device_id);
    esp_http_client_set_post_field(client, body_str, strlen(body_str));
    
    response_len = 0;
    esp_err_t err = esp_http_client_perform(client);
    int status = esp_http_client_get_status_code(client);
    
    if (err == ESP_OK && status == 200) {
        response_buffer[response_len] = '\0';
        ESP_LOGI(TAG, "Heartbeat sent successfully");
        
        // Process any commands in response
        cJSON *resp = cJSON_Parse(response_buffer);
        if (resp) {
            cJSON *commands = cJSON_GetObjectItem(resp, "commands");
            if (commands && cJSON_IsArray(commands)) {
                // Process commands
                cJSON *cmd;
                cJSON_ArrayForEach(cmd, commands) {
                    cJSON *type = cJSON_GetObjectItem(cmd, "type");
                    if (type && type->valuestring) {
                        ESP_LOGI(TAG, "Received command: %s", type->valuestring);
                        // Handle command...
                    }
                }
            }
            cJSON_Delete(resp);
        }
    } else {
        ESP_LOGE(TAG, "Heartbeat failed: HTTP %d", status);
        err = ESP_FAIL;
    }
    
    esp_http_client_cleanup(client);
    cJSON_Delete(body);
    free(body_str);
    
    return err;
}

esp_err_t api_send_event(const char *event_type, cJSON *data) {
    if (strlen(device_token) == 0) {
        // Store for later if not connected (offline mode)
        // See 02_API_INTEGRATION.md Section 7.3 for offline mode spec
        ESP_LOGW(TAG, "Storing event locally: %s", event_type);
        // ... store to local queue (up to 1000 events, 7 days)
        return ESP_OK;
    }
    
    // Build event payload
    // Matches: POST /api/v1/events (DeviceApiController)
    // Supported event types: DOSE_DISPENSED, DOSE_TAKEN, DOSE_MISSED,
    //   REFILL_NEEDED, REFILL_CRITICAL, DEVICE_ONLINE, DEVICE_OFFLINE,
    //   DEVICE_ERROR, BATTERY_LOW, BATTERY_CRITICAL, TRAVEL_MODE_ON, TRAVEL_MODE_OFF
    cJSON *body = cJSON_CreateObject();
    cJSON_AddStringToObject(body, "event", event_type);
    cJSON_AddStringToObject(body, "device_id", device_id);
    
    time_t now;
    time(&now);
    char timestamp[32];
    strftime(timestamp, sizeof(timestamp), "%Y-%m-%dT%H:%M:%SZ", gmtime(&now));
    cJSON_AddStringToObject(body, "timestamp", timestamp);
    
    if (data) {
        cJSON_AddItemToObject(body, "data", cJSON_Duplicate(data, true));
    }
    
    char *body_str = cJSON_PrintUnformatted(body);
    
    char url[256];
    snprintf(url, sizeof(url), "%s/events", API_BASE_URL);
    
    esp_http_client_config_t config = {
        .url = url,
        .method = HTTP_METHOD_POST,
        .timeout_ms = API_TIMEOUT_MS,
        .event_handler = http_event_handler,
        .crt_bundle_attach = esp_crt_bundle_attach,
    };
    
    esp_http_client_handle_t client = esp_http_client_init(&config);
    
    char auth_header[600];
    snprintf(auth_header, sizeof(auth_header), "Bearer %s", device_token);
    esp_http_client_set_header(client, "Authorization", auth_header);
    esp_http_client_set_header(client, "Content-Type", "application/json");
    esp_http_client_set_header(client, "X-Device-ID", device_id);
    esp_http_client_set_post_field(client, body_str, strlen(body_str));
    
    response_len = 0;
    esp_err_t err = esp_http_client_perform(client);
    int status = esp_http_client_get_status_code(client);
    
    if (err == ESP_OK && (status == 200 || status == 202)) {
        ESP_LOGI(TAG, "Event sent: %s", event_type);
    } else {
        ESP_LOGE(TAG, "Event send failed: HTTP %d", status);
        // Store for retry
        err = ESP_FAIL;
    }
    
    esp_http_client_cleanup(client);
    cJSON_Delete(body);
    free(body_str);
    
    return err;
}

const char *api_get_token(void) {
    return device_token;
}
```

---

## 6. Main Application

`main/main.c`:

```c
#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "nvs_flash.h"

// Drivers
#include "motor_driver.h"
#include "sensor_driver.h"
#include "display_driver.h"
#include "audio_driver.h"

// Services
#include "wifi_service.h"
#include "api_client.h"
#include "schedule_service.h"
#include "dispense_service.h"

static const char *TAG = "MAIN";

// Task handles
static TaskHandle_t heartbeat_task_handle = NULL;
static TaskHandle_t schedule_task_handle = NULL;
static TaskHandle_t ui_task_handle = NULL;

// Heartbeat task - sends status to cloud
void heartbeat_task(void *pvParameters) {
    while (1) {
        if (wifi_is_connected()) {
            api_send_heartbeat();
        }
        vTaskDelay(pdMS_TO_TICKS(60000));  // 60 seconds
    }
}

// Schedule task - checks and executes medication schedules
void schedule_task(void *pvParameters) {
    while (1) {
        schedule_check_and_dispense();
        vTaskDelay(pdMS_TO_TICKS(1000));  // Check every second
    }
}

// UI task - handles LVGL
void ui_task(void *pvParameters) {
    while (1) {
        lv_task_handler();
        vTaskDelay(pdMS_TO_TICKS(10));  // 10ms refresh
    }
}

void app_main(void) {
    ESP_LOGI(TAG, "Smart Medication Dispenser Starting...");
    
    // Initialize NVS
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);
    
    // Initialize drivers
    ESP_LOGI(TAG, "Initializing drivers...");
    ESP_ERROR_CHECK(motor_driver_init());
    ESP_ERROR_CHECK(sensor_driver_init());
    ESP_ERROR_CHECK(display_driver_init());
    ESP_ERROR_CHECK(audio_driver_init());
    
    // Initialize services
    ESP_LOGI(TAG, "Initializing services...");
    ESP_ERROR_CHECK(wifi_service_init());
    ESP_ERROR_CHECK(api_client_init());
    ESP_ERROR_CHECK(schedule_service_init());
    ESP_ERROR_CHECK(dispense_service_init());
    
    // Connect to WiFi
    wifi_connect();
    
    // Home the carousel
    motor_home();
    
    // Play startup sound
    audio_play_startup();
    
    // Start tasks
    ESP_LOGI(TAG, "Starting tasks...");
    
    xTaskCreatePinnedToCore(
        heartbeat_task,
        "heartbeat",
        4096,
        NULL,
        5,
        &heartbeat_task_handle,
        0  // Core 0
    );
    
    xTaskCreatePinnedToCore(
        schedule_task,
        "schedule",
        4096,
        NULL,
        6,  // Higher priority
        &schedule_task_handle,
        0  // Core 0
    );
    
    xTaskCreatePinnedToCore(
        ui_task,
        "ui",
        8192,
        NULL,
        4,
        &ui_task_handle,
        1  // Core 1
    );
    
    ESP_LOGI(TAG, "Startup complete!");
    
    // Main loop - monitor system health
    while (1) {
        // Check temperature
        sht40_reading_t env;
        sensor_read_sht40(&env);
        
        if (env.temperature_c > 35 || env.temperature_c < 10) {
            ESP_LOGW(TAG, "Temperature out of range: %.1f°C", env.temperature_c);
            // Send alert
        }
        
        // Check motion for screen wake
        if (sensor_read_motion()) {
            display_wake();
        }
        
        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}
```

---

## 7. Best Practices

### 7.1 Memory Management

| Practice | Reason |
|:---------|:-------|
| Use static allocation where possible | Avoid fragmentation |
| Set task stack sizes carefully | ESP32 has limited RAM |
| Use PSRAM for large buffers | Display framebuffer, audio |
| Monitor heap with `heap_caps_get_free_size()` | Detect leaks |

### 7.2 Power Management

| Practice | Implementation |
|:---------|:---------------|
| Use light sleep when idle | `esp_light_sleep_start()` |
| Disable WiFi when not needed | `esp_wifi_stop()` |
| Lower CPU frequency when possible | `esp_pm_configure()` |
| Turn off peripherals | Motors, display backlight |

### 7.3 Error Handling

```c
// Always check return values
esp_err_t err = some_function();
if (err != ESP_OK) {
    ESP_LOGE(TAG, "Error: %s", esp_err_to_name(err));
    // Handle error appropriately
}

// Use ESP_ERROR_CHECK for critical errors
ESP_ERROR_CHECK(critical_init());  // Will abort on error
```

### 7.4 Logging Levels

```c
ESP_LOGE(TAG, "Error message");   // Errors
ESP_LOGW(TAG, "Warning message"); // Warnings
ESP_LOGI(TAG, "Info message");    // Normal info
ESP_LOGD(TAG, "Debug message");   // Debug (verbose)
ESP_LOGV(TAG, "Verbose message"); // Very verbose
```

---

## 8. Debugging Tips

### 8.1 Serial Monitor

```bash
# Monitor with timestamp
idf.py -p COM3 monitor

# Filter by tag
idf.py -p COM3 monitor --print_filter="*:W MOTOR:I"
```

### 8.2 Common Issues

| Issue | Solution |
|:------|:---------|
| Boot loop | Check power supply, reduce WiFi TX power |
| WiFi timeout | Check antenna placement, add delays |
| I2C failures | Check pull-ups (4.7K), reduce speed |
| Task watchdog | Increase stack, add `vTaskDelay` |
| PSRAM not found | Check `sdkconfig` settings |

### 8.3 Performance Profiling

```c
// Measure execution time
int64_t start = esp_timer_get_time();
// ... code to measure ...
int64_t end = esp_timer_get_time();
ESP_LOGI(TAG, "Execution time: %lld us", end - start);
```

---

## 9. WiFi Service

### 9.1 WiFi Manager

`services/wifi_service.h`:

```c
#ifndef WIFI_SERVICE_H
#define WIFI_SERVICE_H

#include "esp_err.h"

// Initialize WiFi in station mode
esp_err_t wifi_service_init(void);

// Connect to configured AP (non-blocking, retries in background)
esp_err_t wifi_connect(void);

// Disconnect
esp_err_t wifi_disconnect(void);

// Check connection status
bool wifi_is_connected(void);

// Get RSSI (signal strength)
int8_t wifi_get_rssi(void);

// Get IP address as string
const char *wifi_get_ip(void);

// Set credentials (stored in NVS)
esp_err_t wifi_set_credentials(const char *ssid, const char *password);

#endif // WIFI_SERVICE_H
```

`services/wifi_service.c`:

```c
#include "wifi_service.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "esp_log.h"
#include "nvs_flash.h"
#include "freertos/FreeRTOS.h"
#include "freertos/event_groups.h"
#include <string.h>

static const char *TAG = "WIFI";

#define WIFI_CONNECTED_BIT  BIT0
#define WIFI_FAIL_BIT       BIT1
#define MAX_RETRY           10

static EventGroupHandle_t wifi_event_group;
static int retry_count = 0;
static bool is_connected = false;
static char ip_address[16] = {0};

// WiFi event handler
static void wifi_event_handler(void *arg, esp_event_base_t event_base,
                                int32_t event_id, void *event_data) {
    if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_START) {
        esp_wifi_connect();
    } else if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_DISCONNECTED) {
        is_connected = false;
        if (retry_count < MAX_RETRY) {
            esp_wifi_connect();
            retry_count++;
            ESP_LOGI(TAG, "Retrying WiFi connection... (%d/%d)", retry_count, MAX_RETRY);
        } else {
            xEventGroupSetBits(wifi_event_group, WIFI_FAIL_BIT);
            ESP_LOGE(TAG, "WiFi connection failed after %d retries", MAX_RETRY);
        }
    } else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP) {
        ip_event_got_ip_t *event = (ip_event_got_ip_t *)event_data;
        snprintf(ip_address, sizeof(ip_address), IPSTR, IP2STR(&event->ip_info.ip));
        ESP_LOGI(TAG, "Connected! IP: %s", ip_address);
        retry_count = 0;
        is_connected = true;
        xEventGroupSetBits(wifi_event_group, WIFI_CONNECTED_BIT);
    }
}

esp_err_t wifi_service_init(void) {
    ESP_LOGI(TAG, "Initializing WiFi...");
    
    wifi_event_group = xEventGroupCreate();
    
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_netif_create_default_wifi_sta();
    
    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));
    
    // Register event handlers
    ESP_ERROR_CHECK(esp_event_handler_instance_register(
        WIFI_EVENT, ESP_EVENT_ANY_ID, &wifi_event_handler, NULL, NULL));
    ESP_ERROR_CHECK(esp_event_handler_instance_register(
        IP_EVENT, IP_EVENT_STA_GOT_IP, &wifi_event_handler, NULL, NULL));
    
    // Load credentials from NVS
    wifi_config_t wifi_config = {0};
    nvs_handle_t nvs;
    if (nvs_open("wifi", NVS_READONLY, &nvs) == ESP_OK) {
        size_t len = sizeof(wifi_config.sta.ssid);
        nvs_get_str(nvs, "ssid", (char *)wifi_config.sta.ssid, &len);
        len = sizeof(wifi_config.sta.password);
        nvs_get_str(nvs, "password", (char *)wifi_config.sta.password, &len);
        nvs_close(nvs);
    }
    
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config));
    
    return ESP_OK;
}

esp_err_t wifi_connect(void) {
    ESP_LOGI(TAG, "Connecting to WiFi...");
    retry_count = 0;
    return esp_wifi_start();
}

bool wifi_is_connected(void) {
    return is_connected;
}

int8_t wifi_get_rssi(void) {
    wifi_ap_record_t ap_info;
    if (esp_wifi_sta_get_ap_info(&ap_info) == ESP_OK) {
        return ap_info.rssi;
    }
    return -127;
}

const char *wifi_get_ip(void) {
    return ip_address;
}

esp_err_t wifi_set_credentials(const char *ssid, const char *password) {
    nvs_handle_t nvs;
    ESP_ERROR_CHECK(nvs_open("wifi", NVS_READWRITE, &nvs));
    ESP_ERROR_CHECK(nvs_set_str(nvs, "ssid", ssid));
    ESP_ERROR_CHECK(nvs_set_str(nvs, "password", password));
    ESP_ERROR_CHECK(nvs_commit(nvs));
    nvs_close(nvs);
    ESP_LOGI(TAG, "WiFi credentials saved for SSID: %s", ssid);
    return ESP_OK;
}
```

---

## 10. OTA Firmware Updates

### 10.1 OTA Update Service

`services/ota_service.c`:

```c
#include "esp_ota_ops.h"
#include "esp_http_client.h"
#include "esp_https_ota.h"
#include "esp_log.h"
#include "api_client.h"
#include "cJSON.h"

static const char *TAG = "OTA";

/**
 * Check for firmware updates and install if available.
 * Uses dual-partition (A/B) scheme for safe updates.
 * If new firmware fails to boot, automatically rolls back.
 */
esp_err_t ota_check_and_update(void) {
    ESP_LOGI(TAG, "Checking for firmware updates...");
    
    // Get current firmware version
    const esp_app_desc_t *app_desc = esp_app_get_description();
    ESP_LOGI(TAG, "Current firmware: %s", app_desc->version);
    
    // Query API for latest firmware
    cJSON *firmware_info = NULL;
    esp_err_t err = api_check_firmware(&firmware_info);
    if (err != ESP_OK || firmware_info == NULL) {
        ESP_LOGI(TAG, "No update available or API error");
        return ESP_OK;
    }
    
    cJSON *version = cJSON_GetObjectItem(firmware_info, "version");
    cJSON *url = cJSON_GetObjectItem(firmware_info, "url");
    cJSON *hash = cJSON_GetObjectItem(firmware_info, "sha256");
    
    if (!version || !url) {
        cJSON_Delete(firmware_info);
        return ESP_ERR_INVALID_RESPONSE;
    }
    
    // Compare versions
    if (strcmp(version->valuestring, app_desc->version) == 0) {
        ESP_LOGI(TAG, "Firmware is up to date: %s", app_desc->version);
        cJSON_Delete(firmware_info);
        return ESP_OK;
    }
    
    ESP_LOGI(TAG, "New firmware available: %s → %s", app_desc->version, version->valuestring);
    ESP_LOGI(TAG, "Download URL: %s", url->valuestring);
    
    // Configure HTTPS OTA
    esp_http_client_config_t config = {
        .url = url->valuestring,
        .timeout_ms = 60000,
        .crt_bundle_attach = esp_crt_bundle_attach,
    };
    
    // Set auth header
    char auth[600];
    snprintf(auth, sizeof(auth), "Bearer %s", api_get_token());
    
    esp_https_ota_config_t ota_config = {
        .http_config = &config,
    };
    
    ESP_LOGI(TAG, "Starting OTA update...");
    
    // Perform OTA update (downloads and writes to inactive partition)
    esp_https_ota_handle_t ota_handle = NULL;
    err = esp_https_ota_begin(&ota_config, &ota_handle);
    if (err != ESP_OK) {
        ESP_LOGE(TAG, "OTA begin failed: %s", esp_err_to_name(err));
        cJSON_Delete(firmware_info);
        return err;
    }
    
    // Download and write in chunks
    while (1) {
        err = esp_https_ota_perform(ota_handle);
        if (err != ESP_ERR_HTTPS_OTA_IN_PROGRESS) {
            break;
        }
        
        // Log progress
        int image_read = esp_https_ota_get_image_len_read(ota_handle);
        ESP_LOGI(TAG, "OTA progress: %d bytes", image_read);
    }
    
    if (err == ESP_OK) {
        // Finalize: mark new partition as boot
        err = esp_https_ota_finish(ota_handle);
        if (err == ESP_OK) {
            ESP_LOGI(TAG, "OTA update successful! Rebooting...");
            
            // Send update event before reboot
            cJSON *data = cJSON_CreateObject();
            cJSON_AddStringToObject(data, "old_version", app_desc->version);
            cJSON_AddStringToObject(data, "new_version", version->valuestring);
            api_send_event("FIRMWARE_UPDATED", data);
            cJSON_Delete(data);
            
            vTaskDelay(pdMS_TO_TICKS(2000));  // Allow event to send
            esp_restart();
        }
    }
    
    ESP_LOGE(TAG, "OTA update failed: %s", esp_err_to_name(err));
    esp_https_ota_abort(ota_handle);
    cJSON_Delete(firmware_info);
    return err;
}
```

### 10.2 OTA Safety — Rollback Protection

```c
/**
 * Call this in app_main() after successful boot.
 * Marks the current firmware as valid.
 * If not called within 30 seconds, ESP32 rolls back on next boot.
 */
void ota_mark_valid(void) {
    const esp_partition_t *running = esp_ota_get_running_partition();
    esp_ota_img_states_t ota_state;
    
    if (esp_ota_get_state_partition(running, &ota_state) == ESP_OK) {
        if (ota_state == ESP_OTA_IMG_PENDING_VERIFY) {
            ESP_LOGI("OTA", "First boot after OTA — running self-test...");
            
            // Run self-test: check all hardware works
            bool test_passed = true;
            
            if (motor_driver_init() != ESP_OK) test_passed = false;
            if (sensor_driver_init() != ESP_OK) test_passed = false;
            if (display_driver_init() != ESP_OK) test_passed = false;
            
            if (test_passed) {
                esp_ota_mark_app_valid_cancel_rollback();
                ESP_LOGI("OTA", "Self-test passed — firmware marked valid");
            } else {
                ESP_LOGE("OTA", "Self-test FAILED — rolling back!");
                esp_ota_mark_app_invalid_rollback_and_reboot();
            }
        }
    }
}
```

---

## 11. Power Management

### 11.1 Sleep Modes

```c
#include "esp_sleep.h"
#include "esp_pm.h"

/**
 * Configure ESP32-S3 power management.
 * Uses dynamic frequency scaling and light sleep.
 */
esp_err_t power_management_init(void) {
    // Enable automatic light sleep when idle
    esp_pm_config_esp32s3_t pm_config = {
        .max_freq_mhz = 240,    // Full speed when active
        .min_freq_mhz = 80,     // Reduce to 80MHz when idle
        .light_sleep_enable = true  // Auto light sleep
    };
    
    return esp_pm_configure(&pm_config);
}

/**
 * Enter deep sleep for battery backup mode.
 * Wakes on: PIR motion, button press, or timer.
 * Used when device is running on battery and idle for >30 min.
 */
void enter_deep_sleep(uint32_t wakeup_seconds) {
    ESP_LOGI("POWER", "Entering deep sleep for %d seconds", wakeup_seconds);
    
    // Save state to NVS before sleeping
    save_device_state();
    
    // Configure wake-up sources
    esp_sleep_enable_timer_wakeup(wakeup_seconds * 1000000ULL);  // Timer
    esp_sleep_enable_ext0_wakeup(PIN_PIR, 1);        // PIR motion (HIGH)
    esp_sleep_enable_ext1_wakeup(
        (1ULL << PIN_BTN_CONFIRM),                     // Button press
        ESP_EXT1_WAKEUP_ALL_LOW
    );
    
    // Disable peripherals to save power
    esp_wifi_stop();
    
    // Enter deep sleep (10µA consumption)
    esp_deep_sleep_start();
    // MCU resets on wake — app_main() runs again
}

/**
 * Read battery level from BQ24195 via I2C.
 * Returns battery percentage (0-100).
 */
uint8_t power_get_battery_level(void) {
    // BQ24195 I2C address: 0x6B
    // Register 0x0B: System status (charging state)
    // For actual percentage, use a fuel gauge IC (MAX17048)
    // or calculate from battery voltage
    
    // Read battery voltage via ADC (backup method)
    // 7.4V battery through voltage divider (10K/10K) = 3.7V max
    // ESP32 ADC: 0-3.3V = 0-4095
    
    uint32_t adc_reading = 0;  // Read from ADC channel
    float voltage = (adc_reading / 4095.0f) * 3.3f * 2.0f;  // ×2 for divider
    
    // Li-ion 2S: 8.4V full, 6.0V empty
    float percentage = (voltage - 6.0f) / (8.4f - 6.0f) * 100.0f;
    
    if (percentage > 100) percentage = 100;
    if (percentage < 0) percentage = 0;
    
    return (uint8_t)percentage;
}
```

---

## 12. Schedule Service

### 12.1 Schedule Manager

```c
#include "schedule_service.h"
#include "dispense_service.h"
#include "audio_driver.h"
#include "display_driver.h"
#include "api_client.h"
#include "esp_log.h"
#include "time.h"

static const char *TAG = "SCHEDULE";

#define MAX_SCHEDULE_ENTRIES 50

typedef struct {
    uint8_t slot;
    uint8_t pill_count;
    uint8_t hour;
    uint8_t minute;
    bool enabled;
    bool dispensed_today;
    char medication_name[64];
} schedule_entry_t;

static schedule_entry_t schedule[MAX_SCHEDULE_ENTRIES];
static int schedule_count = 0;

/**
 * Check schedule every second.
 * Called from FreeRTOS task in main loop.
 */
void schedule_check_and_dispense(void) {
    time_t now;
    time(&now);
    struct tm *timeinfo = localtime(&now);
    
    for (int i = 0; i < schedule_count; i++) {
        schedule_entry_t *entry = &schedule[i];
        
        if (!entry->enabled || entry->dispensed_today) continue;
        
        // Check if it's time
        if (timeinfo->tm_hour == entry->hour && 
            timeinfo->tm_min == entry->minute &&
            timeinfo->tm_sec == 0) {
            
            ESP_LOGI(TAG, "Dispensing: %s (slot %d, %d pills)",
                     entry->medication_name, entry->slot, entry->pill_count);
            
            // Play reminder audio
            audio_play_alert(ALERT_MEDICATION_REMINDER);
            
            // Show on display
            display_show_medication_due(entry->medication_name, entry->pill_count);
            
            // Dispense
            esp_err_t ret = dispense_medication(entry->slot, entry->pill_count);
            
            if (ret == ESP_OK) {
                entry->dispensed_today = true;
                ESP_LOGI(TAG, "Dispensed successfully");
            } else {
                ESP_LOGE(TAG, "Dispensing failed: %s", esp_err_to_name(ret));
                audio_play_alert(ALERT_ERROR);
            }
        }
        
        // Check for missed dose (30 minutes past schedule)
        if (!entry->dispensed_today &&
            timeinfo->tm_hour == entry->hour &&
            timeinfo->tm_min == entry->minute + 30) {
            
            ESP_LOGW(TAG, "MISSED DOSE: %s", entry->medication_name);
            
            cJSON *data = cJSON_CreateObject();
            cJSON_AddNumberToObject(data, "slot", entry->slot);
            cJSON_AddStringToObject(data, "medication", entry->medication_name);
            api_send_event("DOSE_MISSED", data);
            cJSON_Delete(data);
            
            audio_play_alert(ALERT_DOSE_MISSED);
        }
    }
    
    // Reset dispensed_today flags at midnight
    if (timeinfo->tm_hour == 0 && timeinfo->tm_min == 0 && timeinfo->tm_sec == 0) {
        for (int i = 0; i < schedule_count; i++) {
            schedule[i].dispensed_today = false;
        }
        ESP_LOGI(TAG, "Schedule reset for new day");
    }
}
```

---

---

## 13. API Endpoint Quick Reference (Firmware)

All firmware API calls use the **Device API** prefix: `/api/v1/`

| Action | Method | Endpoint | Auth |
|:-------|:-------|:---------|:-----|
| Register device | POST | `/api/v1/devices/register` | None (first boot) |
| Send heartbeat | POST | `/api/v1/devices/{deviceId}/heartbeat` | Bearer token |
| Get schedule | GET | `/api/v1/devices/{deviceId}/schedule` | Bearer token |
| Send event | POST | `/api/v1/events` | Bearer token |
| Sync inventory | POST | `/api/v1/devices/{deviceId}/inventory` | Bearer token |
| Report error | POST | `/api/v1/devices/{deviceId}/error` | Bearer token |
| Check firmware | GET | `/api/v1/devices/{deviceId}/firmware` | Bearer token |

### Required Headers (All Authenticated Requests)

```c
// Set these headers on every authenticated request:
esp_http_client_set_header(client, "Authorization", auth_header);  // "Bearer <token>"
esp_http_client_set_header(client, "Content-Type", "application/json");
esp_http_client_set_header(client, "X-Device-ID", device_id);
esp_http_client_set_header(client, "X-Firmware-Version", FIRMWARE_VERSION);
```

### Additional Device-Specific Endpoints

```c
// Report device error directly
// POST /api/v1/devices/{deviceId}/error
esp_err_t api_report_error(const char *error_code, const char *message) {
    cJSON *body = cJSON_CreateObject();
    cJSON_AddStringToObject(body, "errorCode", error_code);
    cJSON_AddStringToObject(body, "message", message);
    cJSON_AddStringToObject(body, "severity", "warning");
    cJSON_AddBoolToObject(body, "recoverable", true);
    
    char url[256];
    snprintf(url, sizeof(url), "%s/devices/%s/error", API_BASE_URL, device_id);
    
    // ... send HTTP POST (same pattern as heartbeat)
    
    cJSON_Delete(body);
    return ESP_OK;
}

// Sync inventory state
// POST /api/v1/devices/{deviceId}/inventory
esp_err_t api_sync_inventory(void) {
    cJSON *body = cJSON_CreateObject();
    cJSON *slots = cJSON_CreateArray();
    
    for (int i = 1; i <= NUM_SLOTS; i++) {
        cJSON *slot = cJSON_CreateObject();
        cJSON_AddNumberToObject(slot, "slot", i);
        cJSON_AddStringToObject(slot, "medication", get_slot_medication(i));
        cJSON_AddNumberToObject(slot, "pills_count", get_slot_count(i));
        cJSON_AddItemToArray(slots, slot);
    }
    cJSON_AddItemToObject(body, "slots", slots);
    
    char url[256];
    snprintf(url, sizeof(url), "%s/devices/%s/inventory", API_BASE_URL, device_id);
    
    // ... send HTTP POST
    
    cJSON_Delete(body);
    return ESP_OK;
}
```

---

## 14. Dual API Architecture Note

The backend exposes **two separate API surfaces**. Firmware only uses the Device API:

```
┌──────────────────────────────────────────────────────────────────┐
│                      ASP.NET Core 8 Backend                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Device API (/api/v1/)               User/App API (/api/)        │
│  ┌────────────────────────┐         ┌────────────────────────┐   │
│  │ DeviceApiController    │         │ AuthController         │   │
│  │                        │         │ DevicesController      │   │
│  │ • Device registration  │         │ ContainersController   │   │
│  │ • Heartbeat           │         │ SchedulesController    │   │
│  │ • Event submission    │         │ DispensingController   │   │
│  │ • Schedule fetch      │         │ HistoryController      │   │
│  │ • Firmware check      │         │ NotificationsController│   │
│  │ • Error reporting     │         │ TravelController       │   │
│  │ • Inventory sync      │         │ IntegrationsController │   │
│  │                        │         │ WebhooksController     │   │
│  │ Auth: Device JWT       │         │                        │   │
│  │       or X-API-Key     │         │ Auth: User JWT         │   │
│  └────────────────────────┘         └────────────────────────┘   │
│                                                                   │
│                    Shared: Application Layer (MediatR/CQRS)      │
│                    Shared: Domain Entities                         │
│                    Shared: Infrastructure (EF Core)               │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

Firmware engineers should **only** use endpoints under `/api/v1/`.
The `/api/` endpoints are for mobile/web developers and require user authentication (email + password login).

---

## Revision History

| Version | Date | Changes |
|:--------|:-----|:--------|
| 1.0 | Feb 2026 | Initial release |
| 2.0 | Feb 2026 | Aligned API endpoints with actual backend, added dual API architecture note, added additional endpoints |
| 2.1 | Feb 2026 | Added WiFi service, OTA updates, power management, schedule service |
