import { useState, useEffect } from 'react'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import Notification from './components/Notification'
import phonebookService from './services/phonebook'

const App = () => {
  const [persons, setPersons] = useState([])

  const [newName, setNewName] = useState('')

  const [newNumber, setNewNumber] = useState('')

  const [filter, setFilter] = useState('')

  const [errorMessage, setErrorMessage] = useState(null)

  const [successMessage, setSuccessMessage] = useState(null)

  const addPerson = (event) => {
    event.preventDefault()

    if (newName === '') {
      alert('Name is empty.')
      return
    }

    const exists = persons.find(({ name }) => name === newName);

    if (exists) {
      if (confirm(`${newName} is already added to phonebook. Replace the old number with new one?`)) {
        const person = persons.find(p => p.name === newName)
        const changedPerson = { ...person, number: newNumber }
        phonebookService.update(changedPerson.id, changedPerson)
          .then(response => {
            setPersons(persons.map(person => person.id !== changedPerson.id ? person : response.data))
            setNewName('')
            setNewNumber('')
            setSuccessMessage(`Updated '${person.name}'`)
            setTimeout(() => {
              setSuccessMessage(null)
            }, 5000)
          }
          )
          .catch(error => {
            setErrorMessage(`Update failed`)
            setTimeout(() => {
              setErrorMessage(null)
            }, 5000)
          })
      }
    } else {
      const personObject = {
        name: newName,
        number: newNumber
      }
      phonebookService
        .create(personObject)
        .then(response => {
          setPersons(persons.concat(response.data))
          setNewName('')
          setNewNumber('')
          setSuccessMessage(`Added '${response.data.name}'`)
          setTimeout(() => {
            setSuccessMessage(null)
          }, 5000)
        })
        .catch(error => {
          setErrorMessage(`Adding '${response.data.name}' failed`)
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
        })
    }
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  useEffect(() => {
    phonebookService.getAll()
      .then(response => {
        setPersons(response.data)
      })
  }, [])

  const deleteEntry = (id) => {
    const person = persons.find(p => p.id === id)
    phonebookService.remove(id)
      .then(
        response => {
          setPersons(persons.filter(p => p.id !== id))
          setSuccessMessage(`Deleted '${person.name}'`)
          setTimeout(() => {
            setSuccessMessage(null)
          }, 5000)
        }
      )
      .catch(error => {
        setErrorMessage(`Entry ${person.name} was already deleted from server`)
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
        setPersons(persons.filter(p => p.id !== id))
      })
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={errorMessage} success={false} />
      <Notification message={successMessage} success={true} />
      <Filter filter={filter} handler={handleFilterChange} />
      <PersonForm
        addFunction={addPerson}
        newName={newName}
        nameHandler={handleNameChange}
        newNumber={newNumber}
        numberHandler={handleNumberChange}
      />
      <h2>Numbers</h2>
      <Persons persons={persons} filter={filter} handleDelete={deleteEntry} />
    </div>
  )

}



export default App