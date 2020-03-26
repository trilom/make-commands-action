# Expert Usage Example (with order files monorepo)

```yaml
name: changes
on: push
jobs:
  changes:
    runs-on: ubuntu-latest
    steps:
      - id: file_changes
        uses: trilom/file-changes-action@v1.2.3
      - id: make_commands
        uses: trilom/make-commands-action@master
        with:
          files: steps.file_changes.outputs.files
          files_added: steps.file_changes.outputs.files_added
          files_modified: steps.file_changes.outputs.files_modified
          files_deleted: steps.file_changes.outputs.files_deleted
          order: true
          order_location: serverless/order
          mapping_location: secrets
          template_location: serverless
```

Consider the _modified_ tree from before:

```text
./
├── secrets
│   ├── facebook.yaml
│   ├── airbnb.yaml
│   ├── google.yaml
│   └── amazon.yaml
├── serverless
│   ├── order
│   │   ├── facebook.yaml
│   │   ├── airbnb.yaml
│   │   ├── google.yaml
│   │   └── amazon.yaml
│   ├── facebook
│   │   ├── db-messenger.yaml
│   │   ├── db-marketplace.yaml
│   │   ├── db-web.yaml
│   │   ├── web.yaml
│   │   └── messenger.yaml
│   ├── airbnb
│   │   ├── mongo.yaml
│   │   ├── web.yaml
│   │   └── dev.yaml
│   ├── google
│   │   ├── db-west.yaml
│   │   ├── db-north.yaml
│   │   ├── db-east.yaml
│   │   ├── db-south.yaml
│   │   ├── web-west.yaml
│   │   ├── web-north.yaml
│   │   ├── web-east.yaml
│   │   ├── web-south.yaml
│   │   └── kanye.yaml
│   ├── amazon
│   │   ├── email.yaml
│   │   ├── sso.yaml
│   │   ├── web.yaml
│   │   ├── web1-db.yaml
│   │   ├── web2-db.yaml
│   │   ├── web3-db.yaml
│   │   ├── db-init.yaml
│   │   ├── db-structure.yaml
│   │   ├── db-populate.yaml
│   │   ├── web.yaml
│   │   ├── warehouse.yaml
│   │   ├── database-unit.yaml
│   │   ├── database-integration.yaml
│   │   ├── database-integrity.yaml
│   │   ├── database-scaling.yaml
│   │   ├── web-penetration.yaml
│   │   ├── setup-web-loadtest.yaml
│   │   ├── teardown-database-scaling.yaml
│   │   ├── web-load.yaml
│   │   ├── notify-slack.yaml
│   │   └── store.yaml
```

And order files:
> serverless/order/facebook.yaml

```yaml
commands:
  delete: 'make delete role={{ROLE}} product={{PRODUCT}}'
  deploy: 'make deploy template={{PRODUCT}}-{{ROLE}} env={{BRANCH}}'
  validate: 'make validate template={{PRODUCT}}-{{ROLE}} env={{BRANCH}}'
  wait: 'make wait template={{PRODUCT}}-{{ROLE}} env={{BRANCH}}'
deploy:
  master:
    -
      - db-messenger
      - db-marketplace
      - db-web
    - web
    - messenger
  develop:
    -
      - web
      - db-web
```

> serverless/order/airbnb.yaml

```yaml
commands:
  delete: 'make delete role={{ROLE}} product={{PRODUCT}}'
  deploy: 'make deploy template={{PRODUCT}}-{{ROLE}} env={{BRANCH}}'
  validate: 'make validate template={{PRODUCT}}-{{ROLE}} env={{BRANCH}}'
  wait: 'make wait template={{PRODUCT}}-{{ROLE}} env={{BRANCH}}'
prefix:
  master:
    - name: mongo
      action: deploy
deploy:
  master:
      - web
  develop:
    - dev
```

> serverless/order/google.yaml

```yaml
commands:
  delete: 'make delete role={{ROLE}} product={{PRODUCT}}'
  deploy: 'make deploy template={{PRODUCT}}-{{ROLE}} env={{BRANCH}}'
  validate: 'make validate template={{PRODUCT}}-{{ROLE}} env={{BRANCH}}'
  wait: 'make wait template={{PRODUCT}}-{{ROLE}} env={{BRANCH}}'
deploy:
  master:
    - db-west
    -
      - web-west
      - db-east
    -
      - web-east
      - db-north
    -
      - web-north
      - db-south
    - web-south
    - kanye
```

> serverless/order/amazon.yaml

