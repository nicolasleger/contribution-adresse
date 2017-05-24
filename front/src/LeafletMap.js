const { h, Component } = preact

class LeafletMap extends Component {
  componentDidMount() {
    const { coords, onCloseForm, fullscreen } = this.props
    const { latitude, longitude } = coords
    this.map = L.map(this.container, {
      zoomControl: false,
      dragging: false,
      center: [latitude, longitude],
      zoom: 18,
      preferCanvas: true,
    })

    if (fullscreen) this.map.on('click', onCloseForm)

    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
      maxZoom: 20,
    }).addTo(this.map)

    this.props.markers.addTo(this.map)
    this.updateMap()
  }

  componentWillUpdate() {
    if (this.map) this.updateMap()
  }

  updateMap() {
    const { latitude, longitude } = this.props.coords

    this.map.panTo([latitude, longitude])
    this.map.invalidateSize(true) // Check if Checks if the map container size changed and updates the map
  }

  componentWillUnmount() {
    this.map.remove()
  }

  render() {
    const { fullscreen } = this.props

    return (
      <div id="map" style={{height: fullscreen ? '100%' : '50%'}} ref={ref => this.container = ref} />
    )
  }
}
