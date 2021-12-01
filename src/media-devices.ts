import {FilterStream} from './filter-stream';

// Ideally we'd use an editor or import shaders directly from the API.
import {distortedTV as shader} from './distorted-tv';
//import { moneyFilter as shader } from './money-filter.js';

function monkeyPatchMediaDevices() {
  const enumerateDevicesFn = MediaDevices.prototype.enumerateDevices;
  const getUserMediaFn = MediaDevices.prototype.getUserMedia;

  MediaDevices.prototype.enumerateDevices = async function () {
    const res = await enumerateDevicesFn.call(navigator.mediaDevices);
    // We could add "Virtual VHS" or "Virtual Median Filter" and map devices with filters.
    res.push({
      deviceId: 'virtual',
      groupId: 'uh',
      kind: 'videoinput',
      label: 'Virtual Chrome Webcam',
    } as MediaDeviceInfo);
    return res;
  };

  MediaDevices.prototype.getUserMedia = async function (...args) {
    console.log(args[0]);
    const constraints = args[0] as MediaStreamConstraints;
    if (
      args.length &&
      constraints.video &&
      (constraints.video as MediaTrackConstraints).deviceId
    ) {
      if (
        (constraints.video as MediaTrackConstraints).deviceId === 'virtual' ||
        ((constraints.video as MediaTrackConstraints).deviceId as any).exact ===
          'virtual'
      ) {
        // This constraints could mimick closely the request.
        // Also, there could be a preferred webcam on the options.
        // Right now it defaults to the predefined input.
        const constraints2: MediaStreamConstraints = {
          video: {
            facingMode: (constraints.video as MediaTrackConstraints).facingMode,
            advanced: (constraints.video as MediaTrackConstraints).advanced,
            width: (constraints.video as MediaTrackConstraints).width,
            height: (constraints.video as MediaTrackConstraints).height,
          },
          audio: false,
        };
        const res = await getUserMediaFn.call(
          navigator.mediaDevices,
          constraints2
        );
        if (res) {
          const filter = new FilterStream(res, shader);
          return filter.outputStream;
        }
      }
    }
    const res = await getUserMediaFn.call(navigator.mediaDevices, ...args);
    return res;
  };

  console.log('VIRTUAL WEBCAM INSTALLED.');
}

export {monkeyPatchMediaDevices};
