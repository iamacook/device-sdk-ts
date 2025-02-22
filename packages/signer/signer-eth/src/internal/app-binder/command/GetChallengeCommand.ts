// https://github.com/LedgerHQ/app-ethereum/blob/develop/doc/ethapp.adoc#get-challenge
import {
  type Apdu,
  ApduBuilder,
  type ApduBuilderArgs,
  ApduParser,
  type ApduResponse,
  type Command,
  type CommandResult,
  CommandResultFactory,
  CommandUtils,
  GlobalCommandErrorHandler,
  InvalidStatusWordError,
} from "@ledgerhq/device-management-kit";

const CHALLENGE_LENGTH = 4;

export type GetChallengeCommandResponse = {
  challenge: string;
};

export class GetChallengeCommand
  implements Command<GetChallengeCommandResponse>
{
  constructor() {}

  getApdu(): Apdu {
    const getChallengeArgs: ApduBuilderArgs = {
      cla: 0xe0,
      ins: 0x20,
      p1: 0x00,
      p2: 0x00,
    };
    return new ApduBuilder(getChallengeArgs).build();
  }

  parseResponse(
    response: ApduResponse,
  ): CommandResult<GetChallengeCommandResponse> {
    if (!CommandUtils.isSuccessResponse(response)) {
      return CommandResultFactory({
        error: GlobalCommandErrorHandler.handle(response),
      });
    }

    const parser = new ApduParser(response);

    if (parser.testMinimalLength(CHALLENGE_LENGTH) === false) {
      return CommandResultFactory({
        error: new InvalidStatusWordError("Challenge key is missing"),
      });
    }

    const challenge = parser.encodeToHexaString(
      parser.extractFieldByLength(CHALLENGE_LENGTH),
    );

    return CommandResultFactory({
      data: {
        challenge,
      },
    });
  }
}
