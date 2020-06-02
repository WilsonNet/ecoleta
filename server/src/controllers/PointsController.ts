import knex from '../database/connection'
import { Request, Response } from 'express'

export default class PointsController {
  async index (req: Request, resp: Response) {
    // cidade, uf, items
    const { city, uf, items } = req.query

    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()))

    const points = await knex('point')
      .join('point_item', 'point.id', '=', 'point_item.point_id')
      .whereIn('point_item.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('point.*')

    console.log(city, uf, items)

    return resp.json(points)
  }
  async show (req: Request, resp: Response) {
    const { id } = req.params
    console.log('PointsController -> show -> id', id)
    try {
      const point = await knex('point')
        .where('id', id)
        .first()

      if (!point) {
        return resp.status(400).json({
          message: 'Point not found.'
        })
      }

      const items = await knex('item')
        .join('point_item', 'item.id', '=', 'point_item.item_id')
        .where('point_item.point_id', id)
        .select('item.title')

      return resp.json({ point, items })
    } catch (error) {
      console.error(error)
      return resp.json({ error })
    }
  }

  async create (req: Request, resp: Response) {
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

    const trx = await knex.transaction()
    try {
      // Transaction for dependent queries
      const point = {
        image:
          'https://images.unsplash.com/photo-1591035903010-d83ac023ee84?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=80',
        name,
        email,
        whatsapp,
        latitude,
        longitude,
        city,
        uf
      }

      const insertedIds = await trx('point').insert(point)

      const point_id = insertedIds[0]

      const pointItems = items.map((item_id: number) => {
        return {
          item_id,
          point_id
        }
      })

      await trx('point_item').insert(pointItems)
      await trx.commit()
      return resp.json({ id: point_id, ...point })
    } catch (error) {
      console.error(error)
      trx.rollback()
      resp.json({ error })
    }
  }
}
