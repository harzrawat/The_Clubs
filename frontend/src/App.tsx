import './App.css'
import ClubCard from './components/ui/ClubCard'

function App() {

  const clubs = [
    {
      name: "Club 1",
      description: "Description 1",
      member_count: 10
    },
    {
      name: "Club 2",
      description: "Description 2",
      member_count: 20
    },
    {
      name: "Club 3",
      description: "Description 3",
      member_count: 30
    },
    {
      name: "Club 4",
      description: "Description 4",
      member_count: 40
    },
    {
      name: "Club 5",
      description: "Description 5",
      member_count: 50
    },
    {
      name: "Club 6",
      description: "Description 6",
      member_count: 60
    },
    {
      name: "Club 7",
      description: "Description 7",
      member_count: 70
    },
    {
      name: "Club 8",
      description: "Description 8",
      member_count: 80
    },
    {
      name: "Club 9",
      description: "Description 9",
      member_count: 90
    },
    {
      name: "Club 10",
      description: "Description 10",
      member_count: 100
    }
  ]

  return (
    <>
      <div className='flex flex-wrap gap-4 justify-center'>
        {clubs.map((club) => (
          <ClubCard 
            key={club.name} 
            name={club.name} 
            description={club.description} 
            member_count={club.member_count} 
          />
        ))}
      </div>
      
    </>
  )
}

export default App
