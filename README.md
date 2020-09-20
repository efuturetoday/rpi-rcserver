# rpi-rcserver
A Webserver for Raspberry for sending and receiving 433MHz Switch Codes.

# Run Container
`docker run --privileged -p 8080:8080 efuture/rpi-rcserver:latest`
This will run the container in privileged mode (required for accessing gpios) and expose the container port 8080 to the host port 8080.
You can then access the server via http://localhost:8080/.

# Run Container Advanced
```
docker run --privileged -p 8080:8080 \ 
-e RC_PIN_TRANSMIT=2 \
-e RC_PIN_RECEIVE=3 \
-e RC_PROTOCOL=1 \
-e RC_PULSE_LENGTH=180 \
-e RC_REPEATS=10 \
efuture/rpi-rcserver:latest
```

# Wiring


# Endpoints
Endpoint | Query Params | Method
--- | --- | ---
/config |  | **GET**
/on | `group`, `switch`, `family*` | **GET**
/off | `group`, `switch`, `family*` | **GET**
/send | `code`, `protocol*`, `pulseLength*`, `repeats*` | **GET**
/sniff |  | **GET**

**\*** Optional