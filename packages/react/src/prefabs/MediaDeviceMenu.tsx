import { computeMenuPosition, wasClickOutside } from '@cc-livekit/components-core';
import * as React from 'react';
import { MediaDeviceSelect } from '../components/controls/MediaDeviceSelect';
import { log } from '@cc-livekit/components-core';
import type { LocalAudioTrack, LocalVideoTrack } from 'livekit-client';

/** @public */
export interface MediaDeviceMenuProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: MediaDeviceKind;
  initialSelection?: string;
  onActiveDeviceChange?: (kind: MediaDeviceKind, deviceId: string) => void;
  tracks?: Partial<Record<MediaDeviceKind, LocalAudioTrack | LocalVideoTrack | undefined>>;
  /**
   * this will call getUserMedia if the permissions are not yet given to enumerate the devices with device labels.
   * in some browsers multiple calls to getUserMedia result in multiple permission prompts.
   * It's generally advised only flip this to true, once a (preview) track has been acquired successfully with the
   * appropriate permissions.
   *
   * @see {@link PreJoin}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices | MDN enumerateDevices}
   */
  requestPermissions?: boolean;
}

/**
 * The `MediaDeviceMenu` component is a button that opens a menu that lists
 * all media devices and allows the user to select them.
 *
 * @remarks
 * This component is implemented with the `MediaDeviceSelect` LiveKit components.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <MediaDeviceMenu />
 * </LiveKitRoom>
 * ```
 * @public
 */
export function MediaDeviceMenu({
  kind,
  initialSelection,
  onActiveDeviceChange,
  tracks,
  requestPermissions = false,
  ...props
}: MediaDeviceMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [devices, setDevices] = React.useState<MediaDeviceInfo[]>([]);
  const [updateRequired, setUpdateRequired] = React.useState<boolean>(true);
  const [needPermissions, setNeedPermissions] = React.useState(requestPermissions);

  const handleActiveDeviceChange = (kind: MediaDeviceKind, deviceId: string) => {
    log.debug('handle device change');
    setIsOpen(false);
    onActiveDeviceChange?.(kind, deviceId);
  };

  const button = React.useRef<HTMLButtonElement>(null);
  const tooltip = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (isOpen) {
      setNeedPermissions(true);
    }
  }, [isOpen]);

  React.useLayoutEffect(() => {
    if (button.current && tooltip.current && (devices || updateRequired)) {
      computeMenuPosition(button.current, tooltip.current).then(({ x, y }) => {
        if (tooltip.current) {
          Object.assign(tooltip.current.style, { left: `${x}px`, top: `${y}px` });
        }
      });
    }
    setUpdateRequired(false);
  }, [button, tooltip, devices, updateRequired]);

  const handleClickOutside = React.useCallback(
    (event: MouseEvent) => {
      if (!tooltip.current) {
        return;
      }
      if (event.target === button.current) {
        return;
      }
      if (isOpen && wasClickOutside(tooltip.current, event)) {
        setIsOpen(false);
      }
    },
    [isOpen, tooltip, button],
  );

  React.useEffect(() => {
    document.addEventListener<'click'>('click', handleClickOutside);
    window.addEventListener<'resize'>('resize', () => setUpdateRequired(true));
    return () => {
      document.removeEventListener<'click'>('click', handleClickOutside);
      window.removeEventListener<'resize'>('resize', () => setUpdateRequired(true));
    };
  }, [handleClickOutside, setUpdateRequired]);

  return (
    <>
      <button
        className="lk-button lk-button-menu"
        aria-pressed={isOpen}
        {...props}
        onClick={() => setIsOpen(!isOpen)}
        ref={button}
      >
        {props.children}
      </button>
      {/** only render when enabled in order to make sure that the permissions are requested only if the menu is enabled */}
      {!props.disabled && (
        <div
          className="lk-device-menu"
          ref={tooltip}
          style={{ visibility: isOpen ? 'visible' : 'hidden' }}
        >
          {kind ? (
            kind === 'audioinput' ? (
              <div>
                <p
                  style={{
                    textAlign: 'left',
                    paddingLeft: 16,
                    color: '#878787',
                  }}
                >
                  Microphone
                </p>
                <MediaDeviceSelect
                  initialSelection={initialSelection}
                  onActiveDeviceChange={(deviceId) =>
                    handleActiveDeviceChange('audioinput', deviceId)
                  }
                  onDeviceListChange={setDevices}
                  kind={'audioinput'}
                  track={tracks?.['audioinput']}
                  requestPermissions={needPermissions}
                />
                <p
                  style={{
                    textAlign: 'left',
                    paddingLeft: 16,
                    color: '#878787',
                    marginTop: 4,
                  }}
                >
                  Speakers
                </p>
                <MediaDeviceSelect
                  initialSelection={initialSelection}
                  onActiveDeviceChange={(deviceId) =>
                    handleActiveDeviceChange('audiooutput', deviceId)
                  }
                  onDeviceListChange={setDevices}
                  kind={'audiooutput'}
                  track={tracks?.['audiooutput']}
                  requestPermissions={needPermissions}
                />
              </div>
            ) : (
              <MediaDeviceSelect
                initialSelection={initialSelection}
                onActiveDeviceChange={(deviceId) => handleActiveDeviceChange(kind, deviceId)}
                onDeviceListChange={setDevices}
                kind={kind}
                track={tracks?.[kind]}
                requestPermissions={needPermissions}
              />
            )
          ) : (
            <>
              <div className="lk-device-menu-heading">Audio inputs</div>
              <MediaDeviceSelect
                kind="audioinput"
                onActiveDeviceChange={(deviceId) =>
                  handleActiveDeviceChange('audioinput', deviceId)
                }
                onDeviceListChange={setDevices}
                track={tracks?.audioinput}
                requestPermissions={needPermissions}
              />
              <div className="lk-device-menu-heading">Video inputs</div>
              <MediaDeviceSelect
                kind="videoinput"
                onActiveDeviceChange={(deviceId) =>
                  handleActiveDeviceChange('videoinput', deviceId)
                }
                onDeviceListChange={setDevices}
                track={tracks?.videoinput}
                requestPermissions={needPermissions}
              />
            </>
          )}
        </div>
      )}
    </>
  );
}
