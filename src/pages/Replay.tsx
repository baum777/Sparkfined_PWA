import { Navigate, useLocation } from "react-router-dom";

/**
 * /replay and /chart/replay redirect to /chart with replay mode enabled
 * Preserves query parameters and hash
 */
export default function Replay() {
  const { search, hash } = useLocation();
  const searchParams = new URLSearchParams(search);
  searchParams.set("replay", "true");
  
  return <Navigate to={`/chart?${searchParams.toString()}${hash}`} replace />;
}
