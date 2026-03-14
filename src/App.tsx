import { ReactFlowProvider } from 'reactflow'
import { Sidebar } from './components/sidebar/Sidebar'
import { DiagramCanvas } from './components/canvas/DiagramCanvas'

export default function App() {
  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans">
        <Sidebar />
        <main className="flex-1 relative overflow-hidden">
          <DiagramCanvas />
        </main>
      </div>
    </ReactFlowProvider>
  )
}
