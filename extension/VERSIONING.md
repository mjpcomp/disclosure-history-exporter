# Installed package version - v0.1.4 maintenance update

manifest.json is the single source of truth for the installed extension version. Both preparation and collector panels read chrome.runtime.getManifest().version. Report metadata includes the version used to generate it. Historical component notes retain their original release numbers; they describe history rather than current UI labels. The standalone console script remains separate and unchanged. Existing READMEs are preserved.

No changes to collection, month/year filtering, pagination, status calculations, CSV formats, detail-table CSS, or summary/disclaimer styles. The version metadata may add text wrapping but does not alter styling.

Beginner instructions: ../docs/START-HERE.md. Screenshot uploads remain separate until the sanitized PNGs are committed.

To update: replace the existing installation files, Reload the extension on edge://extensions, and refresh the source webpage. Both panels should display the installed package version, and newly generated reports should identify it. Older saved reports retain their original metadata.
