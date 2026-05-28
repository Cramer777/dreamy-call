import { useEffect, useRef } from "react";
import * as DeepAR from "deepar";

export default function DeepARCamera({ filter }) {
  const canvasRef = useRef(null);
  const deepARRef = useRef(null);

  useEffect(() => {
    startDeepAR();

    return () => {
      if (deepARRef.current) {
        deepARRef.current.shutdown();
      }
    };
  }, [filter]);

  const startDeepAR = async () => {
    try {
      const deepARInstance = await DeepAR.initialize({
        licenseKey:
          "7629a976c738d0081423d56b69725b491c5300a833e168e2c63def914b90c63fc9d9cb97bf479fa0",

        canvas: canvasRef.current,
      });

      deepARRef.current = deepARInstance;

      await deepARInstance.startVideo();

      if (filter === "beauty") {
        await deepARInstance.switchEffect(
          0,
          "effect",
          "/effects/beauty.deepar"
        );
      }

      if (filter === "cool") {
        await deepARInstance.switchEffect(
          0,
          "effect",
          "/effects/glasses.deepar"
        );
      }

      if (filter === "dreamy") {
        await deepARInstance.switchEffect(
          0,
          "effect",
          "/effects/flower_face.deepar"
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-3xl"
      />
    </div>
  );
}