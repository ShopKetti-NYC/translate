import React, { Component } from "react"
import axios from "axios"
import Speech from "speak-tts"
import { API_KEY, languageOptions } from "../strings"

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
      autoSpeak: true,
      voice: "Google US English"
    }
    // Bind functions to make state available
    this.translate = this.translate.bind(this)
    this.speak = this.speak.bind(this)
    this.changeAutoSpeak = this.changeAutoSpeak.bind(this)
  }

  // Perform translation and set state values
  translate() {
    axios
      .get(
        `https://translation.googleapis.com/language/translate/v2?target=${
          this.state.target
        }&key=${API_KEY}&q=${encodeURI(this.state.value)}`
      )
      .then(data => {
        this.setState({
          translated: decodeURI(data.data.data.translations[0].translatedText),
          source: data.data.data.translations[0].detectedSourceLanguage
        })
        if (this.state.autoSpeak) speech.speak({ text: this.state.translated })
      })
      .catch(err => {
        console.log("error")
      })
  }

  // Handle the language selector
  setLanguage(e) {
    this.setState({
      target: e.target.value,
      speechLang: languageOptions.find(x => x.code === e.target.value)
        .speechCode,
      voice: languageOptions.find(x => x.code === e.target.value).voice
    })
    speech.setLanguage(this.state.speechLang)
    //speech.setVoice(this.state.voice) // Experimental
    //console.log(this.state.voice)
    //this.translate()
  }

  // Handle the clicked speech event
  speak() {
    speech.speak({ text: this.state.translated })
  }

  // Handle the AutoSpeak change
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

  // Set initiate speech on component mount
  componentDidMount() {
    speech.init({
      volume: 1,
      lang: this.state.speechLang,
      rate: 1,
      pitch: 1,
      voice: "Google US English",
      splitSentences: true
    })
    console.log(`Initialized with translation key: ${API_KEY}`)
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
