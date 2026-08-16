/**
 * StarUML DMMF Importer - Main Entry Point
 * StarUML v7 Extension
 */

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

  console.log('[DMMF v7] Test 1: showOpenDialog() with no args');
  try {
    const result1 = app.dialogs.showOpenDialog();
    console.log('[DMMF v7] Result 1:', result1);
  } catch (e) {
    console.error('[DMMF v7] Test 1 error:', e.message);
  }

  console.log('[DMMF v7] Test 2: showOpenDialog({}) with empty object');
  try {
    const result2 = app.dialogs.showOpenDialog({});
    console.log('[DMMF v7] Result 2:', result2);
  } catch (e) {
    console.error('[DMMF v7] Test 2 error:', e.message);
  }

  console.log('[DMMF v7] Test 3: showOpenDialog(null) with null');
  try {
    const result3 = app.dialogs.showOpenDialog(null);
    console.log('[DMMF v7] Result 3:', result3);
  } catch (e) {
    console.error('[DMMF v7] Test 3 error:', e.message);
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
