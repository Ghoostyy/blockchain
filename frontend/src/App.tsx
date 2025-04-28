import { useState } from 'react'
import { useWeb3 } from './hooks/useWeb3'
import './App.css'

function App() {
  const { account, contract, connectWallet, isConnected } = useWeb3()
  const [pollName, setPollName] = useState('')
  const [pollResults, setPollResults] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [pollId, setPollId] = useState<number>(0)

  const createSamplePoll = async () => {
    if (!contract || !account) return
    try {
      setLoading(true)
      const receipt = await contract.methods
        .createPoll("Tea?", ["Yes", "No"], 3600)
        .send({ from: account })


      const pollCreatedEvent = receipt.events?.PollCreated
      if (pollCreatedEvent) {
        const id = pollCreatedEvent.returnValues.id
        setPollId(Number(id))
        alert(`Poll created with ID ${id} successfully!`)
      } else {
        alert('Poll created but ID not found')
      }
    } catch (error) {
      console.error('Error creating poll:', error)
      alert('Error creating poll')
    } finally {
      setLoading(false)
    }
  }
  const vote = async () => {
    if (!contract || !account) return
    try {
      setLoading(true)
      await contract.methods.vote(pollId, 0).send({ from: account })
      alert('Voted successfully!')
    } catch (error) {
      console.error('Error voting:', error)
      alert('Error voting')
    } finally {
      setLoading(false)
    }
  }

  const getResults = async () => {
    if (!contract) return
    try {
      setLoading(true)
      const results = await contract.methods.results(pollId).call() as number[]
      setPollResults(results)
    } catch (error) {
      console.error('Error getting results:', error)
      alert('Error getting results')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Voting DApp
          </h1>

          {!isConnected ? (
            <button
              onClick={connectWallet}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              Connect Wallet
            </button>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 mb-4">
                  Connected Account: <span className="font-mono text-sm">{account}</span>
                </p>

                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={createSamplePoll}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    disabled={loading}
                  >
                    Create Sample Poll
                  </button>

                  <button
                    onClick={vote}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    disabled={loading}
                  >
                    Vote Option 0
                  </button>

                  <button
                    onClick={getResults}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    disabled={loading}
                  >
                    Get Results
                  </button>
                </div>

                {pollResults.length > 0 && (
                  <div className="mt-6 bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Poll Results</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-md shadow-sm">
                        <p className="text-gray-600">Yes</p>
                        <p className="text-2xl font-bold">{pollResults[0]}</p>
                      </div>
                      <div className="bg-white p-4 rounded-md shadow-sm">
                        <p className="text-gray-600">No</p>
                        <p className="text-2xl font-bold">{pollResults[1]}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
