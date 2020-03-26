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
│   │   └── facebook.yaml
│   ├── mappings
│   │   └── facebook.yaml
│   ├── templates
│   │   ├── facebook
│   │   │   ├── database.yaml
│   │   │   ├── web.yaml
│   │   │   └── sso.yaml
```

And order file:
> infrastructure/order/facebook.yaml

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
files = ["infrastructure/templates/facebook/web.yaml", "infrastructure/templates/facebook/sso.yaml", "infrastructure/templates/facebook/database.yaml", "infrastructure/templates/facebook/email.yaml"]
files_added = ["infrastructure/templates/facebook/database.yaml"]
files_modified = ["infrastructure/templates/facebook/web.yaml", "infrastructure/templates/facebook/sso.yaml"]
files_deleted = ["infrastructure/templates/facebook/email.yaml"]
```

It will output a JSON object as follows for the **master** branch:

```json
{
    "suffix": [
        {
            "command": "make create role=database",
            "waitCommand": "make wait template=facebook-database env=master"}],
    "prefix": [
        {
            "command": "make delete role=database",
            "waitCommand": "make wait template=facebook-database env=master"}],
    "delete": [
        {
            "command": "make notify user=trilom",
            "waitCommand": "make wait template=facebook-email env=master"}],
    "deploy": [
        {
            "command": "make deploy template=facebook-database env=master",
            "waitCommand": "make wait template=facebook-database env=master"},
        [
            {
                "command": "make deploy template=facebook-web env=master",
                "waitCommand": "make wait template=facebook-web env=master"},
            {
                "command": "make deploy template=facebook-sso env=master",
                "waitCommand": "make wait template=facebook-sso env=master"}
        ]
    ],
    "validate": [
        "make validate template=facebook-database env=master",
        "make validate template=facebook-email env=master",
        "make validate template=facebook-web env=master",
        "make validate template=facebook-sso env=master"
    ]
}
```

But will output this for the **develop** branch:

```json
{
    "deploy": [
            {
                "command": "make deploy template=facebook-web env=develop",
                "waitCommand": "make wait template=facebook-web env=develop"}],
    "validate": [
        "make validate template=facebook-web env=master"
    ]
}
```
