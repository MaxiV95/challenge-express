const express = require("express");
const server = express();
const bodyParser = require("body-parser");

server.use(bodyParser.json());

let model = {
  clients: {},
  reset: () => {
    return (model.clients = {});
  },
  addAppointment: (name, date) => {
    if (!model.clients[name]) {
      model.clients[name] = [];
    }
    date.status = "pending";
    model.clients[name].push(date);

    return model.clients;
  },
  attend: (name, cita) => {
    let citaToChange = model.clients[name].find(citas => citas.date === cita);
    citaToChange.status = "attended";
    return citaToChange;
  },
  expire: (name, cita) => {
    let citaToChange = model.clients[name].find(citas => citas.date === cita);
    citaToChange.status = "expired";
    return citaToChange;
  },
  cancel: (name, cita) => {
    let citaToChange = model.clients[name].find(citas => citas.date === cita);
    citaToChange.status = "cancelled";
    return citaToChange;
  },
  erase: (name, action) => {
    if(action.includes('/')){
      const deleted = model.clients[name].filter(citas => citas.date === action)
      model.clients[name] = model.clients[name].filter(citas => citas.date !== action)
      return deleted;
    }
    const deleted = model.clients[name].filter(citas => citas.status === action)
    model.clients[name] = model.clients[name].filter(citas => citas.status !== action)
    return deleted;
  },
  getAppointments: (name, status) => {
    return status
    ? model.clients[name].filter(citas => citas.status === status)
    : model.clients[name]
  },
  getDate: (name, date) => {
    return model.clients[name].find(citas => citas.date === date)
  },
  getClients: () => Object.keys(model.clients)
};

server.get('/api', (req, res) => {
  res.status(200).json(model.clients)
});

server.post('/api/Appointments', (req, res) => {
  const { client, appointment } = req.body

  if(!client) return res.status(400).send("the body must have a client property")

  if(typeof client !== "string") return res.status(400).send("client must be a string")

  model.addAppointment(client, appointment);
  appointment.status = "pending";
  res.status(200).json(appointment)
});

server.get('/api/Appointments/clients', (req, res) => {
  const clients = model.getClients()
  console.log(clients);
  res.status(200).json(clients)
});

server.get('/api/Appointments/:name', (req, res) => {
  const { name } = req.params;
  const { date, option } = req.query;

  if(!model.getAppointments(name)) return res.status(400).send("the client does not exist");

  if(!model.getDate(name, date)) return res.status(400).send("the client does not have a appointment for that date");

  switch (option) {
    case 'attend':
      const citaToChangeAttend = model.attend(name, date)
      return res.status(200).json(citaToChangeAttend);

    case 'expire':
      const citaToChangeExpire = model.expire(name, date)
      return res.status(200).json(citaToChangeExpire);

    case 'cancel':
      const citaToChangeCancel = model.cancel(name, date)
      return res.status(200).json(citaToChangeCancel);

    default:
      return res.status(400).send("the option must be attend, expire or cancel")
  }
});

server.get('/api/Appointments/:name/erase', (req, res) => {
  const { name } = req.params;
  const { date } = req.query;

  if(!model.getAppointments(name)) return res.status(400).send("the client does not exist");

  
  const dateErase = model.erase(name, date)
  res.status(200).json(dateErase)
});

server.get('/api/Appointments/getAppointments/:name', (req, res) => {
  const { name } = req.params;
  const { status } = req.query;

  const appointmentsToStatus = model.getAppointments(name, status);
  res.status(200).json(appointmentsToStatus)
});

server.listen(3000);
module.exports = { model, server };