```yaml
commands:
  wait:
    default: 'make wait template={{PRODUCT}}-{{ROLE}} env={{BRANCH}}'
    deploy:
      default: true
      prefix: false
      suffix: false
  validate: 'make validate template={{PRODUCT}}-{{ROLE}} env={{BRANCH}}'
  deploy:
    default: 'make deploy template={{PRODUCT}}-{{ROLE}} env={{BRANCH}}'
    prefix: 'make deploy_prefix template={{PRODUCT}}-{{ROLE}} env={{BRANCH}}'
    suffix: 'make deploy_suffix template={{PRODUCT}}-{{ROLE}} env={{BRANCH}}'
    wait: 'make deploy_wait template={{PRODUCT}}-{{ROLE}} env={{BRANCH}}'
  delete:
    default: 'make delete role={{ROLE}} product={{PRODUCT}}'
    prefix:
      default: 'make delete_prefix role={{ROLE}} product={{PRODUCT}}'
      master: 'make delete_prefix_master role={{ROLE}} product={{PRODUCT}}'
prefix:
  master:
    - role: database
      action: delete
      validate: 'make specific_validate role={{ROLE}}'
      wait: 'make specific_wait role={{ROLE}}'
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

And input changed files:

```json
files = ["serverless/facebook/db-web.yaml", "secrets/amazon.yaml", "serverless/amazon/notify-slack.yaml", "serverless/airbnb/web.yaml", "serverless/google/web-south.yaml", "serverless/amazon/web-load.yaml"]
files_added = ["serverless/facebook/db-web.yaml"]
files_modified = ["secrets/amazon.yaml", "serverless/amazon/notify-slack.yaml", "serverless/airbnb/web.yaml"]
files_deleted = ["serverless/google/web-south.yaml", "serverless/amazon/web-load.yaml"]
```

It will output a JSON object as follows for the **master** branch:
```json
{
    "prefix": [
      [
        {
          "command": "make delete_prefix_master role=database product=amazon",
          "waitCommand": "make specific_wait role=database" },
        {
          "command": "make deploy template=airbnb-mongo env=master",
          "waitCommand":
        }],
      [
        { "command": "make delete_prefix role=web1-db product=amazon"},
        { "command": "make delete_prefix role=web2-db product=amazon"},
        { "command": "make delete_prefix role=web3-db product=amazon"}],
      [
        { "command": "make deploy_prefix template=amazon-db-init env=master"}],
      [
        { "command": "make deploy_prefix template=amazon-db-structure env=master"}],
      [
        { "command": "make deploy_prefix template=amazon-db-populate env=master"},
        { "command": "make deploy_prefix template=amazon-web env=master"}]],
    "suffix": [
      [
        { "command": "make deploy_suffix template=amazon-database-unit env=master" },
        { "command": "make deploy_suffix template=amazon-database-integration env=master" },
        { "command": "make deploy_suffix template=amazon-database-integrity env=master" },
        { "command": "make deploy_suffix template=amazon-database-scaling env=master" },
        { "command": "make deploy_suffix template=amazon-web-penetrationenv=master" },
        { "command": "make deploy_suffix template=amazon-setup-web-loadtest env=master" }],
      [
        { "command": "make deploy_suffix template=amazon-teardown-database-scaling env=master" }],
      [
        { "command": "make deploy_suffix template=amazon-notify-slack env=master" }]],
    "delete": [
      [
          {
            "command": "make delete role=web-load product=amazon",
            "waitCommand": "make wait template=amazon-web-load env=master"},
          {
            "command": "make delete role=db-south product=google",
            "waitCommand": "make wait template=google-db-south env=master"}]],
    "deploy": [
        [
            {
                "command": "make deploy template=amazon-database env=master",
                "waitCommand": "make wait template=amazon-database env=master"},
            {
                "command": "make deploy template=airbnb-web env=master",
                "waitCommand": "make wait template=airbnb-web env=master"},
            {
                "command": "make deploy template=facebook-db-web env=master",
                "waitCommand": "make wait template=facebook-db-web env=master"}],
        [
            {
                "command": "make deploy template=amazon-email env=master",
                "waitCommand": "make wait template=amazon-email env=master"}],
        [
            {
                "command": "make deploy template=amazon-web env=master",
                "waitCommand": "make wait template=amazon-web env=master"},
            {
                "command": "make deploy template=amazon-sso env=master",
                "waitCommand": "make wait template=amazon-sso env=master"}]],
    "validate": [
        "make specific_validate role=database",
        "make validate template=amazon-web1-db env=master",
        "make validate template=amazon-web2-db env=master",
        "make validate template=amazon-web3-db env=master",
        "make validate template=amazon-database-init env=master",
        "make validate template=amazon-database-structure env=master",
        "make validate template=amazon-database-populate env=master",
        "make validate template=amazon-web env=master",
        "make validate template=amazon-email env=master",
        "make validate template=amazon-sso env=master",
        "make validate template=amazon-database-unit env=master",
        "make validate template=amazon-database-integration env=master",
        "make validate template=amazon-database-integrity env=master",
        "make validate template=amazon-database-scaling env=master",
        "make validate template=amazon-web-penetration env=master",
        "make validate template=amazon-setup-web-loadtest env=master",
        "make validate template=amazon-teardown-database-scaling env=master",
        "make validate template=amazon-notify-slack env=master",
        "make validate template=amazon-web-load env=master",
        "make validate template=google-db-south env=master",
        "make validate template=airbnb-web env=master",
        "make validate template=airbnb-mongo env=master",
        "make validate template=facebook-db-web env=master"
    ]
}
