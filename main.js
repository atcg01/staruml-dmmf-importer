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
  
  try {
    app.commands.register('staruml-dmmf-importer:import', {
      label: 'Import Prisma DMMF...',
      run: function() { 
        console.log('[DMMF v7] Import command triggered');
        if (app.dialogs) {
          app.dialogs.showInfoDialog({ title: 'DMMF Importer', message: 'Import triggered!' });
        }
      }
    });
    console.log('[DMMF v7] Command registered: staruml-dmmf-importer:import');
  } catch (e) {
    console.error('[DMMF v7] Command registration failed:', e.message);
  }
}

function createMenus() {
  if (!app || !app.menu || !app.menu.template) {
    console.error('[DMMF v7] Cannot create menus - app.menu.template not available');
    return;
  }
  
  console.log('[DMMF v7] Creating menus...');
  console.log('[DMMF v7] app.menu.template length:', app.menu.template.length);
  
  // Find the Tools menu
  const toolsIndex = app.menu.template.findIndex(item => 
    item.id === 'tools' || item.label === 'Tools'
  );
  
  console.log('[DMMF v7] Tools menu index:', toolsIndex);
  
  if (toolsIndex >= 0) {
    const toolsMenu = app.menu.template[toolsIndex];
    console.log('[DMMF v7] Tools menu found - has submenu:', !!toolsMenu.submenu);
    
    if (toolsMenu.submenu && Array.isArray(toolsMenu.submenu)) {
      console.log('[DMMF v7] Tools submenu length before:', toolsMenu.submenu.length);
      
      // Add our menu items to the Tools submenu
      const newItems = [
        {
          id: 'staruml-dmmf-importer.import',
          command: 'staruml-dmmf-importer:import',
          label: 'Import Prisma DMMF...',
          group: 'import',
          order: 10
        }
      ];
      
      toolsMenu.submenu.push(...newItems);
      
      console.log('[DMMF v7] Tools submenu length after:', toolsMenu.submenu.length);
      console.log('[DMMF v7] Menu items added to Tools submenu');
      
      // Try to refresh menu
      if (typeof app.menu.update === 'function') {
        console.log('[DMMF v7] Calling app.menu.update()');
        app.menu.update();
      } else if (typeof app.menu.refresh === 'function') {
        console.log('[DMMF v7] Calling app.menu.refresh()');
        app.menu.refresh();
      } else {
        console.log('[DMMF v7] No menu refresh function found');
      }
    }
  }
}

module.exports = {
  activate: init,
  deactivate: function() {},
  init: init
};
