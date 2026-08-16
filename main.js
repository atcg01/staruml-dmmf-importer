/**
 * StarUML DMMF Importer - Main Entry Point
 * StarUML v7 Extension
 * Using same DMMF processing logic as prisma-to-staruml project
 */

const fs = require('fs');
const path = require('path');
const { getDMMF } = require('@prisma/internals');

// === DEBUG FLAG ===
const DEBUG = true;

// === TYPE MAPPING (from prisma-to-staruml/src/uml/types.ts) ===
const PRISMA_TO_UML = {
  'String': 'String',
  'Int': 'Integer',
  'BigInt': 'Long',
  'Float': 'Double',
  'Decimal': 'Decimal',
  'Boolean': 'Boolean',
  'DateTime': 'DateTime',
  'Json': 'JSON',
  'Bytes': 'Byte[]'
};

const MULTIPLICITY = {
  ONE: '1',
  ZERO_ONE: '0..1',
  ZERO_MANY: '0..*',
  ONE_MANY: '1..*',
  MANY: '*'
};

// === UTILITY FUNCTIONS (from prisma-to-staruml) ===

function getMultiplicity(isRequired, isList, isOptional) {
  if (isList) {
    return isRequired ? MULTIPLICITY.ONE_MANY : MULTIPLICITY.ZERO_MANY;
  }
  return (isRequired || !isOptional) ? MULTIPLICITY.ONE : MULTIPLICITY.ZERO_ONE;
}

function parseFieldType(field) {
  const type = field.type;
  const isList = field.isList || false;
  const isRequired = field.isRequired || false;
  const isOptional = field.isOptional || false;
  const isUnique = field.isUnique || false;
  const isId = field.isId || false;
  const isReadOnly = field.isReadOnly || false;
  const kind = field.kind || 'scalar';

  return {
    name: field.name,
    type: type,
    isList,
    isRequired,
    isOptional,
    isUnique,
    isId,
    isReadOnly,
    kind,
    relationName: field.relationName,
    relationFromFields: field.relationFromFields,
    relationToFields: field.relationToFields,
    documentation: field.documentation || field.comment,
  };
}

function getScalarFields(model, allModels, allEnums, dmmf) {
  const attributes = [];
  const modelName = model.name;

  for (const field of model.fields) {
    const fieldInfo = parseFieldType(field);

    // Skip relation fields - handled as associations
    if (fieldInfo.kind === 'object') {
      continue;
    }

    // Skip enum fields for now
    if (fieldInfo.kind === 'enum') {
      continue;
    }

    // Get the UML type
    let umlType = PRISMA_TO_UML[fieldInfo.type] || fieldInfo.type;

    // Handle enum types
    if (allEnums.some(e => e.name === fieldInfo.type)) {
      umlType = fieldInfo.type;
    }

    // Determine multiplicity
    const multiplicity = getMultiplicity(
      fieldInfo.isRequired,
      fieldInfo.isList,
      fieldInfo.isOptional
    );

    // Build stereotypes
    const stereotypes = [];
    if (fieldInfo.isId) {
      stereotypes.push('PK');
    }
    if (fieldInfo.isUnique) {
      stereotypes.push('unique');
    }

    attributes.push({
      id: `${modelName}_${fieldInfo.name}`,
      name: fieldInfo.name,
      type: 'attribute',
      classId: modelName,
      dataType: umlType,
      multiplicity,
      visibility: 'public',
      isStatic: false,
      isReadOnly: fieldInfo.isReadOnly,
      isId: fieldInfo.isId,
      isUnique: fieldInfo.isUnique,
      documentation: fieldInfo.documentation,
      stereotypes: stereotypes.length > 0 ? stereotypes.join(',') : undefined
    });
  }

  return attributes;
}

function extractRelations(dmmf) {
  const relations = [];
  const processedRelations = new Set();

  for (const model of dmmf.datamodel.models) {
    for (const field of model.fields) {
      if (field.kind === 'object' && field.relationName) {
        const relationName = field.relationName;

        if (processedRelations.has(relationName)) {
          continue;
        }

        processedRelations.add(relationName);

        // Find all fields in all models that belong to this relation
        const relationFields = [];
        for (const m of dmmf.datamodel.models) {
          for (const f of m.fields) {
            if (f.relationName === relationName) {
              relationFields.push(f);
            }
          }
        }

        if (relationFields.length >= 2) {
          const firstField = relationFields[0];
          const secondField = relationFields[1];

          const fromModel = firstField.type;
          const toModel = secondField.type;

          const fromField = relationFields.find(f => f.type === fromModel);
          const toField = relationFields.find(f => f.type === toModel);

          const fromIsList = fromField?.isList || false;
          const toIsList = toField?.isList || false;

          let relationType;
          if (!fromIsList && !toIsList) {
            relationType = 'oneToOne';
          } else if (!fromIsList && toIsList) {
            relationType = 'oneToMany';
          } else if (fromIsList && !toIsList) {
            relationType = 'manyToOne';
          } else {
            relationType = 'manyToMany';
          }

          relations.push({
            name: relationName,
            fromModel: fromModel,
            toModel: toModel,
            fromFields: firstField.relationFromFields || [],
            toFields: firstField.relationToFields || [],
            type: relationType,
          });
        }
      }
    }
  }

  return relations;
}

