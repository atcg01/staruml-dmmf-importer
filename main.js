/**
 * StarUML DMMF Importer - Main Entry Point
 * 
 * StarUML v7 Extension
 * 
 * Minimal version for testing menu integration
 */

// ============================================
// EXTENSION ACTIVATION
// ============================================

// StarUML v7 calls activate() function if it exists
function activate() {
  console.log('[DMMF Importer v7] Activating extension...');
  
  // Register commands
  registerCommands();
  
  console.log('[DMMF Importer v7] Extension activated. Menu should appear in Tools.');
}

// Also support init() for compatibility
function init() {
  activate();
}

// Export for StarUML v7
module.exports = {
  activate: activate,
  init: init,
  deactivate: function() {
    console.log('[DMMF Importer v7] Extension deactivated');
  }
};

// ============================================
// COMMAND REGISTRATION (StarUML v7 API)
// ============================================

function registerCommands() {
  if (typeof app === 'undefined') {
    console.error('[DMMF Importer v7] ERROR: app is not defined');
    return;
  }
  
  console.log('[DMMF Importer v7] Registering commands...');
  
  // StarUML v7 API: Try different methods
  
  // Method 1: app.commands.register (most likely for v7)
  if (app.commands && typeof app.commands.register === 'function') {
    console.log('[DMMF Importer v7] Using app.commands.register()');
    try {
      app.commands.register('staruml-dmmf-importer:import', {
        label: 'Import Prisma DMMF...',
        run: function() {
          showMessage('Import command triggered!');
        }
      });
      
      app.commands.register('staruml-dmmf-importer:reimport', {
        label: 'Reimport Prisma DMMF',
        run: function() {
          showMessage('Reimport command triggered!');
        }
      });
      
      app.commands.register('staruml-dmmf-importer:show-options', {
        label: 'DMMF Importer Options',
        run: function() {
          showMessage('Options command triggered!');
        }
      });
      
      console.log('[DMMF Importer v7] Commands registered via register()');
      return;
    } catch (e) {
      console.error('[DMMF Importer v7] register() failed:', e.message);
    }
  }
  
  // Method 2: app.commands.addCommand
  if (app.commands && typeof app.commands.addCommand === 'function') {
    console.log('[DMMF Importer v7] Using app.commands.addCommand()');
    try {
      app.commands.addCommand('staruml-dmmf-importer:import', {
        label: 'Import Prisma DMMF...',
        run: function() { showMessage('Import!'); }
      });
      app.commands.addCommand('staruml-dmmf-importer:reimport', {
        label: 'Reimport Prisma DMMF',
        run: function() { showMessage('Reimport!'); }
      });
      app.commands.addCommand('staruml-dmmf-importer:show-options', {
        label: 'DMMF Importer Options',
        run: function() { showMessage('Options!'); }
      });
      console.log('[DMMF Importer v7] Commands added via addCommand()');
      return;
    } catch (e) {
      console.error('[DMMF Importer v7] addCommand() failed:', e.message);
    }
  }
  
  // Method 3: app.commands.setCommand
  if (app.commands && typeof app.commands.setCommand === 'function') {
    console.log('[DMMF Importer v7] Using app.commands.setCommand()');
    try {
      app.commands.setCommand('staruml-dmmf-importer:import', {
        label: 'Import Prisma DMMF...',
        run: function() { showMessage('Import!'); }
      });
      console.log('[DMMF Importer v7] Commands set via setCommand()');
      return;
    } catch (e) {
      console.error('[DMMF Importer v7] setCommand() failed:', e.message);
    }
  }
  
  // Method 4: Direct assignment
  if (app.commands && typeof app.commands === 'object') {
    console.log('[DMMF Importer v7] Trying direct assignment...');
    try {
      app.commands['staruml-dmmf-importer:import'] = {
        label: 'Import Prisma DMMF...',
        run: function() { showMessage('Import!'); }
      };
      console.log('[DMMF Importer v7] Commands assigned directly');
      return;
    } catch (e) {
      console.error('[DMMF Importer v7] Direct assignment failed:', e.message);
    }
  }
  
  // Debug: Show what IS available
  console.error('[DMMF Importer v7] ERROR: No command registration method found!');
  console.error('[DMMF Importer v7] Available in app:', Object.keys(app || {}));
  if (app && app.commands) {
    console.error('[DMMF Importer v7] Available in app.commands:', Object.keys(app.commands));
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showMessage(message) {
  if (app && app.dialogs && typeof app.dialogs.showInfoDialog === 'function') {
    try {
      app.dialogs.showInfoDialog({
        title: 'DMMF Importer v7',
        message: message
      });
    } catch (e) {
      console.error('[DMMF Importer v7] Dialog error:', e.message);
    }
  } else {
    console.log('[DMMF Importer v7]', message);
  }
}

// ============================================
// AUTO-INITIALIZE IF NEEDED
// ============================================

// StarUML v7 should call activate() automatically, but just in case:
if (typeof activate === 'function') {
  // Only auto-activate if we're in StarUML context
  if (typeof app !== 'undefined') {
    activate();
  }
}
