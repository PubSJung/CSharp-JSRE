
/*
  Effyiexs CSharp-JavaScriptRuntimeEnvironment
  v0.0.1
*/

class CSNamespace {

  constructor() {
    this.namespaces = {};
    this.instances = {};
  }

  getEnvFromInstancePath(relativePath) {
    return this.getEnvFromRelativePath(relativePath, true);
  }

  getEnvFromRelativePath(relativePath, hasInstanceName) {

    const tokens = relativePath.split(".");

    var env = this;
    for(var i = 0; i < tokens.length - (hasInstanceName ? 1 : 0); i++)
    env = env.namespaces[tokens[i]];

    if(hasInstanceName) {
      return (env, tokens[tokens.length - 1]);
    } else return env;

  }

  getInstance(relativePath) {
    let (env, instanceName) = this.getEnvFromInstancePath(relativePath);
    return env.instances[instanceName];
  }

  pushInstance(relativePath, instanceObject) {
    let (env, instanceName) = this.getEnvFromInstancePath(relativePath);
    env.instances[instanceName] = instanceObject;
    env.instances[instanceName].setInstancePath(relativePath);
  }

}

class CSInstance {

  constructor(modifiers, type, value) {
    this.modifiers = modifiers;
    this.type = type;
    this.value = value;
  }

  setInstancePath(path) {
    this.instancePath = path;
    this.namespacePath = path.substring(0, path.lastIndexOf("."));
  }

  checkVisibility(accessPath) {
    return (
      this.modifiers.includes("public") // Any-Access
      || (this.modifiers.includes("private") && accessPath == this.instancePath) // Mainclass-Access
      || (this.modifiers.includes("protected") && accessPath == this.instancePath) // (TODO): Childclass-Access
      || (accessPath.startsWith(this.namespacePath)) // Namespace-Access
    );
  }

}

class CSClass extends CSInstance {

  constructor(modifiers) {
    super(modifiers, "class", {
      constructors: [],
      instances: {}
    });
  }

}

class CSFunction extends CSInstance {

  constructor(modifiers, params, body, returnType) {
    super(modifiers, returnType ? returnType : "void", body);
    this.body = body;
    this.params = params;
  } 

  call(accessPath, sender, params) {

    var paramStr = "";
    if(params && params.length > 0) {
      for(var i = 0; i < params.length; i++) 
      paramStr += params[i] + ", ";
      paramStr = paramStr.slice(0, -2);
    }

    if(sender || this.modifiers.includes("static")) // (TODO): Check if sender is valid
    if(this.checkVisibility(accessPath)) {
      var output;
      eval("output = this.value(" + paramStr + ");");
      return output;
    }

  }

}

class CSVariable extends CSInstance {

  constructor(modifiers, value, valueType) {
    super(modifiers, "variable", {
      type: valueType ? valueType : "var",
      value: value
    });
  }

  set(accessPath, value) {
    
    if(!(
      this.modifiers.includes("const")
      || (this.modifiers.includes("readonly") && typeof(CSRoot[accessPath]) != "")
    ))
    if(this.checkVisibility(accessPath))
    this.value = value;
  }

  get(accessPath) { 
    if(this.checkVisibility(accessPath))
    return this.value;
  }

}

const CSRoot = new CSNamespace();

String.prototype.equalsIgnoreCase = function(str) {
  return this.toLowerCase() == str.toLowerCase();
}

function isModifier(token) {
  return (
    token == "static"
    || token == "const"
    || token == "virtual"
    || token == "override"
    || token == "abstract"
    || token == "sealed"
    || token == "readonly"
    || token == "public"
    || token == "private"
    || token == "protected"
  );
}

window.addEventListener("load", () => {

  var mainFunctionPath = undefined;

  document.head
    .querySelectorAll("script[type=\"text/csharp\"]")
    .forEach(async script => {

    const code = (
      script.src != undefined && script.src.length > 0
      ? await (await fetch(script.src)).text()
      : script.innerHTML 
    );
    const tokens = code.split(" ");

    var latestNamespace = "";
    var declareNamespace = false;
    const latestEnvironment = () => {
      var env = CSRoot;
      latestNamespace.split(".").forEach(ns => {
        env = env.namespaces[ns];
      });  
      return env;
    };
    const initEnvironment = () => {
      var env = CSRoot;
      latestNamespace.split(".").forEach(ns => {
        if(!env.namespaces[ns])
          env.namespaces[ns] = new CSNamespace();
        env = env.namespaces[ns];
      });
    };   
    
    var latestInstance = {
      modifiers: [],
      type: undefined,
      name: undefined
    };

    tokens.forEach((token, t) => {

      token = token.trim();

      if(declareNamespace) {
        if(!mainFunctionPath && script.src) {
          mainClassName = script.src.substring(script.src.lastIndexOf("/") + 1, script.src.lastIndexOf("."));
          mainFunctionPath = (latestNamespace + '.' + mainClassName + ".Main");
        }
        latestNamespace = token.toLowerCase();
        initEnvironment();
        declareNamespace = false;
      } else if(token.equalsIgnoreCase("namespace"))
      declareNamespace = true;
      
    
    });

    document.head.removeChild(script);

  });

  if(mainFunctionPath) {
    var mainFunction = CSRoot.getInstance(mainFunctionPath);
    mainFunction.call(null, []);
  }

});
