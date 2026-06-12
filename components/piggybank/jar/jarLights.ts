import * as THREE from 'three';

export function setupJarLights(scene: THREE.Scene, theme: 'light' | 'dark') {
  const hemisphereLight = new THREE.HemisphereLight(
    theme === 'light' ? 0xffffff : 0x2a2f42,
    theme === 'light' ? 0xd0d0d5 : 0x090b10,
    1.5
  );
  scene.add(hemisphereLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
  keyLight.position.set(5, 12, 6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.bias = -0.001;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 25;
  keyLight.shadow.camera.left = -5;
  keyLight.shadow.camera.right = 5;
  keyLight.shadow.camera.top = 5;
  keyLight.shadow.camera.bottom = -5;
  scene.add(keyLight);

  const refLightLeft = new THREE.PointLight(theme === 'light' ? 0x059669 : 0x10B981, 4.0, 15);
  refLightLeft.position.set(-5, 4, -3);
  scene.add(refLightLeft);

  const refLightRight = new THREE.PointLight(theme === 'light' ? 0xFF8A4C : 0xFF5A1F, 3.0, 15);
  refLightRight.position.set(5, 3, 2);
  scene.add(refLightRight);

  // Ground Shadow Plane
  const shadowMaterial = new THREE.ShadowMaterial({ opacity: theme === 'light' ? 0.08 : 0.4 });
  const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), shadowMaterial);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -0.4;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);
}
