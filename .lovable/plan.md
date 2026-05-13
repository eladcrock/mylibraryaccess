## My Library Wallet

A new authenticated page where users can securely store and quickly reference their library card numbers and PINs for each library system they have an account with.

### User experience

- New nav link "My Wallet" (authenticated users only), route `/wallet`.
- Page lists saved cards as tiles: library name, card number (masked by default with show/hide toggle), PIN (masked with show/hide), optional nickname/notes, and a "Copy" button for the number.
- "Add card" button opens a dialog to pick a library system (searchable select pulled from `library_systems`) and enter card number, PIN, and optional notes.
- Edit and delete actions per card.
- Empty state explains what the wallet is for and links to `/my-benefits` to add cards.

### Data model

New table `public.library_cards`:
- `user_id` (uuid, owner)
- `library_system_id` (uuid, optional — links to a known library)
- `custom_label` (text, optional — for libraries not in our DB)
- `card_number` (text)
- `pin` (text, nullable)
- `notes` (text, nullable)
- `created_at`, `updated_at`

RLS: users can only select/insert/update/delete their own rows (`auth.uid() = user_id`). Standard `updated_at` trigger.

### Security note

Card numbers and PINs are sensitive. Storage will be per-user with strict RLS so only the owner can read their rows. Values are stored as plain text in the database (same model as the existing `applicant_profiles` table). The UI masks values by default and only reveals on explicit user action. I'll add a clear notice on the page that this is for personal quick-reference and to use a strong account password. If you want stronger protection (client-side encryption with a passphrase only you know, so even the database can't read it), say so and I'll add that as a follow-up.

### Files

- New migration: create `library_cards` table + RLS + trigger.
- New route: `src/routes/_authenticated.wallet.tsx` (list, add, edit, delete dialogs, mask/reveal/copy).
- Add "My Wallet" link to `src/components/site-header.tsx` (authenticated nav).
