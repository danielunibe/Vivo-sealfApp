'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { setupJarLights } from './jar/jarLights';
import { createJarGlassMesh } from './jar/jarGlass';
import { createJarCoins, animateCoins, CoinData } from './jar/jarCoins';
import AnimatedMoneyCounter from './AnimatedMoneyCounter';
import { getInteractionPreferences } from '@/lib/interactionPreferences';

interface SavingsJarProps {
  theme: 'light' | 'dark';
  currentEarnings: number;
  currentGoal: number;
}

export default function SavingsJar({ theme, currentEarnings, currentGoal }: SavingsJarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const currentContainer = containerRef.current;
    const width = currentContainer.clientWidth || 250;
    const height = currentContainer.clientHeight || 280;
    const isAndroidWebView = /Android/i.test(window.navigator.userAgent);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowPowerMode = isAndroidWebView || prefersReducedMotion || getInteractionPreferences().reducedMotion;

    // 1. Create Scene & Perspective Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.5, 9);
    camera.lookAt(0, 1.8, 0);

    // 2. WebGL Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ 
        antialias: !lowPowerMode, 
        alpha: true,
        powerPreference: lowPowerMode ? 'default' : 'high-performance'
      });
    } catch (e) {
      console.warn('WebGL is not supported in this environment:', e);
      setTimeout(() => setInitError('WebGL temporalmente no disponible.'), 0);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(lowPowerMode ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = !lowPowerMode;
    if (!lowPowerMode) {
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    currentContainer.appendChild(renderer.domElement);

    // 3. Setup Lights
    setupJarLights(scene, theme);

    // 4. Create Glass Jar
    const { jarMesh, geometry: latheGeometry, material: glassMaterial } = createJarGlassMesh(theme);
    scene.add(jarMesh);

    // 5. Create Coins
    const { coinGroup, coinsData, coinGeometry, coinMaterial } = createJarCoins(currentEarnings);
    coinGroup.position.copy(jarMesh.position);
    scene.add(coinGroup);

    // 6. Animation Loop
    let animationId: number;
    let lastFrame = 0;
    const frameInterval = lowPowerMode ? 1000 / 30 : 1000 / 60;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const now = performance.now();
      if (now - lastFrame < frameInterval) return;
      lastFrame = now;
      animateCoins(coinsData);
      renderer.render(scene, camera);
    };

    animate();

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      if (currentContainer.contains(renderer.domElement)) {
        currentContainer.removeChild(renderer.domElement);
      }
      latheGeometry.dispose();
      glassMaterial.dispose();
      coinGeometry.dispose();
      coinMaterial.dispose();
      renderer.dispose();
    };
  }, [theme, currentEarnings]);

  if (initError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
        <div className="relative w-36 h-36 flex items-center justify-center mb-2">
          <div className="absolute inset-0 border-2 border-dashed border-emerald-500/10 rounded-full animate-ping pointer-events-none" />
          <div className="w-24 h-28 rounded-b-[2.5rem] rounded-t-[1.5rem] border-3 border-emerald-500/20 bg-emerald-500/5 relative flex items-center justify-center p-3">
            <span className="text-[26px] font-black text-emerald-500 font-mono animate-bounce mt-3">
              ${currentEarnings.toLocaleString('es-MX')}
            </span>
          </div>
        </div>
        <p className="text-[9.5px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
          Visualizador de Ahorros
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {/* Background radial spotlight behind the translucent jar */}
      <div 
        className="absolute w-44 h-44 rounded-full filter blur-[40px] pointer-events-none transition-all duration-700 opacity-25 dark:opacity-15"
        style={{
          background: theme === 'light' 
            ? 'radial-gradient(circle, #ff5a1f22 0%, transparent 70%)' 
            : 'radial-gradient(circle, #10b98122 0%, transparent 70%)',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />
      <div ref={containerRef} className="w-[360px] h-[400px] pointer-events-auto relative compact-scale-jar">
        {/* Transparent label overlay attached functionally to the front of the jar */}
        <div className="absolute inset-x-0 bottom-24 flex items-center justify-center pointer-events-none z-10">
          <div className={`flex flex-col items-center justify-center px-4 py-2 ${currentEarnings >= currentGoal ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 dark:bg-white/5'} backdrop-blur-md rounded-[16px] border border-white/10 shadow-none mix-blend-normal transition-all duration-500`}>
            <span className={`text-[8px] font-semibold tracking-[0.2em] ${currentEarnings >= currentGoal ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-600 dark:text-neutral-400'} uppercase font-sans mb-0.5`}>
              {currentEarnings >= currentGoal ? 'Meta Lograda' : 'Faltan'}
            </span>
            <AnimatedMoneyCounter 
              value={currentEarnings >= currentGoal ? currentEarnings : Math.max(0, currentGoal - currentEarnings)} 
              className={`text-xl font-medium tracking-tight ${currentEarnings >= currentGoal ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-800 dark:text-neutral-200'}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
