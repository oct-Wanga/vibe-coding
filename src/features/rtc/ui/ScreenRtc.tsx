"use client";

import { useRef } from "react";

export function ScreenRtc() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleSetScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: 30,
          cursor: "always",
        },
        audio: true, // 시스템 사운드 (OS/브라우저 제약 있음)
      });
      console.log("screenStreamscreenStream", screenStream);

      const pc = new RTCPeerConnection();

      videoRef.current!.srcObject = screenStream;

      screenStream.getTracks().forEach((track) => {
        pc.addTrack(track, screenStream);
      });

      console.log("pc", pc);
      console.log(pc.ontrack);

      pc.ontrack = (event) => {
        console.log("??Dsadad");
        if (videoRef.current) {
          console.log("??");
          videoRef.current.srcObject = event.streams[0];
        }
      };
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-2">
      <button className="rounded bg-black px-3 py-2 text-sm text-white" onClick={handleSetScreen}>
        Share Screen
      </button>
      <video ref={videoRef} autoPlay playsInline />
    </div>
  );
}
