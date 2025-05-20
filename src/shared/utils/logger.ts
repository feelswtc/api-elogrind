interface ColorOptions {
  color?: AnsiColor
  fullcolor?: boolean
}

export enum AnsiColor {
  Reset = "\x1b[0m",
  Green = "\x1b[32m",
  Cyan = "\x1b[36m",
  Grey = "\x1b[90m",
  Red = "\x1b[31m",
  Purple = "\x1b[35m",
  Orange = "\x1b[33m",
}

export default class Logger {
  private static isProduction = process.env.NODE_ENV === "production"

  static log(level: string, message: string, options?: ColorOptions): void {
    const timestamp = new Date().toISOString()

    if (this.isProduction) {
      // In production, output JSON logs for better parsing
      console.log(
        JSON.stringify({
          timestamp,
          level,
          message,
        }),
      )
      return
    }

    // Development logging with colors
    const formattedTimestamp = Logger._color(`[${timestamp}]`, AnsiColor.Grey)

    if (!options?.color) {
      console.log(`\x1b[32m${formattedTimestamp}${AnsiColor.Reset} [${level}] ${message}`)
      return
    }

    if (options.fullcolor) {
      message = Logger._color(`[${level}] ${message}`, options.color)
    } else {
      const coloredLevel = Logger._color(`[${level}]`, options.color)
      message = `${coloredLevel} ${message}`
    }

    console.log(`${formattedTimestamp} ${message}`)
  }

  static info(message: string): void {
    Logger.log("INFO", message, {
      color: AnsiColor.Cyan,
    })
  }

  static error(message: string, error: Error): void {
    const errorDetails = this.isProduction ? error.message : `${error.message}\n${error.stack}`

    Logger.log("ERROR", `${message} ${errorDetails}`, {
      color: AnsiColor.Red,
    })
  }

  static warn(message: string): void {
    Logger.log("WARN", message, {
      color: AnsiColor.Orange,
    })
  }

  private static _color(message: string, color: AnsiColor): string {
    return `${color}${message}${AnsiColor.Reset}`
  }
}
