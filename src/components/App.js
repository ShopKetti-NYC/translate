import React, { Component } from "react"
import axios from "axios"
import Speech from "speak-tts"

const API_KEY = "AIzaSyD3eKpJo4gNUDWXmrmXTakTd3orG2LNKDI"
const languageOptions = [
  {
    name: "English",
    code: "en",
    speechCode: "en-US"
  },
  {
    name: "Indonesian",
    code: "id",
    speechCode: "id-ID"
  },
  {
    name: "Tagalog (Filipino)",
    code: "tl",
    speechCode: "fil-PH"
  },
  {
    name: "Spanish",
    code: "es",
    speechCode: "es-MX"
  },
  {
    name: "Italian",
    code: "it",
    speechCode: "it-IT"
  },
  {
    name: "French",
    code: "fr",
    speechCode: "fr-FR"
  }
]

const speech = new Speech() // will throw an exception if not browser supported
if (speech.hasBrowserSupport()) {
  // returns a boolean
  console.log("speech synthesis supported")
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: "",
      translated: "",
      source: "",
      target: "en",
      speechLang: "en-US",
      autoSpeak: true
    }
    this.translate = this.translate.bind(this)
    this.speak = this.speak.bind(this)
    this.changeAutoSpeak = this.changeAutoSpeak.bind(this)
  }
  translate() {
    axios
      .get(
        `https://translation.googleapis.com/language/translate/v2?target=${
          this.state.target
        }&key=${API_KEY}&q=${this.state.value}`
      )
      .then(data => {
        this.setState({
          translated: data.data.data.translations[0].translatedText,
          source: data.data.data.translations[0].detectedSourceLanguage
        })
        console.log(data.data.data.translations[0].translatedText)
        if (this.state.autoSpeak) speech.speak({ text: this.state.translated })
      })
      .catch(err => {
        console.log("error")
      })
  }
  setLanguage(e) {
    this.setState({
      target: e.target.value,
      speechLang: languageOptions.find(x => x.code === e.target.value)
        .speechCode
    })
    speech.setLanguage(this.state.speechLang)
    //this.translate()
  }
  speak() {
    speech.speak({ text: this.state.translated })
  }
  changeAutoSpeak() {
    if (this.state.autoSpeak)
      this.setState({
        autoSpeak: false
      })
    else
      this.setState({
        autoSpeak: true
      })
  }
  componentDidMount() {
    speech.init({
      volume: 1,
      lang: this.state.speechLang,
      rate: 1,
      pitch: 5,
      voice: "Google US English",
      splitSentences: true
    })
  }
  render() {
    return (
      <div className='container p-5'>
        <h6>Translation Experiment</h6>
        <textarea
          className='form-control mb-2'
          placeholder='Write something here...'
          value={this.state.value}
          onChange={e => this.setState({ value: e.target.value })}
        />
        <div className='d-flex align-items-center'>
          <button onClick={this.translate} className='btn btn-primary'>
            Translate
          </button>
          <select
            onChange={e => this.setLanguage(e)}
            selected={this.state.target}
            className='form-control ml-2'
          >
            {languageOptions.map(opt => (
              <option key={opt.name} value={opt.code}>
                {opt.name}
              </option>
            ))}
          </select>
          <div className='form-check w-100 ml-3'>
            <input
              type='checkbox'
              checked={this.state.autoSpeak}
              onChange={this.changeAutoSpeak}
              className='form-check-input'
            />
            <label className='form-check-label'>Speak automatically</label>
          </div>
        </div>
        {this.state.translated && (
          <div className='mt-3'>
            <h6 className='text-muted'>Translation</h6>
            <div className='d-flex flex-column'>
              <p onClick={this.speak} className='font-weight-bold text-success'>
                {this.state.translated}
              </p>
            </div>
            <small className='text-muted'>
              Detected Language:
              <b className='text-uppercase font-weight-bolder mr-2 ml-1'>
                {this.state.source}
              </b>
              [Click the translation to hear it]
            </small>
          </div>
        )}
      </div>
    )
  }
}

export default App
