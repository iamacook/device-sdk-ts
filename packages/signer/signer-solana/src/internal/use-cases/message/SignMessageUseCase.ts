import { inject, injectable } from "inversify";

import { SignMessageDAReturnType } from "@api/app-binder/SignMessageDeviceActionTypes";
import { appBinderTypes } from "@internal/app-binder/di/appBinderTypes";
import { type SolanaAppBinder } from "@internal/app-binder/SolanaAppBinder";

@injectable()
export class SignMessageUseCase {
  private _appBinding: SolanaAppBinder;

  constructor(
    @inject(appBinderTypes.AppBinder)
    appBinding: SolanaAppBinder,
  ) {
    this._appBinding = appBinding;
  }

  execute(derivationPath: string, message: string): SignMessageDAReturnType {
    return this._appBinding.signMessage({
      derivationPath,
      message,
    });
  }
}
