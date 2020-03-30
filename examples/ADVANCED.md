# Advanced Usage (with order files)

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
```

Consider the tree:

```text
./
├── infrastructure
│   ├── order
│   │   └── advanced.yaml
│   ├── mappings
│   │   └── advanced.yaml
│   ├── templates
│   │   ├── advanced
│   │   │   ├── database.yaml
│   │   │   ├── web.yaml
│   │   │   └── sso.yaml
```

And order file:
> infrastructure/order/advanced.yaml

```yaml
commands:
  delete:
    default: 'make delete role={{ROLE}} product={{PRODUCT}}'
    master: 'make notify user=trilom'
    prefix:
      master: 'make delete role={{ROLE}}'
  deploy:
    default: 'make deploy template={{PRODUCT}}-{{ROLE}} env={{BRANCH}}'
    suffix:
      master: 'make create role={{ROLE}}'
  validate: 'make validate template={{PRODUCT}}-{{ROLE}} env={{BRANCH}}'
  wait: 'make wait template={{PRODUCT}}-{{ROLE}} env={{BRANCH}}'
prefix:
  master:
    -
      - role: database
        action: delete
deploy:
  master:
    - database
    - email
    -
      - web
      - sso
  develop:
    - web
suffix:
  master:
    -
      - role: database
        action: deploy
```

And input changed files:

```json
files = ["infrastructure/templates/advanced/web.yaml", "infrastructure/templates/advanced/sso.yaml", "infrastructure/templates/advanced/database.yaml", "infrastructure/templates/advanced/email.yaml"]
files_added = ["infrastructure/templates/advanced/database.yaml"]
files_modified = ["infrastructure/templates/advanced/web.yaml", "infrastructure/templates/advanced/sso.yaml"]
files_deleted = ["infrastructure/templates/advanced/email.yaml"]
```

It will output a JSON object as follows for the **master** branch:

```json
{
    "suffix": [
        {
            "command": "make create role=database",
            "waitCommand": "make wait template=advanced-database env=master"}],
    "prefix": [
        {
            "command": "make delete role=database",
            "waitCommand": "make wait template=advanced-database env=master"}],
    "delete": [
        {
            "command": "make notify user=trilom",
            "waitCommand": "make wait template=advanced-email env=master"}],
    "deploy": [
        {
            "command": "make deploy template=advanced-database env=master",
            "waitCommand": "make wait template=advanced-database env=master"},
        [
            {
                "command": "make deploy template=advanced-web env=master",
                "waitCommand": "make wait template=advanced-web env=master"},
            {
                "command": "make deploy template=advanced-sso env=master",
                "waitCommand": "make wait template=advanced-sso env=master"}
        ]
    ],
    "validate": [
        "make validate template=advanced-database env=master",
        "make validate template=advanced-email env=master",
        "make validate template=advanced-web env=master",
        "make validate template=advanced-sso env=master"
    ]
}
```

But will output this for the **develop** branch:

```json
{
    "deploy": [
            {
                "command": "make deploy template=advanced-web env=develop",
                "waitCommand": "make wait template=advanced-web env=develop"}],
    "validate": [
        "make validate template=advanced-web env=master"
    ]
}
```
