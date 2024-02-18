#!/bin/bash
wasm-pack build --target web
cp "pkg/sjung_cs_jsre_bg.wasm" "../environment.wasm"
cp "pkg/sjung_cs_jsre.js" "../bindings.js"
rm -rf "pkg"
