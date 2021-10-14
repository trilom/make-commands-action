const core = require('@actions/core');
const fs = require('fs');
const yaml = require('js-yaml');
const _isEqual = require('lodash.isequal'); // array
const _union = require('lodash.union');
const _uniqWith = require('lodash.uniqwith');
const _uniq = require('lodash.uniq');

var env, home, repo, dev
var modified, added, remove
const logLevel = 'debug'
// set up dev env
process.argv.forEach((val, index) => {
    if ( val === 'dev' ) {
        dev = true
        env = 'prod'
        home = '/Users/bkillian/repos/cloudformation/.github/actions/make_commands/test'
        repo = '/Users/bkillian/repos/cloudformation/cloudformation'
    }
});

if ( env === undefined ) {
    dev = false
    env = process.env.env;
    home = process.env.HOME;
    repo = `${home}/work/cloudformation/cloudformation/cloudformation`
}
// try to read files from github action
try {
    modified = Array.from(JSON.parse(fs.readFileSync(`${home}/files_modified.json`, 'utf8').toString()));
    added = Array.from(JSON.parse(fs.readFileSync(`${home}/files_added.json`, 'utf8').toString()));
    remove = Array.from(JSON.parse(fs.readFileSync(`${home}/files_removed.json`, 'utf8').toString()));
} catch (error) {
    log(error.message, 'error')
    core.setFailed(`Couldn't load necessary files from files-changes-action ${error.message}`);
}
const actions = ['deploy', 'delete', 'validate']
const lifecycles = ['prefix', 'deploy', 'suffix']

var commands = {
    'changes': {
        'prefix': [],
        'suffix': [],
        'delete': [],
        'deploy': []
    },
    'deploy': {
        // 'prefix': [
        //     {
        //         'command': '',
        //         'wait_command': ''
        //     }
        // ],
        'prefix': [],
        'deploy': [],
        'suffix': []
    },
    'delete': {
        'deploy': []
    },
    'validate': {
        'deploy': []
    }
}

const logs = {
    'core': {
        "debug": "debug",
        "info": "info",
        "warn": "warning",
        "warning": "warning",
        "error": "error",
        "critical": "error"
    },
    'local': {
        "debug": "log",
        "info": "info",
        "warn": "warn",
        "warning": "warn",
        "error": "error",
        "critical": "error"
    }
}

var mappings = { delete: [], deploy: [] }

var templates = { delete: [], deploy: [] }

var changedProducts = { deploy: [], delete: [] }

// Logger
function log(message, level = logLevel) {
    if (typeof level !== 'string') {
        console.error(`error logging, please send a string not a ${typeof level}`)
    } else {
        if (dev) {
            console[logs.local[level]](message)
        } else {
            core[logs.core[level]](message)
        }
    }
}

function json(obj, encoding = 'utf-8') {
    // log(`returning JSON obj of: ${obj}`)
    let ret
    if (typeof obj === 'object') {
        ret = JSON.stringify(obj, encoding, 2);
    } else if (typeof obj === `string`) {
        // try to parse
        try {
            ret = JSON.parse(obj, encoding, 2)
        } catch (err) {
            ret = obj
        }
    } else {
        ret = obj
    }
    return ret
}

// generate a make string.  pass in no action for validate
function makeString(template, action = null, waitAction = null) {
    if (action === null || action === 'validate') {
        return `make validate TEMPLATE='${template}' ENV='${env}'`
    } else if ( action === 'wait' ) {
        return `make wait TEMPLATE='${template}' ENV='${env}' ACTION='${waitAction}'`
    } else {
        return `make ${action} TEMPLATE='${template}' ENV='${env}' CI=true`
    }
}

