import { inject, injectable } from "inversify";

import { Command } from "@api/command/Command";
import { deviceSessionTypes } from "@internal/device-session/di/deviceSessionTypes";
import type { DeviceSessionService } from "@internal/device-session/service/DeviceSessionService";
import { loggerTypes } from "@internal/logger-publisher/di/loggerTypes";
import { LoggerPublisherService } from "@internal/logger-publisher/service/LoggerPublisherService";

export type SendCommandUseCaseArgs<T, U = void> = {
  /**
   * The device session id.
   */
  sessionId: string;
  /**
   * The command to send.
   */
  command: Command<T, U>;
  /**
   * The parameters of the command.
   */
  params: U;
};

/**
 * Sends a command to a device through a device session.
 */
@injectable()
export class SendCommandUseCase {
  private readonly _sessionService: DeviceSessionService;
  private readonly _logger: LoggerPublisherService;
  constructor(
    @inject(deviceSessionTypes.DeviceSessionService)
    sessionService: DeviceSessionService,
    @inject(loggerTypes.LoggerPublisherServiceFactory)
    loggerFactory: (tag: string) => LoggerPublisherService,
  ) {
    this._sessionService = sessionService;
    this._logger = loggerFactory("SendCommandUseCase");
  }

  /**
   * Sends a command to a device through a device session.
   *
   * @param sessionId - The device session id.
   * @param command - The command to send.
   * @param params - The parameters of the command.
   * @returns The response from the command.
   */
  async execute<T, U = void>({
    sessionId,
    command,
    params,
  }: SendCommandUseCaseArgs<T, U>): Promise<T> {
    const deviceSessionOrError =
      this._sessionService.getDeviceSessionById(sessionId);

    return deviceSessionOrError.caseOf({
      // Case device session found
      Right: async (deviceSession) => {
        const deviceModelId = deviceSession.connectedDevice.deviceModel.id;
        const action = deviceSession.getCommand<T, U>(command);
        return await action(deviceModelId, params);
      },
      // Case device session not found
      Left: (error) => {
        this._logger.error("Error getting session", {
          data: { error },
        });
        throw error;
      },
    });
  }
}
