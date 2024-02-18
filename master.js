
const isCSharpSupported = (() => {
  try {
      if (
        typeof WebAssembly === "object"
        && typeof WebAssembly.instantiate === "function"
      ) {
          const module = new WebAssembly.Module (
            Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
          );
          if(module instanceof WebAssembly.Module) {
            const instance = new WebAssembly.Instance(module);
            return instance instanceof WebAssembly.Instance;
          }
      }
  } catch (e) {
      console.log(e);
  }
  return false;
})();

console.log("CSharp-Support: " + (isCSharpSupported ? "yes" : "no") + "!");
if(isCSharpSupported) {
  const csRuntimeInitialize = document.createElement("script");
  csRuntimeInitialize.type = "module";
  csRuntimeInitialize.src = "./initialize.js";
  document.head.appendChild(csRuntimeInitialize);
}