// push templates to deploy/delete/validate deploy lifecycle
// pass in a target array (of arrays), the index to put your string
// the acton and template for the make command
// it will safely create places in the array for objects
// and not insert duplicates
function safePush(target, index, action, template) {
    log(`In safePush...`, 'info')
    log(`Index: ${index} action: ${action} template: ${template}`)
    if (index === -2) {
        return; // -2 is an index set in deep search to say that it wasn't found in the order as well but order was defined, so it shouldn't be here at all
    }
    let exists = false;
    let cmd = makeString(template, action)
    let waitCmd = makeString(template, 'wait', action)
    target.forEach(parent => {
        parent.forEach(child => {
            if (JSON.stringify(child) === JSON.stringify({ 'cmd': cmd, 'waitCmd': waitCmd })) {
                exists = true
            }
        })
    })
    if (!exists) {
        if (target[index] === undefined) {
            log(`Pushing empty array...`, 'info')
            target.push([]);
            index = target.length - 1;
        }
        log(`Pushing ${template} with action ${action} to ${json(target[index])}`)
        log(`Pushing to command object...${template}`)
        target[index].push({ 'cmd': cmd, 'waitCmd': waitCmd });
        if (action === 'deploy') {
            commands.validate.deploy.push(makeString(template))
        }
        // push to changes obj
        commands.changes[action].push(`${template}-${env}`)
        log(`Pushed success: ${json(target[index])}`);
    } else {
        log(`Make command already exists, bye!`, 'info')
    }
}

// creates make commands for mapping file changes
// pass in an action to build cmds for and a mapping file
// if a mapping file changes, we roll out all templates
// based on the order file
//
// if there is no order file then it assumes
// that it's a "singleton" template and grabs all
// templates named PRODUCT-*.yaml/yml
function mappingCommands(action, mapping, file) {
    var target = commands[action].deploy;
    try {
        let orderYaml = yaml.safeLoad(fs.readFileSync(`${repo}/order/${file}`, 'utf8'));
        // parse it, add deleteCommands, and return from loop
        if (orderYaml.deploy[env] !== null) {
            let order = (action === 'deploy') ? orderYaml.deploy[env] : orderYaml.deploy[env].reverse();
            if (order !== null) {
                order.forEach(role => {
                    if (Array.isArray(role)) {
                        role.forEach(nestedRole => {
                            let template = `${mapping.product}-${nestedRole}`
                            safePush(target, order.indexOf(role), action, template);
                        })
                    } else {
                        let template = `${mapping.product}-${role}`
                        safePush(target, order.indexOf(role), action, template);
                    }
                });
            } else {
                log(`Order defined, but there is a null/empty order in ${action}.${env}`)
            }
        } else {
            log(`No order specified for ${file} in env:${env} for action ${action}.`, 'info')
            // this means that the file was found (we know the product exists) but we haven't
            // specified an order (intent to not deploy) so we skip this one
        }
        return
    } catch (e) {
        log(`Error parsing yaml order: ${e}`)
        return
    }
}

// creates make commands template changes
// pass in an action to build cmds for and a template file
// if there is no order file then it assumes
// that it's a singleton template and deploys the template
function templateCommands(action, template, file) {
    var target = commands[action].deploy;
    try {
        let orderYaml = yaml.safeLoad(fs.readFileSync(`${repo}/order/${file}`, 'utf8'));
        if (orderYaml.deploy[env] !== null) {
            let order = (action === 'deploy') ? orderYaml.deploy[env] : orderYaml.deploy[env].reverse();
            if (order !== null) {
                order.forEach(role => {
                    if (Array.isArray(role)) {
                        role.forEach(nestedRole => {
                            if (nestedRole === template.role) {
                                // match push to array
                                safePush(target, order.indexOf(role), action, `${template.product}-${template.role}`)
                                return
                            }
                        })
                    } else {
                        if (role === template.role) {
                            // match push to array
                            safePush(target, order.indexOf(role), action, `${template.product}-${template.role}`)
                            return
                        }
                    }
                });
                return
            } else {
                log(`No order specified for ${file} in env:${env} for action ${action}.`, 'info')
            }
            return
        }
    } catch (error) {
        log(`Error getting order file: ${error}`, 'error')
    }
}

