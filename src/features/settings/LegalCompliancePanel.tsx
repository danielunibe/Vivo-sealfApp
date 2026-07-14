import React from 'react';
import { FileText, Shield, Scale, Lock, Smartphone, AlertTriangle, Copyright } from 'lucide-react';

const LEGAL_OWNER = 'Daniel Alexis Aguilar Unibe';

function LegalBlock({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="vivo-panel rounded-[1.5rem] p-4 flex flex-col gap-2.5">
      <div className="flex items-center gap-2.5">
        <div className="vivo-inset-on-pattern p-2 rounded-xl text-slate-600 dark:text-slate-300">
          {icon}
        </div>
        <h3 className="text-[0.78rem] font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="text-[0.72rem] leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
        {children}
      </div>
    </div>
  );
}

export default function LegalCompliancePanel() {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-[1.5rem] p-4 text-[0.72rem] leading-relaxed text-amber-800 dark:text-amber-200 font-semibold">
        Este módulo deja una base legal interna y visible dentro de la app. No sustituye asesoría jurídica profesional.
        Antes de distribución pública amplia o publicación comercial, conviene completar correo legal, domicilio de contacto y revisión formal con asesoría en México.
      </div>

      <LegalBlock title="Titularidad y Propiedad Intelectual" icon={<Copyright size={16} />}>
        <p>
          La aplicación <strong>VIVO Promotor</strong>, incluyendo su desarrollo, estructura, interfaz, textos, flujos, recursos visuales propios,
          lógica de operación y documentación interna vinculada, se reconoce dentro de esta build como una creación de <strong>{LEGAL_OWNER}</strong>,
          quien se identifica como creador, desarrollador y titular de la propiedad intelectual sobre la obra de software, salvo aquellos elementos
          de terceros que conserven su propia titularidad.
        </p>
        <p className="mt-2">
          Queda prohibida la reproducción, distribución, modificación, sublicenciamiento, ingeniería inversa, explotación comercial no autorizada
          o reutilización sustancial del software sin autorización expresa del titular. El uso autorizado de la app no transfiere la titularidad
          del código, diseño, marca no registrada, documentación ni know-how asociado.
        </p>
      </LegalBlock>

      <LegalBlock title="Términos y Condiciones de Uso" icon={<Scale size={16} />}>
        <p>
          Esta app está diseñada como herramienta operativa para registro de ventas, inventario, calendario comercial, respaldos y consulta interna.
          La persona usuaria debe utilizarla de buena fe, con información veraz y solo para fines legítimos de operación, seguimiento y análisis comercial.
        </p>
        <p className="mt-2">
          Se prohíbe su uso para manipular registros, suplantar identidades, infringir derechos de terceros, introducir contenido ilícito o intentar
          vulnerar la integridad del sistema. El titular podrá modificar funciones, textos, flujos o disponibilidad de la app sin previo aviso, especialmente
          cuando exista necesidad de seguridad, cumplimiento, mantenimiento o evolución del producto.
        </p>
      </LegalBlock>

      <LegalBlock title="Privacidad y Tratamiento de Datos" icon={<Lock size={16} />}>
        <p>
          Conforme a la estructura actual del proyecto, la app almacena principalmente datos operativos en el dispositivo, tales como ventas registradas,
          movimientos de inventario, configuraciones, metas, agenda laboral y catálogos personalizados. La finalidad de estos datos es permitir la operación,
          consulta, exportación, respaldo y restauración de la información generada por la persona usuaria.
        </p>
        <p className="mt-2">
          En la versión actual, la información se conserva de forma local y no se observó una transferencia remota obligatoria de esos registros como parte
          del flujo principal. La salida de información ocurre por acciones iniciadas por la persona usuaria, por ejemplo: copiar CSV al portapapeles,
          exportar respaldo JSON o restaurar un archivo local.
        </p>
        <p className="mt-2">
          Si en una fase futura la app incorpora sincronización, analítica remota, autenticación, mensajería, nube o servicios externos, este módulo legal
          deberá actualizarse antes de poner en operación dichas funciones.
        </p>
      </LegalBlock>

      <LegalBlock title="Permisos y Acceso al Dispositivo" icon={<Smartphone size={16} />}>
        <p>
          La revisión actual del proyecto muestra permisos Android para <strong>Internet</strong> y <strong>Vibración</strong>. Además, la app puede usar
          almacenamiento local del navegador/WebView, portapapeles para exportación de texto y archivos locales de respaldo mediante flujos explícitos.
        </p>
        <p className="mt-2">
          En esta versión no se detectó una solicitud activa de permisos de cámara, micrófono, ubicación, contactos o biométricos dentro del flujo principal.
          Cualquier incorporación futura de permisos sensibles exigirá actualización de esta sección, del aviso de privacidad y, en su caso, de los consentimientos aplicables.
        </p>
      </LegalBlock>

      <LegalBlock title="Responsabilidad y Limitaciones" icon={<Shield size={16} />}>
        <p>
          La app se entrega como herramienta de apoyo operativo. Aunque busca integridad funcional y resguardo razonable de la información, no garantiza
          disponibilidad absoluta, ausencia total de errores, compatibilidad universal entre dispositivos o inexistencia de pérdidas derivadas de fallas del sistema,
          uso indebido, restauraciones defectuosas, errores de captura o alteraciones realizadas por terceros.
        </p>
        <p className="mt-2">
          La persona usuaria es responsable de verificar sus capturas, mantener prácticas razonables de respaldo y revisar la consistencia de la información
          exportada o restaurada. Esta app no constituye asesoría legal, fiscal, contable, médica ni financiera.
        </p>
      </LegalBlock>

      <LegalBlock title="Cumplimiento y Datos Pendientes de Formalización" icon={<FileText size={16} />}>
        <p>
          Para una versión de distribución pública o comercial en México, todavía conviene complementar al menos:
        </p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>Correo electrónico de contacto legal y privacidad.</li>
          <li>Domicilio o medio formal para notificaciones.</li>
          <li>Canal para derechos ARCO y solicitudes relacionadas con datos personales.</li>
          <li>Versión pública final de términos y aviso de privacidad hospedados externamente si la app se publica en tiendas.</li>
          <li>En su caso, registro o estrategia formal de protección autoral y/o distintiva.</li>
        </ul>
        <p className="mt-2">
          Mientras esos datos no se completen, esta sección debe entenderse como base legal operativa y de titularidad, no como paquete regulatorio final para distribución masiva.
        </p>
      </LegalBlock>

      <LegalBlock title="Nota de Autoría" icon={<AlertTriangle size={16} />}>
        <p>
          Cualquier tercero que colabore, adapte o mantenga esta app deberá respetar la autoría y titularidad aquí declaradas a favor de <strong>{LEGAL_OWNER}</strong>,
          salvo pacto escrito en contrario firmado por las partes correspondientes.
        </p>
      </LegalBlock>
    </div>
  );
}
