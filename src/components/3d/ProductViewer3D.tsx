import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { Product3D, RenderMode } from '../../types/product';

interface ProductViewer3DProps {
  product: Product3D;
  renderMode?: RenderMode;
  customPrimaryColor?: string;
  customSecondaryColor?: string;
  autoRotate?: boolean;
  interactive?: boolean;
  height?: string;
  lightPreset?: 'studio' | 'neon' | 'dark' | 'sunset';
  explodeFactor?: number;
}

export const ProductViewer3D: React.FC<ProductViewer3DProps> = ({
  product,
  renderMode = 'standard',
  customPrimaryColor,
  customSecondaryColor,
  autoRotate = true,
  interactive = true,
  height = '100%',
  lightPreset = 'neon',
  explodeFactor = 0
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const mainGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const primaryHex = customPrimaryColor || product.primaryColor;
  const secondaryHex = customSecondaryColor || product.secondaryColor;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const heightPx = container.clientHeight || 300;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 0.1, 1000);
    camera.position.set(0, 0, 8);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights according to preset
    const ambientLight = new THREE.AmbientLight(0xffffff, lightPreset === 'dark' ? 0.3 : 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(new THREE.Color(primaryHex), 2);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    if (lightPreset === 'neon') {
      const pointLight1 = new THREE.PointLight(new THREE.Color(primaryHex), 3, 15);
      pointLight1.position.set(3, 3, 3);
      scene.add(pointLight1);

      const pointLight2 = new THREE.PointLight(new THREE.Color(secondaryHex), 3, 15);
      pointLight2.position.set(-3, -3, -3);
      scene.add(pointLight2);
    } else if (lightPreset === 'sunset') {
      const sunsetLight = new THREE.DirectionalLight(0xff6600, 2.5);
      sunsetLight.position.set(0, 10, -5);
      scene.add(sunsetLight);
    }

    // 5. Build Procedural 3D Model
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    mainGroupRef.current = mainGroup;

    buildModelGeometry(mainGroup, (product as { geometryType?: any }).geometryType || 'quantumCore', primaryHex, secondaryHex, renderMode, explodeFactor);

    // Add particle ambient dust
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 12;
      particlePositions[i + 1] = (Math.random() - 0.5) * 12;
      particlePositions[i + 2] = (Math.random() - 0.5) * 12;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: new THREE.Color(primaryHex),
      size: 0.06,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Simple Interactive Controls (Orbit effect on drag)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      if (!interactive) return;
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!interactive || !isDragging || !mainGroupRef.current) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      mainGroupRef.current.rotation.y += deltaX * 0.01;
      mainGroupRef.current.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      if (!interactive) return;
      e.preventDefault();
      camera.position.z = Math.max(3, Math.min(15, camera.position.z + e.deltaY * 0.005));
    };

    // Touch support for mobile
    const onTouchStart = (e: TouchEvent) => {
      if (!interactive || e.touches.length !== 1) return;
      isDragging = true;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!interactive || !isDragging || e.touches.length !== 1 || !mainGroupRef.current) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;

      mainGroupRef.current.rotation.y += deltaX * 0.01;
      mainGroupRef.current.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    domElement.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onMouseUp);

    // 7. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      if (mainGroupRef.current) {
        if (autoRotate && !isDragging) {
          mainGroupRef.current.rotation.y += 0.008;
        }

        // Animate sub-parts (rings, energy, propellers)
        mainGroupRef.current.children.forEach((child) => {
          if (child.userData?.animType === 'rotateX') {
            child.rotation.x += 0.02;
          } else if (child.userData?.animType === 'rotateZ') {
            child.rotation.z -= 0.025;
          } else if (child.userData?.animType === 'float') {
            child.position.y = Math.sin(elapsedTime * 2) * 0.15;
          } else if (child.userData?.animType === 'pulse') {
            const s = 1 + Math.sin(elapsedTime * 3) * 0.05;
            child.scale.set(s, s, s);
          }
        });
      }

      particles.rotation.y = elapsedTime * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [(product as { geometryType?: any }).geometryType, primaryHex, secondaryHex, renderMode, autoRotate, interactive, lightPreset, explodeFactor]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: height,
        position: 'relative',
        cursor: interactive ? 'grab' : 'default',
        userSelect: 'none'
      }}
    />
  );
};

