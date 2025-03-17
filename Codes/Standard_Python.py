import binascii

def compute_crc(data: str, polynomial=0x04C11DB7, initial=0xFFFFFFFF, final_xor=0xFFFFFFFF):
    crc = initial
    data_bytes = data.encode()  # Convert to bytes

    for byte in data_bytes:
        crc ^= (byte << 24)
        for _ in range(8):
            if crc & 0x80000000:
                crc = (crc << 1) ^ polynomial
            else:
                crc <<= 1
            crc &= 0xFFFFFFFF  # Keep within 32-bit

    return hex(crc ^ final_xor)  # Final XOR step

# Example Usage
paragraph = input("Enter your paragraph: ").strip()
crc_value = compute_crc(paragraph)
print(f"CRC-32: {crc_value}")