// pass in each file and associated action
// this will check if it is necessary for the deployment
// if it's a function it gets deployed with it's PRODUCT-ROLE template
// if it's a mapping then every PRODUCT
// if its a template than the PRODUCT-ROLE is deployed
function updateLists(file, action) {
    let fileParts = file.split('/');
    if (fileParts[0] === 'functions' && fileParts[1].split('.')[0].split('-').length === 2 && action === 'deploy') {
        let functionDir = fileParts[1];
        let product = functionDir.split('.')[0].split('-')[0];
        let role = functionDir.split('.')[0].split('-')[1];
        let template = JSON.parse(`{ "product": "${product}", "role": "${role}" }`)
        let exists = (templates[action].indexOf(template) === -1);
        (exists) ? templates[action].push(template) : null;
    } else if (fileParts[0] === 'functions' && fileParts[1].split('.')[0].split('-').length < 2) {
        /* This is a function that is in a directory named PRODUCT */
        log(`Unknown file: ${file}`);
    } else {
        if (fileParts[1] === 'mappings') {
            let mappingFile = fileParts[2];
            let product = mappingFile.split('.')[1];
            let mapping = JSON.parse(`{ "product": "${product}" }`);
            (mappings[action].indexOf(mapping) === -1) ? mappings[action].push(mapping) : null;
        } else if (fileParts[1] === 'templates') {
            let templateFile = fileParts[2];
            let product = templateFile.split('.')[0].split('-')[0];
            let role = templateFile.split('.')[0].split('-')[1];
            let template = JSON.parse(`{ "product": "${product}", "role": "${role}" }`)
            let exists = (templates[action].indexOf(template) === -1);
            (exists) ? templates[action].push(template) : null;
        } else {
            log(`Unknown file: ${file}`);
        }
    }
}

// Just a wrapper for this with error handling
function existsSync(path) {
    try {
        log(`in existsSync ${path}`)
        return fs.existsSync(path)
    } catch(err) {
        log(`encountered an error looking for file at ${path}`)
        throw err
    }
}

function searchPath(path, type) {
    try {
        // with path and type set, lets try to find a file
        if (Array.isArray(type)) {
            log(type)
            // type is an array
            for (i = 0; i <= type.length - 1; i++) {
                log(`${type[i]}`)
                found = existsSync(`${path}${type[i]}`)
                if (found) {
                    return `${path}${type[i]}`
                }
            }
        } else {
            found = existsSync(`${path}`)
            if (found) {
                return `${path}`
            }
        }
        return false
    } catch (error) {
        log(`error looking for yaml file ${err}`)
        return false
    }
}

// if you if you pass in blank it assumes a full file
// if you pass in an extention it assumes you don't exactly know
// the extension but want to check for alternatives (.yml, .yaml)
function fileExist(file, type = null) {
    let path
    let found = false
    // sort inputs
    log(`${file} ${type}`)
    if (type === null) {
        // no type, assume its just a path
        path = file
    } else if (Array.isArray(type)) {
        // array type, assume it's file types to try
        path = path = `${file}.`
    } else {
        if (['yaml', 'yml'].includes(type)) {
            // yaml passed in as type, try both yaml types
            path = `${file}.`
            type = ['yaml', 'yml']
        } else {
            // else just assume its a lone type
            path = `${file}.${type}`
        }
    }
    return searchPath(path, type)
}

// get all modified files and put them into lists sorted by delete and deploy
function getModifiedFiles() {
    // get removed files
    (remove.length === 0) ? null : remove.forEach(file => {
        updateLists(file, 'delete');
    });
    // get added/modified files
    (modified.length === 0 && added.length === 0) ? null : _union(modified, added).forEach(file => {
        updateLists(file, 'deploy');
    });
}

// this creates make commands to load into commands object
function createMakeCommands() {
    orderFiles = fs.readdirSync(`${repo}/order/`)

    // create make commands for mappings
    Object.keys(mappings).forEach(action => {
        log(`Creating make commands for action ${action}...`);
        _uniqWith(mappings[action], _isEqual).forEach(mapping => {
            log(`Creating make commands for mapping ${json(mapping)}...`);
            let found = orderFiles.find(file => {
                return file.includes(mapping.product)
            })
            if (found === undefined) {
                log(`Didnt find ${json(mapping)}, pushing anyway...`)
                fs.readdirSync(`${repo}/templates/`).forEach(file => {
                    let template = file.toString().replace('.yml', '').replace('.yaml', '')
                    let target = commands[action].deploy;
                    template.includes(mapping.product) ? safePush(target, target.length, action, template) : null;
                });
            } else {
                log(`Found ${json(mapping)}, pushing...`)
                mappingCommands(action, mapping, found);
            }
        })
    })
    // create make commands for templates
    Object.keys(templates).forEach(action => {
        log(`Creating make commands for action ${action}...`);
        _uniqWith(templates[action], _isEqual).forEach(template => {
            log(`Creating make commands for template ${json(template)}...`);
            let found = orderFiles.find(file => {
                return file.includes(template.product)
            })
            if (found === undefined) {
                log(`Didnt find ${json(template)}, pushing anyway...`)
                safePush(target, target.length, action, `${template.product}-${template.role}`);
            } else {
                log(`Found ${json(template)}, pushing...`)
                templateCommands(action, template, found);
            }
        })
    })
}

