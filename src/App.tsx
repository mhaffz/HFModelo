import { useEffect } from 'react'
import { ReactFlowProvider } from 'reactflow'

import { Sidebar } from './components/sidebar/Sidebar'
import { DiagramCanvas } from './components/canvas/DiagramCanvas'
import { Navbar } from './components/navbar/Navbar'
import { AiSettingsModal } from './components/modals/AiSettingsModal'
import { useDiagramStore } from './store/useDiagramStore'

export default function App() {
  const { isAiSettingsOpen, setAiSettingsOpen, theme } = useDiagramStore()

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])


  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-pastel-bg dark:bg-dark-bg text-pastel-text dark:text-dark-text font-sans selection:bg-primary-200 selection:text-primary-900 transition-colors duration-300">

        <Navbar />
        <div className="flex flex-1 relative overflow-hidden">
          <Sidebar />
          <main className="flex-1 relative overflow-hidden bg-pastel-bg">
            <DiagramCanvas />
          </main>
        </div>

        {/* Global Modals */}
        {isAiSettingsOpen && <AiSettingsModal onClose={() => setAiSettingsOpen(false)} />}
      </div>

    </ReactFlowProvider>
  )
}
