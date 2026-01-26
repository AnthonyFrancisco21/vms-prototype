# Fix Visitor Registration Flow

## Issues Identified

- Step 3 ("Take Photo") renders ID scan instead of photo capture
- Step 4 ("Scan RFID") renders photo capture instead of RFID input
- Confirmation step incorrectly set to step 6 instead of step 5

## Tasks

- [ ] Swap render logic for visitor steps 3 and 4
- [ ] Update confirmation step from 6 to 5
- [ ] Test registration flow after changes
