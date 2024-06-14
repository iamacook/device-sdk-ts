import { Container } from "inversify";
import { Observable } from "rxjs";

import { commandTypes } from "@api/command/di/commandTypes";
import {
  SendCommandUseCase,
  SendCommandUseCaseArgs,
} from "@api/command/use-case/SendCommandUseCase";
import { ApduResponse } from "@api/device-session/ApduResponse";
import { DeviceSessionState } from "@api/device-session/DeviceSessionState";
import { DeviceSessionId } from "@api/device-session/types";
import {
  ConnectUseCaseArgs,
  DisconnectUseCaseArgs,
  DiscoveredDevice,
  SendApduUseCaseArgs,
} from "@api/types";
import { ConnectedDevice } from "@api/usb/model/ConnectedDevice";
import { configTypes } from "@internal/config/di/configTypes";
import { GetSdkVersionUseCase } from "@internal/config/use-case/GetSdkVersionUseCase";
import { deviceSessionTypes } from "@internal/device-session/di/deviceSessionTypes";
import { GetDeviceSessionStateUseCase } from "@internal/device-session/use-case/GetDeviceSessionStateUseCase";
import { discoveryTypes } from "@internal/discovery/di/discoveryTypes";
import { ConnectUseCase } from "@internal/discovery/use-case/ConnectUseCase";
import { DisconnectUseCase } from "@internal/discovery/use-case/DisconnectUseCase";
import type { StartDiscoveringUseCase } from "@internal/discovery/use-case/StartDiscoveringUseCase";
import type { StopDiscoveringUseCase } from "@internal/discovery/use-case/StopDiscoveringUseCase";
import { sendTypes } from "@internal/send/di/sendTypes";
import { SendApduUseCase } from "@internal/send/use-case/SendApduUseCase";
import { usbDiTypes } from "@internal/usb/di/usbDiTypes";
import {
  GetConnectedDeviceUseCase,
  GetConnectedDeviceUseCaseArgs,
} from "@internal/usb/use-case/GetConnectedDeviceUseCase";
import { makeContainer, MakeContainerProps } from "@root/src/di";

/**
 * The main class to interact with the SDK.
 *
 * NB: do not instantiate this class directly, instead, use `DeviceSdkBuilder`.
 */
export class DeviceSdk {
  container: Container;
  /** @internal */
  constructor({ stub, loggers }: Partial<MakeContainerProps> = {}) {
    // NOTE: MakeContainerProps might not be the exact type here
    // For the init of the project this is sufficient, but we might need to
    // update the constructor arguments as we go (we might have more than just the container config)
    this.container = makeContainer({ stub, loggers });
  }

  /**
   * Returns a promise resolving to the version of the SDK.
   */
  getVersion(): Promise<string> {
    return this.container
      .get<GetSdkVersionUseCase>(configTypes.GetSdkVersionUseCase)
      .getSdkVersion();
  }

  /**
   * Starts discovering devices connected via USB HID (BLE not implemented yet).
   *
   * For the WeHID implementation, this use-case needs to be called as a result
   * of an user interaction (button "click" event for ex).
   *
   * @returns {Observable<DiscoveredDevice>} An observable of discovered devices.
   */
  startDiscovering(): Observable<DiscoveredDevice> {
    return this.container
      .get<StartDiscoveringUseCase>(discoveryTypes.StartDiscoveringUseCase)
      .execute();
  }

  /**
   * Stops discovering devices connected via USB HID (and later BLE).
   */
  stopDiscovering() {
    return this.container
      .get<StopDiscoveringUseCase>(discoveryTypes.StopDiscoveringUseCase)
      .execute();
  }

  /**
   * Connects to a device previously discovered with `DeviceSdk.startDiscovering`.
   * Creates a new device session which:
   * - Represents the connection to the device.
   * - Is terminated upon disconnection of the device.
   * - Exposes the device state through an observable (see `DeviceSdk.getDeviceSessionState`)
   * - Should be used for all subsequent communication with the device.
   *
   * @param {ConnectUseCaseArgs} args - The device ID (obtained in discovery) to connect to.
   * @returns The session ID to use for further communication with the device.
   */
  connect(args: ConnectUseCaseArgs): Promise<DeviceSessionId> {
    return this.container
      .get<ConnectUseCase>(discoveryTypes.ConnectUseCase)
      .execute(args);
  }

  /**
   * Disconnects to a discovered device via USB HID (and later BLE).
   *
   * @param {DisconnectUseCaseArgs} args - The session ID to disconnect.
   */
  disconnect(args: DisconnectUseCaseArgs): Promise<void> {
    return this.container
      .get<DisconnectUseCase>(discoveryTypes.DisconnectUseCase)
      .execute(args);
  }

  /**
   * Sends an APDU command to a device through a device session.
   *
   * @param {SendApduUseCaseArgs} args - The device session ID and APDU command to send.
   */
  sendApdu(args: SendApduUseCaseArgs): Promise<ApduResponse> {
    return this.container
      .get<SendApduUseCase>(sendTypes.SendApduUseCase)
      .execute(args);
  }

  /**
   * Sends a command to a device through a device session.
   *
   * @param {SendCommandUseCaseArgs<Response, Args>} args - The device session ID, command and command parameters to send.
   * @returns A promise resolving with the response from the command.
   */
  sendCommand<Response, Args>(
    args: SendCommandUseCaseArgs<Response, Args>,
  ): Promise<Response> {
    return this.container
      .get<SendCommandUseCase>(commandTypes.SendCommandUseCase)
      .execute(args);
  }

  /**
   * Gets the connected from its device session ID.
   *
   * @param {GetConnectedDeviceUseCaseArgs} args - The device session ID.
   * @returns {ConnectedDevice} The connected device.
   */
  getConnectedDevice(args: GetConnectedDeviceUseCaseArgs): ConnectedDevice {
    return this.container
      .get<GetConnectedDeviceUseCase>(usbDiTypes.GetConnectedDeviceUseCase)
      .execute(args);
  }

  /**
   * Gets the device state of a session.
   *
   * @param {{DeviceSessionId}} args - The device session ID.
   * @returns {Observable<DeviceSessionState>} An observable of the session device state.
   */
  getDeviceSessionState(args: {
    sessionId: DeviceSessionId;
  }): Observable<DeviceSessionState> {
    return this.container
      .get<GetDeviceSessionStateUseCase>(
        deviceSessionTypes.GetDeviceSessionStateUseCase,
      )
      .execute(args);
  }
}
