import {
  CommandResultFactory,
  DeviceActionStatus,
  UnknownDeviceExchangeError,
  UserInteractionRequired,
} from "@ledgerhq/device-management-kit";
import {
  InvalidStatusWordError,
  UnknownDAError,
} from "@ledgerhq/device-management-kit";

import { type SignMessageDAState } from "@api/app-binder/SignMessageDeviceActionTypes";
import { makeDeviceActionInternalApiMock } from "@internal/app-binder/device-action/__test-utils__/makeInternalApi";
import { setupOpenAppDAMock } from "@internal/app-binder/device-action/__test-utils__/setupOpenAppDAMock";
import { testDeviceActionStates } from "@internal/app-binder/device-action/__test-utils__/testDeviceActionStates";

import { SignMessageDeviceAction } from "./SignMessageDeviceAction";

jest.mock(
  "@ledgerhq/device-management-kit",
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  () => ({
    ...jest.requireActual("@ledgerhq/device-management-kit"),
    OpenAppDeviceAction: jest.fn(() => ({
      makeStateMachine: jest.fn(),
    })),
  }),
);

describe("SignMessageDeviceAction", () => {
  const signMessageMock = jest.fn();

  function extractDependenciesMock() {
    return {
      signMessage: signMessageMock,
    };
  }

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("Success case", () => {
    it("should call external dependencies with the correct parameters", (done) => {
      setupOpenAppDAMock();

      const deviceAction = new SignMessageDeviceAction({
        input: {
          derivationPath: "44'/60'/0'/0/0",
          message: "Hello world",
        },
      });

      jest
        .spyOn(deviceAction, "extractDependencies")
        .mockImplementation(() => extractDependenciesMock());

      const signatureData = new Uint8Array([
        // v
        0x1c,
        // r
        0x8a, 0x54, 0x05, 0x10, 0xe1, 0x3b, 0x0f, 0x2b, 0x11, 0xa4, 0x51, 0x27,
        0x57, 0x16, 0xd2, 0x9e, 0x08, 0xca, 0xad, 0x07, 0xe8, 0x9a, 0x1c, 0x84,
        0x96, 0x47, 0x82, 0xfb, 0x5e, 0x1a, 0xd7, 0x88,
        // s
        0x64, 0xa0, 0xde, 0x23, 0x5b, 0x27, 0x0f, 0xbe, 0x81, 0xe8, 0xe4, 0x06,
        0x88, 0xf4, 0xa9, 0xf9, 0xad, 0x9d, 0x28, 0x3d, 0x69, 0x05, 0x52, 0xc9,
        0x33, 0x1d, 0x77, 0x73, 0xce, 0xaf, 0xa5, 0x13,
      ]);

      signMessageMock.mockResolvedValueOnce(
        CommandResultFactory({
          data: signatureData,
        }),
      );

      const expectedStates: Array<SignMessageDAState> = [
        {
          intermediateValue: {
            requiredUserInteraction: UserInteractionRequired.None,
          },
          status: DeviceActionStatus.Pending,
        },
        {
          intermediateValue: {
            requiredUserInteraction: UserInteractionRequired.ConfirmOpenApp,
          },
          status: DeviceActionStatus.Pending,
        },
        {
          intermediateValue: {
            requiredUserInteraction:
              UserInteractionRequired.SignPersonalMessage,
          },
          status: DeviceActionStatus.Pending,
        },
        {
          output: signatureData,
          status: DeviceActionStatus.Completed,
        },
      ];

      const { observable } = testDeviceActionStates(
        deviceAction,
        expectedStates,
        makeDeviceActionInternalApiMock(),
        done,
      );

      observable.subscribe({
        complete: () => {
          expect(signMessageMock).toHaveBeenCalledWith(
            expect.objectContaining({
              input: expect.objectContaining({
                derivationPath: "44'/60'/0'/0/0",
                message: "Hello world",
              }),
            }),
          );
        },
      });
    });
  });

  describe("error cases", () => {
    it("Error if the open app fails", (done) => {
      setupOpenAppDAMock(new UnknownDeviceExchangeError("Mocked error"));

      const expectedStates: Array<SignMessageDAState> = [
        {
          status: DeviceActionStatus.Pending,
          intermediateValue: {
            requiredUserInteraction: UserInteractionRequired.None,
          },
        },
        {
          status: DeviceActionStatus.Pending,
          intermediateValue: {
            requiredUserInteraction: UserInteractionRequired.ConfirmOpenApp,
          },
        },
        {
          status: DeviceActionStatus.Error,
          error: new UnknownDeviceExchangeError("Mocked error"),
        },
      ];

      const deviceAction = new SignMessageDeviceAction({
        input: {
          derivationPath: "44'/60'/0'/0/0",
          message: "Hello world",
        },
      });

      testDeviceActionStates(
        deviceAction,
        expectedStates,
        makeDeviceActionInternalApiMock(),
        done,
      );
    });

    it("Error if the signMessage fails", (done) => {
      setupOpenAppDAMock();

      const deviceAction = new SignMessageDeviceAction({
        input: {
          derivationPath: "44'/60'/0'/0/0",
          message: "Hello world",
        },
      });

      jest
        .spyOn(deviceAction, "extractDependencies")
        .mockImplementation(() => extractDependenciesMock());
      signMessageMock.mockResolvedValueOnce(
        CommandResultFactory({
          error: new UnknownDeviceExchangeError("Mocked error"),
        }),
      );

      const expectedStates: Array<SignMessageDAState> = [
        {
          status: DeviceActionStatus.Pending,
          intermediateValue: {
            requiredUserInteraction: UserInteractionRequired.None,
          },
        },
        {
          status: DeviceActionStatus.Pending,
          intermediateValue: {
            requiredUserInteraction: UserInteractionRequired.ConfirmOpenApp,
          },
        },
        {
          status: DeviceActionStatus.Pending,
          intermediateValue: {
            requiredUserInteraction:
              UserInteractionRequired.SignPersonalMessage,
          },
        },
        {
          status: DeviceActionStatus.Error,
          error: new UnknownDeviceExchangeError("Mocked error"),
        },
      ];

      testDeviceActionStates(
        deviceAction,
        expectedStates,
        makeDeviceActionInternalApiMock(),
        done,
      );
    });

    it("Error if signMessage throws an exception", (done) => {
      setupOpenAppDAMock();

      const deviceAction = new SignMessageDeviceAction({
        input: {
          derivationPath: "44'/60'/0'/0/0",
          message: "Hello world",
        },
      });

      jest
        .spyOn(deviceAction, "extractDependencies")
        .mockImplementation(() => extractDependenciesMock());
      signMessageMock.mockRejectedValueOnce(
        new InvalidStatusWordError("Mocked error"),
      );

      const expectedStates: Array<SignMessageDAState> = [
        {
          status: DeviceActionStatus.Pending,
          intermediateValue: {
            requiredUserInteraction: UserInteractionRequired.None,
          },
        },
        {
          status: DeviceActionStatus.Pending,
          intermediateValue: {
            requiredUserInteraction: UserInteractionRequired.ConfirmOpenApp,
          },
        },
        {
          status: DeviceActionStatus.Pending,
          intermediateValue: {
            requiredUserInteraction:
              UserInteractionRequired.SignPersonalMessage,
          },
        },
        {
          status: DeviceActionStatus.Error,
          error: new InvalidStatusWordError("Mocked error"),
        },
      ];

      testDeviceActionStates(
        deviceAction,
        expectedStates,
        makeDeviceActionInternalApiMock(),
        done,
      );
    });

    it("Return a Left if the final state has no signature", (done) => {
      setupOpenAppDAMock();

      const deviceAction = new SignMessageDeviceAction({
        input: {
          derivationPath: "44'/60'/0'/0/0",
          message: "Hello world",
        },
      });

      jest
        .spyOn(deviceAction, "extractDependencies")
        .mockImplementation(() => extractDependenciesMock());
      signMessageMock.mockResolvedValueOnce(
        CommandResultFactory({
          data: undefined,
        }),
      );

      const expectedStates: Array<SignMessageDAState> = [
        {
          status: DeviceActionStatus.Pending,
          intermediateValue: {
            requiredUserInteraction: UserInteractionRequired.None,
          },
        },
        {
          status: DeviceActionStatus.Pending,
          intermediateValue: {
            requiredUserInteraction: UserInteractionRequired.ConfirmOpenApp,
          },
        },
        {
          status: DeviceActionStatus.Pending,
          intermediateValue: {
            requiredUserInteraction:
              UserInteractionRequired.SignPersonalMessage,
          },
        },
        {
          status: DeviceActionStatus.Error,
          error: new UnknownDAError("No error in final state"),
        },
      ];

      testDeviceActionStates(
        deviceAction,
        expectedStates,
        makeDeviceActionInternalApiMock(),
        done,
      );
    });
  });
});
