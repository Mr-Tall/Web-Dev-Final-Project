import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/common/Navbar'
import Home from './pages/home'
import AdvancedSearch from './pages/advanced-search'
import BookDetails from './pages/book-details'
import BookReviews from './pages/book-reviews'
import ResourcesPage from './pages/resources'
import MyLibrary from './pages/my-library'
import SignIn from './pages/auth'
import { About, FAQ, Contact, Privacy } from './pages/info'
import BookList from './pages/book-list'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/advanced-search" element={<AdvancedSearch />} />
          <Route path="/book/:id" element={<BookDetails />} />
          <Route path="/book-details" element={<BookDetails />} />
          <Route path="/book/isbn/:isbn" element={<BookDetails />} />
          <Route path="/book-reviews" element={<BookReviews />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/my-library" element={<MyLibrary />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/book-list/:listType" element={<BookList />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
