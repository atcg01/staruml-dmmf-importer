/**
 * StarUML DMMF Importer - Main Entry Point
 * StarUML v7 Extension
 */

const fs = require('fs');
const path = require('path');
const { getDMMF } = require('@prisma/internals');

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

  console.log('[DMMF v7] Opening file dialog...');
  
  const files = app.dialogs.showOpenDialog();
  console.log('[DMMF v7] Selected files:', files);
  
  if (files && files.length > 0) {
    const filePath = files[0];
    console.log('[DMMF v7] Processing file:', filePath);
    parseDMMF(filePath);
  } else {
    console.log('[DMMF v7] No file selected');
  }
}

function parseDMMF(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log('[DMMF v7] File read, size:', content.length, 'bytes');
    
    let dmmf;
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.json') {
      // Direct JSON DMMF file
      dmmf = JSON.parse(content);
      console.log('[DMMF v7] Parsed as JSON DMMF');
    } else if (ext === '.prisma') {
      // Prisma schema file - need to compile to DMMF
      if (!getDMMF) {
        console.error('[DMMF v7] Cannot parse .prisma file: @prisma/generator-helper not installed');
        console.error('[DMMF v7] Run: npm install @prisma/generator-helper');
        return;
      }
      console.log('[DMMF v7] Compiling .prisma to DMMF...');
      dmmf = getDMMF({ datamodel: content });
      console.log('[DMMF v7] Compiled .prisma to DMMF');
    } else {
      // Try JSON parse for any other extension
      try {
        dmmf = JSON.parse(content);
        console.log('[DMMF v7] Parsed as JSON DMMF');
      } catch (e) {
        console.error('[DMMF v7] Unrecognized file format:', ext);
        return;
      }
    }
    
    // Validate DMMF structure
    if (isValidDMMF(dmmf)) {
      console.log('[DMMF v7] DMMF parsing: SUCCESS');
      console.log('[DMMF v7] Models:', dmmf.datamodel?.models?.length || 0);
      console.log('[DMMF v7] Enums:', dmmf.datamodel?.enums?.length || 0);
    } else {
      console.error('[DMMF v7] DMMF parsing: INVALID STRUCTURE');
    }
    
  } catch (e) {
    console.error('[DMMF v7] DMMF parsing error:', e.message);
  }
}

function isValidDMMF(dmmf) {
  if (!dmmf || typeof dmmf !== 'object') return false;
  if (dmmf.datamodel && typeof dmmf.datamodel === 'object') {
    return true;
  }
  if (dmmf.schema && typeof dmmf.schema === 'object') {
    return true;
  }
  return false;
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
