(()=>{"use strict";var t={865:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.distortedTV=void 0,e.distortedTV="\n// change these values to 0.0 to turn off individual effects\nfloat vertJerkOpt = 1.0;\nfloat vertMovementOpt = 1.0;\nfloat bottomStaticOpt = 1.0;\nfloat scalinesOpt = 1.0;\nfloat rgbOffsetOpt = 1.0;\nfloat horzFuzzOpt = 1.0;\n\n// Noise generation functions borrowed from: \n// https://github.com/ashima/webgl-noise/blob/master/src/noise2D.glsl\n\nvec3 mod289(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec2 mod289(vec2 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec3 permute(vec3 x) {\n  return mod289(((x*34.0)+1.0)*x);\n}\n\nfloat snoise(vec2 v)\n  {\n  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0\n                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)\n                     -0.577350269189626,  // -1.0 + 2.0 * C.x\n                      0.024390243902439); // 1.0 / 41.0\n// First corner\n  vec2 i  = floor(v + dot(v, C.yy) );\n  vec2 x0 = v -   i + dot(i, C.xx);\n\n// Other corners\n  vec2 i1;\n  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0\n  //i1.y = 1.0 - i1.x;\n  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n  // x0 = x0 - 0.0 + 0.0 * C.xx ;\n  // x1 = x0 - i1 + 1.0 * C.xx ;\n  // x2 = x0 - 1.0 + 2.0 * C.xx ;\n  vec4 x12 = x0.xyxy + C.xxzz;\n  x12.xy -= i1;\n\n// Permutations\n  i = mod289(i); // Avoid truncation effects in permutation\n  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))\n\t\t+ i.x + vec3(0.0, i1.x, 1.0 ));\n\n  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);\n  m = m*m ;\n  m = m*m ;\n\n// Gradients: 41 points uniformly over a line, mapped onto a diamond.\n// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)\n\n  vec3 x = 2.0 * fract(p * C.www) - 1.0;\n  vec3 h = abs(x) - 0.5;\n  vec3 ox = floor(x + 0.5);\n  vec3 a0 = x - ox;\n\n// Normalise gradients implicitly by scaling m\n// Approximation of: m *= inversesqrt( a0*a0 + h*h );\n  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );\n\n// Compute final noise value at P\n  vec3 g;\n  g.x  = a0.x  * x0.x  + h.x  * x0.y;\n  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\n  return 130.0 * dot(m, g);\n}\n\nfloat staticV(vec2 uv) {\n    float staticHeight = snoise(vec2(9.0,iTime*1.2+3.0))*0.3+5.0;\n    float staticAmount = snoise(vec2(1.0,iTime*1.2-6.0))*0.1+0.3;\n    float staticStrength = snoise(vec2(-9.75,iTime*0.6-3.0))*2.0+2.0;\n\treturn (1.0-step(snoise(vec2(5.0*pow(iTime,2.0)+pow(uv.x*7.0,1.2),pow((mod(iTime,100.0)+100.0)*uv.y*0.3+3.0,staticHeight))),staticAmount))*staticStrength;\n}\n\n\nvoid mainImage( out vec4 fragColor, in vec2 fragCoord )\n{\n\n\tvec2 uv =  fragCoord.xy/iResolution.xy;\n\t\n\tfloat jerkOffset = (1.0-step(snoise(vec2(iTime*1.3,5.0)),0.8))*0.05;\n\t\n\tfloat fuzzOffset = snoise(vec2(iTime*15.0,uv.y*80.0))*0.003;\n\tfloat largeFuzzOffset = snoise(vec2(iTime*1.0,uv.y*25.0))*0.004;\n    \n    float vertMovementOn = (1.0-step(snoise(vec2(iTime*0.2,8.0)),0.4))*vertMovementOpt;\n    float vertJerk = (1.0-step(snoise(vec2(iTime*1.5,5.0)),0.6))*vertJerkOpt;\n    float vertJerk2 = (1.0-step(snoise(vec2(iTime*5.5,5.0)),0.2))*vertJerkOpt;\n    float yOffset = abs(sin(iTime)*4.0)*vertMovementOn+vertJerk*vertJerk2*0.3;\n    float y = mod(uv.y+yOffset,1.0);\n    \n\t\n\tfloat xOffset = (fuzzOffset + largeFuzzOffset) * horzFuzzOpt;\n    \n    float staticVal = 0.0;\n   \n    for (float y = -1.0; y <= 1.0; y += 1.0) {\n        float maxDist = 5.0/200.0;\n        float dist = y/200.0;\n    \tstaticVal += staticV(vec2(uv.x,uv.y+dist))*(maxDist-abs(dist))*1.5;\n    }\n        \n    staticVal *= bottomStaticOpt;\n\t\n\tfloat red \t=   texture2D(\tiChannel0, \tvec2(uv.x + xOffset -0.01*rgbOffsetOpt,y)).r+staticVal;\n\tfloat green = \ttexture2D(\tiChannel0, \tvec2(uv.x + xOffset,\t  y)).g+staticVal;\n\tfloat blue \t=\ttexture2D(\tiChannel0, \tvec2(uv.x + xOffset +0.01*rgbOffsetOpt,y)).b+staticVal;\n\t\n\tvec3 color = vec3(red,green,blue);\n\tfloat scanline = sin(uv.y*800.0)*0.04*scalinesOpt;\n\tcolor -= scanline;\n\t\n\tfragColor = vec4(color,1.0);\n}\n"},101:(t,e,i)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.FilterStream=void 0;const n=i(610);e.FilterStream=class{constructor(t,e){console.log("New Filter for stream",t),this.stream=t;const i=document.createElement("video"),o=document.createElement("canvas");this.canvas=o,this.renderer=new n.ShaderRenderer(this.canvas,i,e),i.addEventListener("playing",(()=>{this.renderer.setSize(this.video.videoWidth,this.video.videoHeight),this.update()})),i.srcObject=t,i.autoplay=!0,this.video=i,this.outputStream=this.canvas.captureStream()}update(){this.renderer.render(),requestAnimationFrame((()=>this.update()))}}},471:(t,e,i)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.monkeyPatchMediaDevices=void 0;const n=i(101),o=i(865);e.monkeyPatchMediaDevices=function(){const t=MediaDevices.prototype.enumerateDevices,e=MediaDevices.prototype.getUserMedia;MediaDevices.prototype.enumerateDevices=async function(){const e=await t.call(navigator.mediaDevices);return e.push({deviceId:"virtual",groupId:"uh",kind:"videoinput",label:"Virtual Chrome Webcam"}),e},MediaDevices.prototype.getUserMedia=async function(...t){console.log(t[0]);const i=t[0];if(t.length&&i.video&&i.video.deviceId&&"virtual"===i.video.deviceId){const t={video:{facingMode:i.video.facingMode,advanced:i.video.advanced,width:i.video.width,height:i.video.height},audio:!1},s=await e.call(navigator.mediaDevices,t);if(s)return new n.FilterStream(s,o.distortedTV).outputStream}return await e.call(navigator.mediaDevices,...t)},console.log("VIRTUAL WEBCAM INSTALLED.")}},610:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.ShaderRenderer=void 0,e.ShaderRenderer=class{constructor(t,e,i){this.canvas=t,this.video=e,this.gl=this.canvas.getContext("webgl"),this.program=this.createProgram("\n  attribute vec4 a_position;\n\n  void main() {\n    gl_Position = a_position;\n  }\n",`\n\nprecision highp float;\n\nuniform vec2 iResolution;\nuniform sampler2D iChannel0;\nuniform float iTime;\n\n${i}\n\nvoid main() {\n  vec4 col;\n  mainImage(col, gl_FragCoord.xy);\n  gl_FragColor = col;\n}\n`),this.texture=this.gl.createTexture(),this.positionAttributeLocation=this.gl.getAttribLocation(this.program,"a_position"),this.positionBuffer=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.positionBuffer),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),this.gl.STATIC_DRAW),this.resolutionLocation=this.gl.getUniformLocation(this.program,"iResolution"),this.cameraLocation=this.gl.getUniformLocation(this.program,"iChannel0"),this.timeLocation=this.gl.getUniformLocation(this.program,"iTime")}createShader(t,e){const i=this.gl.createShader(e);if(this.gl.shaderSource(i,t),this.gl.compileShader(i),!this.gl.getShaderParameter(i,this.gl.COMPILE_STATUS)){const t=this.gl.getShaderInfoLog(i);throw console.log(t),"Could not compile WebGL program. \n\n"+t}return i}createProgram(t,e){const i=this.createShader(t,this.gl.VERTEX_SHADER),n=this.createShader(e,this.gl.FRAGMENT_SHADER),o=this.gl.createProgram();return this.gl.attachShader(o,i),this.gl.attachShader(o,n),this.gl.linkProgram(o),this.gl.getProgramParameter(o,this.gl.LINK_STATUS),o}setSize(t,e){this.canvas.width=t,this.canvas.height=e,this.gl.viewport(0,0,t,e)}render(){this.gl.bindTexture(this.gl.TEXTURE_2D,this.texture),this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL,!0),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,this.video),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.bindTexture(this.gl.TEXTURE_2D,null),this.gl.useProgram(this.program),this.gl.uniform2f(this.resolutionLocation,this.gl.canvas.width,this.gl.canvas.height),this.timeLocation&&this.gl.uniform1f(this.timeLocation,.001*performance.now()),this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.texture),this.gl.uniform1i(this.cameraLocation,0),this.gl.enableVertexAttribArray(this.positionAttributeLocation),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.positionBuffer),this.gl.vertexAttribPointer(this.positionAttributeLocation,2,this.gl.FLOAT,!1,0,0),this.gl.drawArrays(this.gl.TRIANGLES,0,6)}}}},e={};(0,function i(n){var o=e[n];if(void 0!==o)return o.exports;var s=e[n]={exports:{}};return t[n](s,s.exports,i),s.exports}(471).monkeyPatchMediaDevices)(),async function(){const t=await navigator.mediaDevices.enumerateDevices();console.log(t);const e=await navigator.mediaDevices.getUserMedia({video:{deviceId:"virtual"},audio:!1}),i=document.createElement("video");i.srcObject=e,i.autoplay=!0,document.body.append(i)}()})();
//# sourceMappingURL=index.js.map