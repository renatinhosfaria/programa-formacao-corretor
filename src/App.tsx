import AppRouter from './router'
import MobileOnlyGate from './components/MobileOnlyGate'
// import TestComponent from './TestComponent'

function App() {
  // Modo de teste - descomente para ver o teste do Tailwind
  // return <TestComponent />
  
  // Modo mobile-only ativado - apenas dispositivos móveis podem acessar
  return (
    <MobileOnlyGate 
      allowTablets={false}
      strictMode={false}
      customMessage="O Programa de Formação de Corretores foi otimizado para celulares. Para se inscrever e ter a melhor experiência, acesse pelo seu smartphone!"
    >
      <AppRouter />
    </MobileOnlyGate>
  )
  
  // Para desativar o modo mobile-only, comente o bloco acima e descomente a linha abaixo:
  // return <AppRouter />
}

export default App
