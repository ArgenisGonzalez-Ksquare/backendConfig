# backgroundengagement-back

backgroundengagement-back Server, based on Flugzeug.

## Development

Read the documentation at `docs/Framework.md`

```
npm run watch
```

## Prepare for production

```
npm run build
```

## Run in production

```
npm start
```

or

```
node dist/main.js
```

## Seed database (see app/seedData.ts)

```
npm run seed
```

## Clean database and seed (see app/seedData.ts)

```
npm run cleanSeed
```

## Print database creation SQL (Useful when writing migrations)

```
npm run sql
```

## Autogenerate migrations for changes on DB

```
npm run makemigration
```

**Please Note:** These migrations only create an "up" action, "down" actions need to be created manually if desired.
Also, those automatic migrations may not account for all edge cases (for example, needing to modify or populate data when adding or deleting fields), and when renaming a field, the info will be lost because by default it will first drop the column and create a new one.

Feel free to manually modify the generated migration files in `app/migrations` to customize and solve those edge cases when needed.

Please make sure to throughly test your migrations before pushing to production.

## Execute migrations

```
npm run migrate
```