function listChangedProducts() {
    // look at changed stacks for products to deploy, make unique list of changed products
    // for each template named in changes per action
    Object.keys(commands.changes).forEach(action => {
        commands.changes[action].forEach(product => {
            if (!changedProducts[action].includes(product.split('-')[0])) {
                changedProducts[action].push(product.split('-')[0])
                log(`Found changed product at: ${product.split('-')[0]}`)
            }
        })
    })
}

function getLifecycleActions() {
    log('                                                                                               In getLifecycleActions...')
    // look at each changed PRODUCT
    changedProducts.deploy.forEach(product => {
        // get products ORDER
        log(`Starting to process changes for PRODUCT:${product}...`)
        let file = `${repo}/order/${product}`
        // make sure the order exists
        try {
            file = fileExist(file, 'yml')
        } catch (err) {
            core.error(err)
            core.setFailed(`${err.message}:  couldn't find order file named ${file} in yml or yaml, please check it`);
        }
        // if file === BOOL then it doesn't exist
        if (typeof file != Boolean) {
            // open up changed PRODUCTs ORDER yaml
            log(`Found a file, beginning to load ${file}...`)
            let orderYaml = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
            // only concerend with PREFIX and SUFFIX lifecycles here
            lifecycles.forEach(lifecycle => {
                if (lifecycle !== 'deploy') {
                    log(`Parsing LIFECYCLE:${lifecycle} from LIFECYCLES:${lifecycles}`)
                    order = orderYaml[lifecycle][env]
                    log(`Found ORDER:${json(order)}, looping through it...`)
                    if (order !== null && order !== undefined) {
                        order.forEach(subOrder => {
                            let index = order.indexOf(subOrder)
                            log(`Working on SUBORDER#${index}`)
                            if (Array.isArray(subOrder)) {
                                subOrder.forEach(subAction => {
                                    let realProduct = (subAction.product === undefined) ? product : subAction.product;
                                    pushLifecycleAction(subAction, lifecycle, realProduct, index)
                                })
                            } else {
                                let realProduct = (subOrder.product === undefined) ? product : subOrder.product;
                                pushLifecycleAction(subOrder, lifecycle, realProduct, index)
                            }
                        })
                    } else {
                        log(`Did not find an order for this template, order is -1.`)
                    }
                }
            })
        }
    })
}

function pushLifecycleAction(actionObj, lifecycle, product, index) {
    let template = `${product}-${actionObj.role}`
    // make sure lifecycle exists in target object
    if (commands.deploy.hasOwnProperty(lifecycle)) {
        // make sure command is a valid command
        if (actions.includes(actionObj.action)) {
            let cmd = makeString(template, actionObj.action)
            let waitCmd = makeString(template, 'wait', actionObj.action)
            // if it doesn't exist push empty arrays until it does
            while (index - commands.deploy[lifecycle].length >= 0) {
                commands.deploy[lifecycle].push([])
            }
            // see if target array has string already
            commands.deploy[lifecycle][index].forEach(subAction => {
                if (JSON.stringify(subAction) === JSON.stringify({ 'cmd': cmd, 'waitCmd': waitCmd })) {
                    commands.deploy[lifecycle][index].push({ 'cmd': cmd, 'waitCmd': waitCmd })
                }
            })
            // check to see if underlying action is deploy and if it's already beign validated
            isDeploy = actionObj.action === 'deploy'
            commandExists = (commands.validate.deploy.includes(makeString(template))) ? true : false
            if (isDeploy && !commandExists) {
                // validate the template if we are not validating already
                commands.validate.deploy.push(makeString(template))
            }
            if (!commands.changes[lifecycle].includes(`${template}-${env}`)) {
                // push change information
                commands.changes[lifecycle].push(`${template}-${env}`)
            }
            log(`Pushed ${lifecycle}:${actionObj.action} command for template ${product}-${actionObj.role}.`, 'info')
        } else {
            console.log('here')
            log(`Received an action that doesnt jive: ${actionObj.action} for template ${template} placed at index${index} in ${json(commands.deploy[lifecycle])}.`, 'warn')
        }
    } else {
        log(`Received lifecycle that doesnt jive: ${lifecycle} for template ${product}-${actionObj.role} placed at index${index} in ${json(commands.deploy)}.`, 'warn')
    }
}

