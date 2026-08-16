/**
 * StarUML DMMF Importer - Main Entry Point
 * StarUML v7 Extension
 * Debug ALL app properties to find menu API
 */

function activate() {
  console.log('[DMMF v7] ===== DEBUG START =====');
  
  if (typeof app === 'undefined') {
    console.error('[DMMF v7] ERROR: app is undefined');
    return;
  }
  
  // Show ALL app properties
  const appKeys = Object.keys(app).sort();
  console.log('[DMMF v7] app has', appKeys.length, 'properties:');
  
  // Show in chunks to avoid console overflow
  for (let i = 0; i < appKeys.length; i += 10) {
    const chunk = appKeys.slice(i, i + 10);
    console.log('[DMMF v7] app properties:', chunk.join(', '));
  }
  
  // Look for menu-related properties
  const menuRelated = appKeys.filter(k => 
    k.toLowerCase().includes('menu') || 
    k.toLowerCase().includes('bar') ||
    k.toLowerCase().includes('tool') ||
    k.toLowerCase().includes('ui')
  );
  console.log('[DMMF v7] Menu-related properties:', menuRelated);
  
  // Show types of key properties
  const keyProps = ['commands', 'extensions', 'ui', 'window', 'menuBar', 'menus', 'menuManager', 'menu'];
  for (const prop of keyProps) {
    if (app[prop]) {
      console.log(`[DMMF v7] app.${prop}:`, typeof app[prop]);
      if (typeof app[prop] === 'object') {
        const subKeys = Object.keys(app[prop]).slice(0, 10);
        console.log(`[DMMF v7] app.${prop} methods:`, subKeys.join(', '));
      }
    }
  }
  
  // Show what each property is
  for (const key of appKeys) {
    const value = app[key];
    if (typeof value === 'object' && value !== null) {
      const constructorName = value.constructor ? value.constructor.name : 'Object';
      const subKeys = Object.keys(value).slice(0, 5);
      console.log(`[DMMF v7] app.${key}: ${typeof value} (${constructorName}) - keys: ${subKeys.join(', ')}`);
    } else {
      console.log(`[DMMF v7] app.${key}: ${typeof value}`);
    }
  }
  
  console.log('[DMMF v7] ===== DEBUG END =====');
  console.log('[DMMF v7] Extension activated.');
}

module.exports = {
  activate: activate,
  deactivate: function() {
    console.log('[DMMF v7] Extension deactivated');
  }
};

function init() {
  activate();
}
module.exports.init = init;
