import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const metadata: Metadata = {
  title: 'SAISEN Agent — Web3 Execution Agent',
  description: 'Autonomous Web3 agent on Solana. Analyze wallets, get live prices, build swap routes, manage staking.',
}

const AgentApp = dynamic(
  () => import('@/components/agent/AgentApp'),
  { ssr: false }
)

export default function AgentPage() {
  return <AgentApp />
}
