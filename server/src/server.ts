import express, { response } from 'express'

const app = express()

const users = ['Diego', 'Cleiton', 'Robson', 'Hehe']

app.get('/users', (request, response) => {
  // JSON
  return response.json(users)
})

app.post('/users', (request, response) => {
  const user = {
    name: 'Diego',
    email: 'diego@rocketseat.com.br'
  }

  return response.json(user)
})

app.listen(3333)
