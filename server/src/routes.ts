import express from 'express'
import knex from './database/connection'

const routes = express.Router()

routes.get('/items', async (request, response) => {
  const items = await knex('item').select('*')
  const serializedItems = items.map(item => {
    return {
      id: item.id,
      title: item.title,
      image_url: `http://localhost:3333/uploads/${item.image}`
    }
  })
  return response.json(serializedItems)
})

routes.post('/point', async (req, resp) => {
  const {
    name,
    email,
    whatsapp,
    latitude,
    longitude,
    city,
    uf,
    items
  } = req.body

  try {
    const ids = await knex('point').insert({
      image: 'image-fake',
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    })

    const pointItems = items.map((item_id: number) => {
      return {
        item_id,
        point_id: ids[0]
      }
    })

    await knex('point_item').insert(pointItems);

    return resp.json({ success: true })
  } catch (error) {

    console.error(error)
    resp.json({ error })

  }
})

export default routes
