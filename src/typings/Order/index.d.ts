export interface Order {
  commands?: {
    wait?: string | OrderOption
    validate?: string | OrderOption
    deploy?: string | ActionOption
    delete?: string | ActionOption
  }
  prefix?: {
    default?: LifecycleCommand[] | LifecycleCommand[][]
    [key: string]: LifecycleCommand[] | LifecycleCommand[][] | undefined
  }
  suffix?: {
    default?: LifecycleCommand[] | LifecycleCommand[][]
    [key: string]: LifecycleCommand[] | LifecycleCommand[][] | undefined
  }
  deploy?: {
    default?: string[] | string[][]
    [key: string]: string[] | string[][] | undefined
  }
  delete?: {
    default?: string[] | string[][]
    [key: string]: string[] | string[][] | undefined
  }
}

/**
 * @interface LifecycleCommand
 * @param role string role for commands to run against
 * @param action string action for commands to run against (delete or deploy)
 * @param validate string specific validate command override
 * @param wait string specific wait command override
 */
interface LifecycleCommand {
  role: string
  action: string
  validate?: string
  wait?: string
}
//
/**
 * @interface OrderOption interface for wait/validate commands
 * @param default string command for option.
 * @param deploy string command for deploy, or Toggle
 * @param delete string command for delete, or Toggle
 * @param [key:string] string command for specific branch, or Toggle
 */
interface OrderOption {
  default: string
  deploy?: string | Toggle
  delete?: string | Toggle
  [key: string]: string | Toggle | undefined
}

/**
 * @interface Toggle interface for toggle options
 * @param default toggle default command
 * @param prefix toggle prefix commands
 * @param suffix toggle suffix commands
 * @param [key:string] toggle specific branch
 */
interface Toggle {
  default?: boolean
  prefix?: boolean
  suffix?: boolean
  [key: string]: boolean | undefined
}

/**
 * @interface LifecycleOption
 * @param default command to run for LifecycleOption
 * @param [key:string] command for specific branch
 */
interface LifecycleOption {
  default: string
  [key: string]: string | undefined
}

/**
 * @interface ActionOption
 * @param default default command string
 * @param prefix string command to run for prefix
 * @param suffix string command to run for suffix
 * @param [key:string] command for specific branch
 */
interface ActionOption {
  default: string
  prefix?: string | LifecycleOption
  suffix?: string | LifecycleOption
  wait?: string | LifecycleOption
  [key: string]: string | LifecycleOption | undefined
}
