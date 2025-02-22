import {
  type DeviceManagementKit,
  type DeviceSessionId,
} from "@ledgerhq/device-management-kit";
import { Container } from "inversify";

// import { makeLoggerMiddleware } from "inversify-logger-middleware";
import { appBinderModuleFactory } from "./app-binder/di/appBinderModule";
import { useCasesModuleFactory } from "./use-cases/di/useCasesModule";
import { externalTypes } from "./externalTypes";

// Uncomment this line to enable the logger middleware
// const logger = makeLoggerMiddleware();

export type MakeContainerProps = {
  dmk: DeviceManagementKit;
  sessionId: DeviceSessionId;
};
export const makeContainer = ({ dmk, sessionId }: MakeContainerProps) => {
  const container = new Container();

  // Uncomment this line to enable the logger middleware
  // container.applyMiddleware(logger);

  container.bind<DeviceManagementKit>(externalTypes.Dmk).toConstantValue(dmk);
  container
    .bind<DeviceSessionId>(externalTypes.SessionId)
    .toConstantValue(sessionId);

  container.load(appBinderModuleFactory(), useCasesModuleFactory());

  return container;
};
