FROM --platform=$TARGETPLATFORM node:lts as build

RUN apt-get update && apt-get install -y \
  sudo

RUN git clone https://github.com/WiringPi/WiringPi.git \
    && cd WiringPi \
    && ./build

ADD package.json package-lock.json ./
RUN npm install

FROM --platform=$TARGETPLATFORM node:lts-slim
WORKDIR /app
COPY --from=build ./node_modules ./node_modules
COPY --from=build /usr/local/bin/gpio /usr/local/bin/gpio
COPY --from=build /usr/lib/libwiringPiDev.so /usr/lib/libwiringPiDev.so
COPY --from=build /usr/local/lib/libwiringPiDev.so /usr/local/lib/libwiringPiDev.so
COPY --from=build /usr/lib/libwiringPi.so /usr/lib/libwiringPi.so
COPY --from=build /usr/local/lib/libwiringPi.so /usr/local/lib/libwiringPi.so
COPY --from=build /usr/local/include/ /usr/local/include/
ADD src ./src

CMD [ "node", "src/index.js" ]
