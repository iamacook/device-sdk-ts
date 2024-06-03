import { Left, Right } from "purify-ts";
import * as uuid from "uuid";
jest.mock("uuid");

import { DeviceModelDataSource } from "@internal/device-model/data/DeviceModelDataSource";
import { InternalDeviceModel } from "@internal/device-model/model/DeviceModel";
import { DefaultDeviceSessionService } from "@internal/device-session/service/DefaultDeviceSessionService";
import { DeviceSessionService } from "@internal/device-session/service/DeviceSessionService";
import { DefaultLoggerPublisherService } from "@internal/logger-publisher/service/DefaultLoggerPublisherService";
import { LoggerPublisherService } from "@internal/logger-publisher/service/LoggerPublisherService";
import { DiscoveredDevice } from "@internal/transport/model/DiscoveredDevice";
import { UnknownDeviceError } from "@internal/transport/model/Errors";
import { connectedDeviceStubBuilder } from "@internal/transport/model/InternalConnectedDevice.stub";
import { usbHidDeviceConnectionFactoryStubBuilder } from "@internal/transport/usb/service/UsbHidDeviceConnectionFactory.stub";
import { WebUsbHidTransport } from "@internal/transport/usb/transport/WebUsbHidTransport";
import { AxiosManagerApiDataSource } from "@internal/manager-api/data/AxiosManagerApiDataSource";
import { ManagerApiDataSource } from "@internal/manager-api/data/ManagerApiDataSource";
import { DefaultManagerApiService } from "@internal/manager-api/service/DefaultManagerApiService";
import { ManagerApiService } from "@internal/manager-api/service/ManagerApiService";
import { UnknownDeviceError } from "@internal/usb/model/Errors";
import { connectedDeviceStubBuilder } from "@internal/usb/model/InternalConnectedDevice.stub";
import { usbHidDeviceConnectionFactoryStubBuilder } from "@internal/usb/service/UsbHidDeviceConnectionFactory.stub";
import { WebUsbHidTransport } from "@internal/usb/transport/WebUsbHidTransport";

import { ConnectUseCase } from "./ConnectUseCase";

jest.mock("@internal/manager-api/data/AxiosManagerApiDataSource");

// TODO test several transports
let transports: WebUsbHidTransport[];
let logger: LoggerPublisherService;
let sessionService: DeviceSessionService;
let managerApi: ManagerApiService;
let managerApiDataSource: ManagerApiDataSource;
const fakeSessionId = "fakeSessionId";

describe("ConnectUseCase", () => {
  const stubDiscoveredDevice: DiscoveredDevice = {
    id: "",
    deviceModel: {} as InternalDeviceModel,
    transport: "USB",
  };
  const stubConnectedDevice = connectedDeviceStubBuilder({ id: "1" });
  const tag = "logger-tag";

  beforeAll(() => {
    logger = new DefaultLoggerPublisherService([], tag);
    jest.spyOn(uuid, "v4").mockReturnValue(fakeSessionId);
    transports = [
      new WebUsbHidTransport(
        {} as DeviceModelDataSource,
        () => logger,
        usbHidDeviceConnectionFactoryStubBuilder(),
      ),
    ];
    sessionService = new DefaultDeviceSessionService(() => logger);
    managerApiDataSource = new AxiosManagerApiDataSource({
      managerApiUrl: "http://fake.url",
    });
    managerApi = new DefaultManagerApiService(managerApiDataSource);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test("If connect use case encounter an error, return it", async () => {
    jest
      .spyOn(transports[0]!, "connect")
      .mockResolvedValue(Left(new UnknownDeviceError()));

    const usecase = new ConnectUseCase(
      transports,
      sessionService,
      () => logger,
      managerApi,
    );

    await expect(
      usecase.execute({ device: stubDiscoveredDevice }),
    ).rejects.toBeInstanceOf(UnknownDeviceError);
  });

  test("If connect is in success, return a deviceSession id", async () => {
    jest
      .spyOn(transports[0]!, "connect")
      .mockResolvedValue(Promise.resolve(Right(stubConnectedDevice)));

    const usecase = new ConnectUseCase(
      transports,
      sessionService,
      () => logger,
      managerApi,
    );

    const sessionId = await usecase.execute({
      device: stubDiscoveredDevice,
    });
    expect(sessionId).toBe(fakeSessionId);
  });
});
