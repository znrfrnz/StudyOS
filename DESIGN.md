# StudyOS Design Guidelines

## Design Intent

StudyOS should feel like a calm study desk: warm, organized, and low-friction. The interface should make planning feel finite and manageable, not like another productivity dashboard to maintain.

## Theme

Students use StudyOS in mixed environments: laptop at a desk, phone between classes, and evening study sessions. Use a warm light theme by default because the app is for reading, planning, and reviewing content over longer periods.

## Color

- Keep the current warm neutral foundation.
- Use subject colors as functional identifiers, not decoration.
- Reserve strong primary treatment for the next action.
- Status colors must always include text or an icon; color alone is not enough.
- Avoid pure black and pure white in new design tokens.

## Typography

- Preserve the current Geist sans-serif system.
- Use large page titles sparingly; forms and task flows should prioritize scannability over display scale.
- Keep body copy short, with line lengths under 75 characters where possible.

## Layout

- Product surfaces should be task-first, not card-first.
- Use cards when grouping distinct tasks or records, but avoid nested cards unless the inner element is interactive.
- Prerequisite setup should be progressive: show the missing blocker, then the form to fix it.
- Put primary actions close to the context that makes them possible.
- On mobile, avoid hiding important destinations without an alternate path.

## Interaction

- Primary flows should avoid unnecessary page hops.
- Inline validation is preferred over browser alerts.
- Icon-only buttons require `aria-label`.
- All interactive elements need visible keyboard focus.
- Destructive actions should use clear labels when space allows; icon-only destructive actions need accessible names.

## Components

- Buttons: rounded full, clear primary/secondary hierarchy, minimum comfortable tap target.
- Forms: label every input, keep help text close to the field, use native controls when they reduce complexity.
- Empty states: name the missing prerequisite and provide one exact next action.
- Lists: make rows scannable with subject, due date or time, and the next action.

## Motion

Use motion only for state feedback, such as loading spinners. Do not animate layout-heavy properties.
