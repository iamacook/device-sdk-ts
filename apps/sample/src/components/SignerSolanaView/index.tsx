import React, { useMemo } from "react";
import {
  type GetAddressDAError,
  type GetAddressDAIntermediateValue,
  type GetAddressDAOutput,
  type GetAppConfigurationDAError,
  type GetAppConfigurationDAIntermediateValue,
  type GetAppConfigurationDAOutput,
  SignerSolanaBuilder,
  type SignMessageDAError,
  type SignMessageDAIntermediateValue,
  type SignMessageDAOutput,
} from "@ledgerhq/device-signer-kit-solana";

import { DeviceActionsList } from "@/components/DeviceActionsView/DeviceActionsList";
import { type DeviceActionProps } from "@/components/DeviceActionsView/DeviceActionTester";
import { useDmk } from "@/providers/DeviceManagementKitProvider";

const DEFAULT_DERIVATION_PATH = "44'/501'";

export const SignerSolanaView: React.FC<{ sessionId: string }> = ({
  sessionId,
}) => {
  const dmk = useDmk();
  const signer = new SignerSolanaBuilder({ dmk, sessionId }).build();

  const deviceModelId = dmk.getConnectedDevice({
    sessionId,
  }).modelId;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deviceActions: DeviceActionProps<any, any, any, any>[] = useMemo(
    () => [
      {
        title: "Get address",
        description:
          "Perform all the actions necessary to get a Solana address from the device",
        executeDeviceAction: ({ derivationPath, checkOnDevice }) => {
          return signer.getAddress(derivationPath, {
            checkOnDevice,
          });
        },
        initialValues: {
          derivationPath: DEFAULT_DERIVATION_PATH,
          checkOnDevice: false,
        },
        deviceModelId,
      } satisfies DeviceActionProps<
        GetAddressDAOutput,
        {
          derivationPath: string;
          checkOnDevice?: boolean;
        },
        GetAddressDAError,
        GetAddressDAIntermediateValue
      >,
      {
        title: "Sign off chain message",
        description:
          "Perform all the actions necessary to sign an off chain message with Solana app",
        executeDeviceAction: ({ derivationPath, message }) => {
          if (!signer) {
            throw new Error("Signer not initialized");
          }
          return signer.signMessage(derivationPath, message);
        },
        initialValues: {
          derivationPath: "44'/60'/0'/0/0",
          message: "Hello World",
        },
        deviceModelId,
      } satisfies DeviceActionProps<
        SignMessageDAOutput,
        {
          derivationPath: string;
          message: string;
        },
        SignMessageDAError,
        SignMessageDAIntermediateValue
      >,
      {
        title: "Sign off chain message",
        description:
          "Perform all the actions necessary to sign an off chain message with Solana app",
        executeDeviceAction: ({ derivationPath, message }) => {
          if (!signer) {
            throw new Error("Signer not initialized");
          }
          return signer.signMessage(derivationPath, message);
        },
        initialValues: {
          derivationPath: "44'/60'/0'/0/0",
          message: "Hello World",
        },
        deviceModelId,
      } satisfies DeviceActionProps<
        SignMessageDAOutput,
        {
          derivationPath: string;
          message: string;
        },
        SignMessageDAError,
        SignMessageDAIntermediateValue
      >,
    ],
    [deviceModelId, signer],
  );

  return (
    <DeviceActionsList title="Solana Signer" deviceActions={deviceActions} />
  );
};
