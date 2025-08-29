'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"

interface WalletInfo {
  address: string
  balance: string
  chainId: string
}

export default function Header() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask
  }

  // Check if already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (isMetaMaskInstalled() && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            await handleWalletConnection(accounts[0])
          }
        } catch (error) {
          console.error('Error checking MetaMask connection:', error)
        }
      }
    }

    checkConnection()
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (isMetaMaskInstalled() && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          handleWalletConnection(accounts[0])
        } else {
          handleDisconnect()
        }
      })

      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }

    return () => {
      if (isMetaMaskInstalled() && window.ethereum) {
        window.ethereum.removeAllListeners()
      }
    }
  }, [])

  const handleWalletConnection = async (account: string) => {
    if (!window.ethereum) return
    
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [account, 'latest']
      })

      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      })

      setWalletInfo({
        address: account,
        balance: (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4),
        chainId: chainId
      })
      setIsConnected(true)
      toast.success('MetaMask connected successfully!')
    } catch (error) {
      console.error('Error getting wallet info:', error)
      toast.error('Failed to get wallet information')
    }
  }

  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      toast.error('MetaMask is not installed. Please install MetaMask first.')
      return
    }

    if (!window.ethereum) {
      toast.error('MetaMask is not available')
      return
    }

    setIsConnecting(true)
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      
      if (accounts.length > 0) {
        await handleWalletConnection(accounts[0])
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error)
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          toast.error('Connection rejected by user')
        } else {
          toast.error('Failed to connect to MetaMask')
        }
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setWalletInfo(null)
    setShowDashboard(false)
    toast.success('Wallet disconnected')
  }

  const openDashboard = () => {
    setShowDashboard(true)
  }

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full px-4 md:px-6 relative"
        style={{
          background: "linear-gradient(135deg, #0a0613 0%, #150d27 100%)",
        }}
      >
        {/* Liquid background glow with animation */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute top-0 right-0 h-full w-1/2 animate-pulse-slow"
            style={{
              background:
                "radial-gradient(circle at 80% 20%, rgba(155,135,245,0.25) 0%, rgba(13,10,25,0) 70%)",
            }}
          />
          <div
            className="absolute top-0 left-0 h-full w-1/2 animate-pulse-slower"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, rgba(135,245,212,0.2) 0%, rgba(13,10,25,0) 70%)",
            }}
          />
        </div>

        {/* Glassy navbar container */}
        <div
          className="mx-auto w-full max-w-6xl rounded-[28px] 
                     border border-white/10 
                     bg-white/10 backdrop-blur-xl 
                     shadow-[0_8px_30px_rgba(0,0,0,0.20)] 
                     animate shadow-purple-500/30"
        >
          <div className="flex h-16 items-center justify-between px-3 sm:px-4 md:px-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-full bg-black shadow-[inset_0_0_0_2px_rgba(255,255,255,0.15)]">
                  <Image
                    src="/assets/logo.png"
                    alt="TraderX logo"
                    width={36}
                    height={36}
                    className="rounded-full bg-white p-1 shadow-md "
                    priority
                  />
                </div>
                <span className="hidden text-base font-semibold tracking-wide text-white sm:inline">TraderX</span>
              </Link>
            </div>

            {/* Nav links */}
            <nav className="hidden items-center gap-8 text-sm md:flex">
              <Link href="#home" className="hidden text-base font-semibold tracking-wide text-white sm:inline">Home</Link>
              <Link href="#about" className="hidden text-base font-semibold tracking-wide text-white sm:inline">About</Link>
              <Link href="#contact" className="hidden text-base font-semibold tracking-wide text-white sm:inline">Contact</Link>
            </nav>

            {/* Wallet button */}
            <div className="flex items-center gap-2">
              {!isConnected ? (
                <Button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="relative rounded-full bg-black px-5 text-white 
                   shadow-[inset_0_0_0_2px_rgba(255,255,255,0.12)] 
                   hover:bg-black/90 border border-white/10 
                   transition-all duration-300 ease-in-out
                   hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30
                   animate-pulse"
                >
                  {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  {/* Wallet Info */}
                  <div className="hidden md:flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 border border-white/20">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white text-sm">
                      {walletInfo?.address.slice(0, 6)}...{walletInfo?.address.slice(-4)}
                    </span>
                    <span className="text-gray-300 text-xs">
                      {walletInfo?.balance} ETH
                    </span>
                  </div>
                  
                  {/* Dashboard Button */}
                  <Button
                    onClick={openDashboard}
                    className="relative rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-5 text-white 
                     shadow-[inset_0_0_0_2px_rgba(255,255,255,0.12)] 
                     hover:from-purple-700 hover:to-blue-700 border border-white/10 
                     transition-all duration-300 ease-in-out
                     hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30"
                  >
                    Dashboard
                  </Button>
                  
                  {/* Disconnect Button */}
                  <Button
                    onClick={handleDisconnect}
                    variant="outline"
                    className="relative rounded-full px-3 text-white border-red-500/50
                     hover:bg-red-500/20 transition-all duration-300 ease-in-out"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Modal */}
      {showDashboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">TraderX Dashboard</h2>
              <button
                onClick={() => setShowDashboard(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Dashboard Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Wallet Info Card */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Wallet Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Address:</span>
                    <span className="text-white font-mono text-sm">
                      {walletInfo?.address.slice(0, 8)}...{walletInfo?.address.slice(-6)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Balance:</span>
                    <span className="text-white font-semibold">{walletInfo?.balance} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Network:</span>
                    <span className="text-white">
                      {walletInfo?.chainId === '0x1' ? 'Ethereum Mainnet' : 
                       walletInfo?.chainId === '0x89' ? 'Polygon' :
                       walletInfo?.chainId === '0x38' ? 'BSC' : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
                    Send Transaction
                  </button>
                  <button className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all">
                    Swap Tokens
                  </button>
                  <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
                    View History
                  </button>
                </div>
              </div>

              {/* AI Assistant Card */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">AI Assistant</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Get AI-powered insights and automated trading assistance
                </p>
                <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all">
                  Start AI Chat
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-center text-gray-400 py-8">
                  <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No recent transactions</p>
                  <p className="text-sm">Your transaction history will appear here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
