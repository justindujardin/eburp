
## Git Commit Guidelines
This is based on: [conventional-changelog](https://github.com/ajoslin/conventional-changelog/blob/master/CONVENTIONS.md), which is based on [the AngularJS commit conventions](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/).

### Commit Message Format
Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special
format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

### Type
Is recommended to be one of these. Only **feat** and **fix** show up in the changelog, in addition to breaking changes (see breaking changes section at bottom).

* **feat**: A new feature
* **game**: A gameplay change
* **fix**: A bug fix
* **perf**: Performance optimizations
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc), or affect only visual style
* **refactor**: A code change that neither fixes a bug or adds a feature
* **test**: Adding missing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
  generation

### Scope
The scope could be anything specifying place of the commit change. For example `$location`,
`$browser`, `$compile`, `$rootScope`, `ngHref`, `ngClick`, `ngView`, etc...

### Subject
The subject contains succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

### Examples
```
feat(ruler): add inches as well as centimeters
```
```
fix(protractor): fix 90 degrees counting as 91 degrees
```
```
refactor(pencil): use graphite instead of lead

Graphite is a much more available resource than lead, so we use it to lower the price.
```
```
fix(pen): use blue ink instead of red ink

BREAKING CHANGE: Pen now uses blue ink instead of red.

To migrate, change your code from the following:

`pen.draw('blue')`

To:

`pen.draw('red')`
```

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
to read on github as well as in various git tools.

### Breaking Changes
Put any breaking changes with migration instructions in the commit footer.

If there is a breaking change, put **BREAKING CHANGE:** in your commit footer, and it will show up in the changelog.
