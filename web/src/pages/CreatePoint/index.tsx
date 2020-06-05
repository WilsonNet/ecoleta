import React, { useEffect, useState, ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import './styles.css'
import logo from '../../assets/logo.svg'
import { Map, TileLayer, Marker } from 'react-leaflet'
import api from '../../services/api'
import axios from 'axios'
import { LeafletMouseEvent } from 'leaflet'
interface Item {
  id: number
  title: string
  image_url: string
}

interface IBGEUFResponse {
  sigla: string
}

interface IBGECityResponse {
  nome: string
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([])
  const [ufs, setufs] = useState<string[]>([])
  const [cityNames, setCityNames] = useState<string[]>([])
  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0,
    0,
  ])
  const [selectedUf, setSelectedUf] = useState('0')
  const [selectedCity, setSelectedCity] = useState('0')
  const [selectPosition, setSelectedPosition] = useState<[number, number]>([
    0,
    0,
  ])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords

      setInitialPosition([latitude, longitude])
    })
  }, [])

  useEffect(() => {
    api.get('items').then((response) => {
      setItems(response.data)
    })
    // .catch((error) => console.log(error))
  }, [])

  useEffect(() => {
    axios
      .get<IBGEUFResponse[]>(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
      )
      .then((response) => {
        const ufInitials = response.data.map((uf) => uf.sigla)
        setufs(ufInitials)
      })
  })

  useEffect(() => {
    if (selectedUf === '0') return
    axios
      .get<IBGECityResponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
      )
      .then((response) => {
        const cityNames = response.data.map((city) => city.nome)
        setCityNames(cityNames)
      })
  }, [selectedUf])

  const handleSelectUF = (evt: ChangeEvent<HTMLSelectElement>) => {
    setSelectedUf(evt.target.value)
  }

  const handleSelectCity = (evt: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(evt.target.value)
  }

  const handleMapClick = (evt: LeafletMouseEvent) => {
    setSelectedPosition([evt.latlng.lat, evt.latlng.lng])
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />
        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>
      <form>
        <h1>
          Cadastro do <br /> ponto de coleta
        </h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input type="text" name="name" id="name" />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="name">E-mail</label>
              <input type="email" name="email" id="email" />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input type="text" name="whatsapp" id="whatsapp" />
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>
          <Map
            center={initialPosition}
            onclick={handleMapClick}
            zoom={15}
          >
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {selectPosition !== [0, 0] && <Marker position={selectPosition} />}
          </Map>
          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                onChange={handleSelectUF}
                value={selectedUf}
                name="uf"
                id="uf"
              >
                <option value="0">Selecione uma UF</option>
                {ufs.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                value={selectedCity}
                onChange={handleSelectCity}
                name="city"
                id="city"
              >
                <option value="0">Selecione uma cidade</option>
                {cityNames.map((cityName) => (
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais ítens de coleta</span>
          </legend>
          <ul className="items-grid">
            {items.map((item) => (
              <li key={item.id}>
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
          <button type="submit">Cadastrar ponto de coleta</button>
        </fieldset>
      </form>
    </div>
  )
}

export default CreatePoint
