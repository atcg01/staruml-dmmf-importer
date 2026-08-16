/**
 * StarUML DMMF Importer - Main Entry Point
 * StarUML v7 Extension
 * Found it! app.menu exists and is a MenuManager with template
 */

function activate() {
  console.log('[DMMF v7] ===== MENU DEBUG =====');
  
  if (typeof app === 'undefined' || !app.menu) {
    console.error('[DMMF v7] ERROR: app or app.menu is not defined');
    return;
  }
  
  console.log('[DMMF v7] app.menu:', typeof app.menu);
  console.log('[DMMF v7] app.menu.constructor:', app.menu.constructor.name);
  
  // Show app.menu properties
  console.log('[DMMF v7] app.menu keys:', Object.keys(app.menu));
  
  // Check template
  if (app.menu.template) {
    console.log('[DMMF v7] app.menu.template type:', typeof app.menu.template);
    if (Array.isArray(app.menu.template)) {
      console.log('[DMMF v7] app.menu.template is an array with', app.menu.template.length, 'items');
      // Show first few items
      for (let i = 0; i < Math.min(5, app.menu.template.length); i++) {
        console.log(`[DMMF v7] app.menu.template[${i}]:`, JSON.stringify(app.menu.template[i]).substring(0, 200));
      }
    } else if (typeof app.menu.template === 'object') {
      console.log('[DMMF v7] app.menu.template keys:', Object.keys(app.menu.template));
      console.log('[DMMF v7] app.menu.template:', JSON.stringify(app.menu.template).substring(0, 500));
    }
  }
  
  // Try to find Tools menu
  if (app.menu.template && Array.isArray(app.menu.template)) {
    const toolsMenu = app.menu.template.find(item => 
      item.id === 'tools' || 
      item.label === 'Tools' ||
      (item.submenu && item.submenu.find(s => s.id === 'tools' || s.label === 'Tools'))
    );
    if (toolsMenu) {
      console.log('[DMMF v7] Found Tools menu:', JSON.stringify(toolsMenu).substring(0, 500));
    }
  }
  
  // Try to add menu items
  createMenus();
  
  console.log('[DMMF v7] ===== END =====');
}

function createMenus() {
  if (!app || !app.menu) {
    console.error('[DMMF v7] ERROR: Cannot create menus');
    return;
  }
  
  // Try to find the template structure
  if (app.menu.template && Array.isArray(app.menu.template)) {
    // Find the Tools menu
    const toolsIndex = app.menu.template.findIndex(item => 
      item.id === 'tools' || item.label === 'Tools'
    );
    
    if (toolsIndex >= 0) {
      console.log('[DMMF v7] Found Tools at index:', toolsIndex);
      const toolsMenu = app.menu.template[toolsIndex];
      console.log('[DMMF v7] Tools menu structure:', JSON.stringify(toolsMenu));
      
      if (toolsMenu.submenu && Array.isArray(toolsMenu.submenu)) {
        console.log('[DMMF v7] Tools submenu has', toolsMenu.submenu.length, 'items');
        // Add our items to the Tools submenu
        const importGroupIndex = toolsMenu.submenu.findIndex(item => item.group === 'import' || item.label === 'Import');
        
        const newItems = [
          {
            id: 'staruml-dmmf-importer.import',
            command: 'staruml-dmmf-importer:import',
            label: 'Import Prisma DMMF...',
            group: 'import',
            order: 10
          },
          {
            type: 'separator',
            id: 'separator-dmmf',
            group: 'import',
            order: 15
          },
          {
            id: 'staruml-dmmf-importer.reimport',
            command: 'staruml-dmmf-importer:reimport',
            label: 'Reimport Prisma DMMF',
            group: 'import',
            order: 20
          },
          {
            id: 'staruml-dmmf-importer.show-options',
            command: 'staruml-dmmf-importer:show-options',
            label: 'DMMF Importer Options',
            group: 'import',
            order: 30
          }
        ];
        
        // Add new items to Tools submenu
        toolsMenu.submenu.push(...newItems);
        
        // Refresh menu
        if (typeof app.menu.update === 'function') {
          app.menu.update();
        } else if (typeof app.menu.refresh === 'function') {
          app.menu.refresh();
        }
        
        console.log('[DMMF v7] Menu items added to Tools submenu');
      }
    }
  }
  
  // Try app.menu.addMenuItem if it exists
  if (typeof app.menu.addMenuItem === 'function') {
    console.log('[DMMF v7] Trying app.menu.addMenuItem()');
    try {
      app.menu.addMenuItem(['Tools'], {
        id: 'staruml-dmmf-importer.import',
        command: 'staruml-dmmf-importer:import',
        label: 'Import Prisma DMMF...',
        group: 'import',
        order: 10
      });
      console.log('[DMMF v7] Menu created via app.menu.addMenuItem()');
    } catch (e) {
      console.error('[DMMF v7] addMenuItem failed:', e.message);
    }
  }
}

// Register commands
function registerCommands() {
  if (!app || !app.commands) return;
  
  try {
    app.commands.register('staruml-dmmf-importer:import', {
      label: 'Import Prisma DMMF...',
      run: function() { showDialog('Import triggered!'); }
    });
    app.commands.register('staruml-dmmf-importer:reimport', {
      label: 'Reimport Prisma DMMF',
      run: function() { showDialog('Reimport triggered!'); }
    });
    app.commands.register('staruml-dmmf-importer:show-options', {
      label: 'DMMF Importer Options',
      run: function() { showDialog('Options triggered!'); }
    });
    console.log('[DMMF v7] Commands registered');
  } catch (e) {
    console.error('[DMMF v7] Command registration failed:', e.message);
  }
}

function showDialog(message) {
  if (app && app.dialogs) {
    try {
      app.dialogs.showInfoDialog({ title: 'DMMF v7', message: message });
    } catch (e) {
      console.error('[DMMF v7] Dialog error:', e.message);
    }
  } else {
    console.log('[DMMF v7]', message);
  }
}

module.exports = {
  activate: function() {
    registerCommands();
    activate();
  },
  deactivate: function() {},
  init: function() {
    registerCommands();
    activate();
  }
};
