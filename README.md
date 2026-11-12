# CardDesk — Student ID Card Replacement & Reissue System

A responsive, interactive **frontend-only** prototype for an Internet Programming project. Built with HTML, CSS and vanilla JavaScript. It does not require a backend, database, API key, build tool or package installation.

## Run the project

1. Download and extract `student_id_reissue_system.zip`.
2. Open the extracted folder.
3. Double-click `index.html` (or open it using VS Code Live Server).
4. Use the application form to submit a demo request.

The Google Fonts import is optional. If you are offline, the page falls back to system sans-serif fonts and all functionality still works.

## Features implemented

- Responsive dashboard and mobile navigation.
- Student application form: roll number, full name, branch, blood group and reason (Lost / Damaged / Defaced).
- Conditional document checklist: police lost-report acknowledgement for a lost card; old card submission confirmation for a damaged or defaced card.
- Clickable Standard (₹500) and Urgent 24-hour (₹900) options. The fee summary recalculates immediately when the selected option changes.
- Application ID generation and a four-stage status pipeline that is visible before submission and becomes personalised after submission: Submitted → Payment Verified → Printing → Ready for Collection.
- Demo status advancement controls, completion state and reset option for classroom presentation.
- Browser `localStorage` persistence so a submitted application remains after refresh on the same device/browser.
- Basic form validation and confirmation/error messages.

## Suggested presentation flow

1. Show the overview and explain that the service consolidates the replacement journey.
2. Try submitting a Lost-card request without checking the police acknowledgement to demonstrate validation.
3. Click the entire Urgent 24-hour option card and point out that the fee summary changes to ₹900 immediately. Switch back to Standard and show it changes to ₹500.
4. Submit the request and show the generated application ID. The four-stage pipeline is visible even before submission; submitting activates its first stage.
5. Click **Advance demo status** three times to move through Payment Verified, Printing and Ready for Collection.
6. Refresh the page to show local persistence, then use **Reset demo** before another demonstration.

## Customization

- Change the sample prices in `script.js` in the `FEES` object.
- Update branch names in the `<select id="branch">` element in `index.html`.
- Update the project name, institute name or labels in `index.html`.
- Adjust colors and responsive breakpoints in `styles.css`.

## Important project scope note

This is a frontend simulation. Application information is saved only in the current browser's local storage. It is not sent to a university, does not verify real payments, does not upload documents and does not create an official student record. The fees and processing times are illustrative values and should be replaced with official institutional values if provided.


Roll-number validation: the field is required and accepts 2–20 characters so short identifiers such as `15` are accepted.
