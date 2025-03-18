#include <stdio.h>
#include <stdint.h>
#include <string.h>

#define POLYNOMIAL 0xEDB88320  // Reversed polynomial (required to match NS-3)
#define INITIAL 0xFFFFFFFF
#define FINAL_XOR 0xFFFFFFFF

uint32_t compute_crc(const char *data) {
    uint32_t crc = INITIAL;
    size_t len = strlen(data);
    
    for (size_t i = 0; i < len; i++) {
        // XOR the byte with the least significant byte of CRC
        crc ^= (uint8_t)data[i];
        
        // Process each bit with right shifts (matching NS-3)
        for (int j = 0; j < 8; j++) {
            if (crc & 1) {
                crc = (crc >> 1) ^ POLYNOMIAL;
            } else {
                crc >>= 1;
            }
        }
    }
    
    return crc ^ FINAL_XOR;  // Final XOR
}

int main() {
    char paragraph[1000];
    printf("Enter your paragraph: ");
    fgets(paragraph, sizeof(paragraph), stdin);
    
    // Remove newline from fgets()
    paragraph[strcspn(paragraph, "\n")] = 0;
    uint32_t crc_value = compute_crc(paragraph);
    printf("CRC-32: 0x%08X\n", crc_value);
    return 0;
}
