# PetShop
Task* = (Optional / low priority)
## Project structure
- [X] Model, handles object creation and structure (`app/model/`) <br>
- [X] View, handles the front end and webpage rendering (`app/view/`)
- [X] Controller, handles the internals and how the view interacts with the db (`app/controller/`)


## HTML
- [X] Home page (`app/view/home.handlebars`)
- [ ] Login page (Admin)*
- [X] Admin pages (`app/view/appointmentList.handlebars`, `app/view/scheduleConfig.handlebars`)
- [X] pretty CSS* (`app/view/static/css/style.css`)

## Request Handlers
- Home
    - [X] ***(GET)@("/")*** Main web page with form for the client to request an appointment
    - [X] ***(POST)@("/")*** handles the new appointment form
- appointment list
    - [X] ***(GET)@("/listaPetAgenda")*** Lists all booked appointments
- AjustaPetAgenda
    - [X] ***(GET)@("/ajustaPetAgenda")*** shows current availability timetable and allows admins to update them
    - [X] ***(POST)@("/ajustaPetAgenda")*** handles the availability update form
- Login*
    - [ ] ***(GET)@("/Login")*** simple authentication page for accessing admin pages*
    - [ ] ***(POST)@("/Login")*** handles the login form*
## DB
- [X] structure data

- Client
  - Name
  - CPF
  - _id (Internal, auto assigned)
- Appointment
  - dateMs
  - clientCPF
  - _id (Internal, auto assigned)
- TimeTable
  - a week sized table that represents the availability during this week