/**
 * StarUML DMMF Importer - Main Entry Point
 * StarUML v7 Extension
 */

const fs = require('fs');

function init() {
  registerCommands();
  createMenus();
}

function registerCommands() {
  if (!app || !app.commands) return;
  app.commands.register('staruml-dmmf-importer:import', openFileDialog);
  console.log('[DMMF v7] Command registered');
}

function openFileDialog() {
  if (!app || !app.dialogs) {
    console.error('[DMMF v7] app.dialogs not available');
    return;
  }

  console.log('[DMMF v7] Opening file dialog...');
  
  const files = app.dialogs.showOpenDialog();
  console.log('[DMMF v7] Selected files:', files);
  
  if (files && files.length > 0) {
    const filePath = files[0];
    console.log('[DMMF v7] Processing file:', filePath);
    receiveFile(filePath);
  } else {
    console.log('[DMMF v7] No file selected');
  }
}

function receiveFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log('[DMMF v7] File received successfully');
    console.log('[DMMF v7] File path:', filePath);
    console.log('[DMMF v7] File size:', content.length, 'bytes');
    console.log('[DMMF v7] Pipeline: OK - file loaded into memory');
  } catch (e) {
    console.error('[DMMF v7] Error receiving file:', e.message);
  }
}

function createMenus() {
  if (!app || !app.menu || !app.menu.template) return;
  const toolsIndex = app.menu.template.findIndex(item => 
    item.id === 'tools' || item.label === 'Tools'
  );
  if (toolsIndex >= 0 && app.menu.template[toolsIndex].submenu) {
    app.menu.template[toolsIndex].submenu.push({
      id: 'staruml-dmmf-importer.import',
      command: 'staruml-dmmf-importer:import',
      label: 'Import Prisma DMMF...',
      group: 'import',
      order: 10
    });
    console.log('[DMMF v7] Menu item added');
  }
}

module.exports = {
  activate: init,
  deactivate: function() {},
  init: init
};
