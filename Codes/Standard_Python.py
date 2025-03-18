import binascii

def compute_crc(data: str, polynomial=0xEDB88320, initial=0xFFFFFFFF, final_xor=0xFFFFFFFF):
    crc = initial
    data_bytes = data.encode()  # Convert to bytes
    
    for byte in data_bytes:
        # XOR the byte with the least significant byte of CRC
        crc ^= byte
        
        # Process each bit with right shifts (matching NS-3)
        for _ in range(8):
            if crc & 1:
                crc = (crc >> 1) ^ polynomial
            else:
                crc >>= 1
    
    return hex(crc ^ final_xor)  # Final XOR step

# Example Usage
paragraph = input("Enter your paragraph: ").strip()
crc_value = compute_crc(paragraph)
print(f"CRC-32: {crc_value}")

# Verification with Python's built-in CRC32
builtin_crc = hex(binascii.crc32(paragraph.encode()) & 0xFFFFFFFF)
print(f"Built-in CRC-32: {builtin_crc}")
