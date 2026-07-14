import { PhoneModel } from '../types';

export function getOfflineFallbackHtmlForModel(model: PhoneModel): string {
  const accentColor = model.accentColor || '#3b82f6';
  const name = model.name;
  
  // Specs fallbacks
  const battery = model.specs?.battery || '5000 mAh';
  const screen = model.specs?.screen || '6.64" FHD+';
  const camera = model.specs?.camera || '50 MP Dual Cam';
  const pitch = model.pitch || 'Rendimiento excepcional y diseño premium';
  
  // Colors and variants
  const colorItems = model.variants.map(v => `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
      <div style="width: 24px; height: 24px; border-radius: 50%; background-color: ${v.colorHex}; border: 2px solid #fff; box-shadow: 0 0 0 1px #e2e8f0;"></div>
      <span style="font-size: 10px; font-weight: bold; color: #475569;">${v.colorName}</span>
    </div>
  `).join('');

  // Advantages and Objections
  const ventajas = model.commercialProfile?.keyStrengths || ['Gran batería', 'Diseño elegante', 'Cámara nítida'];
  const ventajasList = ventajas.map(v => `
    <li style="margin-bottom: 8px; display: flex; align-items: center; gap: 10px;">
      <span style="color: ${accentColor}; font-weight: bold; font-size: 18px;">✓</span>
      <span>${v}</span>
    </li>
  `).join('');

  const objeciones = model.commercialProfile?.objections || [];
  const objecionesHtml = objeciones.map(o => `
    <div style="background: #f8fafc; border-left: 4px solid ${accentColor}; padding: 12px; border-radius: 4px; margin-bottom: 12px;">
      <p style="font-weight: 800; font-size: 13px; color: #1e293b; margin: 0 0 4px 0;">P: "${o.objection}"</p>
      <p style="font-size: 12px; color: #475569; margin: 0; line-height: 1.4;">R: ${o.response}</p>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>vivo ${name} - Ficha Oficial Offline</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Outfit', sans-serif;
          background-color: #f1f5f9;
          color: #0f172a;
          line-height: 1.5;
          padding-bottom: 60px;
        }

        .header {
          background: #ffffff;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .logo-area {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .brand {
          font-weight: 900;
          font-size: 22px;
          letter-spacing: -0.04em;
          color: #000;
        }

        .badge-offline {
          font-size: 9px;
          font-weight: 900;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #475569;
          padding: 3px 8px;
          border-radius: 9999px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .hero {
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          padding: 32px 20px;
          text-align: center;
          border-bottom: 1px solid #e2e8f0;
        }

        .hero h1 {
          font-size: 32px;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 6px;
        }

        .hero .tagline {
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
          max-width: 280px;
          margin: 0 auto 20px auto;
        }

        .phone-placeholder {
          width: 140px;
          height: 140px;
          margin: 20px auto;
          background: #f8fafc;
          border-radius: 20px;
          border: 2px dashed ${accentColor}40;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.03);
          position: relative;
        }

        .phone-placeholder::before {
          content: '📱';
          font-size: 50px;
        }

        .colors-container {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 15px;
        }

        .card {
          background: #ffffff;
          border-radius: 16px;
          padding: 20px;
          margin: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .card h2 {
          font-size: 16px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          margin-bottom: 16px;
          border-bottom: 2px solid ${accentColor}20;
          padding-bottom: 6px;
        }

        .specs-grid {
          display: grid;
          grid-template-cols: 1fr;
          gap: 12px;
        }

        .spec-item {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f8fafc;
          padding: 10px 14px;
          border-radius: 10px;
        }

        .spec-icon {
          font-size: 20px;
        }

        .spec-details {
          display: flex;
          flex-direction: column;
        }

        .spec-label {
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          color: #94a3b8;
        }

        .spec-val {
          font-size: 13px;
          font-weight: 800;
          color: #334155;
        }

        .btn-live {
          display: block;
          width: calc(100% - 32px);
          margin: 20px auto;
          background: ${accentColor};
          color: #fff;
          text-align: center;
          padding: 14px;
          border-radius: 14px;
          font-weight: 800;
          font-size: 14px;
          text-decoration: none;
          box-shadow: 0 4px 12px ${accentColor}40;
          transition: transform 0.2s;
        }

        .btn-live:active {
          transform: scale(0.98);
        }

        .footer-banner {
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
          padding: 20px 16px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-area">
          <span class="brand">vivo</span>
          <span class="badge-offline">Modo Offline</span>
        </div>
        <span style="font-weight: 800; font-size: 13px; color: ${accentColor}">${name}</span>
      </div>

      <div class="hero">
        <h1>vivo ${name}</h1>
        <div class="tagline">${pitch}</div>
        
        <div class="phone-placeholder"></div>
        
        <div class="colors-container">
          ${colorItems}
        </div>
      </div>

      <div class="card">
        <h2>Especificaciones Clave</h2>
        <div class="specs-grid">
          <div class="spec-item">
            <span class="spec-icon">🔋</span>
            <div class="spec-details">
              <span class="spec-label">Batería</span>
              <span class="spec-val">${battery}</span>
            </div>
          </div>
          <div class="spec-item">
            <span class="spec-icon">📱</span>
            <div class="spec-details">
              <span class="spec-label">Pantalla</span>
              <span class="spec-val">${screen}</span>
            </div>
          </div>
          <div class="spec-item">
            <span class="spec-icon">📸</span>
            <div class="spec-details">
              <span class="spec-label">Cámara Principal</span>
              <span class="spec-val">${camera}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Ventajas de Venta</h2>
        <ul style="list-style: none; font-size: 13px; font-weight: 600; color: #334155;">
          ${ventajasList}
        </ul>
      </div>

      ${objecionesHtml ? `
      <div class="card">
        <h2>Manejo de Objeciones</h2>
        ${objecionesHtml}
      </div>
      ` : ''}

      <a href="${model.officialUrl}" class="btn-live" target="_blank">Intentar cargar sitio oficial</a>

      <div class="footer-banner">
        Estás visualizando la ficha técnica local de la app. Los precios y disponibilidad pueden variar.
      </div>
    </body>
    </html>
  `;
}
