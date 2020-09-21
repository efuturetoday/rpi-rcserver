const express = require('express');
const rcswitch = require('rcswitch4');
const process = require('process');

const config = {
    port: 8080,
    pinTransmit: parseInt(process.env.RC_PIN_TRANSMIT) || 2,
    pinReceive: parseInt(process.env.RC_PIN_RECEIVE) || 3,
    protocol: parseInt(process.env.RC_PROTOCOL) || 0,
    pulseLength: parseInt(process.env.RC_PULSE_LENGTH) || 180,
    repeats: parseInt(process.env.RC_REPEATS) || 10
};

console.info(config);

if (!rcswitch.enableReceive(config.pinReceive)) {
    console.error('could not enable receive');
    process.exit(1);
};

if (!rcswitch.enableTransmit(config.pinTransmit)) {
    console.error('could not enable transmit');
    process.exit(1);
};

function configByRequest(req) {
    let protocol = req.query.protocol || config.protocol;
    let pulseLength = req.query.pulseLength || config.pulseLength;
    let repeats = req.query.repeats || config.repeats;

    if (isNaN(parseInt(protocol)) || isNaN(parseInt(pulseLength)) || isNaN(parseInt(repeats))) {
        return false;
    }

    rcswitch.setProtocol(parseInt(protocol));
    rcswitch.setPulseLength(parseInt(pulseLength));
    rcswitch.setRepeatTransmit(parseInt(repeats));

    return true;
}

const app = express();

app.get('/config', (req, res) => {
    res.json(config);
});

app.get('/send', (req, res) => {
    if (!configByRequest(req)) {
        res.status(400).end();
        return;
    }

    const code = parseInt(req.query.code);
    if (isNaN(code)) {
        res.status(400).end();
        return;
    }

    rcswitch.send(code);

    res.status(200).end();
});

app.get('/on', (req, res) => {
    if (!configByRequest(req)) {
        res.status(400).end();
        return;
    }

    const family = req.query.family;
    const group = parseInt(req.query.group);
    const _switch = parseInt(req.query.switch);

    if (isNaN(code) || isNaN(_switch)) {
        res.status(400).end();
        return;
    }

    if (family) {
        rcswitch.switchOn(family, group, _switch);
    } else {
        rcswitch.switchOn(group, _switch);
    }


    res.status(200).end();
});

app.get('/off', (req, res) => {
    if (!configByRequest(req)) {
        res.status(400).end();
        return;
    }

    const family = req.query.family;
    const group = parseInt(req.query.group);
    const _switch = parseInt(req.query.switch);

    if (isNaN(code) || isNaN(_switch)) {
        res.sendStatus(400).end();
        return;
    }

    if (family) {
        rcswitch.switchOff(family, group, _switch);
    } else {
        rcswitch.switchOff(group, _switch);
    }

    res.status(200).end();
});

app.get('/sniff', (req, res, next) => {
    if (!configByRequest(req)) {
        res.sendStatus(400).end();
        return next();
    }

    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);

    const interval = setInterval(() => {
        if (rcswitch.available()) {
            res.write(JSON.stringify({
                code: rcswitch.getReceivedValue(),
                protocol: rcswitch.getReceivedProtocol(),
                bitLength: rcswitch.getReceivedBitlength(),
                raw: rcswitch.getReceivedRawdata()
            }) + '\n');

            rcswitch.resetAvailable();
        }
    }, 100);

    req.on('close', () => {
        clearInterval(interval);
    });
});

app.listen(config.port, () => {
    console.log(`Server listening at port ${config.port}`)
})

process.on('SIGINT', () => {
    console.info('exiting...');
    process.exit(0);
});
