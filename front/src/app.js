const { h, render, Component } = preact
const { bind } = decko

// [
//   {
//     id: '76517531867311',
//     address: {
//       houseNumber: '9c',
//       street: 'rue du moulin'
//     },
//     coords: {
//       accuracy : 30
//       altitude : 100
//       altitudeAccuracy
//       heading
//       latitude
//       longitude
//       speed
//    }
//   }
// ]

const stringArray = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','!','?']

function generateToken() {
  let rndString = ''

  for (var i = 0; i <= 15; i++) {
			var rndNum = Math.ceil(Math.random() * stringArray.length) - 1
			rndString = rndString + stringArray[rndNum];
		}

  return rndString
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tuto: 0,
      selectedAddress: null,
      userCoords: null,
      addresses: [],
      geoOptions: {
        enableHighAccuracy: true,
        maximumAge: 3000,
      },
      fullscreen: true,
      error: null,
    }
    this.loadLocalStorage()
  }

  componentDidMount() {
    this.updatePosition()
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchId)
  }

  saveToLocalStorage() {
    const { addresses, user } = this.state
    localStorage.setItem('addresses', JSON.stringify(addresses))
    localStorage.setItem('user', JSON.stringify(user))
  }

  loadLocalStorage() {
    const addresses = JSON.parse(localStorage.getItem('addresses') || null)
    const user = JSON.parse(localStorage.getItem('user') || null)

    this.setState({
      user: user || {token: null},
      addresses: addresses || []
    })
  }

  @bind
  setStateAndUpdateMap(state) {
    this.setState(state, () => this.leafletMap.forceUpdate())
  }

  @bind
  saveAddresses(addresses) {
    this.setState({addresses}, () => this.saveToLocalStorage(addresses))
  }

  @bind
  openMenu() {
    const { tuto } = this.state
    if (tuto === 1) this.tutoNextStep()
    this.setStateAndUpdateMap({fullscreen: false})
  }

  @bind
  closeForm() {
    this.clearForm()
    this.setStateAndUpdateMap({fullscreen: true, selectedAddress: null})
  }

  @bind
  handleHouseNumberChange(e) {
    this.setState({houseNumber: e.target.value || e.target.textContent})
  }

  @bind
  handleStreetChange(e) {
    this.setState({street: e.target.value || e.target.textContent})
  }

  clearForm() {
    this.setState({houseNumber: '', street: ''})
  }

  @bind
  addAddress() {
    const { addresses, coords, houseNumber, street, tuto } = this.state
    const newAddresses = [...addresses]
    const coordinates = {
      accuracy: coords.accuracy,
      altitude: coords.altitude,
      altitudeAccuracy: coords.altitudeAccuracy,
      heading: coords.heading,
      latitude: coords.latitude,
      longitude: coords.longitude,
      speed: coords.speed,
    }
    newAddresses.push({coords: coordinates, address: {houseNumber, street}, id: `${houseNumber}_${street}`})
    if (tuto === 2 ) this.tutoNextStep()
    this.closeForm()
    this.saveAddresses(newAddresses)
  }

  @bind
  removeAddress() {
    const { addresses, selectedAddress } = this.state
    const newAddresses = [...addresses]
    newAddresses.pop(selectedAddress)
    this.closeForm()
    this.saveAddresses(newAddresses)
  }

  @bind
  editAddress() {
    const { addresses, selectedAddress, houseNumber, street } = this.state
    const newAddresses = [...addresses]
    const addressToEdit = newAddresses.find(addr => addr.id === selectedAddress.id)
    addressToEdit.address = {houseNumber, street}
    this.saveAddresses(newAddresses)
  }

  @bind
  displayAddress(e) {
    const { addresses } = this.state
    const address = addresses.find(address => address.id === e.target.options.id)
    this.setState({houseNumber: address.address.houseNumber, street: address.address.street})
    this.setStateAndUpdateMap({fullscreen: false, selectedAddress: address})
  }

  @bind
  geoError(error) {
    this.setState({error: error.message})
  }

  @bind
  geoSuccess(position) {
    this.setState({coords: position.coords})
  }

  updatePosition() {
    const { geoOptions } = this.state
    if ('geolocation' in navigator) {
      this.watchId = navigator.geolocation.watchPosition(this.geoSuccess, this.geoError, geoOptions)
    } else {
      this.setState({error: 'La géolocalisation n\'est pas prise en charge par votre navigateur.'})
    }
  }

  @bind
  setToken() {
    const { user } = this.state
    user.token = generateToken()
    this.setState({user}, localStorage.setItem('user', JSON.stringify(user)))
  }

  @bind
  tutoNextStep() {
    const { tuto } = this.state
    this.setState({tuto: tuto + 1})
  }

  render() {
    const { user, tuto, coords, houseNumber, street, addresses, selectedAddress, fullscreen, error } = this.state
    if (!user.token) return <Welcome skip={this.setToken}/>
    if (error) return <Error error={error} />
    if (!coords) return <Loading />

    const speed = Number((coords.speed || 0).toFixed())
    const accuracy = Number((coords.accuracy || 0).toFixed())

    return (
      <div class="container">
        {tuto <= 3 ? <Tuto nextStep={this.tutoNextStep} stepIndex={tuto} /> : null}
        <LeafletMap ref={ref => this.leafletMap = ref} addresses={addresses} displayAddress={this.displayAddress} onCloseForm={this.closeForm} coords={coords} fullscreen={fullscreen} />
        <Locator accuracy={coords.accuracy} fullscreen={fullscreen} />
        {fullscreen ?
          <Dashboard speed={speed} accuracy={accuracy} openMenu={this.openMenu} /> :
          <Menu>
            { selectedAddress ?
              <Address houseNumber={houseNumber} street={street} handleHouseNumberChange={this.handleHouseNumberChange} handleStreetChange={this.handleStreetChange} editAddress={this.editAddress} removeAddress={this.removeAddress} /> :
              <AddressForm houseNumber={houseNumber} street={street} onHouseNumberChange={this.handleHouseNumberChange} onStreetChange={this.handleStreetChange} onSubmit={this.addAddress} />
            }
          </Menu>
        }
      </div>
    )
  }
}

// render an instance of App into <body>:
render(<App />, document.body)
