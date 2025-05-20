const { execSync } = require('child_process');

// Função para executar comandos com tratamento de erro
function run(command) {
  try {
    console.log(`Executando: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Erro ao executar: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Instalar dependências
run('npm install');

// Instalar TypeScript explicitamente
run('npm install typescript');

// Gerar cliente Prisma
run('npm run db:generate');

// Tentar compilar TypeScript de várias maneiras
const methods = [
  './node_modules/.bin/tsc --skipLibCheck',
  'npx tsc --skipLibCheck',
  'node ./node_modules/typescript/bin/tsc --skipLibCheck',
  'node ./node_modules/typescript/lib/tsc.js --skipLibCheck'
];

let success = false;
for (const method of methods) {
  console.log(`\nTentando compilar com: ${method}`);
  if (run(method)) {
    success = true;
    console.log('Compilação bem-sucedida!');
    break;
  }
}

if (!success) {
  console.error('\nTodas as tentativas de compilação falharam.');
  process.exit(1);
} else {
  console.log('\nBuild concluído com sucesso!');
}