/**
 * StarUML DMMF Importer - Main Entry Point
 * 
 * StarUML v7 Extension
 * 
 * MINIMAL VERSION: Let StarUML v7 handle everything from extension.json
 * Commands are auto-registered from contributes.commands
 * Menus are auto-created from contributes.menus
 */

// ============================================
// EXTENSION ACTIVATION
// ============================================

// StarUML v7 automatically registers commands from extension.json
// and creates menus from contributes.menus
// We just need an activate function (even empty)

function activate() {
  console.log('[DMMF Importer v7] Extension activated by StarUML v7');
  console.log('[DMMF Importer v7] StarUML should auto-register commands from extension.json');
  console.log('[DMMF Importer v7] StarUML should auto-create menus from contributes.menus');
  console.log('[DMMF Importer v7] Check if menu appears in Tools > Import');
}

// Export for StarUML v7
module.exports = {
  activate: activate,
  deactivate: function() {
    console.log('[DMMF Importer v7] Extension deactivated');
  }
};

// ============================================
// AUTO-INITIALIZE IF NEEDED
// ============================================

// Just in case StarUML calls init() instead of activate()
function init() {
  activate();
}

module.exports.init = init;
