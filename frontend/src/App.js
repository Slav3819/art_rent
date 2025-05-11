import './App.css';
import axios from 'axios';
import {Component} from "react";

class App extends Component {
  state = {details:[],}

  componentDidMount() {
    let data;
    axios.get('http://localhost:8000')
    .then(res => {
      data = res.data;
      this.setState({
        details:data
      });
    })
    .catch(err => {
      console.log(err);
    })
  }
  render() {
    return (
        <div>
          <header>Данные из Django</header>
          {this.state.details.map((output) => (
            <div key={output.id}>
              <div>
                <h2>{output.name}</h2>
                <p>{output.title}</p>
              </div>
            </div>
          ))}

        </div>
    )
  }
}


export default App;
