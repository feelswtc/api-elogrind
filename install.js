const { execSync } = require('child_process');

// Instalar dependências regulares
console.log('Installing dependencies...');
execSync('npm install', { stdio: 'inherit' });

// Instalar definições de tipos explicitamente
console.log('Installing type definitions...');
execSync('npm install --no-save @types/node @types/express @types/cors @types/hpp', { stdio: 'inherit' });

// Gerar cliente Prisma
console.log('Generating Prisma client...');
execSync('npm run db:generate', { stdio: 'inherit' });

// Compilar TypeScript
console.log('Building project...');
execSync('npm run build', { stdio: 'inherit' });