const { h, Component } = preact

class LeafletMap extends Component {
  componentDidMount() {
    const { latitude, longitude } = this.props.coords
    this.map = L.map(this.container, {
      zoomControl: false,
      dragging: false,
      center: [latitude, longitude],
      zoom: 18,
      preferCanvas: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png').addTo(this.map)
  }

  updateMap() {
    const { latitude, longitude } = this.props.coords
    this.map.panTo([latitude, longitude])
  }

  componentWillUnmount() {
    this.map.remove()
  }

  render() {
    if (this.map) this.updateMap()
    return (
      <div id="map"
         ref={ref => this.container = ref} />
    )
  }
}