try {
    log(`modified files (${modified.length}): ${modified}`);
    log(`added files (${added.length}): ${added}`);
    log(`remove files (${remove.length}): ${remove}`);

    // get list of removed files and put them into mappings and templates objects
    log('GETTING MODIFIED FILES', 'info')
    getModifiedFiles()
    // create make commands and store in commands object
    log('CREATING MAKE COMMANDS', 'info')
    createMakeCommands()
    // create a list of products that have changed
    log('LISTING CHANGED PRODUCTS', 'info')
    listChangedProducts()
    // build the prefix and suffix lifecycle actions
    log('GETTING LIFECYCLE ACTIONS', 'info')
    getLifecycleActions()

    // OUTPUT TIME
    log(`mappings: ${json(mappings)}`);
    log(`templates: ${json(templates)}`);

    // create make commands for templates
    Object.keys(commands).forEach( action => {
        Object.keys(commands[action]).forEach( lifecycle => {
            log(`commands.${action}.${lifecycle}: ${json(commands[action][lifecycle])}`, 'info');
            let file = `${home}/${(dev ? 'out/' : '')}${lifecycle}_${action}${((action === 'changes') ? '' : '_commands')}.json`
            try {
                fs.writeFileSync(file, json(commands[action][lifecycle], 'utf-8'));
            } catch (error) {
                log(`found an error: ${json(error)}`)
            }
        })
    })

    // combine all 'changes' arrays into 1 (stacks.json)
    try {
        file = `${home}/${(dev ? 'out/' : '')}stacks.json`
        c = commands.changes
        fs.writeFileSync(file, json(_union(c.deploy, c.delete, c.prefix, c.suffix)))
    } catch (error) {
        log(`found an error: ${json(error)}`)
    }
    (commands.delete.deploy.length != 0 || commands.deploy.deploy.length != 0)
        ? process.exit(0)
        : process.exit(1);
    } catch (error) {
        core.error(error)
        core.setFailed(error.message);
}

/**
 * Expectations:
 *  mapping change:
 *      - If a mapping changes for an environment, then we will deploy the environment IF there is structure defined in deploy.
 *      For example: If your order.yaml specifies prefix/suffix work but the deploy object is empty for the env then the prefix/suffix
 *      work will not be completed by the deploy.
 *  template change:
 *
 *
 * conditions:
 *
 * SUCCESS
 *
 * inputs:
 *      env - string - no requirements, it should match to env's defined in templates/mappings/order files
 *      files_added - [strings] - should be output from GH action listing files added with this action.
 *      files_removed - [strings] - should be output from GH action listing files removed with this action.
 *      files_modified - [strings] - should be output from GH action listing files modified with this action.
 *          check json above to make sure everything is [strings]
 *
 * action:
 *      modify(add)
 *      delete
 *
 * quantities:
 *      single modify
 *      single delete
 *      single modify and delete
 * failures:
 *      RUNTIME mapping file doesn't exist (misspelling)
 *      RUNTIME template file doesn't exist (misspelling)
 *      order structure (not well formed yaml) LIFECYCLE.ENV[obj({role:'database', action:'delete'}) | string (template name) | array of obj/string]
 *
 *      check logic:
 *          given output:
 *              delete_changes: all template names should match a string in the files_removed array AND template should map to an ORDER for env (intent to deploy)
 *              deploy_changes: all template names should match a string in either files_added or files modified array AND template should map to an ORDER for env
 *              prefix_changes: all template names should match a string({order_file_name}-{any 'role' from nested obj in env})
 *              suffix_changes: all template names should match a string({order_file_name}-{any 'role' from nested obj in env})
 */
