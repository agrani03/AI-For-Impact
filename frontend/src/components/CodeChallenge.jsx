import { useState } from 'react'
import Editor from '@monaco-editor/react'

export default function CodeChallenge({ onSubmit, isLoading = false }) {
  const [code, setCode] = useState(`def two_sum(nums, target):
    """Find two numbers that add up to target."""
    # Your solution here
    pass

# Example usage:
# nums = [2, 7, 11, 15]
# target = 9
# Result should be [0, 1]
`)
  
  const [language, setLanguage] = useState('python')

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Please write some code')
      return
    }
    onSubmit({ code, language })
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[#560BAD]">💻 Coding Challenge</h3>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-white/80 border border-white/40 rounded-lg px-3 py-2 text-sm font-semibold"
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </select>
      </div>

      <div className="rounded-lg overflow-hidden border border-white/40 shadow-lg">
        <Editor
          height="300px"
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            fontFamily: 'Fira Code, monospace',
          }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="btn-primary px-8 py-3 shadow-lg disabled:opacity-50 flex items-center gap-2 justify-center"
      >
        {isLoading ? 'Executing...' : 'Submit & Execute'}
        <span className="text-lg">▶️</span>
      </button>
    </div>
  )
}
