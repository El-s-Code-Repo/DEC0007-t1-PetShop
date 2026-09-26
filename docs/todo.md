# PetShop
Task* = (Optional / low priority)
## Project structure
- Model, handles object creation and structure <br>
- View, Handles the front end and webpage rendering
- Controller, handles the internals and how the view interacts with the db


## HTML
- [ ] Home page
- [ ] Login page (Admin)
- [ ] Admin page
- [ ] pretty CSS*

## Request Handlers
- Home
    - [ ] ***(GET)@("/")*** Main web page with form for the client to request an appointment
    - [ ] ***(POST)@("/"(*** handles the new appointment form
- appointment list
    - [ ] ***(GET)@("/admin/ListaPetAgenda")*** Lists all future appointments
- AjustaPetAgenda
    - [ ] ***(GET)@("/admin/AjustaPetAgenda")*** shows current availability timetable and allows admins to update them
    - [ ] ***(POST)@"/admin/AjustaPetAgenda")*** handles the availability update form
- Login
    - [ ] ***(GET)@("/Login")*** simple authentication page for accessing pages under /admin/
    - [ ] ***(POST)@("/Login")*** handles the login form
## DB
- [X] structure data

- Client
  - Name
  - CPF
  - _id (Internal, auto assigned)
- Appointment
    - date
    - Client
    - _id (Internal, auto assigned)
- TimeTable
  - a week sized table that represents the availability during this week
```
O trabalho deverá apresentar, no mı́nimo:
1. servidor Web desenvolvido com Node.js;
2. utilização do framework Express;
3. armazenamento dos dados no MongoDB;
4. páginas Web utilizando Handlebars;
5. configuração dos horários de atendimento;
6. consulta dos horários disponı́veis;```