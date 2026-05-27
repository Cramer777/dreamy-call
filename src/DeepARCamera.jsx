import { useEffect, useRef } from "react";
import * as deepar from "deepar";

export default function DeepARCamera({ filter }) {
  const canvasRef = useRef(null);
  const deeparRef = useRef(null);

  useEffect(() => {
    async function startDeepAR() {
      deeparRef.current = await deepar.initialize({
        licenseKey: "78233afe8812c6bef7ebde891b5ca6c041d7efddcfcb3b7835d5ad91e072c9d16b6661e09133b36e",

        canvas: canvasRef.current,

        rootPath:
          "https://cdn.jsdelivr.net/npm/deepar@latest/",

        effect:
          "https://cdn.jsdelivr.net/npm/deepar@latest/effects/aviators",

        additionalOptions: {
          cameraConfig: {
            facingMode: "user",
          },
        },
      });

      await deeparRef.current.startVideo(true);
    }

    startDeepAR();

    return () => {
      if (deeparRef.current) {
        deeparRef.current.shutdown();
      }
    };
  }, []);

  useEffect(() => {
    if (!deeparRef.current) return;

    let effectURL = "";

    if (filter === "normal") {
  effectURL =
    "https://cdn.jsdelivr.net/npm/deepar@latest/effects/aviators";
}

if (filter === "beauty") {
  effectURL =
    "https://cdn.jsdelivr.net/npm/deepar@latest/effects/flower_face";
}

if (filter === "soft") {
  effectURL =
    "https://cdn.jsdelivr.net/npm/deepar@latest/effects/Hope";
}

if (filter === "glow") {
  effectURL =
    "https://cdn.jsdelivr.net/npm/deepar@latest/effects/MakeupLook";
}

    deeparRef.current.switchEffect(0, effectURL);
  }, [filter]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={450}
      className="w-[320px] h-[450px] rounded-[30px] bg-black"
    />
  );
}