/**
 * Logger utilitaire pour gérer les logs en développement/production
 */

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

const isDevelopment = import.meta.env.DEV;

class Logger {
  private static log(level: LogLevel, emoji: string, message: string, ...args: any[]) {
    if (!isDevelopment) return;
    
    const timestamp = new Date().toLocaleTimeString();
    console[level](`[${timestamp}] ${emoji} ${message}`, ...args);
  }

  static security(message: string, ...args: any[]) {
    this.log('log', '🔐', `SECURITY - ${message}`, ...args);
  }

  static admin(message: string, ...args: any[]) {
    this.log('log', '🔒', `ADMIN - ${message}`, ...args);
  }

  static campaign(message: string, ...args: any[]) {
    this.log('log', '📊', `CAMPAIGN - ${message}`, ...args);
  }

  static payment(message: string, ...args: any[]) {
    this.log('log', '💳', `PAYMENT - ${message}`, ...args);
  }

  static affiliate(message: string, ...args: any[]) {
    this.log('log', '🤝', `AFFILIATE - ${message}`, ...args);
  }

  static error(message: string, ...args: any[]) {
    this.log('error', '🚨', `ERROR - ${message}`, ...args);
  }

  static warning(message: string, ...args: any[]) {
    this.log('warn', '⚠️', `WARNING - ${message}`, ...args);
  }

  static info(message: string, ...args: any[]) {
    this.log('info', 'ℹ️', `INFO - ${message}`, ...args);
  }

  static debug(message: string, ...args: any[]) {
    this.log('debug', '🐛', `DEBUG - ${message}`, ...args);
  }
}

export default Logger;