// Helper: Material factory based on RenderMode
function createMaterial(colorHex: string, mode: RenderMode, emissive: boolean = false): THREE.Material {
  const color = new THREE.Color(colorHex);

  if (mode === 'wireframe') {
    return new THREE.MeshBasicMaterial({
      color: color,
      wireframe: true
    });
  }

  if (mode === 'glow') {
    return new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: emissive ? 1.5 : 0.8,
      roughness: 0.1,
      metalness: 0.9,
      wireframe: false
    });
  }

  if (mode === 'chrome') {
    return new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.05,
      metalness: 1.0,
      wireframe: false
    });
  }

  // Standard PBR Material
  return new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.2,
    metalness: 0.7,
    emissive: emissive ? color : 0x000000,
    emissiveIntensity: emissive ? 0.6 : 0
  });
}

// Helper: Build procedural 3D model structures
function buildModelGeometry(
  group: THREE.Group,
  type: string,
  primaryColor: string,
  secondaryColor: string,
  mode: RenderMode,
  explode: number
) {
  const matPrimary = createMaterial(primaryColor, mode);
  const matSecondary = createMaterial(secondaryColor, mode);
  const matGlow = createMaterial(primaryColor, mode, true);

  if (type === 'quantumCore') {
    // Center glowing core
    const coreGeo = new THREE.IcosahedronGeometry(1.2, 3);
    const coreMesh = new THREE.Mesh(coreGeo, matGlow);
    coreMesh.userData = { animType: 'pulse' };
    group.add(coreMesh);

    // Orbital ring 1
    const ring1Geo = new THREE.TorusGeometry(2.0 + explode * 0.5, 0.08, 16, 100);
    const ring1 = new THREE.Mesh(ring1Geo, matPrimary);
    ring1.userData = { animType: 'rotateX' };
    group.add(ring1);

    // Orbital ring 2
    const ring2Geo = new THREE.TorusGeometry(2.5 + explode * 0.8, 0.06, 16, 100);
    const ring2 = new THREE.Mesh(ring2Geo, matSecondary);
    ring2.rotation.x = Math.PI / 3;
    ring2.userData = { animType: 'rotateZ' };
    group.add(ring2);
  } else if (type === 'cyberMask') {
    // Head main faceted shield
    const headGeo = new THREE.DodecahedronGeometry(1.5, 1);
    const headMesh = new THREE.Mesh(headGeo, matPrimary);
    headMesh.scale.set(1, 1.3, 1);
    group.add(headMesh);

    // Glowing Visor
    const visorGeo = new THREE.BoxGeometry(1.8 + explode * 0.4, 0.4, 0.8);
    const visorMesh = new THREE.Mesh(visorGeo, matGlow);
    visorMesh.position.set(0, 0.2, 0.9 + explode * 0.3);
    group.add(visorMesh);

    // Side Earpiece Antennae
    const ear1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.2, 8), matSecondary);
    ear1.position.set(-1.6 - explode * 0.5, 0, 0);
    ear1.rotation.z = Math.PI / 4;
    group.add(ear1);

    const ear2 = ear1.clone();
    ear2.position.set(1.6 + explode * 0.5, 0, 0);
    ear2.rotation.z = -Math.PI / 4;
    group.add(ear2);
  } else if (type === 'holographicDrone') {
    // Body
    const bodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.1, 0.6, 8), matPrimary);
    bodyMesh.userData = { animType: 'float' };
    group.add(bodyMesh);

    // 4 Rotors
    const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    angles.forEach((angle) => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.6 + explode * 0.4, 0.1, 0.2), matSecondary);
      arm.rotation.y = angle;
      group.add(arm);

      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 12, 32), matGlow);
      ring.position.set(Math.cos(angle) * (1.8 + explode * 0.4), 0.2, Math.sin(angle) * (1.8 + explode * 0.4));
      ring.rotation.x = Math.PI / 2;
      ring.userData = { animType: 'rotateZ' };
      group.add(ring);
    });
  } else if (type === 'voronoiCrystal') {
    // Complex Torus Knot Voronoi style sculpture
    const crystalGeo = new THREE.TorusKnotGeometry(1.2 + explode * 0.2, 0.4, 128, 32, 2, 3);
    const crystalMesh = new THREE.Mesh(crystalGeo, matPrimary);
    group.add(crystalMesh);

    const innerCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.8, 2), matGlow);
    innerCore.userData = { animType: 'pulse' };
    group.add(innerCore);
  } else if (type === 'hypercube') {
    // Outer Tesseract Frame
    const outerBox = new THREE.Mesh(new THREE.BoxGeometry(2.4 + explode * 0.6, 2.4 + explode * 0.6, 2.4 + explode * 0.6), matSecondary);
    group.add(outerBox);

    // Inner Rotating Tesseract
    const innerBox = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), matGlow);
    innerBox.userData = { animType: 'rotateX' };
    group.add(innerBox);
  } else if (type === 'energyCell') {
    // Outer Glass Pod
    const glassGeo = new THREE.CylinderGeometry(1.0, 1.0, 3.0, 32);
    const glassMat = mode === 'wireframe' ? matPrimary : new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
      transmission: 0.9
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    group.add(glassMesh);

    // Metal Caps
    const topCap = new THREE.Mesh(new THREE.CylinderGeometry(1.1 + explode * 0.3, 1.1, 0.4, 32), matSecondary);
    topCap.position.y = 1.7 + explode * 0.3;
    group.add(topCap);

    const bottomCap = topCap.clone();
    bottomCap.position.y = -1.7 - explode * 0.3;
    group.add(bottomCap);

    // Inner Fluid Core
    const fluidMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.6, 1.8, 16, 32), matGlow);
    fluidMesh.userData = { animType: 'pulse' };
    group.add(fluidMesh);
  } else if (type === 'kineticRing') {
    // 3 Concentric Architectural Rings
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.12, 16, 64), matPrimary);
    ring1.rotation.x = Math.PI / 4;
    ring1.userData = { animType: 'rotateX' };
    group.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.3 + explode * 0.4, 0.1, 16, 64), matSecondary);
    ring2.rotation.y = Math.PI / 3;
    ring2.userData = { animType: 'rotateZ' };
    group.add(ring2);

    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(3.0 + explode * 0.8, 0.08, 16, 64), matPrimary);
    ring3.userData = { animType: 'pulse' };
    group.add(ring3);
  } else if (type === 'mechArm') {
    // Base gear
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 0.5, 16), matSecondary);
    base.position.y = -1.8;
    group.add(base);

    // Lower Arm Link
    const arm1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.8 + explode * 0.3, 0.6), matPrimary);
    arm1.position.set(0, -0.6, 0);
    group.add(arm1);

    // Upper Arm Joint & Claw
    const clawBase = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), matGlow);
    clawBase.position.set(0, 0.8 + explode * 0.5, 0);
    clawBase.userData = { animType: 'pulse' };
    group.add(clawBase);
  } else {
    // Orbital Satellite
    const centerSphere = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 32), matPrimary);
    group.add(centerSphere);

    // Solar Wings
    const wing1 = new THREE.Mesh(new THREE.BoxGeometry(2.5 + explode * 0.6, 0.8, 0.05), matSecondary);
    wing1.position.set(2.2 + explode * 0.5, 0, 0);
    group.add(wing1);

    const wing2 = wing1.clone();
    wing2.position.set(-2.2 - explode * 0.5, 0, 0);
    group.add(wing2);

    // Dish antenna
    const dish = new THREE.Mesh(new THREE.ConeGeometry(0.8, 0.4, 32), matGlow);
    dish.position.set(0, 1.5 + explode * 0.3, 0);
    dish.rotation.x = Math.PI;
    group.add(dish);
  }
}
