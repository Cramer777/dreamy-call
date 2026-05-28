import { useEffect, useRef } from "react";
import DeepAR from "deepar";

export default function DeepARCamera({ filter }) {
  const canvasRef = useRef(null);
  const deeparRef = useRef(null);

  useEffect(() => {
    async function startDeepAR() {
      const deepar = await DeepAR.initialize({
  licenseKey: "7629a976c738d0081423d56b69725b491c5300a833e168e2c63def914b90c63fc9d9cb97bf479fa0",

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

      await deeparRef.current.switchEffect(0, "none");
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