/**
 * CLI argument parser.
 *
 * Parses command-line flags and returns a structured args object.
 * When --help is present, all other flags are parsed but ignored.
 */

const VERSION = '0.1.0';

export function parseArgs(argv) {
  const args = {
    port: null,
    noOpen: false,
    dataRoot: null,
    help: false,
    version: false,
  };

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--port':
        args.port = parseInt(argv[++i], 10);
        break;
      case '--no-open':
        args.noOpen = true;
        break;
      case '--data-root':
        args.dataRoot = argv[++i];
        break;
      case '--help':
        args.help = true;
        break;
      case '--version':
        args.version = true;
        break;
    }
  }

  // Validate port range
  if (args.port !== null && (args.port < 1 || args.port > 65535)) {
    console.error('Invalid port number. Must be between 1 and 65535.');
    process.exit(1);
  }

  return args;
}

export function printHelp() {
  console.log(`
akl — AKL's Knowledge CLI

Usage:
  akl [options]

Options:
  --port <number>      Port to run the server on (default: 3001)
  --no-open            Start server without opening the browser
  --data-root <path>   Path to the knowledge base data directory
  --help               Show this help message
  --version            Show the version number

Examples:
  akl                  Start on port 3001, open browser
  akl --port 4000      Start on port 4000
  akl --no-open        Start without opening browser
  akl --data-root ~/my-data   Use custom data directory
`);
}

export function printVersion() {
  console.log(`akl v${VERSION}`);
}
