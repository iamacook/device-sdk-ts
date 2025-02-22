import { injectable, multiInject } from "inversify";
import { from, map, merge, Observable, scan } from "rxjs";

import { DeviceModel } from "@api/device/DeviceModel";
import type { Transport } from "@api/transport/model/Transport";
import { DiscoveredDevice } from "@api/types";
import { transportDiTypes } from "@internal/transport/di/transportDiTypes";
import { InternalDiscoveredDevice } from "@internal/transport/model/InternalDiscoveredDevice";

/**
 * Listen to list of known discovered devices (and later BLE).
 */
@injectable()
export class ListenToKnownDevicesUseCase {
  private readonly _transports: Transport[];
  constructor(
    @multiInject(transportDiTypes.Transport)
    transports: Transport[],
  ) {
    this._transports = transports;
  }

  private mapInternalDiscoveredDeviceToDiscoveredDevice(
    discoveredDevice: InternalDiscoveredDevice,
  ): DiscoveredDevice {
    return {
      id: discoveredDevice.id,
      deviceModel: new DeviceModel({
        id: discoveredDevice.id,
        model: discoveredDevice.deviceModel.id,
        name: discoveredDevice.deviceModel.productName,
      }),
      transport: discoveredDevice.transport,
    };
  }

  execute(): Observable<DiscoveredDevice[]> {
    if (this._transports.length === 0) {
      return from([[]]);
    }

    /**
     * Note: we're not using combineLatest because combineLatest will
     * - wait for all observables to emit at least once before emitting.
     * - complete as soon as one of the observables completes.
     * Some transports will just return an empty array and complete.
     * We want to keep listening to all transports until all have completed.
     */

    const observablesWithIndex = this._transports.map((transport, index) =>
      transport.listenToKnownDevices().pipe(
        map((arr) => ({
          index,
          arr,
        })),
      ),
    );

    return merge(...observablesWithIndex).pipe(
      scan(
        (acc, { index, arr }) => {
          acc[index] = arr;
          return acc;
        },
        {} as { [key: number]: Array<InternalDiscoveredDevice> },
      ),
      map((acc) =>
        Object.values(acc)
          .flat()
          .map(this.mapInternalDiscoveredDeviceToDiscoveredDevice),
      ),
    );
  }
}
