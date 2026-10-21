import * as THREE from "three";

function mat(color: string | number, roughness = 0.55): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.05 });
}

/**
 * Builds a small procedural 3D model for a grocery item.
 * Every seed product carries a `shape` field that picks one of these.
 */
export function createGroceryMesh(shape: string, color: string): THREE.Group {
  const group = new THREE.Group();
  const main = mat(color);

  switch (shape) {
    case "fruit": {
      const body = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), main);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.09, 0.45, 8), mat(0x6f4e37, 0.9));
      stem.position.y = 1.05;
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), mat(0x2e7d32, 0.7));
      leaf.scale.set(1.7, 0.35, 0.8);
      leaf.position.set(0.3, 1.2, 0);
      group.add(body, stem, leaf);
      break;
    }
    case "egg": {
      const egg = new THREE.Mesh(new THREE.SphereGeometry(0.85, 32, 32), mat(color, 0.35));
      egg.scale.set(1, 1.3, 1);
      group.add(egg);
      break;
    }
    case "bottle": {
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 1.7, 28), main);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.36, 0.5, 24), main);
      neck.position.y = 1.05;
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.26, 24), mat(0x37474f, 0.35));
      cap.position.y = 1.42;
      group.add(body, neck, cap);
      break;
    }
    case "loaf": {
      const loaf = new THREE.Mesh(new THREE.CapsuleGeometry(0.62, 1.1, 8, 20), mat(color, 0.75));
      loaf.rotation.z = Math.PI / 2;
      group.add(loaf);
      break;
    }
    case "bar": {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.32, 1.1), main);
      group.add(bar);
      for (let i = -1; i <= 1; i++) {
        for (let j = -0.5; j <= 0.5; j++) {
          const seg = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.1, 0.42), mat(color, 0.45));
          seg.position.set(i * 0.55, 0.2, j * 0.55);
          group.add(seg);
        }
      }
      break;
    }
    case "bag": {
      const bag = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.55, 0.55), main);
      const crimp = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.16, 0.62), mat(0xf5f5f5, 0.8));
      crimp.position.y = 0.85;
      group.add(bag, crimp);
      break;
    }
    case "box":
    default: {
      group.add(new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 1.3), main));
      const flap = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.1, 1.34), mat(0xffffff, 0.8));
      flap.position.y = 0.68;
      group.add(flap);
      break;
    }
  }

  group.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      (obj as THREE.Mesh).castShadow = true;
    }
  });
  return group;
}

/** Random spread of grocery shapes used by the homepage hero. */
export const HERO_SHAPES: Array<{ shape: string; color: string }> = [
  { shape: "fruit", color: "#e74c3c" },
  { shape: "fruit", color: "#f5a623" },
  { shape: "bottle", color: "#1abc9c" },
  { shape: "bottle", color: "#dfe6ee" },
  { shape: "box", color: "#3498db" },
  { shape: "loaf", color: "#c89f6d" },
  { shape: "bag", color: "#f9d976" },
  { shape: "egg", color: "#d2a679" },
  { shape: "bar", color: "#4b2e2e" },
  { shape: "fruit", color: "#27ae60" },
];
