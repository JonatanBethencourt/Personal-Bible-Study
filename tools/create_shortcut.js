const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const vbsPath = path.resolve(__dirname, '..', 'Estudio Personal.vbs');
const workingDir = path.resolve(__dirname, '..');

// Script VBScript para crear el acceso directo en el escritorio del usuario
const createScript = `
Set WshShell = CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")
Set oShortcut = WshShell.CreateShortcut(strDesktop & "\\Estudio Personal.lnk")
oShortcut.TargetPath = "${vbsPath.replace(/\\/g, '\\\\')}"
oShortcut.WorkingDirectory = "${workingDir.replace(/\\/g, '\\\\')}"
oShortcut.Description = "Estudio Personal - Cuaderno de Apuntes y Juegos"
oShortcut.Save
`;

const tempVbs = path.join(__dirname, 'temp_shortcut.vbs');
fs.writeFileSync(tempVbs, createScript, 'utf8');
try {
  execSync(`cscript //nologo "${tempVbs}"`);
  console.log('¡Acceso directo creado en el escritorio con éxito!');
} finally {
  try { fs.unlinkSync(tempVbs); } catch (e) {}
}
