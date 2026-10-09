/* =====================================================================
   FAMILY PAGE DATA: recovery updates + meal/ride/visit slots
   ---------------------------------------------------------------------
   ADD AN UPDATE (newest can go anywhere; the page sorts newest first):
   copy one line inside UPDATES and change the values, e.g.
     { "date": "2026-10-09", "time": "7:30 PM", "status": "resting", "title": "Home and resting", "text": "Sarah is home and napping in the recliner.", "photo": "" },
   - date: YYYY-MM-DD   time: optional, shown as written
   - status: one of  resting | doing-well | checkup | hospital | surgery-day | update
   - photo: optional, a file you put in the photos/ folder, e.g. "photos/oct9.jpg"
     (leave "" for no photo). Add "photoAlt": "description" for screen readers.
   - Keep the double quotes and a comma between entries.

   MARK A SLOT TAKEN: find its line in SLOTS and set "taken": "Aunt Lisa"
   (the name shows as "Taken by Aunt Lisa"). Set "taken": "" to reopen it.
   ADD A SLOT: copy a line, change id (must be unique), date, type, label.
   - type: meal | ride | visit | errand
   ===================================================================== */
window.FAMILY_UPDATES = [
  { "date": "2026-10-09", "time": "", "status": "update", "title": "Surgery day and home again", "text": "", "photo": "", "photoAlt": "", "photos": [
    { "src": "photos/2026-10-09-pre-op.jpg", "caption": "Before surgery, with the surgeon's markings", "alt": "Sarah in a hospital gown and surgical cap, with two marker lines drawn across the front of her neck" },
    { "src": "photos/2026-10-09-post-op.jpg", "caption": "After surgery", "alt": "Close-up of the front of Sarah's neck after surgery, showing the incision line, wearing a gray T-shirt" },
    { "src": "photos/2026-10-09-resting.jpg", "caption": "Resting at home", "alt": "Sarah lying on a bed at home, smiling and giving two thumbs up" }
  ] },
  { "date": "2026-10-02", "time": "", "status": "update", "title": "Surgery is Thursday, Oct 8", "text": "Thank you for all the love. Sarah's disc replacement surgery is on Thursday, October 8. We'll post a short update here after surgery and each day after that. The best way to help right now is to sign up for a meal, ride or short visit on the Meals & Visits page.", "photo": "", "photoAlt": "" }
];

window.FAMILY_SLOTS = [
  { "id": "m1008", "date": "2026-10-08", "type": "meal",  "label": "Dinner for Wesley (surgery day)", "taken": "" },
  { "id": "m1009", "date": "2026-10-09", "type": "meal",  "label": "Soft dinner", "taken": "" },
  { "id": "e1009", "date": "2026-10-09", "type": "errand","label": "Pharmacy / grocery run", "taken": "" },
  { "id": "m1010", "date": "2026-10-10", "type": "meal",  "label": "Soft dinner", "taken": "" },
  { "id": "m1011", "date": "2026-10-11", "type": "meal",  "label": "Soft dinner", "taken": "" },
  { "id": "v1011", "date": "2026-10-11", "type": "visit", "label": "Short visit (afternoon, 20–30 min)", "taken": "" },
  { "id": "m1012", "date": "2026-10-12", "type": "meal",  "label": "Soft dinner", "taken": "" },
  { "id": "m1013", "date": "2026-10-13", "type": "meal",  "label": "Soft dinner", "taken": "" },
  { "id": "v1013", "date": "2026-10-13", "type": "visit", "label": "Short visit (afternoon, 20–30 min)", "taken": "" },
  { "id": "m1014", "date": "2026-10-14", "type": "meal",  "label": "Soft dinner", "taken": "" },
  { "id": "m1015", "date": "2026-10-15", "type": "meal",  "label": "Soft dinner", "taken": "" },
  { "id": "s1015", "date": "2026-10-15", "type": "visit", "label": "Stay with Sarah while Wesley runs out (2 hrs)", "taken": "" },
  { "id": "m1016", "date": "2026-10-16", "type": "meal",  "label": "Soft dinner", "taken": "" },
  { "id": "v1017", "date": "2026-10-17", "type": "visit", "label": "Short visit (afternoon, 20–30 min)", "taken": "" },
  { "id": "m1017", "date": "2026-10-17", "type": "meal",  "label": "Dinner", "taken": "" },
  { "id": "m1018", "date": "2026-10-18", "type": "meal",  "label": "Dinner", "taken": "" },
  { "id": "m1019", "date": "2026-10-19", "type": "meal",  "label": "Dinner", "taken": "" },
  { "id": "r1020", "date": "2026-10-20", "type": "ride",  "label": "Ride to a follow-up appointment (if needed; time to be confirmed)", "taken": "" },
  { "id": "m1020", "date": "2026-10-20", "type": "meal",  "label": "Dinner", "taken": "" },
  { "id": "m1021", "date": "2026-10-21", "type": "meal",  "label": "Dinner", "taken": "" },
  { "id": "v1022", "date": "2026-10-22", "type": "visit", "label": "Visit / gentle walk together", "taken": "" },
  { "id": "m1022", "date": "2026-10-22", "type": "meal",  "label": "Dinner", "taken": "" },
  { "id": "m1023", "date": "2026-10-23", "type": "meal",  "label": "Dinner", "taken": "" },
  { "id": "e1024", "date": "2026-10-24", "type": "errand","label": "Help with laundry / vacuuming", "taken": "" },
  { "id": "m1024", "date": "2026-10-24", "type": "meal",  "label": "Dinner", "taken": "" },
  { "id": "m1025", "date": "2026-10-25", "type": "meal",  "label": "Dinner", "taken": "" },
  { "id": "v1025", "date": "2026-10-25", "type": "visit", "label": "Visit", "taken": "" },
  { "id": "m1026", "date": "2026-10-26", "type": "meal",  "label": "Dinner", "taken": "" },
  { "id": "m1027", "date": "2026-10-27", "type": "meal",  "label": "Dinner", "taken": "" },
  { "id": "r1028", "date": "2026-10-28", "type": "ride",  "label": "Ride / errand (time to be confirmed)", "taken": "" },
  { "id": "m1028", "date": "2026-10-28", "type": "meal",  "label": "Dinner", "taken": "" }
];
