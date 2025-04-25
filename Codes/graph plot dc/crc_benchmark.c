#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <time.h>

// Constants for CRC-32 computation
#define INITIAL 0xFFFFFFFF
#define POLYNOMIAL 0xEDB88320  // Standard CRC-32 polynomial (reversed)
#define FINAL_XOR 0xFFFFFFFF

// Pre-computed lookup table for CRC-32
uint32_t crc_table[256];

// Initialize the CRC lookup table
void init_crc_table() {
    for (int i = 0; i < 256; i++) {
        uint32_t c = i;
        for (int j = 0; j < 8; j++) {
            if (c & 1) {
                c = POLYNOMIAL ^ (c >> 1);
            } else {
                c = c >> 1;
            }
        }
        crc_table[i] = c;
    }
}

// CRC-32 implementation using lookup table
uint32_t compute_crc_table(const char *data, size_t len) {
    uint32_t crc = INITIAL;
    
    for (size_t i = 0; i < len; i++) {
        uint8_t byte = data[i];
        crc = (crc >> 8) ^ crc_table[(crc ^ byte) & 0xFF];
    }
    
    return crc ^ FINAL_XOR;
}

// CRC-32 implementation using bit-by-bit calculation
uint32_t compute_crc_standard(const char *data, size_t len) {
    uint32_t crc = INITIAL;
    
    for (size_t i = 0; i < len; i++) {
        // XOR the byte with the least significant byte of CRC
        crc ^= (uint8_t)data[i];
        
        // Process each bit with right shifts
        for (int j = 0; j < 8; j++) {
            if (crc & 1) {
                crc = (crc >> 1) ^ POLYNOMIAL;
            } else {
                crc >>= 1;
            }
        }
    }
    
    return crc ^ FINAL_XOR;
}

// Generate random data of specified size
char* generate_random_data(size_t size) {
    char* data = (char*)malloc(size + 1);
    if (!data) {
        fprintf(stderr, "Memory allocation failed\n");
        exit(1);
    }
    
    for (size_t i = 0; i < size; i++) {
        data[i] = (char)(rand() % 256);  // Random bytes
    }
    data[size] = '\0';  // Null-terminate for safety
    
    return data;
}

// Benchmark function
void benchmark(FILE* output_file) {
    // Data sizes to test (in bytes)
    size_t sizes[] = {1024, 10240, 102400, 1048576, 5242880, 10485760};
    int num_sizes = sizeof(sizes) / sizeof(sizes[0]);
    int num_runs = 5;  // Number of runs to average
    
    fprintf(output_file, "Size(bytes),Table_Time(ms),Standard_Time(ms)\n");
    
    for (int i = 0; i < num_sizes; i++) {
        size_t size = sizes[i];
        double table_time_total = 0.0;
        double std_time_total = 0.0;
        
        printf("Testing with data size: %zu bytes\n", size);
        
        for (int run = 0; run < num_runs; run++) {
            char* data = generate_random_data(size);
            clock_t start, end;
            uint32_t crc;
            
            // Benchmark table method
            start = clock();
            crc = compute_crc_table(data, size);
            end = clock();
            table_time_total += ((double)(end - start) * 1000.0) / CLOCKS_PER_SEC;
            
            // Benchmark standard method
            start = clock();
            crc = compute_crc_standard(data, size);
            end = clock();
            std_time_total += ((double)(end - start) * 1000.0) / CLOCKS_PER_SEC;
            
            free(data);
        }
        
        // Calculate average times
        double table_time_avg = table_time_total / num_runs;
        double std_time_avg = std_time_total / num_runs;
        
        // Write results to file
        fprintf(output_file, "%zu,%.3f,%.3f\n", size, table_time_avg, std_time_avg);
        printf("Size: %zu bytes | Table: %.3f ms | Standard: %.3f ms\n", 
               size, table_time_avg, std_time_avg);
    }
}

int main() {
    // Seed random number generator
    srand((unsigned int)time(NULL));
    
    // Initialize lookup table
    init_crc_table();
    
    // Open output file
    FILE* output_file = fopen("crc_benchmark_results.csv", "w");
    if (!output_file) {
        fprintf(stderr, "Failed to open output file\n");
        return 1;
    }
    
    // Run benchmarks
    benchmark(output_file);
    
    // Close file
    fclose(output_file);
    printf("Benchmark complete. Results saved to crc_benchmark_results.csv\n");
    
    return 0;
}