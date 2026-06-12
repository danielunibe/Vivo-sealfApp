import * as THREE from 'three';

export function createJarGlassMesh(theme: 'light' | 'dark'): { jarMesh: THREE.Mesh, geometry: THREE.LatheGeometry, material: THREE.MeshPhysicalMaterial } {
  const points: THREE.Vector2[] = [
    new THREE.Vector2(0, 0.05),
    new THREE.Vector2(1.1, 0.05),
    new THREE.Vector2(1.3, 0.3),
    new THREE.Vector2(1.35, 1.0),
    new THREE.Vector2(1.4, 2.0),
    new THREE.Vector2(1.35, 2.8),
    new THREE.Vector2(1.1, 3.4),
    new THREE.Vector2(0.85, 3.6),
    new THREE.Vector2(0.85, 3.9),
    new THREE.Vector2(0.9, 4.0),
    // Inner wall
    new THREE.Vector2(0.8, 3.9),
    new THREE.Vector2(0.75, 3.6),
    new THREE.Vector2(1.0, 3.3),
    new THREE.Vector2(1.25, 2.7),
    new THREE.Vector2(1.3, 1.8),
    new THREE.Vector2(1.2, 0.4),
    new THREE.Vector2(1.0, 0.15),
    new THREE.Vector2(0, 0.15)
  ];

  const splinePoints = new THREE.SplineCurve(points).getPoints(100);
  const geometry = new THREE.LatheGeometry(splinePoints, 64);
  geometry.computeVertexNormals();
  
  const material = new THREE.MeshPhysicalMaterial({
    color: theme === 'light' ? 0xffffff : 0xdff5ef,
    metalness: 0.1,
    roughness: 0.05,        // Less rough for clearer glass
    transmission: 1.0,      // Crystal clear transparent behavior
    ior: 1.52,              // True glass IOR
    thickness: 0.2,         // Thinner feeling for better transparency
    attenuationColor: new THREE.Color(theme === 'light' ? 0xffffff : 0xdff5ef),
    attenuationDistance: 5.0, // Let light travel further
    transparent: true,
    opacity: 1.0,
    clearcoat: 1.0,         // Shiny glossy wet outer coating
    clearcoatRoughness: 0.01,
    side: THREE.DoubleSide
  });

  const jarMesh = new THREE.Mesh(geometry, material);
  jarMesh.position.set(0, -0.4, 0);
  jarMesh.castShadow = true;
  jarMesh.receiveShadow = true;

  return { jarMesh, geometry, material };
}
