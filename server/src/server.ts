import express, { response } from 'express'

const app = express()

const users = ['Diego', 'Cleiton', 'Robson', 'Hehe']

app.get('/users', (request, response) => {
  const search = String(request.query.search)

  const filteredUsers = search ? users.filter(user => user.includes(search)): users

  // JSON
  return response.json(filteredUsers)
})

app.get('/users/:id', (request, response)=> {
  const id = Number(request.params.id)

  const user = users[id]

  return response.json(user)

})

app.post('/users', (request, response) => {
  const user = {
    name: 'Diego',
    email: 'diego@rocketseat.com.br'
  }

  return response.json(user)
})


app.listen(3333)
