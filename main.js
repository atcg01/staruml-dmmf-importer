/**
 * StarUML DMMF Importer - Main Entry Point
 * 
 * StarUML v7 Extension
 * Manual menu creation (StarUML v7 does NOT auto-create menus from extension.json)
 */

// ============================================
// EXTENSION ACTIVATION
// ============================================

function activate() {
  console.log('[DMMF v7] Activating extension...');
  
  // Register commands first
  registerCommands();
  
  // Then create menus
  createMenus();
  
  console.log('[DMMF v7] Extension activated. Menu should now appear in Tools.');
}

// Export for StarUML v7
module.exports = {
  activate: activate,
  deactivate: function() {
    console.log('[DMMF v7] Extension deactivated');
  }
};

// ============================================
// COMMAND REGISTRATION
// ============================================

function registerCommands() {
  if (typeof app === 'undefined') {
    console.error('[DMMF v7] ERROR: app is not defined');
    return;
  }
  
  if (app.commands && typeof app.commands.register === 'function') {
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
}

// ============================================
// MENU CREATION (StarUML v7)
// ============================================

function createMenus() {
  if (typeof app === 'undefined') {
    console.error('[DMMF v7] ERROR: app is not defined');
    return;
  }
  
  // Debug available APIs
  console.log('[DMMF v7] Checking for menu APIs...');
  console.log('[DMMF v7] app.menuBar:', typeof app.menuBar);
  console.log('[DMMF v7] app.menus:', typeof app.menus);
  
  if (app.menuBar) {
    console.log('[DMMF v7] menuBar methods:', Object.keys(app.menuBar));
  }
  if (app.menus) {
    console.log('[DMMF v7] menus methods:', Object.keys(app.menus));
  }
  
  // Try app.menuBar.addMenuItem
  if (app.menuBar && typeof app.menuBar.addMenuItem === 'function') {
    console.log('[DMMF v7] Using app.menuBar.addMenuItem()');
    try {
      app.menuBar.addMenuItem(['Tools'], {
        id: 'staruml-dmmf-importer.import',
        command: 'staruml-dmmf-importer:import',
        label: 'Import Prisma DMMF...',
        group: 'import',
        order: 10
      });
      app.menuBar.addMenuItem(['Tools'], {
        type: 'separator',
        id: 'separator-import',
        group: 'import',
        order: 15
      });
      app.menuBar.addMenuItem(['Tools'], {
        id: 'staruml-dmmf-importer.reimport',
        command: 'staruml-dmmf-importer:reimport',
        label: 'Reimport Prisma DMMF',
        group: 'import',
        order: 20
      });
      app.menuBar.addMenuItem(['Tools'], {
        id: 'staruml-dmmf-importer.show-options',
        command: 'staruml-dmmf-importer:show-options',
        label: 'DMMF Importer Options',
        group: 'import',
        order: 30
      });
      console.log('[DMMF v7] Menu created via menuBar.addMenuItem()');
      return;
    } catch (e) {
      console.error('[DMMF v7] menuBar.addMenuItem() failed:', e.message);
    }
  }
  
  // Try app.menus.addMenuItem
  if (app.menus && typeof app.menus.addMenuItem === 'function') {
    console.log('[DMMF v7] Using app.menus.addMenuItem()');
    try {
      app.menus.addMenuItem('Tools', {
        id: 'staruml-dmmf-importer.import',
        command: 'staruml-dmmf-importer:import',
        label: 'Import Prisma DMMF...',
        group: 'import',
        order: 10
      });
      console.log('[DMMF v7] Menu created via menus.addMenuItem()');
      return;
    } catch (e) {
      console.error('[DMMF v7] menus.addMenuItem() failed:', e.message);
    }
  }
  
  // Try app.menuBar.append
  if (app.menuBar && typeof app.menuBar.append === 'function') {
    console.log('[DMMF v7] Using app.menuBar.append()');
    try {
      app.menuBar.append(['Tools'], {
        id: 'staruml-dmmf-importer.import',
        command: 'staruml-dmmf-importer:import',
        label: 'Import Prisma DMMF...',
        group: 'import',
        order: 10
      });
      console.log('[DMMF v7] Menu created via menuBar.append()');
      return;
    } catch (e) {
      console.error('[DMMF v7] menuBar.append() failed:', e.message);
    }
  }
  
  console.error('[DMMF v7] ERROR: No menu creation method found!');
  console.error('[DMMF v7] Available in app:', Object.keys(app || {}));
}

function showDialog(message) {
  if (app && app.dialogs) {
    try {
      app.dialogs.showInfoDialog({
        title: 'DMMF Importer v7',
        message: message
      });
    } catch (e) {
      console.error('[DMMF v7] Dialog error:', e.message);
    }
  } else {
    console.log('[DMMF v7]', message);
  }
}

function init() {
  activate();
}
module.exports.init = init;
