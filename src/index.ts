import {DMXInterface, getConnectedInterfaces} from "usbdmx-js";
import {dmxnet} from "dmxnet";

const processArgs = process.argv.slice(2);

const allInterfaces = getConnectedInterfaces();
const availableInterface = allInterfaces[0];
if (availableInterface === undefined) {
    console.error("No Interface detected! Exiting...")
    process.exit(1);
}

console.info("Found Interface!")

const usbInterface = DMXInterface.open(availableInterface.path);
var mode = 6;
const modeFlag = processArgs.find((e) => e.includes("mode="))
if (modeFlag !== undefined) {
    const _modeFromFlag = modeFlag.split("=")[1];
    if (!isNaN(parseInt(_modeFromFlag))) {
        mode = parseInt(_modeFromFlag)
    }
}

console.info(`Using mode ${mode}`)
usbInterface.setMode(mode);

const dmxnetManager = new dmxnet();
const artnetReceiver = dmxnetManager.newReceiver();
var recentDMXArray: never[] = [];
console.info("Initialized Art-net interface")
artnetReceiver.on("data", (data) => {
    if (JSON.stringify(data) != JSON.stringify(recentDMXArray)) {
        usbInterface.writeMap(data);
    }
    recentDMXArray = data;
})