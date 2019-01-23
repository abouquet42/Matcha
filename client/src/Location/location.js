
// eslint-disable-next-line
import PlacesAutocomplete, {geocodeByAddress, getLatLng} from 'react-places-autocomplete';
import axios from 'axios'
// let location
let lat
let ln

// let callApi2 = async () => {
//   const response = await fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + ln + '&key=AIzaSyCKb5nHXbxWF6uj_Ehm-P65YZ95KqH8Tuw')
//   const body = await response.json()
//   if (response.status !== 200) throw Error(body.message)
//   let location = body.results[0].formatted_address
//   return location
//   // this.setState({ response: body.results[0].formatted_address })
// }
// let callApi = async () => {
let CallLoca = (e) => {
  navigator.geolocation.getCurrentPosition(async (position, error) => {
    if (!error) {
      lat = position.coords.latitude
      ln = position.coords.longitude
    } else {
      axios.post('https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyCKb5nHXbxWF6uj_Ehm-P65YZ95KqH8Tuw')
        .then((result) => {
          lat = result.data.location.lat
          ln = result.data.location.lng
        })
    }
    const response = await fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + ln + '&key=AIzaSyCKb5nHXbxWF6uj_Ehm-P65YZ95KqH8Tuw')
    const body = await response.json()
    if (response.status !== 200) throw Error(body.message)
    let location = body.results[0].formatted_address
    return location
  }
  )
}
export default CallLoca
