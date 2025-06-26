// src/utils/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogTag = 
  | 'selection' 
  | 'plugin' 
  | 'parser' 
  | 'render' 
  | 'event'
  | 'store'
  | 'ui'
  | 'hotkey';

interface LoggerConfig {
  enabledTags: LogTag[];
  minLevel: LogLevel;
  showTimestamp: boolean;
  showTag: boolean;
}

class Logger {
  private static instance: Logger;
  private config: LoggerConfig = {
    enabledTags: ['selection', 'plugin', 'render', 'ui', 'event'], // Enable multiple tags for debugging
    minLevel: 'debug',
    showTimestamp: true,
    showTag: true
  };

  private logLevelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  private tagColors: Record<LogTag, string> = {
    selection: '#3b82f6', // blue
    plugin: '#10b981',    // green
    parser: '#f59e0b',    // amber
    render: '#8b5cf6',    // purple
    event: '#ef4444',     // red
    store: '#06b6d4',     // cyan
    ui: '#84cc16',        // lime
    hotkey: '#f97316'     // orange
  };

  private tagEmojis: Record<LogTag, string> = {
    selection: '🎯',
    plugin: '🔌',
    parser: '📄',
    render: '🎨',
    event: '⚡',
    store: '💾',
    ui: '🖼️',
    hotkey: '⌨️'
  };

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public enableTags(...tags: LogTag[]): void {
    this.config.enabledTags = [...new Set([...this.config.enabledTags, ...tags])];
  }

  public disableTags(...tags: LogTag[]): void {
    this.config.enabledTags = this.config.enabledTags.filter(tag => !tags.includes(tag));
  }

  public enableOnly(...tags: LogTag[]): void {
    this.config.enabledTags = tags;
  }

  public disableAll(): void {
    this.config.enabledTags = [];
  }

  private shouldLog(tag: LogTag, level: LogLevel): boolean {
    if (!this.config.enabledTags.includes(tag)) return false;
    return this.logLevelPriority[level] >= this.logLevelPriority[this.config.minLevel];
  }

  private formatMessage(tag: LogTag, _level: LogLevel, message: string, ..._args: any[]): string {
    const parts: string[] = [];

    if (this.config.showTimestamp) {
      const timestamp = new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        timeZone: 'Asia/Seoul' 
      });
      parts.push(`[${timestamp}]`);
    }

    if (this.config.showTag) {
      const emoji = this.tagEmojis[tag];
      const tagStr = tag.toUpperCase().padEnd(9);
      parts.push(`${emoji} ${tagStr}`);
    }

    return parts.join(' ') + ' ' + message;
  }

  private log(tag: LogTag, level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(tag, level)) return;

    const formattedMessage = this.formatMessage(tag, level, message);
    const color = this.tagColors[tag];

    const consoleMethod = level === 'error' ? console.error :
                         level === 'warn' ? console.warn :
                         level === 'info' ? console.info : console.log;

    if (args.length > 0) {
      consoleMethod(
        `%c${formattedMessage}`,
        `color: ${color}; font-weight: bold;`,
        ...args
      );
    } else {
      consoleMethod(
        `%c${formattedMessage}`,
        `color: ${color}; font-weight: bold;`
      );
    }
  }

  public debug(tag: LogTag, message: string, ...args: any[]): void {
    this.log(tag, 'debug', message, ...args);
  }

  public info(tag: LogTag, message: string, ...args: any[]): void {
    this.log(tag, 'info', message, ...args);
  }

  public warn(tag: LogTag, message: string, ...args: any[]): void {
    this.log(tag, 'warn', message, ...args);
  }

  public error(tag: LogTag, message: string, ...args: any[]): void {
    this.log(tag, 'error', message, ...args);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions for common tags
export const log = {
  selection: (level: LogLevel, message: string, ...args: any[]) => (logger as any)[level]('selection', message, ...args),
  plugin: (level: LogLevel, message: string, ...args: any[]) => (logger as any)[level]('plugin', message, ...args),
  parser: (level: LogLevel, message: string, ...args: any[]) => (logger as any)[level]('parser', message, ...args),
  render: (level: LogLevel, message: string, ...args: any[]) => (logger as any)[level]('render', message, ...args),
  event: (level: LogLevel, message: string, ...args: any[]) => (logger as any)[level]('event', message, ...args),
  store: (level: LogLevel, message: string, ...args: any[]) => (logger as any)[level]('store', message, ...args),
  ui: (level: LogLevel, message: string, ...args: any[]) => (logger as any)[level]('ui', message, ...args),
  hotkey: (level: LogLevel, message: string, ...args: any[]) => (logger as any)[level]('hotkey', message, ...args),
};

// Dev tools - expose to window for browser console control
if (typeof window !== 'undefined') {
  (window as any).debugLog = {
    enable: (...tags: LogTag[]) => logger.enableTags(...tags),
    disable: (...tags: LogTag[]) => logger.disableTags(...tags),
    only: (...tags: LogTag[]) => logger.enableOnly(...tags),
    off: () => logger.disableAll(),
    all: () => logger.enableOnly('selection', 'plugin', 'parser', 'render', 'event', 'store', 'ui', 'hotkey')
  };
}