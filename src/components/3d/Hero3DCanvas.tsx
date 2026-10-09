import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Hero3DCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Glowing Neon Cyber Grid floor
    const gridHelper = new THREE.GridHelper(40, 40, 0x00f0ff, 0x1a1a3a);
    gridHelper.position.y = -5;
    gridHelper.rotation.x = 0.2;
    scene.add(gridHelper);

    // Ambient floating 3D geometry objects
    const floatGroup = new THREE.Group();
    scene.add(floatGroup);

    const mat1 = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true });
    const mat2 = new THREE.MeshBasicMaterial({ color: 0xbf00ff, wireframe: true });
    const mat3 = new THREE.MeshBasicMaterial({ color: 0xff0055, wireframe: true });

    const obj1 = new THREE.Mesh(new THREE.IcosahedronGeometry(2.5, 1), mat1);
    obj1.position.set(-6, 2, -2);
    floatGroup.add(obj1);

    const obj2 = new THREE.Mesh(new THREE.TorusKnotGeometry(1.8, 0.5, 64, 16), mat2);
    obj2.position.set(6, -1, -4);
    floatGroup.add(obj2);

    const obj3 = new THREE.Mesh(new THREE.OctahedronGeometry(2, 0), mat3);
    obj3.position.set(0, 4, -6);
    floatGroup.add(obj3);

    // Dynamic Dust Particles
    const count = 300;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 30;
      pos[i + 1] = (Math.random() - 0.5) * 20;
      pos[i + 2] = (Math.random() - 0.5) * 20;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.1,
      transparent: true,
      opacity: 0.8
    });
    const pSystem = new THREE.Points(geo, pMat);
    scene.add(pSystem);

    // Mouse parallax movement
    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      mouseX = (e.clientX - windowHalfX) * 0.001;
      mouseY = (e.clientY - windowHalfY) * 0.001;
    };

    window.addEventListener('mousemove', onMouseMove);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      obj1.rotation.x = elapsed * 0.3;
      obj1.rotation.y = elapsed * 0.2;

      obj2.rotation.x = elapsed * 0.2;
      obj2.rotation.z = elapsed * 0.4;

      obj3.rotation.y = elapsed * 0.5;

      pSystem.rotation.y = elapsed * 0.03;

      camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
};
