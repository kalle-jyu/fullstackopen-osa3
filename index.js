const http = require('http')
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

let persons = [
  {
    "id": "1",
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": "2",
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": "3",
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": "4",
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

morgan.token('body', req => {
  return JSON.stringify(req.body)
})

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :url :body',
    { skip: (req, res) => { return req.method !== 'POST' } }
  ))

app.get('/', (request, response) => {
  const date = new Date()
  const content = `<p>Phonebook has info for ${persons.length} people</p>
<p>${date}</p>`
  response.send(content)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(p => p.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const delPerson = persons.find(p => p.id == id)
  console.log(delPerson)
  if (delPerson) {
    persons = persons.filter(p => p.id !== id)
    response.status(204).end()
    response.json(delPerson)
  } else {
    response.status(404).end()
  }
})


const generateId = () => {
  const max = 100000000
  return Math.floor(Math.random() * max);
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  // validation
  const exists = persons.find(p => p.name === body.name)

  if (exists) {
    return response.status(403).json({
      error: 'name must be unique'
    })
  }

  if (!body.name) {
    return response.status(400).json({
      error: 'name cannot be empty'
    })
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'number cannot be empty'
    })
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  }

  persons = persons.concat(person)

  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})