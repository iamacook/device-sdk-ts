"use client";
import { useEffect, memo } from "react";
import makeOpenAppMachine from "./stateMachine";
import { createActor } from "xstate";
import { createBrowserInspector } from "@statelyai/inspect";

const inspector = createBrowserInspector();

const openAppMachine = makeOpenAppMachine();

function Machine() {
  const startMachine = () => {
    console.log("machine: Hello, world!");
    const openAppMachineActor = createActor(openAppMachine, {
      inspect: inspector.inspect,
      input: {
        requestedAppName: "Bitcoin",
        deviceSessionState: {
          status: "Ready",
          deviceOnboarded: true,
        },
      },
    });

    openAppMachineActor.start();
    openAppMachineActor.subscribe((state) => {
      if (state.status === "done") {
        console.log("machine: done", state);
        console.log("machine output:", state.output);
      }
    });
  };
  return <button onClick={startMachine}>Start machine</button>;
}

export default memo(Machine);
