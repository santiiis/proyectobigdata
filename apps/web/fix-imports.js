const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src/app/api', function(filePath) {
  if (filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/import\s*\{\s*successResponse,\s*errorResponse\s*\}\s*from\s*"@\/lib\/responses";/g, 'import { successResponse } from "@/lib/responses";');
    content = content.replace(/import\s*\{\s*errorResponse,\s*successResponse\s*\}\s*from\s*"@\/lib\/responses";/g, 'import { successResponse } from "@/lib/responses";');
    
    // Some still have errorResponse imported alone from responses?
    content = content.replace(/import\s*\{\s*errorResponse\s*\}\s*from\s*"@\/lib\/responses";/g, '');

    // Add errorResponse to lib/errors
    if (!content.includes('errorResponse } from "@/lib/errors"')) {
        content = content.replace(/import\s*\{\s*AppError\s*\}\s*from\s*"@\/lib\/errors";/g, 'import { AppError, errorResponse } from "@/lib/errors";');
    }

    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', filePath);
    }
  }
});
