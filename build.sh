#!/bin/bash

docker buildx build --platform linux/arm/v7 --tag efuture/rpi-rcserver:test -o type=tar,dest=test.tar .
# copy: scp test.tar pi@raspberry:/home/pi
# remote: docker import test.tar
