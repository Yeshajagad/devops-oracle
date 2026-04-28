import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null } }
  componentDidCatch(error) { this.setState({ error }) }
  render() {
    if (this.state.error) return (
      <div style={{color:'red', padding:'40px', background:'#0f0f1a', minHeight:'100vh'}}>
        <h2>Error caught:</h2>
        <pre style={{whiteSpace:'pre-wrap', marginTop:'20px'}}>{this.state.error.toString()}</pre>
        <pre style={{whiteSpace:'pre-wrap', marginTop:'20px'}}>{this.state.error.stack}</pre>
      </div>
    )
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ErrorBoundary>
)