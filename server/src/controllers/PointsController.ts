import knex from '../database/connection'
import { Request, Response } from 'express'

export default class PointsController {
  async index(req: Request, resp: Response) {
    // cidade, uf, items
    const { city, uf, items } = req.query

    const parsedItems = String(items)
      .split(',')
      .map((item) => Number(item.trim()))

    let points: any = {}
    if (city && uf && items) {
      points = await knex('point')
        .join('point_item', 'point.id', '=', 'point_item.point_id')
        .whereIn('point_item.item_id', parsedItems)
        .where('city', String(city))
        .where('uf', String(uf))
        .distinct()
        .select('point.*')
    } else {
      points = await knex('point').distinct().select('*')
    }

    const serializedItems = points.map((point) => {
      return {
        ...point,
        image_url: `http://192.168.0.23:3333/uploads/${point.image}`,
      }
    })

    return resp.json(serializedItems)
  }
  async show(req: Request, resp: Response) {
    const { id } = req.params
    try {
      const point = await knex('point').where('id', id).first()

      if (!point) {
        return resp.status(400).json({
          message: 'Point not found.',
        })
      }
      const serializedPoint = {
        ...point,
        image_url: `http://192.168.0.23:3333/uploads/${point.image}`,
      }

      const items = await knex('item')
        .join('point_item', 'item.id', '=', 'point_item.item_id')
        .where('point_item.point_id', id)
        .select('item.title')

      return resp.json({ serializedPoint, items })
    } catch (error) {
      console.error(error)
      return resp.json({ error })
    }
  }

  async create(req: Request, resp: Response) {
    console.log('oii', req.body)
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = req.body

    const trx = await knex.transaction()
    try {
      // Transaction for dependent queries
      const point = {
        image:req.file.filename,
        name,
        email,
        whatsapp,
        latitude,
        longitude,
        city,
        uf,
      }

      const insertedIds = await trx('point').insert(point)

      const point_id = insertedIds[0]

      const pointItems = items
        .split(',')
        .map((item: string) => Number(item.trim()))
        .map((item_id: number) => {
          return {
            item_id,
            point_id,
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
