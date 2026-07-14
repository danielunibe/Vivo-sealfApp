import { exportFullBackupJson, importFullBackupJson } from './storage';
import { toast } from './toast';
import { toLocalDateKey } from './date';

export const exportBackup = () => {
  try {
    const backupJson = exportFullBackupJson();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(backupJson);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `vivo_promotor_backup_${toLocalDateKey(new Date())}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast("Respaldo exportado exitosamente", "success");
  } catch (error) {
    console.error("Error exporting backup", error);
    toast("Error al exportar el respaldo", "error");
  }
};

export const importBackup = (file: File, onSuccess: () => void) => {
  try {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        if (importFullBackupJson(jsonString)) {
          toast("Respaldo importado correctamente.", "success");
          onSuccess();
        } else {
          toast("Formato de respaldo inválido.", "error");
        }
      } catch(e) {
        toast("El archivo no es un respaldo válido de Vivo Promotor.", "error");
        console.error(e);
      }
    };
    reader.readAsText(file);
  } catch (error) {
    toast("Error al leer el archivo.", "error");
    console.error(error);
  }
};
