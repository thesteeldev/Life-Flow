import './App.css'
import LoginPage from './pages/loginPage'
import HomePage from './pages/homePage'
import NavBar from './components/navBar'
import {Route,Routes} from 'react-router-dom'

function App() {
    return(
        <div>
            <NavBar/>
            <Routes>
                <Route path='/' element={<HomePage/>} />
                <Route path='/login' element={<LoginPage/>}/>
            </Routes>
        </div>
    )
}

export default App
