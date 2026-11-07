/**
 * Patrones de la portada de Hannah. 2026-10-23.
 * Threads shaders and two-pass compositor adapted from React Bits by David Haz.
 * Source: https://github.com/DavidHDev/react-bits/blob/main/src/content/Backgrounds/Threads/Threads.jsx
 * MIT + Commons Clause License Condition v1.0
 * Copyright (c) 2026 David Haz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, and distribute the Software as part of an
 * application, website, or product, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * Commons Clause Restriction
 * You may use this Software, including for any commercial purpose, so long as
 * you do not sell, sublicense, or redistribute the components themselves,
 * whether alone, in a bundle, or as a ported version.
 * The same restriction covers the React Bits tools (Background Studio, Texture
 * Lab, Shape Magic, Center Stage, Sound Lab and any tools added later) and the
 * sounds in the sound library. You may not sell, sublicense, or redistribute
 * the tools or the sounds themselves, or offer the tools or a substantially
 * similar copy of them as a hosted service, whether alone, in a bundle, or as
 * a ported version.
 * What you make with the tools is yours to use. You can use exported code,
 * images, videos, and audio files in any personal or commercial application,
 * website, or product, including paid ones. You may not sell or redistribute
 * the exports on their own, either individually or as the product itself,
 * such as a sound, texture, background, or template pack.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

// Núcleo WebGL de Hannah Lab. Las superficies del sitio colorean su fotograma.
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const LINE_VERTEX = `#version 300 es
precision highp float;
in vec2 aPoint;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uFrame;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;
uniform float uCount;
uniform float uThickness;
uniform float uSoftness;
uniform float uWaves;
uniform float uSplit;
uniform float uFray;
uniform float uSeed;
uniform vec2 uTurn;
uniform vec4 uPart;
uniform float uTaper;
out float vEdge;
out float vBand;
out float vDraw;
out float vAlpha;
out float vIndex;
float Perlin2D(vec2 P) {
  vec2 Pi = floor(P);
  vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
  vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
  Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
  Pt += vec2(26.0, 161.0).xyxy;
  Pt *= Pt;
  Pt = Pt.xzxz * Pt.yyww;
  vec4 hash_x = fract(Pt * (1.0 / 951.135664));
  vec4 hash_y = fract(Pt * (1.0 / 642.949883));
  vec4 grad_x = hash_x - 0.49999;
  vec4 grad_y = hash_y - 0.49999;
  vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y) * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
  grad_results *= 1.4142135623730950;
  vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
  vec4 blend2 = vec4(blend, vec2(1.0 - blend));
  return dot(grad_results, blend2.zxzx * blend2.wwyy);
}
void main() {
  float perc = float(gl_InstanceID) / uCount;
  float x = aPoint.x;
  float pixel = 1.0 / max(uResolution.x, uResolution.y);
  float splitPoint = uSplit + perc * uFray;
  float amplitudeNormal = smoothstep(splitPoint, max(0.7, splitPoint + 0.2), x);
  float finalAmplitude = amplitudeNormal * 0.5 * uAmplitude * (1.0 + (uMouse.y - 0.5) * 0.2);
  float timeScaled = uTime / 10.0 + (uMouse.x - 0.5);
  float blur = smoothstep(splitPoint, splitPoint + 0.05, x) * perc;
  float xnoise = mix(
    Perlin2D(vec2(timeScaled * 2.5 + uSeed, (x * uWaves + perc) * 2.5)),
    Perlin2D(vec2(timeScaled * 3.5 + uSeed, (x * uWaves + timeScaled) * 3.5)) / 1.5,
    x * 0.3
  );
  float y = 0.5 + (perc - 0.5) * uDistance + xnoise / 2.0 * finalAmplitude;
  vec2 local = vec2((x - 0.5) * uFrame.x, (y - 0.5) * uFrame.y);
  if (uPart.z > 0.0) {
    vec2 delta = local - uPart.xy;
    float pull = exp(-dot(delta, delta) / (uPart.w * uPart.w));
    local.y += delta.y * pull * uPart.z;
  }
  float width = 7.0 * uThickness * pixel * (1.0 - perc);
  float band = (width / 2.0 + 10.0 * uSoftness * pixel * blur) * uFrame.y;
  float draw = max(band, 1.0);
  local.y += aPoint.y * draw;
  vec2 turned = vec2(local.x * uTurn.x - local.y * uTurn.y, local.x * uTurn.y + local.y * uTurn.x);
  gl_Position = vec4(turned / (uResolution * 0.5), 0.0, 1.0);
  vEdge = aPoint.y * draw;
  vBand = band;
  vDraw = draw;
  vAlpha = 1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3)) * uTaper;
  vIndex = perc;
}`;
const LINE_FRAGMENT = `#version 300 es
precision highp float;
in float vEdge;
in float vBand;
in float vDraw;
in float vAlpha;
in float vIndex;
uniform vec3 uColor;
uniform vec3 uAccent;
out vec4 outColor;
void main() {
  float coverage = (1.0 - smoothstep(0.0, vDraw, abs(vEdge))) * (vBand / vDraw) * vAlpha;
  outColor = vec4(mix(uColor, uAccent, vIndex) * coverage, coverage);
}`;
const SCREEN_VERTEX = `#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;
const SCREEN_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uLines;
uniform float uOpacity;
out vec4 outColor;
void main() {
  vec4 lines = texture(uLines, vUv);
  float alpha = lines.a;
  vec3 color = alpha > 0.0001 ? lines.rgb / alpha : vec3(0.0);
  outColor = vec4(color * alpha, alpha) * uOpacity;
}`;

function program(gl, vertexText, fragmentText) {
  const shaders = [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].map((type, index) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, index ? fragmentText : vertexText);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  });
  if (shaders.some(shader => !shader)) {
    shaders.forEach(shader => shader && gl.deleteShader(shader));
    return null;
  }
  const result = gl.createProgram();
  shaders.forEach(shader => gl.attachShader(result, shader));
  gl.linkProgram(result);
  shaders.forEach(shader => gl.deleteShader(shader));
  if (gl.getProgramParameter(result, gl.LINK_STATUS)) return result;
  gl.deleteProgram(result);
  return null;
}

export function createThreads(canvas) {
  const gl = canvas.getContext('webgl2', {
    alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false,
    powerPreference: 'low-power'
  });
  if (!gl) return null;
  const lines = program(gl, LINE_VERTEX, LINE_FRAGMENT);
  const screen = program(gl, SCREEN_VERTEX, SCREEN_FRAGMENT);
  if (!lines || !screen) {
    if (lines) gl.deleteProgram(lines);
    if (screen) gl.deleteProgram(screen);
    return null;
  }
  const names = ['uTime', 'uResolution', 'uFrame', 'uAmplitude', 'uDistance', 'uMouse', 'uCount', 'uThickness', 'uSoftness', 'uWaves', 'uSplit', 'uFray', 'uSeed', 'uTurn', 'uPart', 'uTaper', 'uColor', 'uAccent'];
  const uniforms = Object.fromEntries(names.map(name => [name, gl.getUniformLocation(lines, name)]));
  const opacity = gl.getUniformLocation(screen, 'uOpacity');
  const sampler = gl.getUniformLocation(screen, 'uLines');
  const lineVao = gl.createVertexArray();
  const lineBuffer = gl.createBuffer();
  gl.bindVertexArray(lineVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
  const aPoint = gl.getAttribLocation(lines, 'aPoint');
  gl.enableVertexAttribArray(aPoint);
  gl.vertexAttribPointer(aPoint, 2, gl.FLOAT, false, 0, 0);
  const screenVao = gl.createVertexArray();
  const screenBuffer = gl.createBuffer();
  gl.bindVertexArray(screenVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, screenBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPosition = gl.getAttribLocation(screen, 'aPosition');
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
  const target = gl.createTexture();
  const framebuffer = gl.createFramebuffer();
  gl.bindTexture(gl.TEXTURE_2D, target);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  let segments = 0;
  return {
    type: 'webgl2-threads',
    resize(width) {
      segments = clamp(Math.round(width / 3), 120, 560);
      const points = new Float32Array((segments + 1) * 4);
      for (let i = 0; i <= segments; i++) points.set([i / segments, -1, i / segments, 1], i * 4);
      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
      gl.bindTexture(gl.TEXTURE_2D, target);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },
    render(state) {
      if (gl.isContextLost()) return;
      const w = canvas.width;
      const h = canvas.height;
      const angle = -0.36;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const scale = w / state.width;
      const px = (state.pointer.x - state.width / 2) * scale;
      const py = (state.height / 2 - state.pointer.y) * scale;
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(lines);
      gl.uniform1f(uniforms.uTime, state.time * 0.24 + 13);
      gl.uniform2f(uniforms.uResolution, w, h);
      gl.uniform2f(uniforms.uFrame, Math.abs(w * cos) + Math.abs(h * sin), Math.abs(w * sin) + Math.abs(h * cos));
      gl.uniform1f(uniforms.uAmplitude, 1.9);
      gl.uniform1f(uniforms.uDistance, 0.48);
      gl.uniform2f(uniforms.uMouse, 0.5 + (state.pointer.x / state.width - 0.5) * state.presence * 0.18, 0.5 + (0.5 - state.pointer.y / state.height) * state.presence * 0.18);
      gl.uniform1f(uniforms.uCount, 64);
      gl.uniform1f(uniforms.uThickness, 0.43);
      gl.uniform1f(uniforms.uSoftness, 0.75);
      gl.uniform1f(uniforms.uWaves, 1.0);
      gl.uniform1f(uniforms.uSplit, -0.1);
      gl.uniform1f(uniforms.uFray, 0.43);
      gl.uniform1f(uniforms.uSeed, 2.37);
      gl.uniform2f(uniforms.uTurn, cos, sin);
      gl.uniform4f(uniforms.uPart, px * cos + py * sin, -px * sin + py * cos, state.presence * 0.28, Math.min(w, h) * 0.24);
      gl.uniform1f(uniforms.uTaper, 0.73);
      gl.uniform3f(uniforms.uColor, 0, 0, 0);
      gl.uniform3f(uniforms.uAccent, 0, 0, 0);
      gl.bindVertexArray(lineVao);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, (segments + 1) * 2, 64);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, w, h);
      gl.disable(gl.BLEND);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(screen);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, target);
      gl.uniform1i(sampler, 0);
      gl.uniform1f(opacity, 0.39);
      gl.bindVertexArray(screenVao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
    },
    dispose() {
      gl.deleteFramebuffer(framebuffer);
      gl.deleteTexture(target);
      gl.deleteBuffer(lineBuffer);
      gl.deleteBuffer(screenBuffer);
      gl.deleteVertexArray(lineVao);
      gl.deleteVertexArray(screenVao);
      gl.deleteProgram(lines);
      gl.deleteProgram(screen);
    }
  };
}
