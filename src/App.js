import React, {Component} from 'react';
import Navigation from './Components/Navigation/Navigation';
import Signin from './Components/Signin/Signin';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import Logo from './Components/Logo/Logo';
import Register from './Components/Register/Register';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm'
import Rank from './Components/Rank/Rank'
import './App.css';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";


// TS Particles section

const particlesLoaded = () => {
  // console.log("TS Particles deployed!");
};

const particleOptions = {
  background: {
    color: {
      value: "linear-gradient(89deg, #FF5EDF 0%, #04C8DE 100%)"
    },
  },
  fpsLimit: 120,
  interactivity: {
    events: {
      onClick: {
        enable: true,
        mode: "push",
      },
      onHover: {
        enable: false,
        mode: "repulse",
      },
      resize: true,
    },
    modes: {
      push: {
        quantity: 4,
      },
      repulse: {
        distance: 200,
        duration: 0.4,
      },
    },
  },
  particles: {
    color: {
      value: "#ffffff",
    },
    links: {
      color: "#ffffff",
      distance: 150,
      enable: true,
      opacity: 0.5,
      width: 1,
    },
    collisions: {
      enable: false,
    },
    move: {
      direction: "none",
      enable: true,
      outModes: {
        default: "bounce",
      },
      attract: {
        enable: false
      },
      random: false,
      speed: 2,
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 80,
    },
    opacity: {
      value: 0.5,
    },
    shape: {
      type: "circle",
    },
    size: {
      value: { min: 1, max: 5 },
    },
  },
  detectRetina: true,
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  iSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}


// React App section starts here

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      iSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }


  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }



  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);

    // console.log(clarifaiFace)

    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }


  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});

    fetch('https://face-recognition-brain-api.onrender.com/imageurl', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    })
    .then(response => response.json())
    .then(response =>  {
      if(response) {
        fetch('https://face-recognition-brain-api.onrender.com/image', {
          method: 'put',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count => {
            this.setState(Object.assign(this.state.user, {entries: count}))
        })
        .catch(console.log)
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err => console.log(err))
  }

  onRouteChange = (route) => {    
    if(route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
    const particlesInit = async (main) => {
      await loadFull(main);
    };

    const {isSignedIn, imageUrl, route, box} = this.state;
  
    return (
      <div className="App">
        <Particles
          id="tsparticles"
          init={particlesInit}
          loaded={particlesLoaded}
          options={particleOptions}
          className='particles'
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route === 'home'
          ? <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries} />
              <ImageLinkForm 
                onInputChange = {this.onInputChange}
                onButtonSubmit = {this.onButtonSubmit} />
              <FaceRecognition box={box} imageUrl={imageUrl}/>
            </div>
          : (
            route === 'signin'
            ? <Signin onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
            : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
          )
        }
      </div>
    );
  }
}

export default App;