## Running the System

### Start the WebSocket Bridge Server
Run the following commands to start the WebSocket bridge server:
```bash
cd ~/crc-visualization
node server.js
```

### Run the NS-3 Simulation
Open a new terminal and execute the following commands to start your NS-3 simulation:
```bash
cd ~/ns-allinone-3.43/ns-3.43/
./ns3 run "scratch/a3 --web=true"
```

### Open the Web Interface
Once both the server and NS-3 simulation are running, open your web browser and navigate to:
```
http://localhost:8000
```

## How It Works
1. The bridge server creates both an HTTP server and a WebSocket server.
2. Your NS3 simulation sends data to the server using HTTP POST requests.
3. The server forwards this data to all connected WebSocket clients.
4. Your web interface connects to the WebSocket server and visualizes the data.



