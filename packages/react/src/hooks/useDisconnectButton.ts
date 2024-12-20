import { setupDisconnectButton } from '@cc-livekit/components-core';
import { ConnectionState } from 'livekit-client';
import * as React from 'react';
import type { DisconnectButtonProps } from '../components';
import { useFeatureContext, useRoomContext } from '../context';
import { mergeProps } from '../mergeProps';
import { useConnectionState } from './useConnectionStatus';

/**
 * The `useDisconnectButton` hook is used to implement the `DisconnectButton` or your
 * custom implementation of it. It adds onClick handler to the button to disconnect
 * from the room.
 *
 * @example
 * ```tsx
 * const { buttonProps } = useDisconnectButton(buttonProps);
 * return <button {...buttonProps}>Disconnect</button>;
 * ```
 * @public
 */
export function useDisconnectButton(props: DisconnectButtonProps) {
  const room = useRoomContext();
  const connectionState = useConnectionState(room);
  const featureFlags = useFeatureContext();

  const buttonProps = React.useMemo(() => {
    const { className, disconnect } = setupDisconnectButton(room);
    const mergedProps = mergeProps(props, {
      className,
      onClick: async () => {
        if (featureFlags?.onHangup) {
          await featureFlags?.onHangup?.();
        } else {
          disconnect(props.stopTracks ?? true);
        }
      },
      disabled: connectionState === ConnectionState.Disconnected,
    });
    return mergedProps;
  }, [room, props, connectionState]);

  return { buttonProps };
}
