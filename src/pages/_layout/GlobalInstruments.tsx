import React from "react";
import PerfSampler from "../../sections/telemetry/PerfSampler";
import TokenOverlay from "../../sections/telemetry/TokenOverlay";
import { useTelemetry } from "../../state/telemetry";

export default function GlobalInstruments() {
  const { flags } = useTelemetry();
  return (
    <>
      <PerfSampler />
      {flags.tokenOverlay && <TokenOverlay />}
    </>
  );
}
