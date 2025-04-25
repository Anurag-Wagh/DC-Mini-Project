import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Read the benchmark results
df = pd.read_csv('crc_benchmark_results.csv')

# Convert size to KB for better readability
df['Size(KB)'] = df['Size(bytes)'] / 1024

# Create the plot
plt.figure(figsize=(10, 6))

# Plot the timing data
plt.plot(df['Size(KB)'], df['Table_Time(ms)'], 'o-', color='blue', label='Lookup Table Method')
plt.plot(df['Size(KB)'], df['Standard_Time(ms)'], 'o-', color='red', label='Standard Method')

# Add labels and title
plt.xlabel('Data Size (KB)')
plt.ylabel('Execution Time (ms)')
plt.title('CRC-32 Performance Comparison: Lookup Table vs Standard Implementation')
plt.grid(True, linestyle='--', alpha=0.7)
plt.legend()

# Add speedup annotations
for i, row in df.iterrows():
    if row['Standard_Time(ms)'] > 0 and row['Table_Time(ms)'] > 0:
        speedup = row['Standard_Time(ms)'] / row['Table_Time(ms)']
        plt.annotate(f'{speedup:.1f}x faster', 
                     xy=(row['Size(KB)'], row['Table_Time(ms)']),
                     xytext=(5, -15), 
                     textcoords='offset points',
                     fontsize=8)

# Use logarithmic scale if the range is large
if df['Standard_Time(ms)'].max() / df['Table_Time(ms)'].min() > 100:
    plt.yscale('log')

# Format x-axis to show size in KB or MB as appropriate
plt.ticklabel_format(axis='x', style='plain')
if df['Size(KB)'].max() > 1024:
    plt.xlabel('Data Size (MB)')
    df['Size(MB)'] = df['Size(KB)'] / 1024
    plt.xticks(df['Size(KB)'], [f'{x:.1f}' for x in df['Size(MB)']])

# Add a text box with summary
avg_speedup = df['Standard_Time(ms)'].mean() / df['Table_Time(ms)'].mean()
plt.figtext(0.5, 0.01, 
           f'Average speedup: {avg_speedup:.2f}x faster with lookup table', 
           ha='center', fontsize=10, bbox=dict(facecolor='white', alpha=0.8))

# Save the figure
plt.tight_layout()
plt.savefig('crc_performance_comparison.png', dpi=300)
plt.show()