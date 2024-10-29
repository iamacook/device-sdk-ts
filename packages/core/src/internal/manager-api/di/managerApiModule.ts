import { ContainerModule } from "inversify";

import { type SdkConfig } from "@api/SdkConfig";
import { AxiosManagerApiDataSource } from "@internal/manager-api/data/AxiosManagerApiDataSource";
import { DefaultManagerApiService } from "@internal/manager-api/service/DefaultManagerApiService";
import { StubUseCase } from "@root/src/di.stub";

import { managerApiTypes } from "./managerApiTypes";

type FactoryProps = {
  stub?: boolean;
  config: SdkConfig;
};

export const managerApiModuleFactory = ({ stub, config }: FactoryProps) =>
  new ContainerModule((bind, _unbind, _isBound, rebind) => {
    bind(managerApiTypes.SdkConfig).toConstantValue(config);

    bind(managerApiTypes.ManagerApiDataSource).to(AxiosManagerApiDataSource);
    bind(managerApiTypes.ManagerApiService).to(DefaultManagerApiService);

    if (stub) {
      rebind(managerApiTypes.ManagerApiDataSource).to(StubUseCase);
      rebind(managerApiTypes.ManagerApiService).to(StubUseCase);
    }
  });
