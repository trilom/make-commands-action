export interface Order {
  commands: {
    wait: string | OrderOption | undefined
    validate: string | OrderOption | undefined
    deploy: string | ActionOption | undefined
    delete: string | ActionOption | undefined
  } | undefined
  prefix: {
    default: LifecycleCommand[] | LifecycleCommand[][] | undefined
    [key:string]: LifecycleCommand[] | LifecycleCommand[][] | undefined
  } | undefined
  suffix: {
    default: LifecycleCommand[] | LifecycleCommand[][] | undefined
    [key:string]: LifecycleCommand[] | LifecycleCommand[][] | undefined
  } | undefined
  deploy: {
    default: string[] | string[][] | undefined
    [key:string]: string[] | string[][] | undefined
  } | undefined
  delete: {
    default: string[] | string[][] | undefined
    [key:string]: string[] | string[][] | undefined
  } | undefined
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
  validate: string | undefined
  wait: string | undefined
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
  deploy: string | Toggle | undefined
  delete: string | Toggle | undefined
  [key:string]: string | Toggle | undefined
}

/**
 * @interface Toggle interface for toggle options
 * @param default toggle default command
 * @param prefix toggle prefix commands
 * @param suffix toggle suffix commands
 * @param [key:string] toggle specific branch
 */
interface Toggle {
  default: boolean | undefined
  prefix: boolean | undefined
  suffix: boolean | undefined
  [key:string]: boolean | undefined
} 

/**
 * @interface LifecycleOption
 * @param default command to run for LifecycleOption
 * @param [key:string] command for specific branch
 */
interface LifecycleOption {
  default: string
  [key:string]: string | undefined
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
  prefix: string | LifecycleOption | undefined
  suffix: string | LifecycleOption | undefined
  wait: string | LifecycleOption | undefined
  [key:string]: string | LifecycleOption | undefined
}


