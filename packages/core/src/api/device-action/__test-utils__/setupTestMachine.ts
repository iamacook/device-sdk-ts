import { Left, Right } from "purify-ts";
import { assign, createMachine } from "xstate";

import { UserInteractionRequired } from "@api/device-action/model/UserInteractionRequired";
import { UnknownDAError } from "@api/device-action/os/Errors";
import { GetDeviceStatusDeviceAction } from "@api/device-action/os/GetDeviceStatus/GetDeviceStatusDeviceAction";
import { GoToDashboardDeviceAction } from "@api/device-action/os/GoToDashboard/GoToDashboardDeviceAction";
import { ListAppsDeviceAction } from "@api/device-action/os/ListApps/ListAppsDeviceAction";
import { type SdkError } from "@api/Error";

import { type BTC_APP } from "./data";

type App = typeof BTC_APP;

export const setupListAppsMock = (apps: App[], error = false) => {
  (ListAppsDeviceAction as jest.Mock).mockImplementation(() => ({
    makeStateMachine: jest.fn().mockImplementation(() =>
      createMachine({
        id: "MockListAppsDeviceAction",
        initial: "ready",
        states: {
          ready: {
            after: {
              0: "done",
            },
            entry: assign({
              intermediateValue: () => ({
                requiredUserInteraction: UserInteractionRequired.AllowListApps,
              }),
            }),
          },
          done: {
            type: "final",
          },
        },
        output: () => {
          return error
            ? Left(new UnknownDAError("ListApps failed"))
            : Right(apps);
        },
      }),
    ),
  }));
};

export const setupGoToDashboardMock = (error: boolean = false) => {
  (GoToDashboardDeviceAction as jest.Mock).mockImplementation(() => ({
    makeStateMachine: jest.fn().mockImplementation(() =>
      createMachine({
        id: "MockGoToDashboardDeviceAction",
        initial: "ready",
        states: {
          ready: {
            after: {
              0: "done",
            },
            entry: assign({
              intermediateValue: () => ({
                requiredUserInteraction: UserInteractionRequired.None,
              }),
            }),
          },
          done: {
            type: "final",
          },
        },
        output: () => {
          return error
            ? Left(new UnknownDAError("GoToDashboard failed"))
            : Right(undefined);
        },
      }),
    ),
  }));
};

export const setupGetDeviceStatusMock = (
  outputs: ReadonlyArray<
    { currentApp: string; currentAppVersion: string } | SdkError
  > = [
    {
      currentApp: "BOLOS",
      currentAppVersion: "1.0.0",
    },
  ],
) => {
  const outputFn = jest.fn();

  for (const output of outputs) {
    outputFn.mockImplementationOnce(() =>
      "currentApp" in output ? Right(output) : Left(output),
    );
  }
  (GetDeviceStatusDeviceAction as jest.Mock).mockImplementation(() => ({
    makeStateMachine: jest.fn().mockImplementation(() =>
      createMachine({
        id: "MockGetDeviceStatusDeviceAction",
        initial: "ready",
        states: {
          ready: {
            after: {
              0: "done",
            },
            entry: assign({
              intermediateValue: () => ({
                requiredUserInteraction: UserInteractionRequired.None,
              }),
            }),
          },
          done: {
            type: "final",
          },
        },
        output: outputFn,
      }),
    ),
  }));
};
