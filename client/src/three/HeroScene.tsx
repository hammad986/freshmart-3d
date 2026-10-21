import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createGroceryMesh, HERO_SHAPES } from "./shapes";

/** Floating 3D groceries behind the homepage hero text, with mouse parallax. */
export default function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / Math.max(mount.clientHeight, 1),
      0.1,
      100
    );
    camera.position.set(0, 0.6, 9);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(4, 8, 6);
    scene.add(sun);

    const items: Array<{ mesh: THREE.Group; speed: number; offset: number; baseY: number }> = [];
    HERO_SHAPES.forEach(({ shape, color }, i) => {
      const mesh = createGroceryMesh(shape, color);
      const angle = (i / HERO_SHAPES.length) * Math.PI * 2;
      const radius = 3.4 + (i % 3) * 1.1;
      mesh.position.set(
        Math.cos(angle) * radius,
        ((i % 4) - 1.5) * 1.1,
        Math.sin(angle) * radius * 0.6 - 1
      );
      const s = 0.55 + (i % 3) * 0.14;
      mesh.scale.setScalar(s);
      scene.add(mesh);
      items.push({ mesh, speed: 0.25 + (i % 4) * 0.1, offset: i * 1.7, baseY: mesh.position.y });
    });

    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    let frameId = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      for (const item of items) {
        item.mesh.rotation.y = t * item.speed;
        item.mesh.rotation.x = Math.sin(t * 0.4 + item.offset) * 0.15;
        item.mesh.position.y = item.baseY + Math.sin(t * 0.9 + item.offset) * 0.28;
      }
      camera.position.x += (mouseX * 0.9 - camera.position.x) * 0.04;
      camera.position.y += (0.6 - mouseY * 0.5 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      camera.aspect = mount.clientWidth / Math.max(mount.clientHeight, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="hero-canvas" ref={mountRef} aria-hidden="true" />;
}