function createAssociation(associations, fromModel, toModel, relationType, relationName, isSelfReferencing) {
  const associationId = `${fromModel}_${toModel}_${relationName || ''}`;

  let sourceMultiplicity = '1';
  let targetMultiplicity = '1';

  switch (relationType) {
    case 'oneToOne':
      sourceMultiplicity = '1';
      targetMultiplicity = '1';
      break;
    case 'oneToMany':
      sourceMultiplicity = '1';
      targetMultiplicity = '0..*';
      break;
    case 'manyToOne':
      sourceMultiplicity = '0..*';
      targetMultiplicity = '1';
      break;
    case 'manyToMany':
      sourceMultiplicity = '*';
      targetMultiplicity = '*';
      break;
  }

  // Check if association already exists
  const existingAssociation = associations.find(
    a => (a.sourceClassId === fromModel && a.targetClassId === toModel) ||
         (a.sourceClassId === toModel && a.targetClassId === fromModel)
  );

  if (existingAssociation) {
    return;
  }

  associations.push({
    id: associationId,
    name: relationName || `${fromModel}_${toModel}`,
    type: 'association',
    sourceClassId: fromModel,
    targetClassId: toModel,
    sourceRole: relationName ? `${relationName}_source` : undefined,
    targetRole: relationName ? `${relationName}_target` : undefined,
    sourceMultiplicity,
    targetMultiplicity,
    sourceNavigable: true,
    targetNavigable: true,
    aggregation: 'none',
    isBidirectional: false,
  });
}

function convertDmmfToUml(dmmf) {
  const classes = [];
  const enumerations = [];
  const associations = [];

  // Process enums
  for (const enumDef of dmmf.datamodel.enums) {
    const literals = enumDef.values.map(value => ({
      id: `${enumDef.name}_${value.name}`,
      name: value.name,
      type: 'enumeration_literal',
      enumId: enumDef.name,
      documentation: value.documentation,
    }));

    enumerations.push({
      id: enumDef.name,
      name: enumDef.name,
      type: 'enumeration',
      literals,
      isFinal: false,
      documentation: enumDef.documentation || enumDef.comment,
    });
  }

  // Process models
  for (const model of dmmf.datamodel.models) {
    const attributes = getScalarFields(model, dmmf.datamodel.models, dmmf.datamodel.enums, dmmf);

    classes.push({
      id: model.name,
      name: model.name,
      type: 'class',
      attributes,
      methods: [],
      stereotypes: [],
      isAbstract: model.isEmbedded || false,
      documentation: model.documentation || model.comment,
    });
  }

  // Process relations
  const relations = extractRelations(dmmf);

  for (const relation of relations) {
    if (relation.fromModel === relation.toModel) {
      createAssociation(associations, relation.fromModel, relation.toModel, relation.type, relation.name, true);
    } else {
      createAssociation(associations, relation.fromModel, relation.toModel, relation.type, relation.name, false);
    }
  }

  return {
    name: 'PrismaSchema',
    classes,
    enumerations,
    associations,
    generalizations: [],
  };
}

// === MAIN EXTENSION CODE ===

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
    parseDMMF(filePath).catch(e => {
      console.error('[DMMF v7] Async error:', e.message);
    });
  } else {
    console.log('[DMMF v7] No file selected');
  }
}

function cleanSchemaForPrisma7(schema) {
  // Remove url = lines from datasource blocks
  return schema.replace(/(\n\s*url\s*=.*?(\r?\n|$))+/g, '\n');
}

