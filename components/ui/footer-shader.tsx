"use client"

import React, { useEffect, useRef } from "react"

export interface FooterShaderProps {
  watermarkText?: string
  className?: string
  children?: React.ReactNode
}

export function FooterShader({
  watermarkText = "AIDENTITY",
  className = "",
  children,
}: FooterShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const gl =
      canvas.getContext("webgl", { alpha: true, antialias: false, powerPreference: "low-power" }) ||
      canvas.getContext("experimental-webgl", { alpha: true, antialias: false })
    if (!gl) return

    const VERT = `attribute vec2 a_position; void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`
    const FRAG = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }
      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        float n = noise(p * 2.5 + vec2(u_time * 0.05, u_time * 0.03));
        float wave = sin(uv.x * 3.5 + u_time * 0.35 + n * 2.2) * 0.5 + 0.5;
        vec3 dark = vec3(0.05, 0.045, 0.04);
        vec3 crimson = vec3(0.52, 0.12, 0.07);
        vec3 amber = vec3(0.85, 0.45, 0.1);
        vec3 col = mix(dark, crimson, wave * 0.5);
        col = mix(col, amber, pow(n * wave, 3.5) * 0.35);
        float alpha = smoothstep(0.0, 0.85, uv.y) * 0.65;
        gl_FragColor = vec4(col, alpha);
      }
    `

    const vs = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vs, VERT)
    gl.compileShader(vs)

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fs, FRAG)
    gl.compileShader(fs)

    const program = gl.createProgram()!
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    )

    const aPos = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(program, "u_resolution")
    const uTime = gl.getUniformLocation(program, "u_time")

    let isVisible = false
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const w = container.clientWidth
      const h = container.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    window.addEventListener("resize", resize)
    resize()

    let observer: IntersectionObserver | null = null
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          isVisible = entries[0].isIntersecting
        },
        { threshold: 0.05 }
      )
      observer.observe(container)
    } else {
      isVisible = true
    }

    const t0 = performance.now()
    let animationFrameId: number

    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render)
      if (!isVisible) return
      resize()
      gl.useProgram(program)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, (now - t0) * 0.001)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    animationFrameId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationFrameId)
      if (observer) observer.disconnect()
    }
  }, [])

  return (
    <footer
      ref={containerRef}
      className={`relative overflow-hidden border-t border-neutral-800 bg-[#0d0c0a] text-neutral-400 py-20 ${className}`}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-45"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_center,rgba(13,12,10,0.2)_0%,rgba(13,12,10,0.85)_70%,#0d0c0a_100%)]"
      />
      {watermarkText && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 font-serif text-[clamp(4rem,14vw,12rem)] tracking-widest text-[#f4f1e8]/[0.02] select-none whitespace-nowrap"
        >
          {watermarkText}
        </div>
      )}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </footer>
  )
}
