# make-commands-action

[![codecov](https://codecov.io/gh/trilom/make-commands-action/branch/master/graph/badge.svg)](https://codecov.io/gh/trilom/make-commands-action)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Integration Tests](https://github.com/trilom/make-commands-action/workflows/Integration%20Tests/badge.svg)

- [make-commands-action](#make-commands-action)
  - [Simple Usage _default_ (without order files)](#simple-usage-default-without-order-files)
    - [Simple Usage (with order file)](#simple-usage-with-order-file)
  - [Advanced Usage (with order files)](#advanced-usage-with-order-files)
  - [Expert Usage (with order files monorepo)](#expert-usage-with-order-files-monorepo)
  - [Inputs](#inputs)
    - [deploy](#deploy)
    - [delete](#delete)
      - [deploy and delete string replacements](#deploy-and-delete-string-replacements)
    - [files](#files)
    - [files_added](#files_added)
    - [files_modified](#files_modified)
    - [files_removed](#files_removed)
    - [order](#order)
    - [order_location](#order_location)
    - [mapping_location](#mapping_location)
    - [template_location](#template_location)
    - [template_nested](#template_nested)
    - [branch](#branch)
  - [Outputs](#outputs)
    - [output](#output)
    - [deploy](#deploy-1)
    - [delete](#delete-1)
    - [prefix](#prefix)
    - [suffix](#suffix)
    - [validate](#validate)
  - [Order File Structure](#order-file-structure)
  - [Template File Structure](#template-file-structure)
  - [Mapping File Structure](#mapping-file-structure)

This action will take the inputs of files added, files modified, files removed, and/or all files and spit out **organized** commands for scripts to be ran later in the workflow.

## Simple Usage _default_ (without order files)

This uses action inputs `delete` and `files_deleted` to create delete commands, and `deploy`, `files_added` and `files_modified` to create commands for deploy.

```yaml
# bare minimal
name: changes
on: push
jobs:
  changes:
    runs-on: ubuntu-latest
    steps:
      - id: file_changes
        uses: trilom/make-commands-action@master
        with:
          files_added: '["infrastructure/templates/simple/web.yaml"]'
          files_deleted: '["infrastructure/templates/simple/database.yaml"]'
          files_modified: '["infrastructure/templates/simple/sso.yaml", "infrastructure/templates/simple/email.yaml"]'
          deploy: make deploy PRODUCT={{PRODUCT}} ROLE={{ROLE}}
          delete: make delete ROLE={{ROLE}}
```

Will output a JSON object as follows for **any** branch:

```json
{
    "delete": ["make delete ROLE=database"],
    "deploy": [
        "make deploy PRODUCT=simple ROLE=sso",
        "make deploy PRODUCT=simple ROLE=web",
        "make deploy PRODUCT=simple ROLE=email"
    ]
}
```

### Simple Usage (with order file)

Suppose you want to deploy sso and web at the same time?  

```yaml
name: changes
on: push
jobs:
  changes:
    runs-on: ubuntu-latest
    steps:
      - id: file_changes
        uses: trilom/make-commands-action@master
        with:
          files_added: '["infrastructure/templates/simple/web.yaml"]'
          files_deleted: '["infrastructure/templates/simple/database.yaml"]'
          files_modified: '["infrastructure/templates/simple/sso.yaml", "infrastructure/templates/simple/email.yaml"]'
          order: true
```

> **You could add an order file at infrastructure/order/simple.yaml**

```yaml
commands:
  delete: make delete ROLE={{ROLE}}
  deploy: make deploy ENV={{BRANCH}} TEMPLATE={{PATH}}
deploy:
  master:
    - database
    - email
    -
      - web
      - sso
```

Will output a JSON object as follows for the **master** branch **only**:

```json
{
    "delete": ["make delete ROLE=database"],
    "deploy": [
      "make deploy ENV=master TEMPLATE=infrastructure/templates/simple/email.yaml",
      [
        "make deploy ENV=master TEMPLATE=infrastructure/templates/simple/sso.yaml",
        "make deploy ENV=master TEMPLATE=infrastructure/templates/simple/web.yaml"
    ]]
}
```

## [Advanced Usage (with order files)](examples/ADVANCED.md)

This uses specific files `infrastructure/order/PRODUCT.yaml` to define specific commands for branches, prefix, validate, or wait.

## [Expert Usage (with order files monorepo)](examples/EXPERT.md)

This uses multiple specific files `infrastructure/order/*.yaml` to define specific commands for branches, prefix, validate, or wait for mutltiple PRODUCTS in one repo.

## Inputs

>### deploy

_Optional_ - `string` - **''**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Command to run for all deploys.  This is with files corresponding to `files_added` and `files_modified` inputs.  You can choose string replacements to make your command.  ex `make deploy ENV={{BRANCH}} TEMPLATE={{PATH}}` will get you `make deploy ENV=master TEMPLATE=infrastructure/templates/facebook/database.yaml` if that file is in `files_added` or `files_modified`.

>### delete

_Optional_ - `string` - **''**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Command to run for all deletes.  This is with files corresponding to `files_removed` input.  You can choose string replacements to make your command.  ex `make delete ROLE={{ROLE}}` will get you `make delete ROLE=database` if that file is in `files_deleted`.

#### deploy and delete string replacements

- **{{PATH}}** for the relative path of the file. `infrastructure/templates/facebook/database.yaml`
- **{{FULLPATH}}** for the path of the file. `/home/runner/make-commands-action/infrastructure/templates/facebook/database.yaml`
- **{{FILE}}** for the name of the file without extension. **template_location**/facebook-database.yaml would return `facebook-database`
- **{{BRANCH}}** branch that the action is being ran from.
- **{{PRODUCT}}**
  - If **template_nested** is true (default) then this is the directory name above the file.  **template_location**/facebook/database.yaml would be `facebook`
  - If **template_nested** is false then this is the file name split by a hyphen on the left.  **template_location**/facebook-database.yaml would return `facebook`
- **{{ROLE}}**
  - If **template_nested** is true (default) then this is the file name without extension.  **template_location**/facebook/database.yaml would be `database`
  - If **template_nested** is false then this is the file name split by a hyphen on the right.  **template_location**/facebook-database.yaml would return `database`

>### files

_Optional_ - `string` - **[]**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;JSON array of names all new, updated, and removed files

>### files_added

_Optional_ - `string` - **[]**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;JSON array of the newly created files

>### files_modified

_Optional_ - `string` - **[]**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;JSON array of the updated files

>### files_removed

_Optional_ - `string` - **[]**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;JSON array of the removed files

>### order

_Optional_ - `string` - true|**false**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;To use order files default is **false**, assumes default path of `infrastructure/order` (set by _order\_locations_ input) for yaml/yml files.

>### order_location

_Optional_ - `string` - **infrastructure/order**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Path to order files.  Default is `infrastructure/order` this references the root of the repository for the action is where the `infrastructure/order` directory should be located which should contain yaml/yml files describing deployment order.

>### mapping_location

_Optional_ - `string` - **infrastructure/mappings**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Path to mapping files.  Default is `infrastructure/mappings` this references the root of the repository for the action where the `infrastructure/mappings` directory should be located which should contain yaml/yml files describing deployment mappings.

>### template_location

_Optional_ - `string` - **infrastructure/templates**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Path to template files.  Default is `infrastructure/templates` this references the root of the repository for the action where the `infrastructure/templates` directory should be located which should contain yaml/yml files describing infrastructure templates to deploy.

>### template_nested

_Optional_ - `string` - **true**|false  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;To use nested template paths default is **true**.  By default we assume a template is located in **template_location**/_PRODUCT_/_ROLE_.yml  With this enabled we will assume templates are located at **template_location**/_PRODUCT_-_ROLE_.yml instead

>### branch

_Optional_ - `string` - **github.ref**
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;To use a branch other than the branch that was triggered with this action.

## Outputs

>### output

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;steps.make_commands.outputs.output - string - commands object.  
  
With order set to **FALSE** (default) it is an object with properties `deploy` and `delete` which are arrays of strings or arrays of arrays of strings.  

With order set to **TRUE** this can be an object with properties `deploy`, `delete`, `prefix`, `suffix`, and `validate` which are array of strings or command objects (`command` and `waitCommand`) or an array of array of strings or command objects.

This is also a file at `{HOME}/output.json`

See [Advanced](#advanced-usage-with-order-files) or [Expert](#expert-usage-with-order-files-monorepo) for more information on output options.

>### deploy

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;steps.make_commands.outputs.deploy - string - deploy commands array.  

With order set to **FALSE** (default) it is an array of strings or array of arrays of strings.  
With order set to **TRUE** this can be an array of strings or command objects (`command` and `waitCommand`) or an array of array of strings or command objects.  

This is also a file at `{HOME}/deploy.json`

>### delete

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;steps.make_commands.outputs.delete - string - delete commands array.  

With order set to **FALSE** (default) it is an array of strings or array of arrays of strings.  
With order set to **TRUE** this can be an array of strings or command objects (`command` and `waitCommand`) or an array of array of strings or command objects.  

This is also a file at `{HOME}/delete.json`

>### prefix

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;steps.make_commands.outputs.prefix - string - prefix commands array.  

With order set to **TRUE** this can be an array of strings or command objects (`command` and `waitCommand`) or an array of array of strings or command objects.  

This is also a file at `{HOME}/prefix.json`

>### suffix

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;steps.make_commands.outputs.suffix - string - suffix commands array.  

With order set to **TRUE** this can be an array of strings or command objects (`command` and `waitCommand`) or an array of array of strings or command objects.  

This is also a file at `{HOME}/suffix.json`

>### validate

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;steps.make_commands.outputs.validate - string - validate string array.  
With order set to TRUE this can be an array of strings.

This is also a file at `{HOME}/validate.json`

## Order File Structure

The order file is by default assumed to be at `infrastructure/order/PRODUCT.yml`.  It describes the commands and order that the final commands object looks like.

```yaml
commands:
  wait: 'string' #Global wait command (includes delete/deploy and suffix/prefix)
#   OR for wait and validate toggle deploy/delete suffix/prefix
  validate: # Global validate command (includes delete/deploy and suffix/prefix)
    command: 'string'
    deploy: false # set for all deploy/delete
    delete: # or be very specific
      command: true
      prefix: false
      suffix: true
  deploy: 'string' #Global deploy command (includes suffix/prefix)
  delete: 'string' #Global delete command (includes suffix/prefix)
#   OR
  deploy: # OR delete
    default: 'string' #Global deploy command
    prefix: 'string' #Global deploy prefix command
    suffix: 'string' #Global deploy suffix command
    validate: 'string' #Global deploy validate command
    wait: 'string' #Global deploy wait command
#   OR
  delete: # OR deploy
    prefix: # OR suffix/validate/wait
      default: 'string' #Global delete prefix command
      master: 'string' #Master branch only delete prefix command
prefix: # Same structure as suffix
  master: # use default for all branches, or be specific
    - role: database # choose a role
      action: delete # and an action deploy/delete
      validate: 'make specific role={{ROLE}}' # optionally override validate command
      wait: 'make specific role={{ROLE}}' # optionally override wait command
    # Mix and match - use array of objects {}[] or array of array of objects {}[][]
    -
      - role: web1-db
        action: delete
      - role: web2-db
        action: delete
    - role: db-init
      action: deploy
    - role: db-structure
      action: deploy
deploy: # same structure as delete.  if delete is not defined it uses reverse deploy order
  master: # use default for all branches, or be specific
    - database # define the role to be deployed
    - email # use [string] or [string][]
    -
      - web
      - sso
  develop:
    - web
  # anything not master or develop will be deployed this way.
#   default: # if no default then no deploys
#     - database
#     - web
suffix:
```

- Do's
  - Take advantage of **{}[][]** structure in order to do parallel commands in your later files.
  - Override commands all the way down to the branch or action for everything.
  - More specific commands take priority.  `commands.wait` is more broad than `commands.deploy.wait` so for deploy commands, the latter will be used.
  - Be sure to set a default command if using an overidden specific command.  If you set `commands.deploy.wait` to a command and `commands.wait.delete` is **true**(default) then when a delete command is generated it will have no command to use.  Set either:
    - `commands.wait.delete` to **false** if you don't want wait commands for delete
    - `commands.delete.wait` to a command if you want a delete command
    - `commands.wait.command` to a command to use for all wait commands except overridden
    - `commands.delete.wait.master` to a command if you want a delete command for a specific branch
    - `prefix.master.[*].wait` to a command if you want to have a ultra specific wait command
- **Dont's**
  - Use the same object name twice.  Either set one broad command `delete` or be very specific by setting `delete.default` and `delete.prefix.master` to have one command for all `delete` commands except `delete.prefix.master`.
  
> Full Example

- All actions except for deploy will have the same wait command(**wait_default**) but prefix and suffix is disabled..
- All actions will have the same validate command(**validate_default**).
- Deploy will use one command (**deploy_default**)for deploy, one command (**deploy_prefix**) for prefix, one command (**deploy_suffix**) for suffix, and override the default wait command with a new command (**deploy_wait**).
- Delete will use one command (**delete_default**) for all suffix and regular delete actions for all branches, but will use a specific command (**delete_prefix_master**)for the prefix on the master branch, and a different prefix command (**delete_prefix_default**) for all other branches.
- On deploy to master there are parallel commands to tear down the web databases, and prepare the new one.  Then it deploys all of the infrastructure such as database, email, then web and sso in parallel.  Lastly it will perform tests against the deployed infrastructure in prefix commands.

```yaml
commands:
  wait:
    command: 'wait_default'
    deploy:
      default: true
      prefix: false
      suffix: false
  validate: 'validate_default'
  deploy:
    default: 'deploy_default'
    prefix: 'deploy_prefix'
    suffix: 'deploy_suffix'
    wait: 'deploy_wait'
  delete:
    default: 'delete_default'
    prefix:
      default: 'delete_prefix_default'
      master: 'delete_prefix_master'
prefix:
  master:
    - role: database
      action: delete
      validate: 'make specific role={{ROLE}}'
      wait: 'make specific role={{ROLE}}'
    -
      - role: web1-db
        action: delete
      - role: web2-db
        action: delete
      - role: web3-db
        action: delete
    - role: db-init
      action: deploy
    - role: db-structure
      action: deploy
    -
      - role: db-populate
        action: deploy
      - role: web
        action: deploy
deploy:
  master:
    - database
    - email
    -
      - web
      - sso
  develop:
    - web
  default:
    - database
    - web
suffix:
  master:
    -
      - role: database-unit
        action: deploy
      - role: database-integration
        action: deploy
      - role: database-integrity
        action: deploy
      - role: database-scaling
        action: deploy
      - role: web-penetration
        action: deploy
      - role: setup-web-loadtest
        action: deploy
    -
      - role: teardown-database-scaling
        action: deploy
      - role: web-load
        action: deploy
    -
      - role: notify-slack
        action: deploy
```

## Template File Structure

The template file is by default assumed to be at `infrastructure/templates/PRODUCT/ROLE.yaml`.  It describes a specific **ROLE** in relation to a **PRODUCT**.  Think of this as a piece `ROLE` (web server, database, authentication) of an application `PRODUCT` (facebook).  If a template file is changed, it is ran in relation to the rest of the commands in the repo.

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Parameters:
  stage:
    Description: name of the deployment environment
    Type: String
    Default: master
    AllowedValues:
      - master
      - develop
  # I upload the mapping file to an s3 bucket in my make command.  You can easily accomplish this with a prefix command.
  MappingFile:
    Description: mapping file, s3 link
    Type: String
    Default: s3://trailmix-cf/facebook/facebook.yml

Mappings:
  Fn::Transform:
    Name: AWS::Include
    Parameters:
      Location : !Ref MappingFile

Resources:
  FacebookBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !FindInMap [facebook, !Ref stage, BucketName]
```

## Mapping File Structure

The mapping file is by default assumed to be at `infrastructure/mappings/PRODUCT.yaml`.  It describes the parameters that might be shared between infrastructure templates.  If a mapping is changed then all roles referenced in the **PRODUCT**'s order.yaml are added to the commands.

```yaml
awsaccountmap:
  master:
    dbPasswordRef: defg
    webPasswordRef: 9876
    BucketName: abcd1234
  develop:
    dbPasswordRef: abcd
    webPasswordRef: 1234
    BucketName: zyxw9876
```
