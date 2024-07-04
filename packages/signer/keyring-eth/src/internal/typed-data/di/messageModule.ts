import { ContainerModule } from "inversify";

import { typedDataTypes } from "@internal/typed-data/di/typedDataTypes";
import { SignTypedDataUseCase } from "@internal/typed-data/use-case/SignTypedDataUseCase";

export const typedDataModuleFactory = () =>
  new ContainerModule(
    (
      bind,
      _unbind,
      _isBound,
      _rebind,
      _unbindAsync,
      _onActivation,
      _onDeactivation,
    ) => {
      bind(typedDataTypes.SignTypedDataUseCase).to(SignTypedDataUseCase);
    },
  );
