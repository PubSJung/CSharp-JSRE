
import init from "./bindings.js";

const runCSRuntimeEnv = async () => {

  console.log("Initializing CSharp-Environment...");
  const env = await init("./environment.wasm");

  // (TODO) Interactions

  console.log("CSharp-Environment is now up & running!");

};

window.addEventListener("load", runCSRuntimeEnv);
