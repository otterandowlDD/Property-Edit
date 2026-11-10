import {fileURLToPath} from "node:url";

// Keep build tracing inside the existing listing app, regardless of parent lockfiles.
export default {outputFileTracingRoot:fileURLToPath(new URL(".",import.meta.url))};
