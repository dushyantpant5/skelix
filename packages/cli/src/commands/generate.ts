import { Command } from 'commander'
import chalk from 'chalk'
import { existsSync, readFileSync } from 'fs'
import { resolve, extname } from 'path'
import { generateAndWrite } from '@skelix/core'
import { getAdapter } from '@skelix/adapters'
import type { SkelixConfig } from '@skelix/core'

const DEFAULT_CONFIG: SkelixConfig = {
  adapter: 'tailwind',
  outputDir: null,
  naming: 'suffix',
  repeatCount: 3,
  componentMap: {},
  skeleton: {
    baseColor: 'bg-gray-200',
    animation: 'animate-pulse',
  },
}

function loadConfig(configPath: string): Partial<SkelixConfig> {
  if (!existsSync(configPath)) return {}
  try {
    const raw = readFileSync(configPath, 'utf-8')
    return JSON.parse(raw) as Partial<SkelixConfig>
  } catch (err) {
    console.warn(chalk.yellow(`⚠ Could not parse config file: ${configPath}`))
    return {}
  }
}

export const generateCommand = new Command('generate')
  .description('Generate a skeleton loading component from a React component')
  .argument('<file>', 'Path to the React component .tsx file')
  .option('--ui <adapter>', 'UI library adapter (tailwind, shadcn, mui, chakra)', 'tailwind')
  .option('--out <dir>', 'Output directory (default: same as source file)')
  .option('--name <pattern>', 'Naming pattern: suffix (UserCardSkeleton.tsx) or dot (UserCard.skeleton.tsx)', 'suffix')
  .option('--config <path>', 'Path to config file', 'skelix.config.json')
  .action(async (file: string, opts: { ui: string; out?: string; name: string; config: string }) => {
    try {
      // Validate file
      const absFile = resolve(file)
      if (!existsSync(absFile)) {
        console.error(chalk.red(`✖ File not found: ${file}`))
        process.exit(1)
      }
      if (extname(absFile) !== '.tsx') {
        console.error(chalk.red(`✖ File must be a .tsx file: ${file}`))
        process.exit(1)
      }

      // Load and merge config
      const fileConfig = loadConfig(resolve(opts.config))
      const mergedConfig: SkelixConfig = {
        ...DEFAULT_CONFIG,
        ...fileConfig,
        componentMap: {
          ...(DEFAULT_CONFIG.componentMap ?? {}),
          ...(fileConfig.componentMap ?? {}),
        },
        skeleton: {
          ...DEFAULT_CONFIG.skeleton,
          ...(fileConfig.skeleton ?? {}),
        },
      }

      // CLI flags override config
      const adapterName = opts.ui ?? mergedConfig.adapter
      const naming = (opts.name as 'suffix' | 'dot') ?? mergedConfig.naming

      // Get adapter (validates name)
      let adapter
      try {
        adapter = getAdapter(adapterName)
      } catch (err) {
        console.error(chalk.red(`✖ Unknown adapter "${adapterName}". Available: tailwind, shadcn, mui, chakra`))
        process.exit(1)
      }

      const { outputPath } = await generateAndWrite(
        file,
        {
          adapter: adapterName,
          outputDir: opts.out ?? mergedConfig.outputDir,
          naming,
          repeatCount: mergedConfig.repeatCount,
          config: mergedConfig,
          cwd: process.cwd(),
        },
        (node) => adapter.render(node)
      )

      const shortPath = outputPath.replace(process.cwd() + '/', '')
      console.log(chalk.green(`✔ Generated ${shortPath}`))
    } catch (err) {
      if (err instanceof SyntaxError || (err as any)?.code === 'BABEL_PARSE_ERROR') {
        console.error(chalk.red(`✖ Failed to parse JSX in ${file}: ${(err as Error).message}`))
      } else {
        console.error(chalk.red(`✖ ${(err as Error).message}`))
      }
      process.exit(1)
    }
  })
