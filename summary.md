# Investigation Summary

## Project Structure

- `angular.json`
- `package.json`
- `public/`
  - `favicon.ico`
- `src/`
  - `index.html`
  - `main.ts`
  - `styles.scss`
  - `app/`
    - `app.ts`
    - `app.html`
    - `app.scss`
    - `app.config.ts`
    - `app.routes.ts`
    - `app.spec.ts`
    - `common/`
      - `constants.ts`
    - `core/`
      - `graphql-client.service.ts`
    - `pokedex/`
      - `models/pokemon.model.ts`
      - `services/pokemon-api.service.ts`
- `summary.md`

## What was checked

1. `src/main.ts`
   - `bootstrapApplication(App, appConfig)` is used.
   - `App` is imported from `./app/app`, which resolves to `src/app/app.ts`.

2. `src/app/app.ts`
   - The file on disk defines `export class App`.
   - The component decorator uses `selector: 'app-root'`.
   - The constructor contains `console.log('HELLO FROM APP CONSTRUCTOR');`.

3. `angular.json`
   - The application build entry points to `src/main.ts` through `"browser": "src/main.ts"`.
   - The dev server uses the `mini-pokedex:build:development` target.

4. `src/index.html`
   - The root element is `<app-root></app-root>`.
   - This matches the selector in `src/app/app.ts`.

5. Duplicate root component search
   - No duplicate `AppComponent` or `app.component.ts` file was found in the project.
   - Only one root-like component definition was present: `src/app/app.ts`.

6. Dev server restart attempt
   - A fresh `npm run start` attempt failed immediately in this environment with:
     - `listen EPERM: operation not permitted ::1:4200`
   - Because of that, a clean local restart could not be verified here.

## Current conclusion

From the files on disk, the bootstrap path and root selector are consistent.
There is no visible duplicate root component in the repository, so the missing browser console log is not explained by a bootstrap mismatch based on the current code state.
