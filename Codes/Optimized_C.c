#include <stdio.h>
#include <stdint.h>
#include <string.h>

#define POLYNOMIAL 0xEDB88320  // Reverse of 0x04C11DB7
#define INITIAL 0xFFFFFFFF
#define FINAL_XOR 0xFFFFFFFF

uint32_t crc_table[256];

// Generate CRC table using the right-shift method (matches NS-3)
void generate_crc_table() {
    for (int i = 0; i < 256; i++) {
        uint32_t crc = i;
        for (int j = 0; j < 8; j++) {
            if (crc & 1) {
                crc = (crc >> 1) ^ POLYNOMIAL;
            } else {
                crc >>= 1;
            }
        }
        crc_table[i] = crc;
    }
}

// This matches the NS-3 implementation
uint32_t compute_crc(const char *data) {
    uint32_t crc = INITIAL;
    size_t len = strlen(data);
    
    for (size_t i = 0; i < len; i++) {
        uint8_t byte = data[i];
        crc = (crc >> 8) ^ crc_table[(crc ^ byte) & 0xFF];
    }
    
    return crc ^ FINAL_XOR;
}

int main() {
    generate_crc_table();  // Precompute table
    
    char paragraph[1000];
    printf("Enter your paragraph: ");
    fgets(paragraph, sizeof(paragraph), stdin);
    
    // Remove newline from fgets()
    paragraph[strcspn(paragraph, "\n")] = 0;
    
    uint32_t crc_value = compute_crc(paragraph);
    printf("CRC-32: 0x%08X\n", crc_value);
    
    return 0;
}
