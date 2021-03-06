import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import './styles.css'
import logo from '../../assets/logo.svg'
import { Map, TileLayer, Marker } from 'react-leaflet'
import api from '../../services/api'
import axios from 'axios'
import { LeafletMouseEvent } from 'leaflet'
import Dropzone from '../../components/Dropzone'

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
  const [selectedItems, setSelectedItems] = useState<number[]>([])
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  })
  const [selectedFile, setSelectedFile] = useState<File>()

  const history = useHistory()

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

  const handleInputChange = (evt: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [evt.target.name]: evt.target.value })
  }

  const handleSelectItem = (id: number) => {
    const alreadySelected = selectedItems.findIndex((item) => item === id)
    //  selectedItems.
    if (alreadySelected >= 0) {
      const fileredItems = selectedItems.filter((item) => item !== id)

      setSelectedItems(fileredItems)
    } else {
      setSelectedItems([id, ...selectedItems])
    }
  }

  const handleSubmit = async (evt: FormEvent) => {
    evt.preventDefault()
    const { name, email, whatsapp } = formData
    const uf = selectedUf
    const city = selectedCity
    const [latitude, longitude] = selectPosition
    const items = selectedItems

    const data = new FormData()

    data.append('name', name)
    data.append('email', email)
    data.append('whatsapp', whatsapp)
    data.append('uf', uf)
    data.append('city', city)
    data.append('latitude', String(latitude))
    data.append('longitude', String(longitude))
    data.append('items', items.join(','))

    if (selectedFile) {
      data.append('image', selectedFile)
    }

    await api.post('points', data)
    history.push('/')
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
      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do <br /> ponto de coleta
        </h1>

        <Dropzone onFileUploaded={setSelectedFile} />

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="name">E-mail</label>
              <input
                type="email"
                value={formData.email}
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                type="text"
                value={formData.whatsapp}
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>
          <Map center={initialPosition} onclick={handleMapClick} zoom={15}>
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
              <li
                className={selectedItems.includes(item.id) ? 'selected' : ''}
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
              >
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
