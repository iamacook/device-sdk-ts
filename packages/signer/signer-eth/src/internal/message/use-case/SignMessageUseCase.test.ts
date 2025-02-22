import { type EthAppBinder } from "@internal/app-binder/EthAppBinder";

import { SignMessageUseCase } from "./SignMessageUseCase";

describe("SignMessageUseCase", () => {
  it("should call signPersonalMessage on appBinder with the correct arguments", () => {
    // Given
    const derivationPath = "44'/60'/0'/0/0";
    const message = "Hello world";
    const appBinder = {
      signPersonalMessage: jest.fn(),
    };
    const signMessageUseCase = new SignMessageUseCase(
      appBinder as unknown as EthAppBinder,
    );

    // When
    signMessageUseCase.execute(derivationPath, message);

    // Then
    expect(appBinder.signPersonalMessage).toHaveBeenCalledWith({
      derivationPath,
      message,
    });
  });
});
