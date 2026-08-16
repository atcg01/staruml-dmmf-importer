# StarUML DMMF Importer

A StarUML extension that imports Prisma DMMF JSON files and transforms them into native UML class diagrams.

## Features

- **Import Prisma DMMF** - Load DMMF JSON files directly from Prisma
- **UML Classes** - Creates UML classes for each Prisma model
- **UML Attributes** - Maps Prisma fields to UML attributes with correct types
- **UML Enumerations** - Creates UML enumerations from Prisma enums
- **UML Associations** - Creates proper UML associations for Prisma relations
- **Class Diagrams** - Generates a complete class diagram with all elements
- **Automatic Layout** - Grid and force-directed layout options
- **Cardinality Support** - Handles 1:1, 1:N, N:N, and self-referencing relations
- **Primary Keys** - Marks primary key fields with <<PK>> stereotype
- **Unique Constraints** - Marks unique fields with <<unique>> stereotype
- **Reimport Support** - Replace or create new imports

## Prisma Type Mapping

| Prisma Type | UML Type |
|------------|---------|
| String | String |
| Int | Integer |
| BigInt | Long |
| Float | Double |
| Decimal | Decimal |
| Boolean | Boolean |
| DateTime | DateTime |
| Json | JSON |
| Bytes | Byte[] |

## Installation

### 1. Build the Extension

```bash
# Navigate to the extension directory
cd staruml-dmmf-importer

# Install dependencies (if any)
npm install
```

### 2. Package the Extension

StarUML extensions are simple directories. To package for distribution:

```bash
# Create a zip file of the entire directory
zip -r staruml-dmmf-importer.zip .
```

### 3. Install in StarUML

**Method A: Using StarUML Extension Manager (Recommended)**

1. Open StarUML
2. Go to `Extensions > Extension Manager`
3. Click `Install from File...`
4. Select the `staruml-dmmf-importer.zip` file or the directory
5. Click `Install`
6. Restart StarUML if prompted

**Method B: Manual Installation**

1. Close StarUML
2. Navigate to StarUML's extensions directory:
   - **Windows**: `%APPDATA%\StarUML\extensions`
   - **macOS**: `~/Library/Application Support/StarUML/extensions`
   - **Linux**: `~/.config/StarUML/extensions`
3. Create a new directory called `staruml-dmmf-importer`
4. Copy all files from this repository into that directory
5. Restart StarUML

## Usage

### Import a DMMF File

1. Open your StarUML project
2. Go to `Tools > Import Prisma DMMF...`
3. Select your Prisma DMMF JSON file (typically `schema.dmmf.json`)
4. Click `Open`

### Reimport

To replace a previous import:

1. Go to `Tools > Reimport Prisma DMMF`
2. Choose whether to create a new import or replace the previous one

### Generated Structure

The import creates a new package called `Prisma Import` containing:

```
Prisma Import
├── User (UMLClass)
│   ├── id: String <<PK>>
│   ├── email: String <<unique>>
│   └── ...
├── Post (UMLClass)
├── Profile (UMLClass)
├── Role (UMLClass)
├── Employee (UMLClass)
├── UserStatus (UMLEnumeration)
│   ├── ACTIVE
│   ├── INACTIVE
│   └── ...
└── Prisma DMMF Diagram (UMLClassDiagram)
```

### Relation Support

The extension supports all common relation types:

- **1:N (One-to-Many)**: `User 1 ──── 0..* Post`
- **1:1 (One-to-One)**: `User 1 ──── 0..1 Profile`
- **N:N (Many-to-Many)**: `User 0..* ──── 0..* Role`
- **Self-Reference**: `Employee 0..* ──── 1 Manager`

## Example DMMF

Here's a minimal example of a DMMF that can be imported:

```json
{
  "datamodel": {
    "models": [
      {
        "name": "User",
        "fields": [
          {"name": "id", "type": "String", "isId": true},
          {"name": "email", "type": "String", "isUnique": true},
          {"name": "name", "type": "String"}
        ]
      },
      {
        "name": "Post",
        "fields": [
          {"name": "id", "type": "Int", "isId": true},
          {"name": "title", "type": "String"},
          {"name": "userId", "type": "String"},
          {"name": "user", "type": "User", "relationName": "User_Posts"}
        ]
      }
    ],
    "enums": [
      {
        "name": "Status",
        "values": ["ACTIVE", "INACTIVE"]
      }
    ]
  }
}
```

## Limitations

### Known Limitations

