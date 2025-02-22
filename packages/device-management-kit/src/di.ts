import { Container } from "inversify";

// Uncomment this line to enable the logger middleware
// import { makeLoggerMiddleware } from "inversify-logger-middleware";
import { commandModuleFactory } from "@api/command/di/commandModule";
import { deviceActionModuleFactory } from "@api/device-action/di/deviceActionModule";
// Uncomment this line to enable the logger middleware
// import { makeLoggerMiddleware } from "inversify-logger-middleware";
import { type DmkConfig } from "@api/DmkConfig";
import { type LoggerSubscriberService } from "@api/logger-subscriber/service/LoggerSubscriberService";
import { type Transport } from "@api/transport/model/Transport";
import { type BuiltinTransports } from "@api/transport/model/TransportIdentifier";
import { configModuleFactory } from "@internal/config/di/configModule";
import { deviceModelModuleFactory } from "@internal/device-model/di/deviceModelModule";
import { deviceSessionModuleFactory } from "@internal/device-session/di/deviceSessionModule";
import { discoveryModuleFactory } from "@internal/discovery/di/discoveryModule";
import { loggerModuleFactory } from "@internal/logger-publisher/di/loggerModule";
import { managerApiModuleFactory } from "@internal/manager-api/di/managerApiModule";
import {
  DEFAULT_MANAGER_API_BASE_URL,
  DEFAULT_MOCK_SERVER_BASE_URL,
} from "@internal/manager-api/model/Const";
import { sendModuleFactory } from "@internal/send/di/sendModule";
import { transportModuleFactory } from "@internal/transport//di/transportModule";
import { bleModuleFactory } from "@internal/transport/ble/di/bleModule";
import { usbModuleFactory } from "@internal/transport/usb/di/usbModule";

// Uncomment this line to enable the logger middleware
// const logger = makeLoggerMiddleware();

export type MakeContainerProps = {
  stub: boolean;
  transports: BuiltinTransports[];
  customTransports: Transport[];
  loggers: LoggerSubscriberService[];
  config: DmkConfig;
};

export const makeContainer = ({
  stub = false,
  transports = [],
  customTransports = [],
  loggers = [],
  config = {
    managerApiUrl: DEFAULT_MANAGER_API_BASE_URL,
    mockUrl: DEFAULT_MOCK_SERVER_BASE_URL,
  },
}: Partial<MakeContainerProps>) => {
  const container = new Container();

  // Uncomment this line to enable the logger middleware
  // container.applyMiddleware(logger);

  container.load(
    configModuleFactory({ stub }),
    deviceModelModuleFactory({ stub }),
    transportModuleFactory({ stub, transports, customTransports, config }),
    usbModuleFactory({ stub }),
    managerApiModuleFactory({ stub, config }),
    discoveryModuleFactory({ stub }),
    loggerModuleFactory({ subscribers: loggers }),
    deviceSessionModuleFactory({ stub }),
    sendModuleFactory({ stub }),
    commandModuleFactory({ stub }),
    deviceActionModuleFactory({ stub }),
    bleModuleFactory(),
    // modules go here
  );

  return container;
};
