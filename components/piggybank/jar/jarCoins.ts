import * as THREE from 'three';

export interface CoinData {
  mesh: THREE.Mesh;
  targetY: number;
  currentY: number;
  speed: number;
}

// Seeded placement for visual predictability across tabs
const randomSeeded = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export function createJarCoins(currentEarnings: number): { coinGroup: THREE.Group, coinsData: CoinData[], coinGeometry: THREE.CylinderGeometry, coinMaterial: THREE.MeshStandardMaterial } {
  const coinGroup = new THREE.Group();
  
  // Number of coins scales incrementally (max 30 coins for optimal rendering and physics performance)
  const maxCoinsCount = 30;
  const computedCount = Math.floor(currentEarnings / 150); // One coin per $150 MXN earned
  const coinUnitsCount = Math.min(maxCoinsCount, Math.max(1, computedCount));

  // Slightly thicker/larger geometry for better visibility
  const coinGeometry = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 32);
  const coinMaterial = new THREE.MeshStandardMaterial({
    color: 0xffcc00,        // Brighter, clearer gold
    metalness: 0.7,         // Slightly reduced so they don't turn black in shadow
    roughness: 0.25,        // Enough roughness to catch ambient light
  });

  const coinsData: CoinData[] = [];

  for (let c = 0; c < coinUnitsCount; c++) {
    const coinMesh = new THREE.Mesh(coinGeometry, coinMaterial);
    coinMesh.castShadow = true;
    coinMesh.receiveShadow = true;
    
    // Compute pile physics layout
    const seed = c + 15;
    const angle = randomSeeded(seed) * Math.PI * 2;
    
    // Distance from center tapers as height increases (pyramidal pile shape)
    const maxRadius = Math.max(0.05, 0.75 - (c * 0.015));
    const radius = randomSeeded(seed + 1.2) * maxRadius;
    
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    // Calculate continuous layer height allowing a slight overlap for realistic stacking
    const targetY = 0.4 + (c * 0.065) + (randomSeeded(seed + 1.8) * 0.02);

    // Start high up for falling effect, spread out slightly in Y
    const startY = targetY + 3 + (c * 0.25) + (randomSeeded(seed)*1.5);
    coinMesh.position.set(x, startY, z);
    
    // Random tilt angles that feel natural for dropped coins
    coinMesh.rotation.set(
      (randomSeeded(seed + 2.5) - 0.5) * 0.8,
      randomSeeded(seed + 3) * Math.PI,
      (randomSeeded(seed + 3.5) - 0.5) * 0.8
    );

    coinGroup.add(coinMesh);
    // speed initially relative to their height so lower ones drop gently first
    coinsData.push({ mesh: coinMesh, targetY, currentY: startY, speed: 0.02 });
  }

  return { coinGroup, coinsData, coinGeometry, coinMaterial };
}

export function animateCoins(coinsData: CoinData[]) {
  // Premium soft gravity fall for coins
  coinsData.forEach(coin => {
    if (coin.currentY > coin.targetY) {
      coin.speed += 0.006; // Softer gravity acceleration
      
      // Gentle damping as they approach the target
      if (coin.currentY - coin.targetY < 0.8) {
        coin.speed *= 0.88;
      }

      coin.currentY -= coin.speed;
      
      if (coin.currentY <= coin.targetY) {
        // Soft settling stop
        coin.currentY = coin.targetY;
        coin.speed = 0; 
      }
      coin.mesh.position.y = coin.currentY;
    }
  });
}
