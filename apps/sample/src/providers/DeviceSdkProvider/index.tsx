import React, { useCallback, useEffect, useState } from "react";
import { createContext, PropsWithChildren, useContext } from "react";
import {
  BuiltinTransports,
  ConsoleLogger,
  DeviceSdk,
  DeviceSdkBuilder,
  WebLogsExporterLogger,
} from "@ledgerhq/device-management-kit";

import { useMockServerContext } from "@/providers/MockServerProvider";

const webLogsExporterLogger = new WebLogsExporterLogger();

const defaultSdk = new DeviceSdkBuilder()
  .addLogger(new ConsoleLogger())
  .addTransport(BuiltinTransports.USB)
  .addLogger(webLogsExporterLogger)
  .build();

const SdkContext = createContext<DeviceSdk>(defaultSdk);

export const SdkProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const {
    state: { enabled: mockServerEnabled, url },
  } = useMockServerContext();
  const [sdk, setSdk] = useState<DeviceSdk>(defaultSdk);
  useEffect(() => {
    if (mockServerEnabled) {
      sdk.close();
      setSdk(
        new DeviceSdkBuilder()
          .addLogger(new ConsoleLogger())
          .addTransport(BuiltinTransports.MOCK_SERVER)
          .addConfig({ mockUrl: url })
          .build(),
      );
    } else {
      sdk.close();
      setSdk(defaultSdk);
    }
  }, [mockServerEnabled, url]);

  return <SdkContext.Provider value={sdk}>{children}</SdkContext.Provider>;
};

export const useSdk = (): DeviceSdk => {
  return useContext(SdkContext);
};

export function useExportLogsCallback() {
  return useCallback(() => {
    webLogsExporterLogger.exportLogsToJSON();
  }, []);
}