async function parseDMMF(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log('[DMMF v7] File read, size:', content.length, 'bytes');
    
    const ext = path.extname(filePath).toLowerCase();
    let dmmf;
    
    if (ext === '.json') {
      dmmf = JSON.parse(content);
      console.log('[DMMF v7] Parsed as JSON DMMF');
    } else if (ext === '.prisma') {
      const cleanSchema = cleanSchemaForPrisma7(content);
      console.log('[DMMF v7] Cleaned schema preview:', cleanSchema.substring(0, 200));
      try {
        dmmf = await getDMMF({ datamodel: cleanSchema });
        console.log('[DMMF v7] Compiled .prisma to DMMF');
      } catch (dmmfError) {
        console.error('[DMMF v7] getDMMF failed, trying with full schema object...');
        console.error('[DMMF v7] getDMMF error:', dmmfError);
        throw dmmfError;
      }
    } else {
      try {
        dmmf = JSON.parse(content);
        console.log('[DMMF v7] Parsed as JSON DMMF');
      } catch (e) {
        console.error('[DMMF v7] Unrecognized file format:', ext);
        return;
      }
    }
    
    if (!dmmf || !dmmf.datamodel) {
      console.error('[DMMF v7] DMMF parsing: INVALID STRUCTURE - missing datamodel');
      return;
    }
    
    console.log('[DMMF v7] DMMF parsing: SUCCESS');
    console.log('[DMMF v7] Models:', dmmf.datamodel.models?.length || 0);
    console.log('[DMMF v7] Enums:', dmmf.datamodel.enums?.length || 0);
    
    // Convert DMMF to UML model using same logic as prisma-to-staruml
    const umlModel = convertDmmfToUml(dmmf);
    console.log('[DMMF v7] Converted to UML model:', umlModel.classes.length, 'classes,', umlModel.enumerations.length, 'enums,', umlModel.associations.length, 'associations');
    
    // Create StarUML elements
    createStarUMLElements(umlModel);
    
  } catch (e) {
    console.error('[DMMF v7] DMMF parsing error:', e);
    console.error('[DMMF v7] Stack:', e && e.stack ? e.stack : 'No stack');
    if (app.dialogs) {
      app.dialogs.showErrorDialog({
        title: 'Import Error',
        message: 'Failed to import DMMF: ' + (e && e.message ? e.message : String(e))
      });
    }
  }
}

function createStarUMLElements(umlModel) {
  // Get the root project
  const project = (app.repository.select("@Project") || [])[0];
  if (!project) {
    console.error('[DMMF v7] No project found');
    return;
  }

  // Create Prisma Import package directly (no existence check for speed)
  const prismaPackage = app.factory.createModel({ id: "UMLPackage", parent: project });
  app.engine.setProperty(prismaPackage, "name", "Prisma Import");
  if (DEBUG) console.log('[DMMF v7] Created package: Prisma Import');

  const classMap = {};
  let classCount = 0;
  let enumCount = 0;
  let attrCount = 0;

  // Create all enumerations without checking
  for (const enumDef of umlModel.enumerations) {
    const umlEnum = app.factory.createModel({ id: "UMLEnumeration", parent: prismaPackage });
    app.engine.setProperty(umlEnum, "name", enumDef.name);
    app.engine.setProperty(umlEnum, "visibility", "public");

    for (const literal of enumDef.literals) {
      const literalElement = app.factory.createModel({
        id: "UMLEnumerationLiteral",
        parent: umlEnum,
        field: "literals"
      });
      app.engine.setProperty(literalElement, "name", literal.name);
    }
    enumCount++;
    if (DEBUG) console.log('[DMMF v7] Created enumeration:', enumDef.name, 'with', enumDef.literals.length, 'literals');
  }

  // Create all classes and attributes without checking
  for (const umlClass of umlModel.classes) {
    const starClass = app.factory.createModel({ id: "UMLClass", parent: prismaPackage });
    app.engine.setProperty(starClass, "name", umlClass.name);
    app.engine.setProperty(starClass, "visibility", "public");
    classMap[umlClass.id] = starClass;
    classCount++;
    if (DEBUG) console.log('[DMMF v7] Creating class:', umlClass.name, 'with', umlClass.attributes.length, 'attributes');

    for (const attr of umlClass.attributes) {
      const starAttr = app.factory.createModel({
        id: "UMLAttribute",
        parent: starClass,
        field: "attributes"
      });
      app.engine.setProperty(starAttr, "name", attr.name);
      app.engine.setProperty(starAttr, "type", attr.dataType);
      app.engine.setProperty(starAttr, "visibility", attr.visibility || "public");
      app.engine.setProperty(starAttr, "multiplicity", attr.multiplicity);

      if (attr.stereotypes) {
        app.engine.setProperty(starAttr, "stereotype", attr.stereotypes);
      }
      attrCount++;
      if (DEBUG) console.log('[DMMF v7]   Created attribute:', attr.name, 'type:', attr.dataType, 'multiplicity:', attr.multiplicity);
    }
  }

  // Associations and diagram creation still commented out (invalid IDs)
  console.log('[DMMF v7] Skipping associations and diagram (invalid IDs in StarUML v7)');

  console.log('[DMMF v7] IMPORT SUCCESSFUL:');
  console.log('[DMMF v7] Classes:', classCount);
  console.log('[DMMF v7] Attributes:', attrCount);
  console.log('[DMMF v7] Enumerations:', enumCount);

  if (app.dialogs) {
    app.dialogs.showInfoDialog({
      title: 'DMMF Import Successful',
      message: `Imported: ${classCount} classes, ${enumCount} enums, ${attrCount} attributes`
    });
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
