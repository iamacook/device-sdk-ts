import {
  type DeviceManagementKit,
  type DeviceSessionId,
} from "@ledgerhq/device-management-kit";
import { type Container } from "inversify";

import { type GetAddressDAReturnType } from "@api/app-binder/GetAddressDeviceActionTypes";
import { type GetAppConfigurationDAReturnType } from "@api/app-binder/GetAppConfigurationDeviceActionTypes";
import { type SignMessageDAReturnType } from "@api/app-binder/SignMessageDeviceActionTypes";
import { type SignTransactionDAReturnType } from "@api/app-binder/SignTransactionDeviceActionTypes";
import { type AddressOptions } from "@api/model/AddressOption";
import { type Transaction } from "@api/model/Transaction";
import { type TransactionOptions } from "@api/model/TransactionOptions";
import { type SignerSolana } from "@api/SignerSolana";

import { type GetAddressUseCase } from "./use-cases/address/GetAddressUseCase";
import { type GetAppConfigurationUseCase } from "./use-cases/app-configuration/GetAppConfigurationUseCase";
import { useCasesTypes } from "./use-cases/di/useCasesTypes";
import { makeContainer } from "./di";

export type DefaultSignerSolanaConstructorArgs = {
  dmk: DeviceManagementKit;
  sessionId: DeviceSessionId;
};

export class DefaultSignerSolana implements SignerSolana {
  private _container: Container;

  constructor({ dmk, sessionId }: DefaultSignerSolanaConstructorArgs) {
    this._container = makeContainer({ dmk, sessionId });
  }

  signTransaction(
    _derivationPath: string,
    _transaction: Transaction,
    _options?: TransactionOptions,
  ): SignTransactionDAReturnType {
    return {} as SignTransactionDAReturnType;
  }

  signMessage(
    _derivationPath: string,
    _message: string,
  ): SignMessageDAReturnType {
    return {} as SignMessageDAReturnType;
  }

  getAddress(
    derivationPath: string,
    options?: AddressOptions,
  ): GetAddressDAReturnType {
    return this._container
      .get<GetAddressUseCase>(useCasesTypes.GetAddressUseCase)
      .execute(derivationPath, options);
  }

  getAppConfiguration(): GetAppConfigurationDAReturnType {
    return this._container
      .get<GetAppConfigurationUseCase>(useCasesTypes.GetAppConfigurationUseCase)
      .execute();
  }
}