1. **Embedded Types** - Currently skips embedded types (can be enabled in options)
2. **Complex Relations** - Some complex relation patterns may not be fully supported
3. **Custom Types** - Prisma custom types are treated as classes
4. **Transaction Support** - Atomic operations are limited by StarUML API
5. **Layout** - Force-directed layout is simplified

### Unsupported Prisma Features

- Prisma `@@id` and `@@unique` directives on multiple fields
- Prisma `@@map` directives
- Prisma `@@ignore` directives
- Prisma custom type mappings
- Prisma generator configurations

## Compatibility

### StarUML Versions

| StarUML Version | Supported | Notes |
|----------------|----------|------|
| StarUML v5.x | ✅ Yes | Fully supported |
| StarUML v4.x | ❌ No | Different API |
| StarUML v3.x | ❌ No | Different API |

### Prisma Versions

The extension should work with DMMF from:
- Prisma 2.x
- Prisma 3.x
- Prisma 4.x
- Prisma 5.x

## Development

### Project Structure

```
staruml-dmmf-importer/
├── package.json              # Extension metadata
├── main.js                   # Entry point and commands
├── menus/
│   └── tools.json            # Menu definitions
├── src/
│   ├── commands/
│   │   └── import-dmmf.js    # Import command logic
│   ├── dmmf/
│   │   ├── parser.js         # DMMF parsing
│   │   ├── validator.js      # DMMF validation
│   │   └── normalizer.js     # DMMF normalization
│   ├── uml/
│   │   ├── model.js          # UML model creation
│   │   ├── classes.js        # UML class creation
│   │   ├── enums.js          # UML enum creation
│   │   ├── attributes.js     # UML attribute creation
│   │   ├── associations.js   # UML association creation
│   │   └── diagram.js        # UML diagram creation
│   └── utils/
│       └── ids.js            # ID generation utilities
└── test/
    ├── dmmf-test-data.json   # Test DMMF data
    ├── test-validator.js      # Validator tests
    └── test-parser.js         # Parser tests
```

### Setting Up Development Environment

1. Clone this repository
2. Ensure Node.js is installed (for testing)
3. Install dependencies: `npm install`
4. Run tests: `node test/test-validator.js` or `node test/test-parser.js`

### Testing

```bash
# Run validator tests
node test/test-validator.js

# Run parser tests
node test/test-parser.js
```

### Debugging

To debug the extension in StarUML:

1. Open StarUML with the extension installed
2. Open Developer Tools:
   - Windows: `View > Developer > Developer Tools`
   - macOS: `View > Developer > Developer Tools`
3. Check the Console for errors
4. Use `console.log()` in your code for debugging

## API Reference

### StarUML API Used

- `app.repository.select()` - Query elements
- `app.factory.createModel()` - Create UML model elements
- `app.factory.createModelAndView()` - Create UML elements with views
- `app.factory.createDiagram()` - Create diagrams
- `app.commands.registerCommand()` - Register commands
- `app.dialogs.showOpenDialog()` - Open file dialog
- `app.dialogs.showInfoDialog()` - Show info dialog
- `app.dialogs.showErrorDialog()` - Show error dialog
- `app.dialogs.showProgressDialog()` - Show progress dialog

### Extension Commands

| Command | Description |
|---------|-------------|
| `staruml-dmmf-importer:import` | Import DMMF from file |
| `staruml-dmmf-importer:reimport` | Reimport DMMF |
| `staruml-dmmf-importer:show-options` | Show options dialog |

## Troubleshooting

### Extension Not Loading

1. Check StarUML console for errors
2. Ensure the extension is in the correct directory
3. Verify `package.json` has correct structure
4. Check that `main.js` exists and has no syntax errors

### Import Not Working

1. Verify the DMMF file is valid JSON
2. Check that the file has `datamodel.models`
3. Look for validation errors in the dialog
4. Check StarUML console for detailed errors

### No Menu Items Appear

1. Ensure `menus/tools.json` exists
2. Check that menu items reference correct commands
3. Verify commands are registered in `main.js`

## Contributing

1. Fork this repository
2. Create a feature branch
3. Make your changes
4. Run tests to ensure nothing breaks
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

- [StarUML](https://staruml.io/) - The UML modeling tool
- [Prisma](https://www.prisma.io/) - The database toolkit
- This extension is inspired by the need to bridge Prisma schemas with UML modeling

## Version History

- **v1.0.0** - Initial release
  - Support for basic DMMF import
  - UML classes, attributes, enums
  - Basic associations
  - Grid layout
  - Primary key and unique support

---

**StarUML DMMF Importer** - Bridge the gap between Prisma and UML
